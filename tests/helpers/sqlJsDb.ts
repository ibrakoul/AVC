import initSqlJs, { type Database } from 'sql.js';

import { migrate, type Db, type SqlParam } from '@/services/storage/database';

/**
 * In-memory SQLite (sql.js / WASM) implementing the `Db` interface, so the
 * repositories are tested against a real SQL engine with the real migrations.
 */
export async function createTestDb(): Promise<Db> {
  const SQL = await initSqlJs();
  const db: Database = new SQL.Database();
  const impl: Db = {
    async execAsync(source) {
      db.exec(source);
    },
    async runAsync(source, params: SqlParam[]) {
      db.run(source, params);
      return { changes: db.getRowsModified() };
    },
    async getAllAsync<T>(source: string, params: SqlParam[]) {
      const stmt = db.prepare(source);
      stmt.bind(params);
      const rows: T[] = [];
      while (stmt.step()) rows.push(stmt.getAsObject() as T);
      stmt.free();
      return rows;
    },
    async getFirstAsync<T>(source: string, params: SqlParam[]) {
      const rows = await impl.getAllAsync<T>(source, params);
      return rows[0] ?? null;
    },
  };
  await migrate(impl);
  return impl;
}
