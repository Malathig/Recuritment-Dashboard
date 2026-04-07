import type { Vacancy } from '@/lib/api';
import type { CandidateBreakdown } from './PipelineModal';

interface PipelineViewProps {
  vacancies: Vacancy[];
}

function getBreakdown(v: Vacancy): CandidateBreakdown {
  const raw = v.candidate_breakdown as Partial<CandidateBreakdown> | null;
  return {
    thesis_submitted: raw?.thesis_submitted || 0,
    pursuing_phd: raw?.pursuing_phd || 0,
    no_phd: raw?.no_phd || 0,
    rejected: raw?.rejected || 0,
    waiting_list: raw?.waiting_list || 0,
    in_progress: raw?.in_progress || 0,
    not_eligible: raw?.not_eligible || 0,
    no_resume: raw?.no_resume || 0,
    not_interested: raw?.not_interested || 0,
    no_access: raw?.no_access || 0,
    unknown: raw?.unknown || 0,
  };
}

function totalDisq(b: CandidateBreakdown) {
  return Object.values(b).reduce((s, n) => s + n, 0);
}

const DISQ_LABELS: { key: keyof CandidateBreakdown; label: string }[] = [
  { key: 'thesis_submitted', label: 'Thesis Submitted' },
  { key: 'pursuing_phd', label: 'Pursuing PhD' },
  { key: 'no_phd', label: 'No PhD' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'waiting_list', label: 'Waiting List' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'not_eligible', label: 'Not Eligible' },
  { key: 'no_resume', label: 'No Resume' },
  { key: 'not_interested', label: 'Not Interested' },
  { key: 'no_access', label: 'No Access' },
  { key: 'unknown', label: 'Unknown' },
];

