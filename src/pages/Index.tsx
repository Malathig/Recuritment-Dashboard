import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import AppHeader from '@/components/AppHeader';
import StatsCards from '@/components/StatsCards';
import CategoryBar from '@/components/CategoryBar';
import TypeToggle from '@/components/TypeToggle';
import GradeFilter from '@/components/GradeFilter';
import VacancyList from '@/components/VacancyList';
import VacancyModal from '@/components/VacancyModal';
import JoinModal from '@/components/JoinModal';
import ResignModal from '@/components/ResignModal';
import PipelineModal from '@/components/PipelineModal';
import ReportModal from '@/components/ReportModal';
import DashboardView from '@/components/DashboardView';
import JoiningTracker from '@/components/JoiningTracker';
import HODRequests from '@/components/HODRequests';
import PipelineView from '@/components/PipelineView';
import ActivityLogView from '@/components/ActivityLogView';
import DepartmentView from '@/components/DepartmentView';
import OnboardingView from '@/components/OnboardingView';
import ExcelImportExport from '@/components/ExcelImportExport';
import ExecutiveSummary from '@/components/ExecutiveSummary';
import FacultyTracker from '@/components/FacultyTracker';
import {
  fetchVacancies, createVacancy, updateVacancy, deleteVacancy,
  fetchJoinings, createJoining,
  fetchRequisitions, createRequisition, updateRequisition,
  fetchActivityLog, addActivityLog, generateVacancyId,
  type Vacancy, type Requisition, type VacancyInsert
} from '@/lib/api';

type ViewType = 'dash' | 'exec' | 'list' | 'dept' | 'log' | 'join' | 'req' | 'pipe' | 'onb' | 'faculty';

