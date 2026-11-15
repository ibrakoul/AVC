-- STROKE GUARD AI — initial schema
-- Principles: data minimisation, ownership via auth.uid(), Row Level Security
-- on EVERY table holding user data, public read-only for approved education.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles (1:1 with auth.users) — no health data here
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (display_name is null or char_length(display_name) between 1 and 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create an empty profile for each new account.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  insert into public.user_preferences (user_id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- user_preferences
-- ---------------------------------------------------------------------------
create table public.user_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  language text not null default 'en' check (language in ('en', 'fr', 'de')),
  country_code text check (country_code is null or country_code ~ '^[A-Z]{2}$'),
  theme text not null default 'system' check (theme in ('system', 'light', 'dark')),
  reminders_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger user_preferences_updated_at before update on public.user_preferences
  for each row execute function public.set_updated_at();

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- health_measurements — user-entered values, never interpreted server-side
-- ---------------------------------------------------------------------------
create table public.health_measurements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  measurement_type text not null check (measurement_type in
    ('blood_pressure', 'heart_rate', 'blood_glucose', 'cholesterol', 'weight', 'activity', 'sleep')),
  value_primary numeric(7, 2) not null check (value_primary >= 0 and value_primary <= 2000),
  value_secondary numeric(7, 2) check (value_secondary is null or (value_secondary >= 0 and value_secondary <= 2000)),
  unit text not null check (unit in ('mmHg', 'bpm', 'mg/dL', 'mmol/L', 'kg', 'lb', 'min', 'h')),
  subtype text check (subtype is null or subtype in ('total', 'ldl', 'hdl')),
  measured_at timestamptz not null check (measured_at <= now() + interval '1 day'),
  note text check (note is null or char_length(note) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bp_has_two_values check (measurement_type <> 'blood_pressure' or value_secondary is not null),
  constraint subtype_only_for_cholesterol check (subtype is null or measurement_type = 'cholesterol')
);

create index health_measurements_user_date_idx on public.health_measurements (user_id, measured_at desc);
create index health_measurements_user_type_idx on public.health_measurements (user_id, measurement_type);

create trigger health_measurements_updated_at before update on public.health_measurements
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- prevention_questionnaires — answers only, NO computed risk score
-- ---------------------------------------------------------------------------
create table public.prevention_questionnaires (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  answers jsonb not null check (jsonb_typeof(answers) = 'object'),
  created_at timestamptz not null default now()
);

create index prevention_questionnaires_user_idx on public.prevention_questionnaires (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- emergency_contacts
-- ---------------------------------------------------------------------------
create table public.emergency_contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  phone text not null check (phone ~ '^\+?[0-9 ()\-.]{3,20}$'),
  relationship text check (relationship is null or char_length(relationship) <= 60),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index emergency_contacts_user_idx on public.emergency_contacts (user_id);

create trigger emergency_contacts_updated_at before update on public.emergency_contacts
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- consent_records — append-only audit trail
-- ---------------------------------------------------------------------------
create table public.consent_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  consent_type text not null check (consent_type in ('cloud_sync', 'assistant_online', 'account_terms')),
  granted boolean not null,
  policy_version text not null check (char_length(policy_version) between 1 and 20),
  created_at timestamptz not null default now()
);

create index consent_records_user_idx on public.consent_records (user_id, consent_type, created_at desc);

-- ---------------------------------------------------------------------------
-- health_education_content — public, read-only, approved content only
-- ---------------------------------------------------------------------------
create table public.health_education_content (
  id uuid primary key default gen_random_uuid(),
  slug text not null check (slug ~ '^[a-z0-9-]{2,80}$'),
  language text not null check (language in ('en', 'fr', 'de')),
  title text not null check (char_length(title) between 1 and 200),
  body text not null check (char_length(body) between 1 and 20000),
  source_urls text[] not null default '{}',
  review_status text not null default 'draft' check (review_status in ('draft', 'in_review', 'approved')),
  reviewed_by text,
  reviewed_at timestamptz,
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (slug, language, version),
  constraint approved_requires_review check (review_status <> 'approved' or (reviewed_by is not null and reviewed_at is not null))
);

create index health_education_content_lookup_idx on public.health_education_content (language, slug) where review_status = 'approved';

create trigger health_education_content_updated_at before update on public.health_education_content
  for each row execute function public.set_updated_at();

-- ===========================================================================
-- ROW LEVEL SECURITY
-- ===========================================================================
alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.health_measurements enable row level security;
alter table public.prevention_questionnaires enable row level security;
alter table public.emergency_contacts enable row level security;
alter table public.consent_records enable row level security;
alter table public.health_education_content enable row level security;

-- profiles: owner only (row created by trigger; no insert/delete from clients)
create policy "profiles_select_own" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "profiles_update_own" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- user_preferences: owner only
create policy "prefs_select_own" on public.user_preferences for select to authenticated using ((select auth.uid()) = user_id);
create policy "prefs_insert_own" on public.user_preferences for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "prefs_update_own" on public.user_preferences for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- health_measurements: full CRUD on own rows only
create policy "measurements_select_own" on public.health_measurements for select to authenticated using ((select auth.uid()) = user_id);
create policy "measurements_insert_own" on public.health_measurements for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "measurements_update_own" on public.health_measurements for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "measurements_delete_own" on public.health_measurements for delete to authenticated using ((select auth.uid()) = user_id);

-- prevention_questionnaires: own rows only
create policy "prevention_select_own" on public.prevention_questionnaires for select to authenticated using ((select auth.uid()) = user_id);
create policy "prevention_insert_own" on public.prevention_questionnaires for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "prevention_delete_own" on public.prevention_questionnaires for delete to authenticated using ((select auth.uid()) = user_id);

-- emergency_contacts: full CRUD on own rows only
create policy "contacts_select_own" on public.emergency_contacts for select to authenticated using ((select auth.uid()) = user_id);
create policy "contacts_insert_own" on public.emergency_contacts for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "contacts_update_own" on public.emergency_contacts for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "contacts_delete_own" on public.emergency_contacts for delete to authenticated using ((select auth.uid()) = user_id);

-- consent_records: append-only (no update / delete policies)
create policy "consents_select_own" on public.consent_records for select to authenticated using ((select auth.uid()) = user_id);
create policy "consents_insert_own" on public.consent_records for insert to authenticated with check ((select auth.uid()) = user_id);

-- health_education_content: anyone (incl. anonymous) may read APPROVED content;
-- no write policy → only the service role (server-side) can write.
create policy "education_public_read_approved" on public.health_education_content for select to anon, authenticated using (review_status = 'approved');

-- Least privilege grants
revoke all on all tables in schema public from anon;
grant select on public.health_education_content to anon;
