import React from 'react';
import type { Vacancy } from '@/lib/api';

interface DepartmentViewProps {
  vacancies: Vacancy[];
}

export default function DepartmentView({ vacancies }: DepartmentViewProps) {
  const departments = [...new Set(vacancies.map(v => v.department).filter(Boolean))].sort();

  return (
    <div className="p-5 animate-fade-in">
      <div className="bg-blue-50 border-l-4 border-primary rounded-r-lg p-3 text-xs text-blue-900 mb-4">
        <b>By Department</b> — Card-based view of Required vs Filled vs Remaining for every department. View-only.
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {departments.map(d => {
          const rows = vacancies.filter(v => v.department === d);
          const req = rows.reduce((s, v) => s + v.required_count, 0);
          const fil = rows.reduce((s, v) => s + v.filled_count, 0);
          const rem = Math.max(0, req - fil);
          const pct = req > 0 ? Math.round(fil / req * 100) : 0;
          const ts = rows.filter(v => v.job_type === 'TS').length;
          const cl = rows.filter(v => v.status === 'Closed').length;
          const op = rows.filter(v => v.status === 'Need to Hire').length;
          const bc = pct === 100 ? 'bg-success' : pct >= 50 ? 'bg-warning' : 'bg-destructive';

          return (
            <div key={d} className="bg-card rounded-lg p-3.5 shadow-card">
              <h4 className="text-xs font-bold text-foreground mb-2 border-b border-border pb-1.5">{d}</h4>
              <Row label="Required" value={req} />
              <Row label="Filled" value={fil} color="text-success" bold />
              <Row label="Remaining" value={rem} color="text-destructive" bold />
              <Row label="Teaching (TS)" value={ts} color="text-accent" />
              <Row label="Closed" value={cl} color="text-success" />
              <Row label="Need to Hire" value={op} color="text-warning" />
              <div className="mt-2 bg-muted rounded-full h-1.5">
                <div className={`h-1.5 rounded-full ${bc}`} style={{ width: `${pct}%` }} />
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{pct}% filled</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Row({ label, value, color, bold }: { label: string; value: number; color?: string; bold?: boolean }) {
  return (
    <div className="flex justify-between text-xs py-0.5">
      <span className={color || ''}>{label}</span>
      <b className={`${color || ''} ${bold ? 'font-bold' : ''}`}>{value}</b>
    </div>
  );
}
