import { useState, useEffect } from 'react';
import type { Vacancy } from '@/lib/api';

export type CandidateBreakdown = {
  thesis_submitted: number;
  pursuing_phd: number;
  no_phd: number;
  rejected: number;
  waiting_list: number;
  in_progress: number;
  not_eligible: number;
  no_resume: number;
  not_interested: number;
  no_access: number;
  unknown: number;
};

const EMPTY_BREAKDOWN: CandidateBreakdown = {
  thesis_submitted: 0,
  pursuing_phd: 0,
  no_phd: 0,
  rejected: 0,
  waiting_list: 0,
  in_progress: 0,
  not_eligible: 0,
  no_resume: 0,
  not_interested: 0,
  no_access: 0,
  unknown: 0,
};

const DISQUALIFIED_LABELS: { key: keyof CandidateBreakdown; label: string; hint: string }[] = [
  { key: 'thesis_submitted', label: 'Thesis Submitted', hint: 'PhD thesis submitted but degree not yet awarded' },
  { key: 'pursuing_phd', label: 'Pursuing PhD', hint: 'Currently doing PhD — not yet completed' },
  { key: 'no_phd', label: 'No PhD', hint: 'Does not hold the required PhD qualification' },
  { key: 'rejected', label: 'Rejected', hint: 'Rejected by the selection committee' },
  { key: 'waiting_list', label: 'Waiting List', hint: 'On hold — not confirmed for the vacancy' },
  { key: 'in_progress', label: 'In Progress', hint: 'Documents/evaluation still pending — not yet processable' },
  { key: 'not_eligible', label: 'Not Eligible', hint: 'Does not meet basic eligibility criteria' },
  { key: 'no_resume', label: 'No Resume', hint: 'Has not submitted a CV/resume' },
  { key: 'not_interested', label: 'Not Interested', hint: 'Candidate declined or is not interested in the role' },
  { key: 'no_access', label: 'No Access', hint: 'Cannot reach candidate (number unreachable, no response)' },
  { key: 'unknown', label: 'Unknown', hint: 'Status not yet determined — profile received but not categorized' },
];

interface PipelineModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    applied: number;
    shortlisted: number;
    interviewed: number;
    selected: number;
    ad_date: string;
    ad_platform: string;
    offer_made: number;
    offer_accepted: number;
    offer_declined: number;
    candidate_breakdown: CandidateBreakdown;
  }) => void;
  vacancy: Vacancy | null;
}

