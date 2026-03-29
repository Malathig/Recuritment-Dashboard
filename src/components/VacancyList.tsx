import React, { useState, useMemo } from 'react';
import type { Vacancy } from '@/lib/api';

interface VacancyListProps {
  vacancies: Vacancy[];
  onEdit: (v: Vacancy) => void;
  onDelete: (id: string) => void;
  onJoin: (v: Vacancy) => void;
  onResign: (v: Vacancy) => void;
  onPipeline: (v: Vacancy) => void;
  activeCategory: string;
  activeType: string;
  userRole: string | null;
}

export default function VacancyList({
  vacancies, onEdit, onDelete, onJoin, onResign, onPipeline,
  activeCategory, activeType, userRole
}: VacancyListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const departments = useMemo(() =>
    [...new Set(vacancies.map(v => v.department).filter(Boolean))].sort(),
    [vacancies]
  );

  const filtered = useMemo(() => {
    return vacancies.filter(v => {
      if (activeCategory !== 'ALL' && v.sub_category !== activeCategory) return false;
      if (activeType !== 'ALL' && v.job_type !== activeType) return false;
      if (statusFilter && v.status !== statusFilter) return false;
      if (deptFilter && v.department !== deptFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        return (
          v.vacancy_id.toLowerCase().includes(s) ||
          v.position.toLowerCase().includes(s) ||
          v.department.toLowerCase().includes(s) ||
          (v.block || '').toLowerCase().includes(s)
        );
      }
      return true;
    });
  }, [vacancies, activeCategory, activeType, statusFilter, deptFilter, search]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const isReadOnly = userRole === 'view_only';

  return (
    <div>
      {/* Help Bar */}
      <div className="bg-blue-50 border-b border-blue-200 px-5 py-2.5 text-xs text-blue-900">
        <b>Vacancy List</b> — Click <span className="text-primary font-bold">Required</span> or <span className="text-success font-bold">Filled</span> to edit inline. Use filters and search to narrow results.
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap px-5 py-2.5 items-center bg-card border-b border-border">
        <input
          type="text"
          placeholder="Search ID / Position / Dept..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="border border-input rounded-md px-2.5 py-1.5 text-xs bg-card outline-none focus:border-primary w-60"
        />
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="border border-input rounded-md px-2.5 py-1.5 text-xs bg-card outline-none focus:border-primary"
        >
          <option value="">All Status</option>
          <option value="Closed">Closed</option>
          <option value="Need to Hire">Need to Hire</option>
        </select>
        <select
          value={deptFilter}
          onChange={e => { setDeptFilter(e.target.value); setPage(1); }}
          className="border border-input rounded-md px-2.5 py-1.5 text-xs bg-card outline-none focus:border-primary max-w-[180px]"
        >
          <option value="">All Departments</option>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <button
          onClick={() => { setSearch(''); setStatusFilter(''); setDeptFilter(''); setPage(1); }}
          className="px-3 py-1.5 text-xs font-semibold border border-border rounded-md bg-card hover:bg-muted"
        >
          Clear
        </button>
        <div className="ml-auto flex gap-2 items-center">
          <span className="text-[11px] text-muted-foreground">{filtered.length} records</span>
        </div>
      </div>

      {/* Table */}
      <div className="px-5 pb-5">
        <div className="bg-card rounded-lg shadow-card overflow-hidden mt-2.5">
          <div className="px-4 py-2.5 flex items-center justify-between border-b border-border bg-secondary/30">
            <h3 className="text-sm font-bold text-foreground">
              {activeCategory === 'ALL' ? 'All' : activeCategory} Vacancies
            </h3>
            <span className="text-[11px] text-muted-foreground">
              Page {page} of {totalPages || 1}
            </span>
          </div>
          <div className="overflow-x-auto max-h-[460px] overflow-y-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-secondary/50">
                  <th className="px-2.5 py-2 text-left font-bold text-muted-foreground border-b-2 border-border sticky top-0 bg-secondary/50 z-10">Vacancy ID</th>
                  <th className="px-2.5 py-2 text-left font-bold text-muted-foreground border-b-2 border-border sticky top-0 bg-secondary/50 z-10">Category</th>
                  <th className="px-2.5 py-2 text-left font-bold text-muted-foreground border-b-2 border-border sticky top-0 bg-secondary/50 z-10">Block</th>
                  <th className="px-2.5 py-2 text-left font-bold text-muted-foreground border-b-2 border-border sticky top-0 bg-secondary/50 z-10">Position</th>
                  <th className="px-2.5 py-2 text-left font-bold text-muted-foreground border-b-2 border-border sticky top-0 bg-secondary/50 z-10">Department</th>
                  <th className="px-2.5 py-2 text-center font-bold text-primary border-b-2 border-border sticky top-0 bg-secondary/50 z-10">Required</th>
                  <th className="px-2.5 py-2 text-center font-bold text-success border-b-2 border-border sticky top-0 bg-secondary/50 z-10">Filled</th>
                  <th className="px-2.5 py-2 text-center font-bold text-muted-foreground border-b-2 border-border sticky top-0 bg-secondary/50 z-10">Remaining</th>
                  <th className="px-2.5 py-2 text-left font-bold text-muted-foreground border-b-2 border-border sticky top-0 bg-secondary/50 z-10">Progress</th>
                  <th className="px-2.5 py-2 text-left font-bold text-muted-foreground border-b-2 border-border sticky top-0 bg-secondary/50 z-10">Status</th>
                  <th className="px-2.5 py-2 text-left font-bold text-muted-foreground border-b-2 border-border sticky top-0 bg-secondary/50 z-10">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged.length === 0 ? (
                  <tr><td colSpan={11} className="text-center py-10 text-muted-foreground">No vacancies found.</td></tr>
                ) : paged.map(v => {
                  const remaining = Math.max(0, v.required_count - v.filled_count);
                  const pct = v.required_count > 0 ? Math.round(v.filled_count / v.required_count * 100) : 0;
                  const barColor = pct === 100 ? 'bg-success' : pct >= 50 ? 'bg-warning' : 'bg-destructive';
                  const catBadge = v.sub_category === 'TS' ? 'badge-ts' :
                    v.sub_category === 'NTS-Admin' ? 'badge-admin' : 'badge-open';

                  return (
                    <tr key={v.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="px-2.5 py-1.5 font-bold text-foreground text-[11px]">{v.vacancy_id}</td>
                      <td className="px-2.5 py-1.5"><span className={catBadge}>{v.sub_category}</span></td>
                      <td className="px-2.5 py-1.5 text-muted-foreground">{v.block || '—'}</td>
                      <td className="px-2.5 py-1.5 font-semibold max-w-[160px] truncate">{v.position}</td>
                      <td className="px-2.5 py-1.5">{v.department}</td>
                      <td className="px-2.5 py-1.5 text-center font-bold text-primary">{v.required_count}</td>
                      <td className="px-2.5 py-1.5 text-center font-bold text-success">{v.filled_count}</td>
                      <td className="px-2.5 py-1.5 text-center font-bold text-destructive">{remaining}</td>
                      <td className="px-2.5 py-1.5">
                        <div className="flex items-center gap-1">
                          <div className="progress-bar">
                            <div className={`progress-fill ${barColor}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                          </div>
                          <span className="text-[10px] font-bold">{pct}%</span>
                        </div>
                      </td>
                      <td className="px-2.5 py-1.5">
                        <span className={v.status === 'Closed' ? 'badge-closed' : 'badge-open'}>
                          {v.status}
                        </span>
                      </td>
                      <td className="px-2.5 py-1.5">
                        <div className="flex gap-1 flex-nowrap">
                          {!isReadOnly && (
                            <>
                              <button onClick={() => onEdit(v)} className="px-2 py-1 text-[10px] font-semibold border border-border rounded bg-card hover:bg-secondary transition">Edit</button>
                              <button onClick={() => onJoin(v)} className="px-2 py-1 text-[10px] font-semibold border border-emerald-300 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition">+1 Join</button>
                              <button onClick={() => onPipeline(v)} className="px-2 py-1 text-[10px] font-semibold border border-violet-300 rounded bg-violet-50 text-violet-700 hover:bg-violet-100 transition">Pipeline</button>
                              <button onClick={() => onResign(v)} className="px-2 py-1 text-[10px] font-semibold border border-red-300 rounded bg-red-50 text-destructive hover:bg-red-100 transition">Resign</button>
                              <button onClick={() => onDelete(v.id)} className="px-2 py-1 text-[10px] font-semibold border border-red-300 rounded bg-red-50 text-destructive hover:bg-red-100 transition">Del</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="flex items-center gap-2 px-4 py-2 border-t border-border text-xs text-muted-foreground">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-2 py-1 border border-border rounded bg-card disabled:opacity-40">←</button>
            <span>Page {page} of {totalPages || 1}</span>
            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-2 py-1 border border-border rounded bg-card disabled:opacity-40">→</button>
            <select
              value={pageSize}
              onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="ml-auto border border-input rounded px-2 py-1 text-xs bg-card"
            >
              <option value={25}>25/page</option>
              <option value={50}>50/page</option>
              <option value={100}>100/page</option>
              <option value={99999}>All</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
