-- pgTAP tests for Row Level Security. Run with: supabase test db
begin;
select plan(12);

-- Every user-data table has RLS enabled.
select ok((select relrowsecurity from pg_class where oid = 'public.profiles'::regclass), 'RLS on profiles');
select ok((select relrowsecurity from pg_class where oid = 'public.user_preferences'::regclass), 'RLS on user_preferences');
select ok((select relrowsecurity from pg_class where oid = 'public.health_measurements'::regclass), 'RLS on health_measurements');
select ok((select relrowsecurity from pg_class where oid = 'public.prevention_questionnaires'::regclass), 'RLS on prevention_questionnaires');
select ok((select relrowsecurity from pg_class where oid = 'public.emergency_contacts'::regclass), 'RLS on emergency_contacts');
select ok((select relrowsecurity from pg_class where oid = 'public.consent_records'::regclass), 'RLS on consent_records');
select ok((select relrowsecurity from pg_class where oid = 'public.health_education_content'::regclass), 'RLS on health_education_content');

-- Two users.
insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'a@test.local'),
  ('22222222-2222-2222-2222-222222222222', 'b@test.local');

insert into public.health_measurements (user_id, measurement_type, value_primary, value_secondary, unit, measured_at)
values ('11111111-1111-1111-1111-111111111111', 'blood_pressure', 120, 80, 'mmHg', now());

-- User B cannot read user A's measurement.
set local role authenticated;
set local request.jwt.claims = '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}';
select is((select count(*)::int from public.health_measurements), 0, 'user B sees none of user A''s measurements');

-- User B cannot insert a row for user A.
select throws_ok(
  $$insert into public.health_measurements (user_id, measurement_type, value_primary, unit, measured_at)
    values ('11111111-1111-1111-1111-111111111111', 'heart_rate', 70, 'bpm', now())$$,
  '42501', null, 'user B cannot write rows owned by user A');

-- User A sees own row.
set local request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';
select is((select count(*)::int from public.health_measurements), 1, 'user A sees own measurement');

-- Anonymous users can read approved education only, and no personal data.
reset role;
insert into public.health_education_content (slug, language, title, body, review_status, reviewed_by, reviewed_at)
values ('approved-item', 'en', 'Approved', 'Body', 'approved', 'Dr. Reviewer', now()),
       ('draft-item', 'en', 'Draft', 'Body', 'draft', null, null);
set local role anon;
select is((select count(*)::int from public.health_education_content), 1, 'anon reads only approved education content');
select throws_ok('select * from public.health_measurements', '42501', null, 'anon cannot read measurements');

select * from finish();
rollback;
