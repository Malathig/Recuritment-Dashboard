import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Joining } from '@/lib/api';
import { updateJoining } from '@/lib/api';

interface OnboardingViewProps {
  joinings: Joining[];
}

const ONBOARDING_STEPS = [
  'Offer Letter Issued',
  'Documents Verified',
  'ID Card Created',
  'Bio-metric Enrolled',
  'Bank Account Linked',
  'Department Induction',
  'IT Access Granted',
  'Probation Briefing',
];

export default function OnboardingView({ joinings }: OnboardingViewProps) {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'pending' | 'complete'>('all');

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Joining> }) => updateJoining(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['joinings'] }),
  });

  const toggleStep = (joining: Joining, stepIdx: number) => {
    const onb = (joining.onboarding as Record<string, string> | null) || {};
    const key = `step_${stepIdx}`;
    const updated = { ...onb };
    if (updated[key]) {
      delete updated[key];
    } else {
      updated[key] = new Date().toISOString();
    }
    const doneCount = Object.keys(updated).length;
    const isComplete = doneCount >= ONBOARDING_STEPS.length;
    updateMut.mutate({ id: joining.id, data: { onboarding: updated, onb_complete: isComplete } });
  };

  const getStepsDone = (j: Joining) => {
    const onb = (j.onboarding as Record<string, string> | null) || {};
    return Object.keys(onb).filter(k => k.startsWith('step_')).length;
  };

  const filtered = joinings.filter(j => {
    if (filter === 'complete') return j.onb_complete;
    if (filter === 'pending') return !j.onb_complete;
    return true;
  });

  const totalComplete = joinings.filter(j => j.onb_complete).length;
  const totalPending = joinings.length - totalComplete;

  return (
    <div className="p-5 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[15px] font-bold text-foreground">Onboarding Tracker</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Track onboarding checklist for each joining</p>
        </div>
        <div className="flex gap-2">
          {(['all', 'pending', 'complete'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1 text-[11px] font-semibold rounded-full border transition ${filter === f ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border text-muted-foreground hover:bg-secondary'}`}>
              {f === 'all' ? `All (${joinings.length})` : f === 'pending' ? `Pending (${totalPending})` : `Complete (${totalComplete})`}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2.5">
        <div className="stat-card border-l-primary">
          <div className="stat-card-value text-primary">{joinings.length}</div>
          <div className="stat-card-label">Total Joinings</div>
        </div>
        <div className="stat-card border-l-success">
          <div className="stat-card-value text-success">{totalComplete}</div>
          <div className="stat-card-label">Onboarding Complete</div>
        </div>
        <div className="stat-card border-l-warning">
          <div className="stat-card-value text-warning">{totalPending}</div>
          <div className="stat-card-label">Pending</div>
        </div>
        <div className="stat-card border-l-info">
          <div className="stat-card-value text-info">
            {joinings.length > 0 ? Math.round(totalComplete / joinings.length * 100) : 0}%
          </div>
          <div className="stat-card-label">Completion Rate</div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">No joinings to show.</div>
      ) : filtered.map(j => {
        const done = getStepsDone(j);
        const pct = Math.round(done / ONBOARDING_STEPS.length * 100);
        const onb = (j.onboarding as Record<string, string> | null) || {};

        return (
          <div key={j.id} className="bg-card rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2.5">
              <div>
                <span className="text-sm font-bold text-foreground">{j.name}</span>
                <span className="text-[11px] text-muted-foreground ml-2">{j.position} — {j.department}</span>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${j.onb_complete ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                {j.onb_complete ? '✓ Complete' : `${done}/${ONBOARDING_STEPS.length} pending`}
              </span>
            </div>
            <div className="bg-muted rounded-full h-1.5 mb-3">
              <div className={`h-1.5 rounded-full transition-all ${pct === 100 ? 'bg-success' : 'bg-primary'}`} style={{ width: `${pct}%` }} />
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {ONBOARDING_STEPS.map((step, idx) => {
                const isDone = !!onb[`step_${idx}`];
                return (
                  <div
                    key={idx}
                    onClick={() => toggleStep(j, idx)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-md border text-xs cursor-pointer transition ${isDone ? 'bg-emerald-50 border-emerald-300' : 'bg-secondary/30 border-border hover:bg-secondary/60'}`}
                  >
                    <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${isDone ? 'bg-success border-success text-success-foreground' : 'border-border'}`}>
                      {isDone ? '✓' : ''}
                    </span>
                    <span className={`font-semibold ${isDone ? 'text-emerald-700' : 'text-foreground'}`}>{step}</span>
                    {isDone && onb[`step_${idx}`] && (
                      <span className="ml-auto text-[10px] text-muted-foreground">
                        {new Date(onb[`step_${idx}`]).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
