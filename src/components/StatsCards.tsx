import React from 'react';
import { STAT_COLORS } from '@/lib/api';

interface StatsCardsProps {
  vacancies: any[];
}

export default function StatsCards({ vacancies }: StatsCardsProps) {
  const total = vacancies.length;
  const totalRequired = vacancies.reduce((s, v) => s + v.required_count, 0);
  const totalFilled = vacancies.reduce((s, v) => s + v.filled_count, 0);
  const totalRemaining = Math.max(0, totalRequired - totalFilled);
  const closed = vacancies.filter(v => v.status === 'Closed').length;
  const open = vacancies.filter(v => v.status === 'Need to Hire').length;

  const stats = [
    { label: 'Total Vacancies', value: total, color: STAT_COLORS.primary },
    { label: 'Filled', value: totalFilled, color: STAT_COLORS.success },
    { label: 'Required', value: totalRequired, color: STAT_COLORS.warning },
    { label: 'Remaining', value: totalRemaining, color: STAT_COLORS.accent },
    { label: 'Closed', value: closed, color: STAT_COLORS.info },
    { label: 'Need to Hire', value: open, color: STAT_COLORS.destructive },
  ];

  return (
    <div className="grid grid-cols-6 gap-2.5 px-5 py-3">
      {stats.map((s, i) => (
        <div key={i} className={`stat-card ${s.color.border}`}>
          <div className={`stat-card-value ${s.color.text}`}>{s.value}</div>
          <div className="stat-card-label">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
