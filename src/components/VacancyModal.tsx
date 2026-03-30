import React, { useState, useEffect } from 'react';
import type { Vacancy, VacancyInsert, VacancyUpdate } from '@/lib/api';
import { generateVacancyId } from '@/lib/api';

interface VacancyModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: VacancyInsert | VacancyUpdate, isEdit: boolean) => void;
  vacancy: Vacancy | null;
  existingIds: string[];
}

export default function VacancyModal({ open, onClose, onSave, vacancy, existingIds }: VacancyModalProps) {
  const isEdit = !!vacancy;
  const [form, setForm] = useState({
    vacancy_id: '', job_type: 'NTS', sub_category: 'NTS-Admin',
    block: '', location: '', position: '', department: '',
    required_count: 1, filled_count: 0, status: 'Need to Hire' as string,
    remarks: '', requestor: '', grade: ''
  });

  useEffect(() => {
    if (vacancy) {
      setForm({
        vacancy_id: vacancy.vacancy_id,
        job_type: vacancy.job_type,
        sub_category: vacancy.sub_category,
        block: vacancy.block || '',
        location: vacancy.location || '',
        position: vacancy.position,
        department: vacancy.department,
        required_count: vacancy.required_count,
        filled_count: vacancy.filled_count,
        status: vacancy.status,
        remarks: vacancy.remarks || '',
        requestor: vacancy.requestor || '',
        grade: vacancy.grade || '',
      });
    } else {
      const newId = generateVacancyId('NTS-Admin', existingIds);
      setForm({
        vacancy_id: newId, job_type: 'NTS', sub_category: 'NTS-Admin',
        block: '', location: '', position: '', department: '',
        required_count: 1, filled_count: 0, status: 'Need to Hire',
        remarks: '', requestor: '', grade: ''
      });
    }
  }, [vacancy, existingIds]);

  const handleSubCatChange = (sc: string) => {
    const jt = sc === 'TS' ? 'TS' : 'NTS';
    const newId = isEdit ? form.vacancy_id : generateVacancyId(sc, existingIds);
    setForm(f => ({ ...f, sub_category: sc, job_type: jt, vacancy_id: newId }));
  };

  const handleSave = () => {
    if (!form.position.trim() || !form.department.trim()) return;
    onSave(form, isEdit);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/45 z-[200] flex items-center justify-center" onClick={onClose}>
      <div className="bg-card rounded-xl p-6 w-[580px] max-h-[92vh] overflow-y-auto shadow-elevated animate-fade-in" onClick={e => e.stopPropagation()}>
        <h2 className="text-sm font-bold text-foreground mb-4 border-b-2 border-primary pb-2">
          {isEdit ? 'Edit Vacancy' : 'Add Vacancy'}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Vacancy ID">
            <input value={form.vacancy_id} readOnly={isEdit} onChange={e => setForm(f => ({ ...f, vacancy_id: e.target.value }))}
              className="w-full border border-input rounded-md px-2 py-1.5 text-sm outline-none focus:border-primary bg-card" />
          </Field>
          <Field label="Job Type">
            <select value={form.job_type} onChange={e => setForm(f => ({ ...f, job_type: e.target.value }))}
              className="w-full border border-input rounded-md px-2 py-1.5 text-sm outline-none focus:border-primary bg-card">
              <option value="NTS">Non-Teaching (NTS)</option>
              <option value="TS">Teaching (TS)</option>
            </select>
          </Field>
          <Field label="Category">
            <select value={form.sub_category} onChange={e => handleSubCatChange(e.target.value)}
              className="w-full border border-input rounded-md px-2 py-1.5 text-sm outline-none focus:border-primary bg-card">
              <option value="NTS-Admin">Administrative</option>
              <option value="NTS-Technical">Technical / Lab</option>
              <option value="NTS-Maint">Maintenance</option>
              <option value="NTS-HK">Housekeeping</option>
              <option value="NTS-Security">Security</option>
              <option value="TS">Teaching (TS)</option>
            </select>
          </Field>
          <Field label="Requestor">
            <input value={form.requestor} onChange={e => setForm(f => ({ ...f, requestor: e.target.value }))}
              className="w-full border border-input rounded-md px-2 py-1.5 text-sm outline-none focus:border-primary bg-card" />
          </Field>
          <Field label="Block">
            <input value={form.block} onChange={e => setForm(f => ({ ...f, block: e.target.value }))}
              className="w-full border border-input rounded-md px-2 py-1.5 text-sm outline-none focus:border-primary bg-card" placeholder="e.g. Block A" />
          </Field>
          <Field label="Location">
            <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              className="w-full border border-input rounded-md px-2 py-1.5 text-sm outline-none focus:border-primary bg-card" placeholder="e.g. Chennai Campus" />
          </Field>
          <Field label="Position">
            <input value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))}
              className="w-full border border-input rounded-md px-2 py-1.5 text-sm outline-none focus:border-primary bg-card" placeholder="e.g. Lab Assistant" />
          </Field>
          <Field label="Department">
            <input value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
              className="w-full border border-input rounded-md px-2 py-1.5 text-sm outline-none focus:border-primary bg-card" placeholder="e.g. Computer Science" />
          </Field>
          <Field label="Required Count">
            <input type="number" min={0} value={form.required_count} onChange={e => setForm(f => ({ ...f, required_count: +e.target.value }))}
              className="w-full border border-input rounded-md px-2 py-1.5 text-sm outline-none focus:border-primary bg-card" />
          </Field>
          <Field label="Filled Count">
            <input type="number" min={0} value={form.filled_count} onChange={e => setForm(f => ({ ...f, filled_count: +e.target.value }))}
              className="w-full border border-input rounded-md px-2 py-1.5 text-sm outline-none focus:border-primary bg-card" />
          </Field>
          <Field label="Status">
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              className="w-full border border-input rounded-md px-2 py-1.5 text-sm outline-none focus:border-primary bg-card">
              <option value="Need to Hire">Need to Hire</option>
              <option value="Closed">Closed</option>
            </select>
          </Field>
          <Field label="Grade">
            <input value={form.grade} onChange={e => setForm(f => ({ ...f, grade: e.target.value }))}
              className="w-full border border-input rounded-md px-2 py-1.5 text-sm outline-none focus:border-primary bg-card" placeholder="e.g. Asst. Prof (OG)" />
          </Field>
          <Field label="Remarks" full>
            <textarea value={form.remarks} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))}
              className="w-full border border-input rounded-md px-2 py-1.5 text-sm outline-none focus:border-primary bg-card min-h-[55px] resize-y" />
          </Field>
        </div>
        <div className="flex gap-2.5 justify-end mt-4 pt-3 border-t border-border">
          <button onClick={onClose} className="px-4 py-2 text-xs font-semibold border border-border rounded-md bg-card hover:bg-muted">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 text-xs font-semibold bg-primary text-primary-foreground rounded-md hover:opacity-90">Save</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={`flex flex-col gap-1 ${full ? 'col-span-2' : ''}`}>
      <label className="text-[10px] font-bold text-muted-foreground uppercase">{label}</label>
      {children}
    </div>
  );
}