export default function PipelineModal({ open, onClose, onSave, vacancy }: PipelineModalProps) {
  const [form, setForm] = useState({
    applied: 0, shortlisted: 0, interviewed: 0, selected: 0,
    ad_date: '', ad_platform: '', offer_made: 0, offer_accepted: 0, offer_declined: 0,
  });
  const [breakdown, setBreakdown] = useState<CandidateBreakdown>(EMPTY_BREAKDOWN);
  const [showBreakdown, setShowBreakdown] = useState(false);

  useEffect(() => {
    if (vacancy) {
      setForm({
        applied: vacancy.applied || 0,
        shortlisted: vacancy.shortlisted || 0,
        interviewed: vacancy.interviewed || 0,
        selected: vacancy.selected || 0,
        ad_date: vacancy.ad_date || '',
        ad_platform: vacancy.ad_platform || '',
        offer_made: vacancy.offer_made || 0,
        offer_accepted: vacancy.offer_accepted || 0,
        offer_declined: vacancy.offer_declined || 0,
      });
      const raw = vacancy.candidate_breakdown as Partial<CandidateBreakdown> | null;
      setBreakdown({ ...EMPTY_BREAKDOWN, ...(raw || {}) });
    }
  }, [vacancy]);

  if (!open || !vacancy) return null;

  const stages = [
    { key: 'applied', label: 'Applied', color: 'text-primary' },
    { key: 'shortlisted', label: 'Shortlisted', color: 'text-success' },
    { key: 'interviewed', label: 'Interviewed', color: 'text-accent' },
    { key: 'selected', label: 'Selected', color: 'text-warning' },
  ] as const;

  const totalDisqualified = Object.values(breakdown).reduce((s, n) => s + n, 0);
  const validCandidates = Math.max(0, form.applied - totalDisqualified);

  return (
    <div className="fixed inset-0 bg-black/45 z-[200] flex items-center justify-center" onClick={onClose}>
      <div
        className="bg-card rounded-xl p-6 w-[560px] max-h-[90vh] overflow-y-auto shadow-elevated animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-sm font-bold text-foreground mb-4 border-b-2 border-accent pb-2">Pipeline & Ad/Offer</h2>
        <div className="bg-violet-50 border border-violet-200 rounded-lg p-3 mb-3.5 text-xs text-violet-900">
          <b>{vacancy.vacancy_id}</b> — <b>{vacancy.position}</b><br />
          Dept: {vacancy.department} | Required: {vacancy.required_count} | Filled: {vacancy.filled_count}
        </div>

        {/* Pipeline Stages */}
        <div className="grid grid-cols-4 gap-2.5 mb-4">
          {stages.map(s => (
            <div key={s.key} className="bg-secondary/50 rounded-lg p-2.5 text-center">
              <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1.5">{s.label}</label>
              <input
                type="number" min={0}
                value={form[s.key]}
                onChange={e => setForm(f => ({ ...f, [s.key]: +e.target.value || 0 }))}
                className={`w-full text-xl font-extrabold text-center bg-transparent outline-none ${s.color}`}
              />
            </div>
          ))}
        </div>

        {/* Valid vs Disqualified summary */}
        {form.applied > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-3.5 text-center text-[11px]">
            <div className="bg-primary/10 rounded-lg p-2">
              <div className="text-lg font-extrabold text-primary">{form.applied}</div>
              <div className="text-muted-foreground">Total Applied</div>
            </div>
            <div className="bg-destructive/10 rounded-lg p-2">
              <div className="text-lg font-extrabold text-destructive">{totalDisqualified}</div>
              <div className="text-muted-foreground">Disqualified</div>
            </div>
            <div className="bg-success/10 rounded-lg p-2">
              <div className="text-lg font-extrabold text-success">{validCandidates}</div>
              <div className="text-muted-foreground">Valid Candidates</div>
            </div>
          </div>
        )}

        {/* Disqualified Breakdown Toggle */}
        <div className="mb-3">
          <button
            type="button"
            onClick={() => setShowBreakdown(s => !s)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-border bg-secondary/30 text-xs font-semibold hover:bg-secondary/60 transition"
          >
            <span>Disqualified Candidates Breakdown</span>
            <span className="flex items-center gap-2">
              {totalDisqualified > 0 && (
                <span className="bg-destructive text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">{totalDisqualified}</span>
              )}
              <span className="text-muted-foreground">{showBreakdown ? '▲' : '▼'}</span>
            </span>
          </button>
          {showBreakdown && (
            <div className="mt-2 border border-border rounded-lg overflow-hidden">
              <div className="bg-amber-50 border-b border-amber-200 px-3 py-1.5 text-[10px] text-amber-800">
                These statuses mean the candidate is <b>NOT valid</b> for this vacancy and should not be counted in the active pipeline.
              </div>
              <div className="grid grid-cols-1 divide-y divide-border">
                {DISQUALIFIED_LABELS.map(({ key, label, hint }) => (
                  <div key={key} className="flex items-center justify-between px-3 py-1.5 hover:bg-secondary/20">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-foreground">{label}</div>
                      <div className="text-[10px] text-muted-foreground truncate" title={hint}>{hint}</div>
                    </div>
                    <input
                      type="number" min={0}
                      value={breakdown[key]}
                      onChange={e => setBreakdown(b => ({ ...b, [key]: +e.target.value || 0 }))}
                      className="w-14 text-center border border-input rounded-md px-1 py-0.5 text-sm font-bold outline-none focus:border-destructive bg-card ml-3"
                    />
                  </div>
                ))}
              </div>
              <div className="px-3 py-2 bg-secondary/30 flex justify-between text-xs border-t border-border">
                <span className="font-semibold text-muted-foreground">Total Disqualified</span>
                <span className="font-extrabold text-destructive">{totalDisqualified}</span>
              </div>
            </div>
          )}
        </div>

        {/* Ad Info */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">Ad Date</label>
            <input type="date" value={form.ad_date} onChange={e => setForm(f => ({ ...f, ad_date: e.target.value }))}
              className="border border-input rounded-md px-2 py-1.5 text-sm outline-none focus:border-primary bg-card" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">Ad Platform</label>
            <input value={form.ad_platform} onChange={e => setForm(f => ({ ...f, ad_platform: e.target.value }))} placeholder="e.g. LinkedIn"
              className="border border-input rounded-md px-2 py-1.5 text-sm outline-none focus:border-primary bg-card" />
          </div>
        </div>

        {/* Offers */}
        <div className="grid grid-cols-3 gap-2.5 mb-3">
          {[
            { key: 'offer_made', label: 'Offers Made' },
            { key: 'offer_accepted', label: 'Accepted' },
            { key: 'offer_declined', label: 'Declined' },
          ].map(o => (
            <div key={o.key} className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">{o.label}</label>
              <input type="number" min={0} value={(form as any)[o.key]} onChange={e => setForm(f => ({ ...f, [o.key]: +e.target.value || 0 }))}
                className="border border-input rounded-md px-2 py-1.5 text-sm text-center outline-none focus:border-primary bg-card" />
            </div>
          ))}
        </div>

        <div className="flex gap-2.5 justify-end mt-4 pt-3 border-t border-border">
          <button onClick={onClose} className="px-4 py-2 text-xs font-semibold border border-border rounded-md bg-card hover:bg-muted">Cancel</button>
          <button
            onClick={() => onSave({ ...form, candidate_breakdown: breakdown })}
            className="px-4 py-2 text-xs font-semibold bg-accent text-accent-foreground rounded-md hover:opacity-90"
          >
            Save Pipeline
          </button>
        </div>
      </div>
    </div>
  );
}
