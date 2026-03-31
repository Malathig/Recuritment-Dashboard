import React, { useState } from 'react';
import type { Vacancy } from '@/lib/api';
import { COLLEGES } from '@/lib/api';

interface JoinModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  vacancy: Vacancy | null;
}

export default function JoinModal({ open, onClose, onSave, vacancy }: JoinModalProps) {
  const [form, setForm] = useState({
    name: '', date: '', college: 'SSE', joining_status: 'New',
    emp_id: '', bio_id: '', qualification: '', address: '', remarks: '', referred_by: ''
  });

  const handleSave = () => {
    if (!form.name.trim()) return;
    onSave({
      ...form,
      vacancy_id: vacancy?.vacancy_id,
      position: vacancy?.position,
      department: vacancy?.department,
      job_type: vacancy?.job_type,
    });
    setForm({ name: '', date: '', college: 'SSE', joining_status: 'New', emp_id: '', bio_id: '', qualification: '', address: '', remarks: '', referred_by: '' });
  };

  if (!open || !vacancy) return null;

  const remaining = Math.max(0, vacancy.required_count - vacancy.filled_count);

  return (
    <div className="fixed inset-0 bg-black/45 z-[200] flex items-center justify-center" onClick={onClose}>
      <div className="bg-card rounded-xl p-6 w-[430px] max-h-[92vh] overflow-y-auto shadow-elevated animate-fade-in" onClick={e => e.stopPropagation()}>
        <h2 className="text-sm font-bold text-foreground mb-4 border-b-2 border-success pb-2">Record New Joining</h2>
        <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-3 mb-3.5 text-xs text-emerald-900 leading-relaxed">
          <b>{vacancy.vacancy_id}</b> — {vacancy.position}<br />
          Dept: <b>{vacancy.department}</b> | Required: <b>{vacancy.required_count}</b> | Filled: <b className="text-success">{vacancy.filled_count}</b> | Remaining: <b className="text-destructive">{remaining}</b>
        </div>

        <div className="space-y-3">
          <Field label="Candidate Name">
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Dr. Anitha Krishnan"
              className="w-full border border-input rounded-md px-2 py-2 text-sm outline-none focus:border-primary bg-card" />
          </Field>
          <Field label="Date of Joining">
            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              className="w-full border border-input rounded-md px-2 py-2 text-sm outline-none focus:border-primary bg-card" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="College / Campus">
              <select value={form.college} onChange={e => setForm(f => ({ ...f, college: e.target.value }))}
                className="w-full border border-input rounded-md px-2 py-2 text-sm outline-none focus:border-primary bg-card">
                {COLLEGES.map(c => <option key={c.code} value={c.code}>{c.code} — {c.name}</option>)}
              </select>
            </Field>
            <Field label="Joining Status">
              <select value={form.joining_status} onChange={e => setForm(f => ({ ...f, joining_status: e.target.value }))}
                className="w-full border border-input rounded-md px-2 py-2 text-sm outline-none focus:border-primary bg-card">
                <option value="New">New</option>
                <option value="Rejoin">Rejoin</option>
                <option value="Left">Left</option>
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Employee ID">
              <input value={form.emp_id} onChange={e => setForm(f => ({ ...f, emp_id: e.target.value }))} placeholder="e.g. SSE2025001"
                className="w-full border border-input rounded-md px-2 py-2 text-sm outline-none focus:border-primary bg-card" />
            </Field>
            <Field label="Bio ID">
              <input value={form.bio_id} onChange={e => setForm(f => ({ ...f, bio_id: e.target.value }))} placeholder="e.g. BIO1234"
                className="w-full border border-input rounded-md px-2 py-2 text-sm outline-none focus:border-primary bg-card" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Qualification">
              <input value={form.qualification} onChange={e => setForm(f => ({ ...f, qualification: e.target.value }))} placeholder="e.g. Ph.D"
                className="w-full border border-input rounded-md px-2 py-2 text-sm outline-none focus:border-primary bg-card" />
            </Field>
            <Field label="Address">
              <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="City - Pincode"
                className="w-full border border-input rounded-md px-2 py-2 text-sm outline-none focus:border-primary bg-card" />
            </Field>
          </div>
          <Field label="Referred / Called By (Faculty Name)">
            <input value={form.referred_by} onChange={e => setForm(f => ({ ...f, referred_by: e.target.value }))} placeholder="e.g. Dr. Kumar, Prof. Ravi"
              className="w-full border border-input rounded-md px-2 py-2 text-sm outline-none focus:border-primary bg-card" />
          </Field>
          <Field label="Remarks (optional)">
            <input value={form.remarks} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))} placeholder="e.g. Lateral entry"
              className="w-full border border-input rounded-md px-2 py-2 text-sm outline-none focus:border-primary bg-card" />
          </Field>
        </div>

        <div className="bg-amber-50 rounded-lg p-2.5 text-[11px] text-amber-800 mt-3">
          Filled count will increase by 1 automatically. If all positions filled, status will close.
        </div>
        <div className="flex gap-2.5 justify-end mt-4 pt-3 border-t border-border">
          <button onClick={onClose} className="px-4 py-2 text-xs font-semibold border border-border rounded-md bg-card hover:bg-muted">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 text-xs font-semibold bg-success text-success-foreground rounded-md hover:opacity-90">Record Joining</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold text-muted-foreground uppercase">{label}</label>
      {children}
    </div>
  );
}