export default function Index() {
  const { profile, userRole } = useAuth();
  const qc = useQueryClient();

  const [view, setView] = useState<ViewType>('list');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [activeType, setActiveType] = useState('ALL');
  const [activeGrade, setActiveGrade] = useState('ALL');

  // Modals
  const [vacancyModal, setVacancyModal] = useState(false);
  const [editVacancy, setEditVacancy] = useState<Vacancy | null>(null);
  const [joinModal, setJoinModal] = useState(false);
  const [joinVacancy, setJoinVacancy] = useState<Vacancy | null>(null);
  const [resignModal, setResignModal] = useState(false);
  const [resignVacancy, setResignVacancy] = useState<Vacancy | null>(null);
  const [pipeModal, setPipeModal] = useState(false);
  const [pipeVacancy, setPipeVacancy] = useState<Vacancy | null>(null);
  const [reportModal, setReportModal] = useState(false);

  // Queries
  const { data: vacancies = [] } = useQuery({ queryKey: ['vacancies'], queryFn: fetchVacancies });
  const { data: joinings = [] } = useQuery({ queryKey: ['joinings'], queryFn: fetchJoinings });
  const { data: requisitions = [] } = useQuery({ queryKey: ['requisitions'], queryFn: fetchRequisitions });
  const { data: logs = [] } = useQuery({ queryKey: ['activity_log'], queryFn: fetchActivityLog });

  const userName = profile?.name || 'User';

  const log = useCallback((action: string, targetId: string, details: string) => {
    addActivityLog({ user_name: userName, action, target_id: targetId, details });
    qc.invalidateQueries({ queryKey: ['activity_log'] });
  }, [userName, qc]);

  // Mutations
  const createVacMut = useMutation({
    mutationFn: createVacancy,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['vacancies'] }); toast.success('Vacancy added!'); },
  });

  const updateVacMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateVacancy(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['vacancies'] }); toast.success('Vacancy updated!'); },
  });

  const deleteVacMut = useMutation({
    mutationFn: deleteVacancy,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['vacancies'] }); toast.success('Vacancy deleted!'); },
  });

  const createJoinMut = useMutation({
    mutationFn: createJoining,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['joinings'] }); },
  });

  const createReqMut = useMutation({
    mutationFn: createRequisition,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['requisitions'] }); toast.success('Request submitted!'); },
  });

  const updateReqMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateRequisition(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['requisitions'] }); },
  });

  // Bulk import
  const bulkImportMut = useMutation({
    mutationFn: async (rows: VacancyInsert[]) => {
      for (const row of rows) {
        await createVacancy(row);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vacancies'] });
      toast.success('Import complete!');
    },
  });

  // Handlers
  const handleSaveVacancy = (data: any, isEdit: boolean) => {
    if (isEdit && editVacancy) {
      updateVacMut.mutate({ id: editVacancy.id, data: { ...data, updated_by: userName } });
      log('EDIT', data.vacancy_id, `Updated by ${userName}`);
    } else {
      createVacMut.mutate({ ...data, updated_by: userName });
      log('ADD', data.vacancy_id, `Created by ${userName}`);
    }
    setVacancyModal(false);
    setEditVacancy(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this vacancy?')) return;
    const v = vacancies.find(v => v.id === id);
    deleteVacMut.mutate(id);
    if (v) log('DELETED', v.vacancy_id, v.position);
  };

  const handleJoinSave = (data: any) => {
    createJoinMut.mutate(data);
    if (joinVacancy) {
      const newFilled = joinVacancy.filled_count + 1;
      const newStatus = newFilled >= joinVacancy.required_count && joinVacancy.required_count > 0 ? 'Closed' : 'Need to Hire';
      updateVacMut.mutate({ id: joinVacancy.id, data: { filled_count: newFilled, status: newStatus, updated_by: userName } });
      log('JOIN', joinVacancy.vacancy_id, `${data.name} joined | Filled: ${joinVacancy.filled_count} -> ${newFilled}`);
    }
    setJoinModal(false);
    setJoinVacancy(null);
    toast.success('Joining recorded!');
  };

  const handleResignSave = (data: { count: number; action: string; remark: string }) => {
    if (!resignVacancy) return;
    const v = resignVacancy;
    const newFilled = Math.max(0, v.filled_count - data.count);
    const newRequired = data.action === 'backfill' ? v.required_count + data.count : v.required_count;
    const newStatus = newFilled >= newRequired && newRequired > 0 ? 'Closed' : 'Need to Hire';
    updateVacMut.mutate({ id: v.id, data: { filled_count: newFilled, required_count: newRequired, status: newStatus, updated_by: userName, remarks: v.remarks ? `${v.remarks} | ${data.remark}` : data.remark } });
    log('RESIGN', v.vacancy_id, `${data.count} resignation(s) | Filled: ${v.filled_count} -> ${newFilled}`);
    setResignModal(false);
    setResignVacancy(null);
    toast.success('Resignation recorded!');
  };

  const handlePipelineSave = (data: any) => {
    if (!pipeVacancy) return;
    updateVacMut.mutate({ id: pipeVacancy.id, data: { ...data, updated_by: userName } });
    log('PIPELINE', pipeVacancy.vacancy_id, `Pipeline updated by ${userName}`);
    setPipeModal(false);
    setPipeVacancy(null);
    toast.success('Pipeline updated!');
  };

  const handleApproveReq = (req: Requisition) => {
    const newVacId = generateVacancyId(req.sub_category || 'TS', vacancies.map(v => v.vacancy_id));
    createVacMut.mutate({
      vacancy_id: newVacId, job_type: req.job_type || 'TS', sub_category: req.sub_category || 'TS',
      position: req.position, department: req.department, required_count: req.count,
      block: req.block || '', source: 'hod', updated_by: userName,
    });
    updateReqMut.mutate({ id: req.id, data: { status: 'Approved', approved_by: userName, approved_at: new Date().toISOString(), vacancy_id: newVacId } });
    log('APPROVED', req.req_id, `Approved by ${userName} → ${newVacId}`);
    toast.success('Request approved! Vacancy created.');
  };

  const handleRejectReq = (req: Requisition) => {
    updateReqMut.mutate({ id: req.id, data: { status: 'Rejected', approved_by: userName } });
    log('REJECTED', req.req_id, `Rejected by ${userName}`);
    toast.success('Request rejected.');
  };

  const existingIds = vacancies.map(v => v.vacancy_id);
  const isAdmin = userRole === 'admin';

  // Filter vacancies by grade when TS is selected
  const filteredVacancies = activeGrade !== 'ALL' && activeCategory === 'TS'
    ? vacancies.filter(v => (v.grade || '').toLowerCase().includes(activeGrade.toLowerCase()))
    : vacancies;

  const views: { key: ViewType; label: string; show?: boolean }[] = [
    { key: 'dash', label: 'Dashboard' },
    { key: 'exec', label: '📊 Executive Report' },
    { key: 'list', label: 'Vacancy List' },
    { key: 'dept', label: 'By Department' },
    { key: 'join', label: 'Joining Tracker' },
    { key: 'faculty', label: '👥 Faculty Tracker' },
    { key: 'req', label: 'HOD Requests' },
    { key: 'pipe', label: 'Pipeline' },
    { key: 'onb', label: 'Onboarding' },
    { key: 'log', label: 'Activity Log', show: isAdmin },
  ];

  return (
    <div className="min-h-screen bg-background">
      <AppHeader onReport={() => setReportModal(true)} />
      <StatsCards vacancies={vacancies} />
      <CategoryBar activeCategory={activeCategory} onCategoryChange={(cat) => { setActiveCategory(cat); if (cat !== 'TS') setActiveGrade('ALL'); }} vacancies={vacancies} />
      <GradeFilter activeGrade={activeGrade} onGradeChange={setActiveGrade} show={activeCategory === 'TS'} />
      <TypeToggle activeType={activeType} onTypeChange={setActiveType} vacancies={vacancies} />

      {/* View Tabs */}
      <div className="flex px-5 bg-background">
        {views.filter(v => v.show !== false).map(v => (
          <div key={v.key} className={`view-tab ${view === v.key ? 'active' : ''}`} onClick={() => setView(v.key)}>
            {v.label}
          </div>
        ))}
      </div>

      {/* View Content */}
      <div className="border-t border-border">
        {view === 'dash' && <DashboardView vacancies={vacancies} />}
        {view === 'exec' && <ExecutiveSummary vacancies={vacancies} joinings={joinings} />}
        {view === 'list' && (
          <div>
            <div className="px-5 pt-2.5 flex justify-end gap-2">
              <ExcelImportExport vacancies={vacancies} onImport={(rows) => bulkImportMut.mutate(rows)} />
              {userRole !== 'view_only' && (
                <button onClick={() => { setEditVacancy(null); setVacancyModal(true); }} className="px-3 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-md hover:opacity-90">
                  + Add Vacancy
                </button>
              )}
            </div>
            <VacancyList
              vacancies={filteredVacancies}
              activeCategory={activeCategory}
              activeType={activeType}
              userRole={userRole}
              onEdit={(v) => { setEditVacancy(v); setVacancyModal(true); }}
              onDelete={handleDelete}
              onJoin={(v) => { setJoinVacancy(v); setJoinModal(true); }}
              onResign={(v) => { setResignVacancy(v); setResignModal(true); }}
              onPipeline={(v) => { setPipeVacancy(v); setPipeModal(true); }}
            />
          </div>
        )}
        {view === 'dept' && <DepartmentView vacancies={vacancies} />}
        {view === 'join' && <JoiningTracker joinings={joinings} />}
        {view === 'req' && <HODRequests requisitions={requisitions} onAdd={(r) => createReqMut.mutate(r)} onApprove={handleApproveReq} onReject={handleRejectReq} userRole={userRole} />}
        {view === 'pipe' && <PipelineView vacancies={vacancies} />}
        {view === 'onb' && <OnboardingView joinings={joinings} />}
        {view === 'faculty' && <FacultyTracker joinings={joinings} vacancies={vacancies} />}
        {view === 'log' && <ActivityLogView logs={logs} />}
      </div>

      {/* Modals */}
      <VacancyModal open={vacancyModal} onClose={() => { setVacancyModal(false); setEditVacancy(null); }} onSave={handleSaveVacancy} vacancy={editVacancy} existingIds={existingIds} />
      <JoinModal open={joinModal} onClose={() => { setJoinModal(false); setJoinVacancy(null); }} onSave={handleJoinSave} vacancy={joinVacancy} />
      <ResignModal open={resignModal} onClose={() => { setResignModal(false); setResignVacancy(null); }} onSave={handleResignSave} vacancy={resignVacancy} />
      <PipelineModal open={pipeModal} onClose={() => { setPipeModal(false); setPipeVacancy(null); }} onSave={handlePipelineSave} vacancy={pipeVacancy} />
      <ReportModal open={reportModal} onClose={() => setReportModal(false)} vacancies={vacancies} joinings={joinings} />
    </div>
  );
}
