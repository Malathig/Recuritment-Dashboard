import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function AppHeader() {
  const { profile, userRole, signOut } = useAuth();

  return (
    <header className="text-primary-foreground px-5 py-3 flex items-center justify-between shadow-md" style={{ background: 'var(--header-gradient)' }}>
      <div>
        <h1 className="text-lg font-bold">SIMATS — Vacancy Tracker</h1>
        <p className="text-[11px] opacity-75 mt-0.5">Saveetha Institute of Medical And Technical Sciences · Recruitment Dashboard</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="bg-white/20 rounded-full px-3 py-1.5 text-xs flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-dot" />
          <span>{profile?.name || 'User'}</span>
          <span className="text-[10px] bg-white/20 rounded-full px-2 py-0.5">{userRole?.replace('_', ' ') || 'User'}</span>
        </div>
        <button onClick={signOut} className="px-3 py-1.5 text-xs font-semibold border border-white/30 rounded-md bg-white/15 hover:bg-white/25 transition">
          Logout
        </button>
      </div>
    </header>
  );
}
