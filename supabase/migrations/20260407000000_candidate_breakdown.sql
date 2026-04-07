-- Add candidate_breakdown column to track disqualified candidate reasons per vacancy
-- This stores counts for statuses that make a candidate NOT valid for the vacancy
ALTER TABLE public.vacancies ADD COLUMN IF NOT EXISTS candidate_breakdown JSONB DEFAULT '{}';

COMMENT ON COLUMN public.vacancies.candidate_breakdown IS
  'JSON object storing counts of disqualified candidates by reason:
   thesis_submitted, pursuing_phd, no_phd, rejected, waiting_list,
   in_progress, not_eligible, no_resume, not_interested, no_access, unknown';
