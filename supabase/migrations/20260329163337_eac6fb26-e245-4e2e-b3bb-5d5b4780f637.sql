
-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'hr_team', 'view_only');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL DEFAULT '',
  pin TEXT NOT NULL DEFAULT '5678',
  color TEXT NOT NULL DEFAULT '#1a3a5c',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'view_only',
  UNIQUE(user_id, role)
);

-- Vacancies table
CREATE TABLE public.vacancies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vacancy_id TEXT NOT NULL UNIQUE,
  job_type TEXT NOT NULL DEFAULT 'NTS' CHECK (job_type IN ('TS', 'NTS')),
  sub_category TEXT NOT NULL DEFAULT 'NTS-Admin',
  block TEXT DEFAULT '',
  location TEXT DEFAULT '',
  position TEXT NOT NULL,
  department TEXT NOT NULL,
  required_count INT NOT NULL DEFAULT 1,
  filled_count INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Need to Hire' CHECK (status IN ('Need to Hire', 'Closed')),
  remarks TEXT DEFAULT '',
  requestor TEXT DEFAULT '',
  source TEXT DEFAULT 'direct',
  grade TEXT DEFAULT '',
  applied INT DEFAULT 0,
  shortlisted INT DEFAULT 0,
  interviewed INT DEFAULT 0,
  selected INT DEFAULT 0,
  ad_date TEXT DEFAULT '',
  ad_platform TEXT DEFAULT '',
  offer_made INT DEFAULT 0,
  offer_accepted INT DEFAULT 0,
  offer_declined INT DEFAULT 0,
  updated_by TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Joinings table
CREATE TABLE public.joinings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vacancy_id TEXT,
  name TEXT NOT NULL,
  position TEXT DEFAULT '',
  department TEXT DEFAULT '',
  date DATE,
  college TEXT DEFAULT 'SSE',
  joining_status TEXT DEFAULT 'New' CHECK (joining_status IN ('New', 'Rejoin', 'Left')),
  job_type TEXT DEFAULT 'NTS',
  emp_id TEXT DEFAULT '',
  bio_id TEXT DEFAULT '',
  qualification TEXT DEFAULT '',
  address TEXT DEFAULT '',
  remarks TEXT DEFAULT '',
  onboarding JSONB DEFAULT '{}',
  onb_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Requisitions (HOD Requests)
CREATE TABLE public.requisitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  req_id TEXT NOT NULL UNIQUE,
  hod_name TEXT NOT NULL,
  department TEXT NOT NULL,
  position TEXT NOT NULL,
  count INT NOT NULL DEFAULT 1,
  justification TEXT DEFAULT '',
  job_type TEXT DEFAULT 'TS',
  sub_category TEXT DEFAULT 'TS',
  block TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
  approved_by TEXT DEFAULT '',
  approved_at TIMESTAMPTZ,
  vacancy_id TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Activity log
CREATE TABLE public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name TEXT NOT NULL,
  action TEXT NOT NULL,
  target_id TEXT DEFAULT '',
  details TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- App settings
CREATE TABLE public.app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vacancies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.joinings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requisitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS Policies (internal app - all authenticated users can access)
CREATE POLICY "Auth users read vacancies" ON public.vacancies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users insert vacancies" ON public.vacancies FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users update vacancies" ON public.vacancies FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth users delete vacancies" ON public.vacancies FOR DELETE TO authenticated USING (true);

CREATE POLICY "Auth users read joinings" ON public.joinings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users insert joinings" ON public.joinings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users update joinings" ON public.joinings FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth users delete joinings" ON public.joinings FOR DELETE TO authenticated USING (true);

CREATE POLICY "Auth users read requisitions" ON public.requisitions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users insert requisitions" ON public.requisitions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users update requisitions" ON public.requisitions FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Auth users read log" ON public.activity_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users insert log" ON public.activity_log FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Auth users read settings" ON public.app_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users upsert settings" ON public.app_settings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users update settings" ON public.app_settings FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Auth users read profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Auth users read roles" ON public.user_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_vacancies_updated_at BEFORE UPDATE ON public.vacancies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_joinings_updated_at BEFORE UPDATE ON public.joinings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, short_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email), UPPER(LEFT(COALESCE(NEW.raw_user_meta_data->>'name', NEW.email), 2)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
