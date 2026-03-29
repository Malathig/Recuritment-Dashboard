import React from 'react';
import { CATEGORIES } from '@/lib/api';

interface CategoryBarProps {
  activeCategory: string;
  onCategoryChange: (cat: string) => void;
  vacancies: any[];
}

export default function CategoryBar({ activeCategory, onCategoryChange, vacancies }: CategoryBarProps) {
  const getCount = (cat: string) => {
    if (cat === 'ALL') return vacancies.length;
    return vacancies.filter(v => v.sub_category === cat).length;
  };

  return (
    <div className="flex gap-0 px-5 bg-background border-b-2 border-border flex-wrap">
      {CATEGORIES.map(c => (
        <div
          key={c.key}
          className={`category-tab ${activeCategory === c.key ? 'active' : ''}`}
          onClick={() => onCategoryChange(c.key)}
        >
          {c.icon && <span>{c.icon}</span>}
          {c.label}
          <span className="category-count">{getCount(c.key)}</span>
        </div>
      ))}
    </div>
  );
}
