import React from 'react';
import type { Joining } from '@/lib/api';

interface JoiningTrackerProps {
  joinings: Joining[];
}

export default function JoiningTracker({ joinings }: JoiningTrackerProps) {
  const total = joinings.length;
  const newCount = joinings.filter(j => j.joining_status === 'New').length;
  const rejoinCount = joinings.filter(j => j.joining_status === 'Rejoin').length;
  const leftCount = joinings.filter(j => j.joining_status === 'Left').length;

  return (
    <div className="p-5 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-[15px] font-bold text-foreground">Joining Tracker</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Track all employee joinings across vacancies</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2.5">
        <StatCard value={total} label="Total Joinings" border="border-l-primary" color="text-primary" />
        <StatCard value={newCount} label="New Joinings" border="border-l-success" color="text-success" />
        <StatCard value={rejoinCount} label="Rejoinings" border="border-l-warning" color="text-warning" />
        <StatCard value={leftCount} label="Left" border="border-l-destructive" color="text-destructive" />
      </div>

      <div className="bg-card rounded-lg shadow-card overflow-hidden">
        <div className="px-4 py-2.5 border-b border-border bg-secondary/30 flex justify-between items-center">
          <span className="text-sm font-bold text-foreground">All Joinings</span>
          <span className="text-[11px] text-muted-foreground">{total} entries</span>
        </div>
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-secondary/50">
                {['Name', 'Position', 'Department', 'Date', 'College', 'Status', 'Emp ID', 'Bio ID', 'Type'].map(h => (
                  <th key={h} className="px-2.5 py-2 text-left font-bold text-muted-foreground border-b-2 border-border sticky top-0 bg-secondary/50 z-10">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {joinings.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-10 text-muted-foreground">No joinings recorded yet.</td></tr>
              ) : joinings.map(j => (
                <tr key={j.id} className="border-b border-border/50 hover:bg-secondary/30">
                  <td className="px-2.5 py-1.5 font-semibold">{j.name}</td>
                  <td className="px-2.5 py-1.5">{j.position}</td>
                  <td className="px-2.5 py-1.5">{j.department}</td>
                  <td className="px-2.5 py-1.5">{j.date ? new Date(j.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</td>
                  <td className="px-2.5 py-1.5">{j.college}</td>
                  <td className="px-2.5 py-1.5">
                    <span className={j.joining_status === 'New' ? 'badge-closed' : j.joining_status === 'Rejoin' ? 'badge-open' : 'badge-ts'}>
                      {j.joining_status}
                    </span>
                  </td>
                  <td className="px-2.5 py-1.5 text-muted-foreground">{j.emp_id || '—'}</td>
                  <td className="px-2.5 py-1.5 text-muted-foreground">{j.bio_id || '—'}</td>
                  <td className="px-2.5 py-1.5">
                    <span className={j.job_type === 'TS' ? 'badge-ts' : 'badge-admin'}>{j.job_type}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ value, label, border, color }: { value: number; label: string; border: string; color: string }) {
  return (
    <div className={`stat-card ${border}`}>
      <div className={`text-2xl font-extrabold leading-none ${color}`}>{value}</div>
      <div className="stat-card-label">{label}</div>
    </div>
  );
}
