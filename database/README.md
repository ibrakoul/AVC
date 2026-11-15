# Database

The PostgreSQL schema lives in [`../supabase/migrations`](../supabase/migrations) (Supabase CLI convention),
with RLS tests in [`../supabase/tests/database`](../supabase/tests/database) and a development seed in
[`../supabase/seed.sql`](../supabase/seed.sql).

The on-device SQLite schema (offline source of truth) is defined in
[`../services/storage/database.ts`](../services/storage/database.ts) (`LOCAL_MIGRATIONS`).
