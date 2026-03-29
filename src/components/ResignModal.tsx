import React, { useState } from 'react';
import type { Vacancy } from '@/lib/api';

interface ResignModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { count: number; action: string; remark: string }) => void;
  vacancy: Vacancy | null;
}

export default function ResignModal({ open, onClose, onSave, vacancy }: ResignModalProps) {
  const [count, setCount] = useState(1);
  const [action, setAction] = useState('backfill');
  const [remark, setRemark] = useState('');

  if (!open || !vacancy) return null;

  const remaining = Math.max(0, vacancy.required_count - vacancy.filled_count);

  return (
    <div className="fixed inset-0 bg-black/45 z-[200] flex items-center justify-center" onClick={onClose}>
      <div className="bg-card rounded-xl p-6 w-[430px] shadow-elevated animate-fade-in" onClick={e => e.stopPropagation()}>
        <h2 className="text-sm font-bold text-foreground mb-4 border-b-2 border-destructive pb-2">Resignation / Vacancy Reopened</h2>
        <div className="bg-red-50 border border-red-300 rounded-lg p-3 mb-3.5 text-xs text-red-900 leading-relaxed">
          <b>{vacancy.vacancy_id}</b> — {vacancy.position}<br />
          Dept: <b>{vacancy.department}</b> | Required: <b>{vacancy.required_count}</b> | Filled: <b className="text-success">{vacancy.filled_count}</b> | Remaining: <b className="text-destructive">{remaining}</b>
        </div>
        <div className="space-y-3">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">Number of Resignations</label>
            <input type="number" min={1} value={count} onChange={e => setCount(Math.max(1, +e.target.value))}
              className="w-full border border-input rounded-md px-2 py-2.5 text-lg text-center font-bold outline-none focus:border-primary bg-card" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">Action on Required Count</label>
            <select value={action} onChange={e => setAction(e.target.value)}
              className="w-full border border-input rounded-md px-2 py-2 text-sm outline-none focus:border-primary bg-card">
              <option value="backfill">Add to Required (backfill needed)</option>
              <option value="nobackfill">Keep Required same (no backfill)</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">Resigned Person(s) / Remarks</label>
            <input value={remark} onChange={e => setRemark(e.target.value)} placeholder="e.g. Dr. Priya resigned"
              className="w-full border border-input rounded-md px-2 py-2 text-sm outline-none focus:border-primary bg-card" />
          </div>
        </div>
        <div className="bg-amber-50 rounded-lg p-2.5 text-[11px] text-amber-800 mt-3">
          <b>Backfill:</b> Filled reduces, Required increases → status reopens<br />
          <b>No backfill:</b> Filled reduces only, Required unchanged
        </div>
        <div className="flex gap-2.5 justify-end mt-4 pt-3 border-t border-border">
          <button onClick={onClose} className="px-4 py-2 text-xs font-semibold border border-border rounded-md bg-card hover:bg-muted">Cancel</button>
          <button onClick={() => { onSave({ count, action, remark }); setCount(1); setAction('backfill'); setRemark(''); }}
            className="px-4 py-2 text-xs font-semibold bg-destructive text-destructive-foreground rounded-md hover:opacity-90">Confirm Resignation</button>
        </div>
      </div>
    </div>
  );
}
