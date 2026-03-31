import React, { useState } from 'react';
import type { Joining, Vacancy } from '@/lib/api';

interface FacultyTrackerProps {
  joinings: Joining[];
  vacancies: Vacancy[];
}

export default function FacultyTracker({ joinings, vacancies }: FacultyTrackerProps) {
  const [sortBy, setSortBy] = useState<'referrals' | 'interviews' | 'conversions'>('referrals');

  // Group joinings by referred_by
  const facultyMap = new Map<string, { referrals: number; joined: number; left: number; departments: Set<string> }>();

  joinings.forEach(j => {
    const ref = (j as any).referred_by?.trim();
    if (!ref) return;
    if (!facultyMap.has(ref)) {
      facultyMap.set(ref, { referrals: 0, joined: 0, left: 0, departments: new Set() });
    }
    const entry = facultyMap.get(ref)!;
    entry.referrals++;
    if (j.joining_status === 'New' || j.joining_status === 'Rejoin') entry.joined++;
    if (j.joining_status === 'Left') entry.left++;
    if (j.department) entry.departments.add(j.department);
  });

  // Also count pipeline contributions (vacancies where requestor matches)
  const facultyPipeline = new Map<string, { applied: number; interviewed: number; selected: number }>();
  vacancies.forEach(v => {
    const req = v.requestor?.trim();
    if (!req) return;
    if (!facultyPipeline.has(req)) {
      facultyPipeline.set(req, { applied: 0, interviewed: 0, selected: 0 });
    }
    const entry = facultyPipeline.get(req)!;
    entry.applied += v.applied || 0;
    entry.interviewed += v.interviewed || 0;
    entry.selected += v.selected || 0;
  });

  const allNames = new Set([...facultyMap.keys(), ...facultyPipeline.keys()]);
  const rows = Array.from(allNames).map(name => {
    const ref = facultyMap.get(name) || { referrals: 0, joined: 0, left: 0, departments: new Set() };
    const pipe = facultyPipeline.get(name) || { applied: 0, interviewed: 0, selected: 0 };
    const conversionRate = ref.referrals > 0 ? Math.round((ref.joined / ref.referrals) * 100) : 0;
    return { name, ...ref, ...pipe, conversionRate, deptList: Array.from(ref.departments).join(', ') };
  });

  rows.sort((a, b) => {
    if (sortBy === 'referrals') return b.referrals - a.referrals;
    if (sortBy === 'interviews') return b.interviewed - a.interviewed;
    return b.conversionRate - a.conversionRate;
  });

  const totalReferrals = rows.reduce((s, r) => s + r.referrals, 0);
  const totalInterviewed = rows.reduce((s, r) => s + r.interviewed, 0);
  const totalJoined = rows.reduce((s, r) => s + r.joined, 0);

  return (
    <div className="p-5 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-[15px] font-bold text-foreground">👥 Faculty Contribution Tracker</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Track individual faculty efforts in candidate referral and interview coordination</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">Sort by:</span>
          {(['referrals', 'interviews', 'conversions'] as const).map(s => (
            <button key={s} onClick={() => setSortBy(s)}
              className={`px-2 py-1 text-[10px] font-semibold rounded-md border transition ${sortBy === s ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border text-muted-foreground hover:bg-muted'}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2.5">
        <StatCard value={allNames.size} label="Active Faculty" border="border-l-primary" color="text-primary" />
        <StatCard value={totalReferrals} label="Total Referrals" border="border-l-accent" color="text-accent" />
        <StatCard value={totalInterviewed} label="Total Interviewed" border="border-l-warning" color="text-warning" />
        <StatCard value={totalJoined} label="Total Joined" border="border-l-success" color="text-success" />
      </div>

      {rows.length === 0 ? (
        <div className="bg-card rounded-lg shadow-card p-10 text-center">
          <div className="text-3xl mb-2">📋</div>
          <div className="text-sm font-semibold text-muted-foreground">No faculty referral data yet</div>
          <div className="text-xs text-muted-foreground mt-1">When recording joinings, fill the "Referred By" field to track faculty contributions.</div>
        </div>
      ) : (
        <div className="bg-card rounded-lg shadow-card overflow-hidden">
          <div className="px-4 py-2.5 border-b border-border bg-secondary/30 flex justify-between">
            <span className="text-sm font-bold text-foreground">Faculty Performance</span>
            <span className="text-[11px] text-muted-foreground">{rows.length} faculty members</span>
          </div>
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-secondary/50">
                  {['#', 'Faculty Name', 'Referrals', 'Joined', 'Left', 'Conversion %', 'Applied', 'Interviewed', 'Selected', 'Departments'].map(h => (
                    <th key={h} className="px-2.5 py-2 text-left font-bold text-muted-foreground border-b-2 border-border sticky top-0 bg-secondary/50 z-10">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.name} className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="px-2.5 py-1.5 text-muted-foreground">{i + 1}</td>
                    <td className="px-2.5 py-1.5 font-semibold text-foreground">{r.name}</td>
                    <td className="px-2.5 py-1.5 text-center font-bold text-accent">{r.referrals}</td>
                    <td className="px-2.5 py-1.5 text-center font-bold text-success">{r.joined}</td>
                    <td className="px-2.5 py-1.5 text-center font-bold text-destructive">{r.left}</td>
                    <td className="px-2.5 py-1.5 text-center">
                      <span className={`inline-block min-w-[40px] px-1.5 py-0.5 rounded-full text-[10px] font-bold ${r.conversionRate >= 80 ? 'bg-emerald-100 text-success' : r.conversionRate >= 50 ? 'bg-amber-100 text-warning' : 'bg-red-100 text-destructive'}`}>
                        {r.conversionRate}%
                      </span>
                    </td>
                    <td className="px-2.5 py-1.5 text-center text-primary font-bold">{r.applied}</td>
                    <td className="px-2.5 py-1.5 text-center text-warning font-bold">{r.interviewed}</td>
                    <td className="px-2.5 py-1.5 text-center text-success font-bold">{r.selected}</td>
                    <td className="px-2.5 py-1.5 text-muted-foreground text-[10px] max-w-[180px] truncate" title={r.deptList}>{r.deptList || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
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
