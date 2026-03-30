import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import type { Vacancy, Joining } from '@/lib/api';
import { COLLEGES } from '@/lib/api';

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  vacancies: Vacancy[];
  joinings: Joining[];
}

const REPORT_TYPES = [
  { value: 'dept_monthly', label: '1. Department-wise Monthly Joining Report (Excel)' },
  { value: 'college_dept', label: '2. College + Department Monthly Report — New & Rejoin (Excel)' },
  { value: 'grade_college', label: '3. Grade-wise College Summary Report (Excel)' },
  { value: 'joinees_list', label: '4. Full Joinees List by Month (Excel)' },
];

export default function ReportModal({ open, onClose, vacancies, joinings }: ReportModalProps) {
  const [reportType, setReportType] = useState('dept_monthly');
  const [fromMonth, setFromMonth] = useState('');
  const [toMonth, setToMonth] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [collegeFilter, setCollegeFilter] = useState('ALL');

  if (!open) return null;

  const filterJoinings = () => {
    return joinings.filter(j => {
      if (typeFilter !== 'ALL' && j.job_type !== typeFilter) return false;
      if (collegeFilter !== 'ALL' && j.college !== collegeFilter) return false;
      if (fromMonth && j.date) {
        const jMonth = j.date.slice(0, 7);
        if (jMonth < fromMonth) return false;
      }
      if (toMonth && j.date) {
        const jMonth = j.date.slice(0, 7);
        if (jMonth > toMonth) return false;
      }
      return true;
    });
  };

  const generateReport = () => {
    const filtered = filterJoinings();
    const wb = XLSX.utils.book_new();

    if (reportType === 'dept_monthly') {
      const depts = [...new Set(filtered.map(j => j.department).filter(Boolean))].sort();
      const data = depts.map(d => {
        const rows = filtered.filter(j => j.department === d);
        return {
          'Department': d,
          'Total Joinings': rows.length,
          'New': rows.filter(j => j.joining_status === 'New').length,
          'Rejoin': rows.filter(j => j.joining_status === 'Rejoin').length,
          'Left': rows.filter(j => j.joining_status === 'Left').length,
        };
      });
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, 'Dept Monthly');
    } else if (reportType === 'college_dept') {
      const data = filtered.map(j => ({
        'Name': j.name,
        'College': j.college,
        'Department': j.department,
        'Position': j.position,
        'Date': j.date,
        'Status': j.joining_status,
        'Type': j.job_type,
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, 'College Dept');
    } else if (reportType === 'grade_college') {
      const vFiltered = vacancies.filter(v => {
        if (typeFilter !== 'ALL' && v.job_type !== typeFilter) return false;
        return true;
      });
      const colleges = [...new Set(vFiltered.map(v => v.block).filter(Boolean))].sort();
      const grades = [...new Set(vFiltered.map(v => v.grade).filter(Boolean))].sort();
      const data = grades.map(g => {
        const row: Record<string, any> = { 'Grade': g };
        colleges.forEach(c => {
          row[c || 'Other'] = vFiltered.filter(v => v.grade === g && v.block === c).reduce((s, v) => s + v.required_count, 0);
        });
        row['Total'] = vFiltered.filter(v => v.grade === g).reduce((s, v) => s + v.required_count, 0);
        return row;
      });
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, 'Grade College');
    } else {
      const data = filtered.map(j => ({
        'Name': j.name,
        'Position': j.position,
        'Department': j.department,
        'Date': j.date,
        'College': j.college,
        'Status': j.joining_status,
        'Type': j.job_type,
        'Emp ID': j.emp_id,
        'Bio ID': j.bio_id,
        'Qualification': j.qualification,
        'Address': j.address,
        'Remarks': j.remarks,
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, 'Joinees List');
    }

    const period = fromMonth && toMonth ? `_${fromMonth}_to_${toMonth}` : '';
    XLSX.writeFile(wb, `SIMATS_Report_${reportType}${period}.xlsx`);
    toast.success('Report downloaded!');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/45 z-[200] flex items-center justify-center" onClick={onClose}>
      <div className="bg-card rounded-xl p-6 w-[520px] max-h-[92vh] overflow-y-auto shadow-elevated animate-fade-in" onClick={e => e.stopPropagation()}>
        <h2 className="text-sm font-bold text-foreground mb-4 border-b-2 border-primary pb-2">Generate Monthly Report</h2>

        <div className="space-y-3">
          <Field label="Report Type">
            <select value={reportType} onChange={e => setReportType(e.target.value)}
              className="w-full border border-input rounded-md px-2 py-2 text-sm outline-none focus:border-primary bg-card">
              {REPORT_TYPES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="From Month">
              <input type="month" value={fromMonth} onChange={e => setFromMonth(e.target.value)}
                className="w-full border border-input rounded-md px-2 py-2 text-sm outline-none focus:border-primary bg-card" />
            </Field>
            <Field label="To Month">
              <input type="month" value={toMonth} onChange={e => setToMonth(e.target.value)}
                className="w-full border border-input rounded-md px-2 py-2 text-sm outline-none focus:border-primary bg-card" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Filter by Type">
              <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
                className="w-full border border-input rounded-md px-2 py-2 text-sm outline-none focus:border-primary bg-card">
                <option value="ALL">All Types</option>
                <option value="TS">Teaching Staff (TS)</option>
                <option value="NTS">Non-Teaching (NTS)</option>
              </select>
            </Field>
            <Field label="Filter by College">
              <select value={collegeFilter} onChange={e => setCollegeFilter(e.target.value)}
                className="w-full border border-input rounded-md px-2 py-2 text-sm outline-none focus:border-primary bg-card">
                <option value="ALL">All Colleges</option>
                {COLLEGES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
              </select>
            </Field>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-3 mt-3 text-xs text-blue-800">
          Preview: {filterJoinings().length} joining records match your filters.
          {vacancies.length} vacancies available for grade reports.
        </div>

        <div className="flex gap-2.5 justify-end mt-4 pt-3 border-t border-border">
          <button onClick={onClose} className="px-4 py-2 text-xs font-semibold border border-border rounded-md bg-card hover:bg-muted">Cancel</button>
          <button onClick={generateReport} className="px-4 py-2 text-xs font-semibold bg-primary text-primary-foreground rounded-md hover:opacity-90">⇩ Download Report</button>
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
