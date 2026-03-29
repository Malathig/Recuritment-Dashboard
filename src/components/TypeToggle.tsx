import React from 'react';

interface TypeToggleProps {
  activeType: string;
  onTypeChange: (type: string) => void;
  vacancies: any[];
}

export default function TypeToggle({ activeType, onTypeChange, vacancies }: TypeToggleProps) {
  const tsCount = vacancies.filter(v => v.job_type === 'TS').length;
  const ntsCount = vacancies.filter(v => v.job_type === 'NTS').length;

  return (
    <div className="flex gap-0 px-5 py-2.5 bg-card border-b border-border items-center flex-wrap">
      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mr-3">Type:</span>
      <button
        className={`type-btn all ${activeType === 'ALL' ? 'active-all' : ''}`}
        onClick={() => onTypeChange('ALL')}
      >
        All <span className="text-[10px] font-bold ml-1.5 bg-black/10 rounded-full px-1.5 py-px">{vacancies.length}</span>
      </button>
      <div className="w-px h-7 bg-border mx-3" />
      <button
        className={`type-btn ts ${activeType === 'TS' ? 'active-ts' : ''}`}
        onClick={() => onTypeChange('TS')}
      >
        🎓 Teaching <span className="text-[10px] font-bold ml-1.5 bg-black/10 rounded-full px-1.5 py-px">{tsCount}</span>
      </button>
      <button
        className={`type-btn nts ${activeType === 'NTS' ? 'active-nts' : ''}`}
        onClick={() => onTypeChange('NTS')}
      >
        Non-Teaching <span className="text-[10px] font-bold ml-1.5 bg-black/10 rounded-full px-1.5 py-px">{ntsCount}</span>
      </button>
    </div>
  );
}
