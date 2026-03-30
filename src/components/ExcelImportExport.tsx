import React, { useRef } from 'react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import type { Vacancy, VacancyInsert } from '@/lib/api';

interface ExcelImportExportProps {
  vacancies: Vacancy[];
  onImport: (rows: VacancyInsert[]) => void;
}

export default function ExcelImportExport({ vacancies, onImport }: ExcelImportExportProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = vacancies.map(v => ({
      'Vacancy ID': v.vacancy_id,
      'Job Type': v.job_type,
      'Category': v.sub_category,
      'Position': v.position,
      'Department': v.department,
      'Block': v.block || '',
      'Location': v.location || '',
      'Grade': v.grade || '',
      'Required': v.required_count,
      'Filled': v.filled_count,
      'Remaining': Math.max(0, v.required_count - v.filled_count),
      'Status': v.status,
      'Applied': v.applied || 0,
      'Shortlisted': v.shortlisted || 0,
      'Interviewed': v.interviewed || 0,
      'Selected': v.selected || 0,
      'Offers Made': v.offer_made || 0,
      'Offers Accepted': v.offer_accepted || 0,
      'Offers Declined': v.offer_declined || 0,
      'Ad Platform': v.ad_platform || '',
      'Ad Date': v.ad_date || '',
      'Requestor': v.requestor || '',
      'Remarks': v.remarks || '',
      'Source': v.source || '',
      'Updated By': v.updated_by || '',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Vacancies');
    XLSX.writeFile(wb, `SIMATS_Vacancies_${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success('Exported to Excel!');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target?.result, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<any>(ws);

        const vacancies: VacancyInsert[] = rows.map((r: any) => ({
          vacancy_id: r['Vacancy ID'] || `IMP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 5)}`,
          job_type: r['Job Type'] || 'NTS',
          sub_category: r['Category'] || 'NTS-Admin',
          position: r['Position'] || '',
          department: r['Department'] || '',
          block: r['Block'] || '',
          location: r['Location'] || '',
          grade: r['Grade'] || '',
          required_count: Number(r['Required']) || 1,
          filled_count: Number(r['Filled']) || 0,
          status: r['Status'] || 'Need to Hire',
          remarks: r['Remarks'] || '',
          requestor: r['Requestor'] || '',
          source: 'import',
        })).filter((v: VacancyInsert) => v.position);

        if (vacancies.length === 0) {
          toast.error('No valid rows found. Ensure columns match: Position, Department, etc.');
          return;
        }

        onImport(vacancies);
        toast.success(`Importing ${vacancies.length} vacancies...`);
      } catch (err) {
        toast.error('Failed to parse Excel file.');
        console.error(err);
      }
    };
    reader.readAsBinaryString(file);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="flex gap-2">
      <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleImport} />
      <button onClick={() => fileRef.current?.click()}
        className="px-3 py-1.5 text-xs font-semibold border border-border rounded-md bg-card hover:bg-muted transition">
        ⇧ Import
      </button>
      <button onClick={handleExport}
        className="px-3 py-1.5 text-xs font-semibold border border-border rounded-md bg-card hover:bg-muted transition">
        ⇩ Export
      </button>
    </div>
  );
}
