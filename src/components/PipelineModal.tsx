import React, { useState, useEffect } from 'react';
import type { Vacancy } from '@/lib/api';

interface PipelineModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { applied: number; shortlisted: number; interviewed: number; selected: number; ad_date: string; ad_platform: string; offer_made: number; offer_accepted: number; offer_declined: number }) => void;
  vacancy: Vacancy | null;
}

export default function PipelineModal({ open, onClose, onSave, vacancy }: PipelineModalProps) {
  const [form, setForm] = useState({
    applied: 0, shortlisted: 0, interviewed: 0, selected: 0,
    ad_date: '', ad_platform: '', offer_made: 0, offer_accepted: 0, offer_declined: 0
  });

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
    }
  }, [vacancy]);

  if (!open || !vacancy) return null;

  const stages = [
    { key: 'applied', label: 'Applied', color: 'text-primary' },
    { key: 'shortlisted', label: 'Shortlisted', color: 'text-success' },
    { key: 'interviewed', label: 'Interviewed', color: 'text-accent' },
    { key: 'selected', label: 'Selected', color: 'text-warning' },
  ] as const;

  return (
    <div className="fixed inset-0 bg-black/45 z-[200] flex items-center justify-center" onClick={onClose}>
      <div className="bg-card rounded-xl p-6 w-[480px] shadow-elevated animate-fade-in" onClick={e => e.stopPropagation()}>
        <h2 className="text-sm font-bold text-foreground mb-4 border-b-2 border-accent pb-2">Pipeline & Ad/Offer</h2>
        <div className="bg-violet-50 border border-violet-200 rounded-lg p-3 mb-3.5 text-xs text-violet-900">
          <b>{vacancy.vacancy_id}</b> — <b>{vacancy.position}</b><br />
          Dept: {vacancy.department} | Required: {vacancy.required_count} | Filled: {vacancy.filled_count}
        </div>

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
          <button onClick={() => onSave(form)}
            className="px-4 py-2 text-xs font-semibold bg-accent text-accent-foreground rounded-md hover:opacity-90">Save Pipeline</button>
        </div>
      </div>
    </div>
  );
}
