import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

type FormState = {
  hod_name: string;
  hod_email: string;
  department: string;
  position: string;
  count: number;
  job_type: string;
  sub_category: string;
  block: string;
  justification: string;
};

const INITIAL_FORM: FormState = {
  hod_name: '', hod_email: '', department: '', position: '',
  count: 1, job_type: 'TS', sub_category: 'TS', block: '', justification: '',
};

export default function PublicRequestForm() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const set = (field: keyof FormState, value: string | number) =>
    setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.hod_name.trim() || !form.department.trim() || !form.position.trim()) {
      setError('Please fill all required fields marked with *');
      return;
    }
    setSubmitting(true);
    setError(null);
    const reqId = `REQ-${Date.now().toString(36).toUpperCase()}`;
    const { error: dbError } = await supabase.from('requisitions').insert({
      req_id: reqId,
      hod_name: form.hod_name.trim(),
      hod_email: form.hod_email.trim(),
      department: form.department.trim(),
      position: form.position.trim(),
      count: form.count,
      job_type: form.job_type,
      sub_category: form.sub_category,
      block: form.block.trim(),
      justification: form.justification.trim(),
      status: 'Pending',
      source: 'online',
    });
    setSubmitting(false);
    if (dbError) {
      setError('Submission failed. Please try again or contact HR directly.');
      console.error(dbError);
    } else {
      setSubmitted(reqId);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Request Submitted!</h2>
          <p className="text-gray-500 text-sm mb-5">
            Your vacancy request has been received and is pending HR review. You will be notified once it is processed.
          </p>
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
            <p className="text-xs font-semibold text-blue-400 uppercase mb-1">Your Tracking ID</p>
            <p className="text-2xl font-bold text-blue-700 tracking-wider">{submitted}</p>
            <p className="text-xs text-blue-400 mt-1">Save this ID to follow up with HR</p>
          </div>
          <button
            onClick={() => { setSubmitted(null); setForm(INITIAL_FORM); }}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Submit Another Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 flex items-start justify-center p-4 py-8">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-600 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-white text-base font-bold leading-tight">Vacancy Request Form</h1>
              <p className="text-blue-200 text-xs mt-0.5">SIMATS — HR Department</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* Section: HOD Details */}
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">HOD Information</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600">Full Name <span className="text-red-500">*</span></label>
                <input
                  required
                  value={form.hod_name}
                  onChange={e => set('hod_name', e.target.value)}
                  placeholder="Dr. / Prof. Full Name"
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div className="col-span-2 flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600">Email Address</label>
                <input
                  type="email"
                  value={form.hod_email}
                  onChange={e => set('hod_email', e.target.value)}
                  placeholder="hod@simats.ac.in"
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* Section: Position Details */}
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">Position Details</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600">Department <span className="text-red-500">*</span></label>
                <input
                  required
                  value={form.department}
                  onChange={e => set('department', e.target.value)}
                  placeholder="e.g. CSE, Mech, Admin"
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600">Block / Location</label>
                <input
                  value={form.block}
                  onChange={e => set('block', e.target.value)}
                  placeholder="e.g. Block A, Main"
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div className="col-span-2 flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600">Position / Role Title <span className="text-red-500">*</span></label>
                <input
                  required
                  value={form.position}
                  onChange={e => set('position', e.target.value)}
                  placeholder="e.g. Assistant Professor, Lab Technician, Admin Officer"
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600">Staff Type <span className="text-red-500">*</span></label>
                <select
                  value={form.job_type}
                  onChange={e => {
                    const jt = e.target.value;
                    set('job_type', jt);
                    set('sub_category', jt === 'TS' ? 'TS' : 'NTS-Admin');
                  }}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white"
                >
                  <option value="TS">Teaching Staff (TS)</option>
                  <option value="NTS">Non-Teaching Staff (NTS)</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600">Category <span className="text-red-500">*</span></label>
                <select
                  value={form.sub_category}
                  onChange={e => set('sub_category', e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white"
                >
                  {form.job_type === 'TS' ? (
                    <option value="TS">Teaching Staff</option>
                  ) : (
                    <>
                      <option value="NTS-Admin">Administrative</option>
                      <option value="NTS-Technical">Technical</option>
                      <option value="NTS-Maint">Maintenance</option>
                      <option value="NTS-HK">Housekeeping</option>
                      <option value="NTS-Security">Security</option>
                    </>
                  )}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600">No. of Positions <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  required
                  value={form.count}
                  onChange={e => set('count', Math.max(1, parseInt(e.target.value) || 1))}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* Justification */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600">Justification / Reason</label>
            <textarea
              value={form.justification}
              onChange={e => set('justification', e.target.value)}
              placeholder="Briefly explain why this position is needed — e.g. workload increase, resignation, new program launch..."
              rows={3}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-y"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg p-2.5">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Submitting...
              </span>
            ) : 'Submit Vacancy Request'}
          </button>

          <p className="text-xs text-gray-400 text-center">
            Your request will be reviewed by HR. You'll receive a tracking ID after submission.
          </p>
        </form>
      </div>
    </div>
  );
}
