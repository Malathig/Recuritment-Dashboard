import React from 'react';

interface GradeFilterProps {
  activeGrade: string;
  onGradeChange: (grade: string) => void;
  show: boolean;
}

const GRADES = [
  { key: 'ALL', label: 'All Grades' },
  { key: 'OG', label: 'Asst. Prof (OG)' },
  { key: 'SG', label: 'Asst. Prof (SG)' },
  { key: 'Associate', label: 'Associate Professor' },
  { key: 'Prof', label: 'Professor' },
];

export default function GradeFilter({ activeGrade, onGradeChange, show }: GradeFilterProps) {
  if (!show) return null;

  return (
    <div className="flex gap-2 px-5 py-2 bg-secondary/30 border-b border-border items-center flex-wrap">
      <span className="text-[11px] font-semibold text-muted-foreground">Grade:</span>
      {GRADES.map(g => (
        <button
          key={g.key}
          className={`filter-pill ${activeGrade === g.key ? 'active' : ''}`}
          onClick={() => onGradeChange(g.key)}
        >
          {g.label}
        </button>
      ))}
    </div>
  );
}
