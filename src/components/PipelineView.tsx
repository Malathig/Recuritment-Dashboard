import React from 'react';
import type { Vacancy } from '@/lib/api';

interface PipelineViewProps {
  vacancies: Vacancy[];
}

export default function PipelineView({ vacancies }: PipelineViewProps) {
  const withPipe = vacancies.filter(v => (v.applied || 0) > 0);
  const totApplied = vacancies.reduce((s, v) => s + (v.applied || 0), 0);
  const totShort = vacancies.reduce((s, v) => s + (v.shortlisted || 0), 0);
  const totInter = vacancies.reduce((s, v) => s + (v.interviewed || 0), 0);
  const totSel = vacancies.reduce((s, v) => s + (v.selected || 0), 0);

  return (
    <div className="p-5 space-y-4 animate-fade-in">
      <div>
        <h3 className="text-[15px] font-bold text-foreground">Candidate Pipeline</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Track candidates from application to selection per vacancy</p>
      </div>

      <div className="grid grid-cols-4 gap-2.5">
        <div className="stat-card border-l-primary"><div className="stat-card-value text-primary">{totApplied}</div><div className="stat-card-label">Total Applied</div></div>
        <div className="stat-card border-l-success"><div className="stat-card-value text-success">{totShort}</div><div className="stat-card-label">Shortlisted</div></div>
        <div className="stat-card border-l-accent"><div className="stat-card-value text-accent">{totInter}</div><div className="stat-card-label">Interviewed</div></div>
        <div className="stat-card border-l-warning"><div className="stat-card-value text-warning">{totSel}</div><div className="stat-card-label">Selected</div></div>
      </div>

      <div className="bg-card rounded-lg shadow-card overflow-hidden">
        <div className="px-4 py-2.5 border-b border-border bg-secondary/30 flex justify-between">
          <span className="text-sm font-bold text-foreground">Vacancy-wise Pipeline</span>
          <span className="text-[11px] text-muted-foreground">{withPipe.length} vacancies with pipeline data</span>
        </div>
        {withPipe.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No pipeline data yet. Click the <b className="text-accent">Pipeline</b> button on any vacancy row to start tracking.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-secondary/50">
                  {['Vacancy ID', 'Position', 'Department', 'Applied', 'Shortlisted', 'Interviewed', 'Selected', 'Offers', 'Filled', 'Ad Platform', 'Ad Date'].map(h => (
                    <th key={h} className="px-2.5 py-2 text-left font-bold text-muted-foreground border-b-2 border-border">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {withPipe.map(v => (
                  <tr key={v.id} className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="px-2.5 py-2 font-bold text-foreground text-[11px]">{v.vacancy_id}</td>
                    <td className="px-2.5 py-2 font-semibold truncate max-w-[160px]">{v.position}</td>
                    <td className="px-2.5 py-2 text-[11px]">{v.department}</td>
                    <td className="px-2.5 py-2 text-center font-bold text-primary">{v.applied}</td>
                    <td className="px-2.5 py-2 text-center font-bold text-success">{v.shortlisted || 0}</td>
                    <td className="px-2.5 py-2 text-center font-bold text-accent">{v.interviewed || 0}</td>
                    <td className="px-2.5 py-2 text-center font-bold text-warning">{v.selected || 0}</td>
                    <td className="px-2.5 py-2 text-center text-[10px]">
                      {v.offer_made || 0} made<br />{v.offer_accepted || 0} acc / {v.offer_declined || 0} dec
                    </td>
                    <td className="px-2.5 py-2 text-center font-bold text-success">{v.filled_count}</td>
                    <td className="px-2.5 py-2">{v.ad_platform ? <span className="badge-admin">{v.ad_platform}</span> : <span className="text-muted-foreground">—</span>}</td>
                    <td className="px-2.5 py-2 text-muted-foreground">{v.ad_date || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
