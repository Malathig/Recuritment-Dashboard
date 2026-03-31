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
  { value: 'executive', label: '📊 Executive Summary Report (Director)' },
  { value: 'hiring_tat', label: '⏱ Hiring TAT (Turnaround Time) Report' },
  { value: 'pipeline_funnel', label: '🔄 Pipeline Conversion Funnel Report' },
  { value: 'faculty_contribution', label: '👥 Faculty Contribution Report' },
  { value: 'dept_monthly', label: '1. Department-wise Monthly Joining Report' },
  { value: 'college_dept', label: '2. College + Department Monthly Report — New & Rejoin' },
  { value: 'grade_college', label: '3. Grade-wise College Summary Report' },
  { value: 'joinees_list', label: '4. Full Joinees List by Month' },
];

export default function ReportModal({ open, onClose, vacancies, joinings }: ReportModalProps) {
  const [reportType, setReportType] = useState('executive');
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

    if (reportType === 'executive') {
      // Executive Summary
      const totalVac = vacancies.length;
      const totalReq = vacancies.reduce((s, v) => s + v.required_count, 0);
      const totalFil = vacancies.reduce((s, v) => s + v.filled_count, 0);
      const fillPct = totalReq > 0 ? Math.round((totalFil / totalReq) * 100) : 0;
      const closed = vacancies.filter(v => v.status === 'Closed').length;
      const open = vacancies.filter(v => v.status === 'Need to Hire').length;

      const summary = [
        { Metric: 'Total Vacancies', Value: totalVac },
        { Metric: 'Total Required', Value: totalReq },
        { Metric: 'Total Filled', Value: totalFil },
        { Metric: 'Remaining', Value: Math.max(0, totalReq - totalFil) },
        { Metric: 'Fill Rate', Value: `${fillPct}%` },
        { Metric: 'Closed Positions', Value: closed },
        { Metric: 'Open Positions', Value: open },
        { Metric: 'Total Joinings (filtered)', Value: filtered.length },
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summary), 'Executive Summary');

      // Department breakdown
      const depts = [...new Set(vacancies.map(v => v.department))].sort();
      const deptData = depts.map(d => {
        const rows = vacancies.filter(v => v.department === d);
        const req = rows.reduce((s, v) => s + v.required_count, 0);
        const fil = rows.reduce((s, v) => s + v.filled_count, 0);
        return { Department: d, Required: req, Filled: fil, Remaining: Math.max(0, req - fil), 'Fill %': req > 0 ? `${Math.round((fil / req) * 100)}%` : '0%' };
      });
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(deptData), 'By Department');

    } else if (reportType === 'hiring_tat') {
      const closedVacs = vacancies.filter(v => v.status === 'Closed' && v.updated_at);
      const tatData = closedVacs.map(v => {
        const days = Math.max(0, Math.round((new Date(v.updated_at || v.created_at).getTime() - new Date(v.created_at).getTime()) / 86400000));
        return {
          'Vacancy ID': v.vacancy_id, Position: v.position, Department: v.department,
          'Created Date': v.created_at.slice(0, 10), 'Closed Date': (v.updated_at || '').slice(0, 10),
          'TAT (Days)': days, Category: v.sub_category, Grade: v.grade || '',
        };
      }).sort((a, b) => b['TAT (Days)'] - a['TAT (Days)']);
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(tatData), 'Hiring TAT');

      // Dept-wise TAT summary
      const depts = [...new Set(tatData.map(t => t.Department))].sort();
      const deptSummary = depts.map(d => {
        const rows = tatData.filter(t => t.Department === d);
        const avg = Math.round(rows.reduce((s, r) => s + r['TAT (Days)'], 0) / rows.length);
        return { Department: d, 'Avg TAT (Days)': avg, 'Min TAT': Math.min(...rows.map(r => r['TAT (Days)'])), 'Max TAT': Math.max(...rows.map(r => r['TAT (Days)'])), Count: rows.length };
      });
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(deptSummary), 'TAT by Department');

    } else if (reportType === 'pipeline_funnel') {
      const totApplied = vacancies.reduce((s, v) => s + (v.applied || 0), 0);
      const stages = [
        { Stage: 'Applied', Count: totApplied },
        { Stage: 'Shortlisted', Count: vacancies.reduce((s, v) => s + (v.shortlisted || 0), 0) },
        { Stage: 'Interviewed', Count: vacancies.reduce((s, v) => s + (v.interviewed || 0), 0) },
        { Stage: 'Selected', Count: vacancies.reduce((s, v) => s + (v.selected || 0), 0) },
        { Stage: 'Offer Made', Count: vacancies.reduce((s, v) => s + (v.offer_made || 0), 0) },
        { Stage: 'Offer Accepted', Count: vacancies.reduce((s, v) => s + (v.offer_accepted || 0), 0) },
        { Stage: 'Offer Declined', Count: vacancies.reduce((s, v) => s + (v.offer_declined || 0), 0) },
        { Stage: 'Joined (Filled)', Count: vacancies.reduce((s, v) => s + v.filled_count, 0) },
      ].map((s, i, arr) => ({
        ...s,
        'Conversion from Applied': totApplied > 0 ? `${Math.round((s.Count / totApplied) * 100)}%` : '0%',
        'Stage Conversion': i > 0 && arr[i - 1].Count > 0 ? `${Math.round((s.Count / arr[i - 1].Count) * 100)}%` : '100%',
      }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(stages), 'Pipeline Funnel');

      // Per-vacancy pipeline
      const perVac = vacancies.filter(v => (v.applied || 0) > 0).map(v => ({
        'Vacancy ID': v.vacancy_id, Position: v.position, Department: v.department,
        Applied: v.applied, Shortlisted: v.shortlisted, Interviewed: v.interviewed,
        Selected: v.selected, 'Offer Made': v.offer_made, 'Offer Accepted': v.offer_accepted,
        'Offer Declined': v.offer_declined, Filled: v.filled_count,
      }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(perVac), 'Per Vacancy Pipeline');

    } else if (reportType === 'faculty_contribution') {
      const facultyMap = new Map<string, { referrals: number; joined: number; left: number; depts: Set<string> }>();
      filtered.forEach(j => {
        const ref = (j as any).referred_by?.trim();
        if (!ref) return;
        if (!facultyMap.has(ref)) facultyMap.set(ref, { referrals: 0, joined: 0, left: 0, depts: new Set() });
        const e = facultyMap.get(ref)!;
        e.referrals++;
        if (j.joining_status === 'New' || j.joining_status === 'Rejoin') e.joined++;
        if (j.joining_status === 'Left') e.left++;
        if (j.department) e.depts.add(j.department);
      });
      const data = Array.from(facultyMap.entries()).map(([name, e]) => ({
        'Faculty Name': name, Referrals: e.referrals, Joined: e.joined, Left: e.left,
        'Conversion %': e.referrals > 0 ? `${Math.round((e.joined / e.referrals) * 100)}%` : '0%',
        Departments: Array.from(e.depts).join(', '),
      })).sort((a, b) => b.Referrals - a.Referrals);
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.length > 0 ? data : [{ 'Faculty Name': 'No data', Referrals: 0 }]), 'Faculty Contributions');

    } else if (reportType === 'dept_monthly') {
      const depts = [...new Set(filtered.map(j => j.department).filter(Boolean))].sort();
      const data = depts.map(d => {
        const rows = filtered.filter(j => j.department === d);
        return { Department: d, 'Total Joinings': rows.length, New: rows.filter(j => j.joining_status === 'New').length, Rejoin: rows.filter(j => j.joining_status === 'Rejoin').length, Left: rows.filter(j => j.joining_status === 'Left').length };
      });
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), 'Dept Monthly');

    } else if (reportType === 'college_dept') {
      const data = filtered.map(j => ({ Name: j.name, College: j.college, Department: j.department, Position: j.position, Date: j.date, Status: j.joining_status, Type: j.job_type }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), 'College Dept');

    } else if (reportType === 'grade_college') {
      const vFiltered = vacancies.filter(v => typeFilter === 'ALL' || v.job_type === typeFilter);
      const colleges = [...new Set(vFiltered.map(v => v.block).filter(Boolean))].sort();
      const grades = [...new Set(vFiltered.map(v => v.grade).filter(Boolean))].sort();
      const data = grades.map(g => {
        const row: Record<string, any> = { Grade: g };
        colleges.forEach(c => { row[c || 'Other'] = vFiltered.filter(v => v.grade === g && v.block === c).reduce((s, v) => s + v.required_count, 0); });
        row['Total'] = vFiltered.filter(v => v.grade === g).reduce((s, v) => s + v.required_count, 0);
        return row;
      });
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), 'Grade College');

    } else {
      const data = filtered.map(j => ({
        Name: j.name, Position: j.position, Department: j.department, Date: j.date, College: j.college,
        Status: j.joining_status, Type: j.job_type, 'Emp ID': j.emp_id, 'Bio ID': j.bio_id,
        Qualification: j.qualification, Address: j.address, 'Referred By': (j as any).referred_by || '', Remarks: j.remarks,
      }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), 'Joinees List');
    }

    const period = fromMonth && toMonth ? `_${fromMonth}_to_${toMonth}` : '';
    XLSX.writeFile(wb, `SIMATS_Report_${reportType}${period}.xlsx`);
    toast.success('Report downloaded!');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/45 z-[200] flex items-center justify-center" onClick={onClose}>
      <div className="bg-card rounded-xl p-6 w-[520px] max-h-[92vh] overflow-y-auto shadow-elevated animate-fade-in" onClick={e => e.stopPropagation()}>
        <h2 className="text-sm font-bold text-foreground mb-4 border-b-2 border-primary pb-2">Generate Report</h2>

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

        {/* Report description */}
        <div className="bg-blue-50 rounded-lg p-3 mt-3 text-xs text-blue-800">
          {reportType === 'executive' && '📊 One-page overview: fill rates, department progress, monthly trends. Multi-sheet Excel.'}
          {reportType === 'hiring_tat' && '⏱ Turnaround time from vacancy creation to closure, by department. Highlights slow areas.'}
          {reportType === 'pipeline_funnel' && '🔄 Full conversion funnel: Applied → Shortlisted → Interviewed → Selected → Offer → Joined.'}
          {reportType === 'faculty_contribution' && '👥 Faculty referral performance: who referred candidates, conversion rates, departments covered.'}
          {reportType === 'dept_monthly' && 'Department-wise joining counts with New/Rejoin/Left breakdown.'}
          {reportType === 'college_dept' && 'College + Department monthly joinings with status and type.'}
          {reportType === 'grade_college' && 'Grade-wise vacancy summary across colleges.'}
          {reportType === 'joinees_list' && 'Complete list of all joinees with full details.'}
          <div className="mt-1.5 pt-1.5 border-t border-blue-200">
            Preview: {filterJoinings().length} joining records • {vacancies.length} vacancies
          </div>
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
