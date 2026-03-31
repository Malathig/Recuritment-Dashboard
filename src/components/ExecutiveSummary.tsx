import React from 'react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import type { Vacancy, Joining } from '@/lib/api';

interface ExecutiveSummaryProps {
  vacancies: Vacancy[];
  joinings: Joining[];
}

export default function ExecutiveSummary({ vacancies, joinings }: ExecutiveSummaryProps) {
  const totalVac = vacancies.length;
  const totalReq = vacancies.reduce((s, v) => s + v.required_count, 0);
  const totalFil = vacancies.reduce((s, v) => s + v.filled_count, 0);
  const totalRem = Math.max(0, totalReq - totalFil);
  const fillPct = totalReq > 0 ? Math.round((totalFil / totalReq) * 100) : 0;
  const closed = vacancies.filter(v => v.status === 'Closed').length;
  const open = vacancies.filter(v => v.status === 'Need to Hire').length;

  // Hiring TAT: avg days from created_at to when filled_count >= required_count
  const closedVacs = vacancies.filter(v => v.status === 'Closed' && v.updated_at);
  const tatDays = closedVacs.map(v => {
    const created = new Date(v.created_at).getTime();
    const updated = new Date(v.updated_at || v.created_at).getTime();
    return Math.max(0, Math.round((updated - created) / (1000 * 60 * 60 * 24)));
  });
  const avgTAT = tatDays.length > 0 ? Math.round(tatDays.reduce((a, b) => a + b, 0) / tatDays.length) : 0;
  const minTAT = tatDays.length > 0 ? Math.min(...tatDays) : 0;
  const maxTAT = tatDays.length > 0 ? Math.max(...tatDays) : 0;

  // Pipeline funnel
  const totApplied = vacancies.reduce((s, v) => s + (v.applied || 0), 0);
  const totShort = vacancies.reduce((s, v) => s + (v.shortlisted || 0), 0);
  const totInter = vacancies.reduce((s, v) => s + (v.interviewed || 0), 0);
  const totSel = vacancies.reduce((s, v) => s + (v.selected || 0), 0);
  const totOfferMade = vacancies.reduce((s, v) => s + (v.offer_made || 0), 0);
  const totOfferAcc = vacancies.reduce((s, v) => s + (v.offer_accepted || 0), 0);

  // Monthly trends
  const monthlyJoinings = new Map<string, number>();
  joinings.forEach(j => {
    if (j.date) {
      const m = j.date.slice(0, 7);
      monthlyJoinings.set(m, (monthlyJoinings.get(m) || 0) + 1);
    }
  });
  const months = [...monthlyJoinings.entries()].sort((a, b) => a[0].localeCompare(b[0])).slice(-6);

  // Department TAT
  const depts = [...new Set(vacancies.map(v => v.department))].sort();
  const deptTAT = depts.map(d => {
    const rows = closedVacs.filter(v => v.department === d);
    const days = rows.map(v => Math.max(0, Math.round((new Date(v.updated_at || v.created_at).getTime() - new Date(v.created_at).getTime()) / 86400000)));
    const avg = days.length > 0 ? Math.round(days.reduce((a, b) => a + b, 0) / days.length) : 0;
    return { dept: d, avg, count: rows.length };
  }).filter(d => d.count > 0).sort((a, b) => b.avg - a.avg);

  const funnelStages = [
    { label: 'Applied', value: totApplied, color: 'bg-primary' },
    { label: 'Shortlisted', value: totShort, color: 'bg-info' },
    { label: 'Interviewed', value: totInter, color: 'bg-accent' },
    { label: 'Selected', value: totSel, color: 'bg-warning' },
    { label: 'Offer Made', value: totOfferMade, color: 'bg-orange-400' },
    { label: 'Offer Accepted', value: totOfferAcc, color: 'bg-success' },
    { label: 'Joined', value: totalFil, color: 'bg-emerald-600' },
  ];
  const maxFunnel = Math.max(...funnelStages.map(s => s.value), 1);

  const downloadExecReport = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Summary
    const summaryData = [
      { Metric: 'Total Vacancies', Value: totalVac },
      { Metric: 'Total Required', Value: totalReq },
      { Metric: 'Total Filled', Value: totalFil },
      { Metric: 'Total Remaining', Value: totalRem },
      { Metric: 'Fill Rate %', Value: `${fillPct}%` },
      { Metric: 'Closed Positions', Value: closed },
      { Metric: 'Open Positions', Value: open },
      { Metric: 'Avg Hiring TAT (days)', Value: avgTAT },
      { Metric: 'Min TAT (days)', Value: minTAT },
      { Metric: 'Max TAT (days)', Value: maxTAT },
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryData), 'Executive Summary');

    // Sheet 2: Pipeline Funnel
    const funnelData = funnelStages.map(s => ({ Stage: s.label, Count: s.value, 'Conversion %': totApplied > 0 ? `${Math.round((s.value / totApplied) * 100)}%` : '0%' }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(funnelData), 'Pipeline Funnel');

    // Sheet 3: TAT by Department
    const tatData = deptTAT.map(d => ({ Department: d.dept, 'Avg TAT (days)': d.avg, 'Closed Vacancies': d.count }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(tatData), 'TAT by Department');

    // Sheet 4: Monthly Trends
    const trendData = months.map(([m, c]) => ({ Month: m, Joinings: c }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(trendData), 'Monthly Trends');

    XLSX.writeFile(wb, `SIMATS_Executive_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success('Executive report downloaded!');
  };

  return (
    <div className="p-5 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-foreground">📊 Executive Summary Report</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Comprehensive hiring metrics for Director review</p>
        </div>
        <button onClick={downloadExecReport} className="px-3 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-md hover:opacity-90">
          ⇩ Download Full Report (Excel)
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-5 gap-2.5">
        <KPI value={totalVac} label="Vacancies" color="text-primary" />
        <KPI value={`${fillPct}%`} label="Fill Rate" color={fillPct >= 80 ? 'text-success' : 'text-warning'} />
        <KPI value={totalRem} label="Remaining" color="text-destructive" />
        <KPI value={`${avgTAT}d`} label="Avg Hiring TAT" color="text-accent" />
        <KPI value={totalFil} label="Total Joined" color="text-success" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Pipeline Funnel */}
        <div className="bg-card rounded-xl p-4 shadow-card">
          <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3">🔄 Hiring Pipeline Funnel</h4>
          <div className="space-y-2">
            {funnelStages.map((s, i) => {
              const pct = Math.max(5, Math.round((s.value / maxFunnel) * 100));
              const convPct = i > 0 && funnelStages[i - 1].value > 0
                ? Math.round((s.value / funnelStages[i - 1].value) * 100) : 100;
              return (
                <div key={s.label}>
                  <div className="flex justify-between text-[11px] mb-0.5">
                    <span className="font-semibold text-foreground">{s.label}</span>
                    <span className="text-muted-foreground">{s.value} {i > 0 ? `(${convPct}%)` : ''}</span>
                  </div>
                  <div className="bg-muted rounded h-3">
                    <div className={`h-3 rounded ${s.color} transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* TAT by Department */}
        <div className="bg-card rounded-xl p-4 shadow-card">
          <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3">⏱ Hiring TAT by Department</h4>
          {deptTAT.length === 0 ? (
            <div className="text-center text-muted-foreground py-8 text-xs">No closed vacancies yet to compute TAT.</div>
          ) : (
            <div className="space-y-2 max-h-[280px] overflow-y-auto">
              {deptTAT.map(d => {
                const maxD = Math.max(...deptTAT.map(x => x.avg), 1);
                const pct = Math.max(5, Math.round((d.avg / maxD) * 100));
                const bc = d.avg <= 15 ? 'bg-success' : d.avg <= 30 ? 'bg-warning' : 'bg-destructive';
                return (
                  <div key={d.dept}>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="font-semibold truncate max-w-[180px]" title={d.dept}>{d.dept}</span>
                      <span className="text-muted-foreground">{d.avg} days ({d.count})</span>
                    </div>
                    <div className="bg-muted rounded h-2">
                      <div className={`h-2 rounded ${bc}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAT Summary */}
          <div className="grid grid-cols-3 gap-1 mt-3 pt-2 border-t border-border">
            <div className="text-center bg-secondary rounded p-1.5">
              <div className="text-sm font-extrabold text-success">{minTAT}d</div>
              <div className="text-[9px] text-muted-foreground">Fastest</div>
            </div>
            <div className="text-center bg-secondary rounded p-1.5">
              <div className="text-sm font-extrabold text-accent">{avgTAT}d</div>
              <div className="text-[9px] text-muted-foreground">Average</div>
            </div>
            <div className="text-center bg-secondary rounded p-1.5">
              <div className="text-sm font-extrabold text-destructive">{maxTAT}d</div>
              <div className="text-[9px] text-muted-foreground">Slowest</div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="bg-card rounded-xl p-4 shadow-card">
        <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3">📈 Monthly Joining Trends (Last 6 Months)</h4>
        {months.length === 0 ? (
          <div className="text-center text-muted-foreground py-6 text-xs">No joining data with dates yet.</div>
        ) : (
          <div className="flex items-end gap-3 h-[120px]">
            {months.map(([m, c]) => {
              const maxC = Math.max(...months.map(x => x[1] as number), 1);
              const h = Math.max(8, Math.round((c / maxC) * 100));
              return (
                <div key={m} className="flex-1 flex flex-col items-center">
                  <span className="text-[10px] font-bold text-foreground mb-1">{c}</span>
                  <div className="w-full bg-primary/80 rounded-t" style={{ height: `${h}px` }} />
                  <span className="text-[9px] text-muted-foreground mt-1">{m.slice(5)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function KPI({ value, label, color }: { value: string | number; label: string; color: string }) {
  return (
    <div className="bg-card rounded-xl p-3 shadow-card text-center">
      <div className={`text-2xl font-extrabold leading-none ${color}`}>{value}</div>
      <div className="text-[10px] text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