export default function PipelineView({ vacancies }: PipelineViewProps) {
  const withPipe = vacancies.filter(v => (v.applied || 0) > 0);

  const totApplied = vacancies.reduce((s, v) => s + (v.applied || 0), 0);
  const totShort = vacancies.reduce((s, v) => s + (v.shortlisted || 0), 0);
  const totInter = vacancies.reduce((s, v) => s + (v.interviewed || 0), 0);
  const totSel = vacancies.reduce((s, v) => s + (v.selected || 0), 0);

  const totDisq = vacancies.reduce((s, v) => s + totalDisq(getBreakdown(v)), 0);
  const totValid = Math.max(0, totApplied - totDisq);

  // Aggregate disqualification reasons across all vacancies
  const aggBreakdown = vacancies.reduce((acc, v) => {
    const b = getBreakdown(v);
    for (const k of Object.keys(b) as (keyof CandidateBreakdown)[]) {
      acc[k] = (acc[k] || 0) + b[k];
    }
    return acc;
  }, {} as Record<keyof CandidateBreakdown, number>);

  return (
    <div className="p-5 space-y-4 animate-fade-in">
      <div>
        <h3 className="text-[15px] font-bold text-foreground">Candidate Pipeline</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Track candidates from application to selection per vacancy</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-6 gap-2.5">
        <div className="stat-card border-l-primary"><div className="stat-card-value text-primary">{totApplied}</div><div className="stat-card-label">Total Applied</div></div>
        <div className="stat-card border-l-destructive"><div className="stat-card-value text-destructive">{totDisq}</div><div className="stat-card-label">Disqualified</div></div>
        <div className="stat-card border-l-success"><div className="stat-card-value text-success">{totValid}</div><div className="stat-card-label">Valid Candidates</div></div>
        <div className="stat-card border-l-info"><div className="stat-card-value text-info">{totShort}</div><div className="stat-card-label">Shortlisted</div></div>
        <div className="stat-card border-l-accent"><div className="stat-card-value text-accent">{totInter}</div><div className="stat-card-label">Interviewed</div></div>
        <div className="stat-card border-l-warning"><div className="stat-card-value text-warning">{totSel}</div><div className="stat-card-label">Selected</div></div>
      </div>

      {/* Disqualification Reason Summary */}
      {totDisq > 0 && (
        <div className="bg-card rounded-lg shadow-card overflow-hidden">
          <div className="px-4 py-2.5 border-b border-border bg-red-50/60 flex justify-between">
            <span className="text-sm font-bold text-destructive">Disqualified Candidate Breakdown</span>
            <span className="text-[11px] text-muted-foreground">{totDisq} total disqualified (not valid for any vacancy)</span>
          </div>
          <div className="grid grid-cols-4 gap-0 divide-x divide-y divide-border">
            {DISQ_LABELS.map(({ key, label }) => {
              const count = aggBreakdown[key] || 0;
              if (count === 0) return null;
              const pct = totDisq > 0 ? Math.round((count / totDisq) * 100) : 0;
              return (
                <div key={key} className="px-3 py-2 flex items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-semibold text-foreground">{label}</div>
                    <div className="w-full bg-muted rounded h-1 mt-1 min-w-[80px]">
                      <div className="h-1 rounded bg-destructive" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <span className="text-sm font-extrabold text-destructive ml-2">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Vacancy-wise Pipeline Table */}
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
                  {['Vacancy ID', 'Position', 'Department', 'Applied', 'Disqualified', 'Valid', 'Shortlisted', 'Interviewed', 'Selected', 'Offers', 'Filled', 'Ad Platform', 'Ad Date'].map(h => (
                    <th key={h} className={`px-2.5 py-2 text-left font-bold border-b-2 border-border ${h === 'Disqualified' ? 'text-destructive' : h === 'Valid' ? 'text-success' : 'text-muted-foreground'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {withPipe.map(v => {
                  const b = getBreakdown(v);
                  const disq = totalDisq(b);
                  const valid = Math.max(0, (v.applied || 0) - disq);
                  return (
                    <tr key={v.id} className="border-b border-border/50 hover:bg-secondary/30">
                      <td className="px-2.5 py-2 font-bold text-foreground text-[11px]">{v.vacancy_id}</td>
                      <td className="px-2.5 py-2 font-semibold truncate max-w-[160px]">{v.position}</td>
                      <td className="px-2.5 py-2 text-[11px]">{v.department}</td>
                      <td className="px-2.5 py-2 text-center font-bold text-primary">{v.applied}</td>
                      <td className="px-2.5 py-2 text-center font-bold text-destructive">
                        {disq > 0 ? (
                          <span title={DISQ_LABELS.filter(l => b[l.key] > 0).map(l => `${l.label}: ${b[l.key]}`).join(', ')}
                            className="cursor-help underline decoration-dotted">{disq}</span>
                        ) : '—'}
                      </td>
                      <td className="px-2.5 py-2 text-center font-bold text-success">{valid}</td>
                      <td className="px-2.5 py-2 text-center font-bold text-info">{v.shortlisted || 0}</td>
                      <td className="px-2.5 py-2 text-center font-bold text-accent">{v.interviewed || 0}</td>
                      <td className="px-2.5 py-2 text-center font-bold text-warning">{v.selected || 0}</td>
                      <td className="px-2.5 py-2 text-center text-[10px]">
                        {v.offer_made || 0} made<br />{v.offer_accepted || 0} acc / {v.offer_declined || 0} dec
                      </td>
                      <td className="px-2.5 py-2 text-center font-bold text-success">{v.filled_count}</td>
                      <td className="px-2.5 py-2">{v.ad_platform ? <span className="badge-admin">{v.ad_platform}</span> : <span className="text-muted-foreground">—</span>}</td>
                      <td className="px-2.5 py-2 text-muted-foreground">{v.ad_date || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-[11px] text-amber-800 space-y-1">
        <div className="font-bold mb-1">Disqualified Status Meanings</div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-0.5">
          {DISQ_LABELS.map(({ label }) => {
            const hints: Record<string, string> = {
              'Thesis Submitted': 'PhD thesis submitted but degree not yet awarded',
              'Pursuing PhD': 'Currently doing PhD — not yet completed',
              'No PhD': 'Does not hold the required PhD qualification',
              'Rejected': 'Rejected by the selection committee',
              'Waiting List': 'On hold — not confirmed for the vacancy',
              'In Progress': 'Documents/evaluation still pending — not processable',
              'Not Eligible': 'Does not meet basic eligibility criteria',
              'No Resume': 'Has not submitted a CV/resume',
              'Not Interested': 'Candidate declined or not interested in the role',
              'No Access': 'Cannot reach candidate (unreachable number/no response)',
              'Unknown': 'Status not yet determined — profile received but not categorized by HR',
            };
            return (
              <div key={label}><b>{label}:</b> {hints[label]}</div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
