/**
 * Local SQLite database (offline-first, source of truth for personal data).
 *
 * The `Db` interface is the subset of expo-sqlite's `SQLiteDatabase` we use,
 * so repositories can be tested against an in-memory SQL engine (sql.js).
 */
export type SqlParam = string | number | null;

export interface Db {
  execAsync(source: string): Promise<void>;
  runAsync(source: string, params: SqlParam[]): Promise<{ changes: number }>;
  getAllAsync<T>(source: string, params: SqlParam[]): Promise<T[]>;
  getFirstAsync<T>(source: string, params: SqlParam[]): Promise<T | null>;
}

/** Ordered local schema migrations. Never edit a shipped migration — append. */
export const LOCAL_MIGRATIONS: readonly string[] = [
  `
  CREATE TABLE IF NOT EXISTS measurements (
    id TEXT PRIMARY KEY NOT NULL,
    type TEXT NOT NULL,
    value REAL NOT NULL,
    value2 REAL,
    unit TEXT NOT NULL,
    subtype TEXT,
    measured_at TEXT NOT NULL,
    note TEXT,
    created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_measurements_type_date ON measurements (type, measured_at DESC);
  CREATE TABLE IF NOT EXISTS emergency_contacts (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    relationship TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS prevention_answers (
    id TEXT PRIMARY KEY NOT NULL,
    answers TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  `,
];

export async function migrate(db: Db): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version', []);
  let version = row?.user_version ?? 0;
  while (version < LOCAL_MIGRATIONS.length) {
    const sql = LOCAL_MIGRATIONS[version];
    if (sql) await db.execAsync(sql);
    version += 1;
    await db.execAsync(`PRAGMA user_version = ${version}`);
  }
}

let dbPromise: Promise<Db> | null = null;
let overrideDb: Db | null = null;

/** Test hook: inject a database implementation. */
export function setDatabaseForTesting(db: Db | null): void {
  overrideDb = db;
  dbPromise = null;
}

export function getDb(): Promise<Db> {
  if (overrideDb) return Promise.resolve(overrideDb);
  if (!dbPromise) {
    dbPromise = (async () => {
      // Lazy require keeps expo-sqlite out of environments that lack it.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const SQLite = require('expo-sqlite') as typeof import('expo-sqlite');
      const db = await SQLite.openDatabaseAsync('strokeguard.db');
      await db.execAsync('PRAGMA journal_mode = WAL;');
      await migrate(db);
      return db as unknown as Db;
    })().catch((error: unknown) => {
      dbPromise = null;
      throw error;
    });
  }
  return dbPromise;
}

export async function wipeLocalDatabase(db?: Db): Promise<void> {
  const d = db ?? (await getDb());
  await d.execAsync('DELETE FROM measurements; DELETE FROM emergency_contacts; DELETE FROM prevention_answers;');
}
