import React, { useState } from 'react';
import type { Requisition, RequisitionInsert } from '@/lib/api';

interface HODRequestsProps {
  requisitions: Requisition[];
  onAdd: (req: RequisitionInsert) => void;
  onApprove: (req: Requisition) => void;
  onReject: (req: Requisition) => void;
  userRole: string | null;
}

export default function HODRequests({ requisitions, onAdd, onApprove, onReject, userRole }: HODRequestsProps) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    hod_name: '', department: '', position: '', count: 1,
    justification: '', job_type: 'TS', sub_category: 'TS', block: ''
  });

  const pending = requisitions.filter(r => r.status === 'Pending').length;
  const approved = requisitions.filter(r => r.status === 'Approved').length;
  const rejected = requisitions.filter(r => r.status === 'Rejected').length;

  const handleAdd = () => {
    if (!form.hod_name.trim() || !form.department.trim() || !form.position.trim()) return;
    const reqId = `REQ-${Date.now().toString(36).toUpperCase()}`;
    onAdd({ ...form, req_id: reqId });
    setForm({ hod_name: '', department: '', position: '', count: 1, justification: '', job_type: 'TS', sub_category: 'TS', block: '' });
    setShowModal(false);
  };

  const isAdmin = userRole === 'admin';

  return (
    <div className="p-5 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[15px] font-bold text-foreground">HOD Requests</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Track vacancy requests from Heads of Department</p>
        </div>
        <button onClick={() => setShowModal(true)} className="px-3 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-md hover:opacity-90">
          + New Request
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2.5">
        <div className="stat-card border-l-primary"><div className="stat-card-value text-primary">{requisitions.length}</div><div className="stat-card-label">Total</div></div>
        <div className="stat-card border-l-warning"><div className="stat-card-value text-warning">{pending}</div><div className="stat-card-label">Pending</div></div>
        <div className="stat-card border-l-success"><div className="stat-card-value text-success">{approved}</div><div className="stat-card-label">Approved</div></div>
        <div className="stat-card border-l-destructive"><div className="stat-card-value text-destructive">{rejected}</div><div className="stat-card-label">Rejected</div></div>
      </div>

      <div className="space-y-2">
        {requisitions.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-sm">No requests yet.</div>
        ) : requisitions.map(r => (
          <div key={r.id} className={`bg-card rounded-lg p-4 shadow-card border-l-4 flex items-start gap-3.5 ${
            r.status === 'Pending' ? 'border-l-warning' : r.status === 'Approved' ? 'border-l-success' : 'border-l-destructive'
          }`}>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-foreground">{r.req_id}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  r.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                  r.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                  'bg-red-100 text-red-700'
                }`}>{r.status}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                <b>{r.position}</b> × {r.count} — Dept: {r.department} — HOD: {r.hod_name}
              </div>
              {r.justification && <div className="text-[11px] text-muted-foreground mt-1">{r.justification}</div>}
              {r.approved_by && <div className="text-[10px] text-muted-foreground mt-1">By: {r.approved_by}</div>}
            </div>
            {isAdmin && r.status === 'Pending' && (
              <div className="flex gap-1.5">
                <button onClick={() => onApprove(r)} className="px-2.5 py-1 text-[10px] font-semibold bg-success text-success-foreground rounded hover:opacity-90">Approve</button>
                <button onClick={() => onReject(r)} className="px-2.5 py-1 text-[10px] font-semibold bg-destructive text-destructive-foreground rounded hover:opacity-90">Reject</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Request Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/45 z-[200] flex items-center justify-center" onClick={() => setShowModal(false)}>
          <div className="bg-card rounded-xl p-6 w-[480px] shadow-elevated animate-fade-in" onClick={e => e.stopPropagation()}>
            <h2 className="text-sm font-bold text-foreground mb-4 border-b-2 border-primary pb-2">New HOD Request</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">HOD Name</label>
                <input value={form.hod_name} onChange={e => setForm(f => ({ ...f, hod_name: e.target.value }))}
                  className="border border-input rounded-md px-2 py-1.5 text-sm outline-none focus:border-primary bg-card" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Department</label>
                <input value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                  className="border border-input rounded-md px-2 py-1.5 text-sm outline-none focus:border-primary bg-card" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Position</label>
                <input value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))}
                  className="border border-input rounded-md px-2 py-1.5 text-sm outline-none focus:border-primary bg-card" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Count</label>
                <input type="number" min={1} value={form.count} onChange={e => setForm(f => ({ ...f, count: +e.target.value }))}
                  className="border border-input rounded-md px-2 py-1.5 text-sm outline-none focus:border-primary bg-card" />
              </div>
              <div className="flex flex-col gap-1 col-span-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Justification</label>
                <textarea value={form.justification} onChange={e => setForm(f => ({ ...f, justification: e.target.value }))}
                  className="border border-input rounded-md px-2 py-1.5 text-sm outline-none focus:border-primary bg-card min-h-[55px] resize-y" />
              </div>
            </div>
            <div className="flex gap-2.5 justify-end mt-4 pt-3 border-t border-border">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-xs font-semibold border border-border rounded-md bg-card hover:bg-muted">Cancel</button>
              <button onClick={handleAdd} className="px-4 py-2 text-xs font-semibold bg-primary text-primary-foreground rounded-md hover:opacity-90">Submit Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
