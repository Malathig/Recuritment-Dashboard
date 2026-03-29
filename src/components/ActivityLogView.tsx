import React from 'react';
import type { ActivityLog } from '@/lib/api';

interface ActivityLogViewProps {
  logs: ActivityLog[];
}

export default function ActivityLogView({ logs }: ActivityLogViewProps) {
  return (
    <div className="p-5 space-y-3 animate-fade-in">
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-bold text-foreground">Activity Log</h3>
        <span className="text-[11px] text-muted-foreground">{logs.length} entries</span>
      </div>
      <div className="bg-blue-50 border-l-4 border-primary rounded-r-lg p-3 text-xs text-blue-900 mb-3">
        <b>Activity Log</b> — Complete audit trail of all actions. Read-only. Admin only.
      </div>
      {logs.length === 0 ? (
        <div className="text-muted-foreground text-center py-10 text-sm">No activity yet.</div>
      ) : logs.map(l => (
        <div key={l.id} className="bg-card rounded-lg p-3 shadow-card border-l-[3px] border-primary flex items-center gap-2.5 flex-wrap text-xs">
          <span className="text-muted-foreground text-[10px] min-w-[120px]">
            {new Date(l.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
          </span>
          <span className="font-bold text-foreground min-w-[90px]">{l.user_name}</span>
          <span className="bg-secondary text-primary rounded px-2 py-0.5 text-[10px] font-bold">{l.action}</span>
          <span className="font-semibold text-muted-foreground">{l.target_id}</span>
          <span className="text-muted-foreground text-[11px]">{l.details}</span>
        </div>
      ))}
    </div>
  );
}
