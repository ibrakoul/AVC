import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Static checks of the Supabase migrations (the live RLS behaviour is
 * covered by supabase/tests/database/rls.test.sql via `supabase test db`).
 */
const dir = join(__dirname, '..', 'supabase', 'migrations');
const sql = readdirSync(dir)
  .filter((f) => f.endsWith('.sql'))
  .map((f) => readFileSync(join(dir, f), 'utf8'))
  .join('\n')
  .toLowerCase();

const tables = [...sql.matchAll(/create table public\.(\w+)/g)].map((m) => m[1]!);
const USER_TABLES = ['profiles', 'user_preferences', 'health_measurements', 'prevention_questionnaires', 'emergency_contacts', 'consent_records'];

describe('database access permissions (migrations)', () => {
  it('creates every required table', () => {
    expect(tables.sort()).toEqual([...USER_TABLES, 'health_education_content'].sort());
  });

  it.each([...USER_TABLES, 'health_education_content'])('%s has RLS enabled', (table) => {
    expect(sql).toContain(`alter table public.${table} enable row level security`);
  });

  it.each(USER_TABLES)('%s policies are restricted to the owner via auth.uid()', (table) => {
    const policies = [...sql.matchAll(new RegExp(`create policy "[^"]+" on public\\.${table} for (\\w+) to (\\w+)([^;]*);`, 'g'))];
    expect(policies.length).toBeGreaterThan(0);
    for (const [, , role, body] of policies) {
      expect(role).toBe('authenticated');
      expect(body).toMatch(/\(select auth\.uid\(\)\) = (user_id|id)/);
    }
  });

  it('user tables are linked to auth.users with cascade delete (account deletion)', () => {
    for (const table of USER_TABLES) {
      const block = sql.split(`create table public.${table} (`)[1]!.split(');')[0]!;
      expect(block).toMatch(/references auth\.users \(id\) on delete cascade/);
    }
  });

  it('uses UUID primary keys and timestamps', () => {
    for (const table of tables) {
      const block = sql.split(`create table public.${table} (`)[1]!.split(');')[0]!;
      expect(block).toMatch(/uuid primary key/);
      expect(block).toMatch(/created_at timestamptz not null default now\(\)/);
    }
  });

  it('consent records are append-only (no update/delete policy)', () => {
    expect(sql).not.toMatch(/on public\.consent_records for (update|delete)/);
  });

  it('education content is publicly readable only when approved, never writable by clients', () => {
    expect(sql).toContain(`on public.health_education_content for select to anon, authenticated using (review_status = 'approved')`);
    expect(sql).not.toMatch(/on public\.health_education_content for (insert|update|delete|all)/);
  });

  it('never stores a computed clinical risk score', () => {
    expect(sql).not.toMatch(/risk_score|risk_level/);
  });
});

describe('no secrets in the mobile app', () => {
  it('the app never references the service-role key or AI provider key', () => {
    const { execSync } = jest.requireActual('node:child_process') as typeof import('node:child_process');
    const out = execSync(
      `grep -rIl -E "SERVICE_ROLE|service_role|ANTHROPIC_API_KEY|sk-ant-" app components features services hooks constants utils locales || true`,
      { cwd: join(__dirname, '..'), encoding: 'utf8' },
    );
    expect(out.trim()).toBe('');
  });
});
