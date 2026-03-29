import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Vacancy = Tables<'vacancies'>;
export type VacancyInsert = TablesInsert<'vacancies'>;
export type VacancyUpdate = TablesUpdate<'vacancies'>;
export type Joining = Tables<'joinings'>;
export type JoiningInsert = TablesInsert<'joinings'>;
export type Requisition = Tables<'requisitions'>;
export type RequisitionInsert = TablesInsert<'requisitions'>;
export type ActivityLog = Tables<'activity_log'>;

// Vacancies
export async function fetchVacancies() {
  const { data, error } = await supabase.from('vacancies').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createVacancy(v: VacancyInsert) {
  const { data, error } = await supabase.from('vacancies').insert(v).select().single();
  if (error) throw error;
  return data;
}

export async function updateVacancy(id: string, v: VacancyUpdate) {
  const { data, error } = await supabase.from('vacancies').update(v).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteVacancy(id: string) {
  const { error } = await supabase.from('vacancies').delete().eq('id', id);
  if (error) throw error;
}

// Joinings
export async function fetchJoinings() {
  const { data, error } = await supabase.from('joinings').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createJoining(j: JoiningInsert) {
  const { data, error } = await supabase.from('joinings').insert(j).select().single();
  if (error) throw error;
  return data;
}

export async function updateJoining(id: string, j: Partial<Joining>) {
  const { data, error } = await supabase.from('joinings').update(j).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

// Requisitions
export async function fetchRequisitions() {
  const { data, error } = await supabase.from('requisitions').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createRequisition(r: RequisitionInsert) {
  const { data, error } = await supabase.from('requisitions').insert(r).select().single();
  if (error) throw error;
  return data;
}

export async function updateRequisition(id: string, r: Partial<Requisition>) {
  const { data, error } = await supabase.from('requisitions').update(r).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

// Activity Log
export async function fetchActivityLog() {
  const { data, error } = await supabase.from('activity_log').select('*').order('created_at', { ascending: false }).limit(300);
  if (error) throw error;
  return data;
}

export async function addActivityLog(entry: { user_name: string; action: string; target_id?: string; details?: string }) {
  const { error } = await supabase.from('activity_log').insert(entry);
  if (error) console.error('Log error:', error);
}

// Helpers
export function generateVacancyId(subcat: string, existingIds: string[]): string {
  const codes: Record<string, string> = {
    'TS': 'TS', 'NTS-Admin': 'ADM', 'NTS-Technical': 'TEC',
    'NTS-Maint': 'MNT', 'NTS-HK': 'HK', 'NTS-Security': 'SEC'
  };
  const code = codes[subcat] || 'GEN';
  const yr = new Date().getFullYear();
  const ay = String(yr).slice(-2) + String(yr + 1).slice(-2);
  const used = new Set(existingIds);
  let rand: number, tries = 0;
  do {
    rand = Math.floor(Math.random() * 9000) + 1000;
    tries++;
  } while (used.has(`SIM-${code}-${ay}-${rand}`) && tries < 50);
  return `SIM-${code}-${ay}-${rand}`;
}

export const CATEGORIES = [
  { key: 'ALL', label: 'All', icon: '' },
  { key: 'TS', label: 'Teaching (TS)', icon: '🎓' },
  { key: 'NTS-Admin', label: 'Administrative', icon: '📋' },
  { key: 'NTS-Technical', label: 'Technical', icon: '🔬' },
  { key: 'NTS-Maint', label: 'Maintenance', icon: '🔧' },
  { key: 'NTS-HK', label: 'Housekeeping', icon: '🧹' },
  { key: 'NTS-Security', label: 'Security', icon: '🛡️' },
];

export const COLLEGES = [
  { code: 'SSE', name: 'SIMATS Engineering' },
  { code: 'SCLAS', name: 'Liberal Arts & Science' },
  { code: 'SCAD', name: 'Architecture & Design' },
  { code: 'SPIER', name: 'Education & Research' },
  { code: 'STUDIO', name: 'SIMATS Design Studio' },
  { code: 'SHIFT', name: 'Hospitality, Aviation & Tourism' },
  { code: 'Other', name: 'Other' },
];

export const STAT_COLORS = {
  primary: { border: 'border-l-primary', text: 'text-primary' },
  success: { border: 'border-l-success', text: 'text-success' },
  warning: { border: 'border-l-warning', text: 'text-warning' },
  accent: { border: 'border-l-accent', text: 'text-accent' },
  info: { border: 'border-l-info', text: 'text-info' },
  destructive: { border: 'border-l-destructive', text: 'text-destructive' },
};
