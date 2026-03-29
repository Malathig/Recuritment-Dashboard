import React from 'react';
import type { Vacancy } from '@/lib/api';

interface DashboardViewProps {
  vacancies: Vacancy[];
}

export default function DashboardView({ vacancies }: DashboardViewProps) {
  const total = vacancies.length;
  const totalReq = vacancies.reduce((s, v) => s + v.required_count, 0);
  const totalFil = vacancies.reduce((s, v) => s + v.filled_count, 0);
  const totalRem = Math.max(0, totalReq - totalFil);
  const closed = vacancies.filter(v => v.status === 'Closed').length;
  const open = vacancies.filter(v => v.status === 'Need to Hire').length;
  const fillPct = totalReq > 0 ? Math.round(totalFil / totalReq * 100) : 0;

  const tsRows = vacancies.filter(v => v.job_type === 'TS');
  const ntsRows = vacancies.filter(v => v.job_type === 'NTS');
  const tsReq = tsRows.reduce((s, v) => s + v.required_count, 0);
  const tsFil = tsRows.reduce((s, v) => s + v.filled_count, 0);
  const ntsReq = ntsRows.reduce((s, v) => s + v.required_count, 0);
  const ntsFil = ntsRows.reduce((s, v) => s + v.filled_count, 0);
  const tsPct = tsReq > 0 ? Math.round(tsFil / tsReq * 100) : 0;
  const ntsPct = ntsReq > 0 ? Math.round(ntsFil / ntsReq * 100) : 0;

  const departments = [...new Set(vacancies.map(v => v.department).filter(Boolean))].sort();
  const topDepts = departments.map(d => {
    const rows = vacancies.filter(v => v.department === d);
    const req = rows.reduce((s, v) => s + v.required_count, 0);
    const fil = rows.reduce((s, v) => s + v.filled_count, 0);
    return { name: d, req, fil, rem: Math.max(0, req - fil) };
  }).sort((a, b) => b.rem - a.rem).slice(0, 8);

  const categories = [
    { key: 'TS', label: 'Teaching (TS)', color: '#7c3aed' },
    { key: 'NTS-Admin', label: 'Administrative', color: '#0369a1' },
    { key: 'NTS-Technical', label: 'Technical', color: '#065f46' },
    { key: 'NTS-Maint', label: 'Maintenance', color: '#92400e' },
    { key: 'NTS-HK', label: 'Housekeeping', color: '#be185d' },
    { key: 'NTS-Security', label: 'Security', color: '#991b1b' },
  ];

  return (
    <div className="p-5 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-lg font-extrabold text-foreground">Director Dashboard</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Real-time recruitment overview</p>
        </div>
        <span className="text-[11px] text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">
          {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      </div>

      {/* Row 1: Big Stats */}
      <div className="grid grid-cols-4 gap-3">
        <StatBox value={total} label="Total Vacancies" color="text-primary" />
        <StatBox value={`${fillPct}%`} label="Overall Fill Rate" color={fillPct >= 80 ? 'text-success' : fillPct >= 50 ? 'text-warning' : 'text-destructive'} />
        <StatBox value={closed} label="Closed" color="text-success" />
        <StatBox value={open} label="Need to Hire" color="text-warning" />
      </div>

      {/* Row 2: Category, Top Depts, TS vs NTS */}
      <div className="grid grid-cols-3 gap-3">
        {/* Category Summary */}
        <div className="bg-card rounded-xl p-4 shadow-card">
          <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Category Breakdown</h4>
          {categories.map(cat => {
            const rows = vacancies.filter(v => v.sub_category === cat.key);
            const req = rows.reduce((s, v) => s + v.required_count, 0);
            const fil = rows.reduce((s, v) => s + v.filled_count, 0);
            const pct = req > 0 ? Math.round(fil / req * 100) : 0;
            return (
              <div key={cat.key} className="flex items-center gap-2 py-1.5 border-b border-border/50 last:border-0 text-xs">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                <span className="flex-1 text-foreground">{cat.label}</span>
                <span className="font-bold min-w-[28px] text-right">{rows.length}</span>
                <span className="text-[10px] text-muted-foreground min-w-[36px] text-right">{pct}%</span>
              </div>
            );
          })}
          {/* Totals */}
          <div className="grid grid-cols-3 gap-1 mt-3 pt-2 border-t border-border">
            <MiniStat value={totalReq} label="Required" bg="bg-secondary" />
            <MiniStat value={totalFil} label="Filled" bg="bg-emerald-50" color="text-success" />
            <MiniStat value={totalRem} label="Remaining" bg="bg-red-50" color="text-destructive" />
          </div>
        </div>

        {/* Top Departments */}
        <div className="bg-card rounded-xl p-4 shadow-card">
          <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Top Departments</h4>
          {topDepts.length === 0 ? (
            <div className="text-center text-muted-foreground py-8 text-xs">No vacancy data yet.</div>
          ) : topDepts.map(d => {
            const pct = d.req > 0 ? Math.round(d.fil / d.req * 100) : 0;
            const bc = pct === 100 ? 'bg-success' : pct >= 50 ? 'bg-warning' : 'bg-destructive';
            return (
              <div key={d.name} className="mb-2">
                <div className="flex justify-between text-[11px] mb-0.5">
                  <span className="font-semibold truncate max-w-[140px]" title={d.name}>{d.name}</span>
                  <span className="text-muted-foreground text-[10px]">{d.fil}/{d.req} · <b className="text-destructive">{d.rem} rem</b></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="flex-1 bg-muted rounded h-1.5">
                    <div className={`h-1.5 rounded ${bc}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-[10px] font-bold min-w-[28px] text-right">{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* TS vs NTS */}
        <div className="bg-card rounded-xl p-4 shadow-card">
          <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3">TS vs NTS</h4>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-violet-50 rounded-lg p-3 text-center">
              <div className="text-xl font-extrabold text-accent">{tsRows.length}</div>
              <div className="text-[10px] font-semibold text-violet-700 mb-1">Teaching (TS)</div>
              <div className="text-[10px] text-muted-foreground">Req:<b>{tsReq}</b> Fil:<b className="text-success">{tsFil}</b></div>
              <div className="bg-violet-200/50 rounded h-1 mt-1.5">
                <div className="h-1 rounded bg-accent" style={{ width: `${tsPct}%` }} />
              </div>
              <div className="text-[9px] text-accent mt-0.5">{tsPct}% filled</div>
            </div>
            <div className="bg-sky-50 rounded-lg p-3 text-center">
              <div className="text-xl font-extrabold text-info">{ntsRows.length}</div>
              <div className="text-[10px] font-semibold text-sky-700 mb-1">Non-Teaching (NTS)</div>
              <div className="text-[10px] text-muted-foreground">Req:<b>{ntsReq}</b> Fil:<b className="text-success">{ntsFil}</b></div>
              <div className="bg-sky-200/50 rounded h-1 mt-1.5">
                <div className="h-1 rounded bg-info" style={{ width: `${ntsPct}%` }} />
              </div>
              <div className="text-[9px] text-info mt-0.5">{ntsPct}% filled</div>
            </div>
          </div>

          {/* Alerts */}
          <h4 className="text-[11px] font-bold text-muted-foreground mb-1.5">🔔 Alerts</h4>
          {open === 0 ? (
            <div className="text-[11px] text-muted-foreground p-2">No alerts. Everything on track.</div>
          ) : (
            <div className="bg-amber-50 border-l-[3px] border-warning rounded p-2 text-[11px] text-amber-800">
              ⚠ {open} vacancies still need to hire. {totalRem} positions remaining.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatBox({ value, label, color }: { value: string | number; label: string; color: string }) {
  return (
    <div className="bg-card rounded-xl p-4 shadow-card">
      <div className={`text-3xl font-extrabold leading-none ${color}`}>{value}</div>
      <div className="text-[11px] text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function MiniStat({ value, label, bg, color }: { value: number; label: string; bg: string; color?: string }) {
  return (
    <div className={`text-center p-1.5 rounded ${bg}`}>
      <div className={`text-sm font-extrabold ${color || 'text-foreground'}`}>{value}</div>
      <div className="text-[9px] text-muted-foreground">{label}</div>
    </div>
  );
}
