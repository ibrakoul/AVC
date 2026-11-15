import type { CholesterolKind, Measurement, MeasurementType, MeasurementUnit, NewMeasurement } from '@/types/health';
import { newId } from '@/utils/id';
import { getDb, type Db } from './database';

interface Row {
  id: string;
  type: string;
  value: number;
  value2: number | null;
  unit: string;
  subtype: string | null;
  measured_at: string;
  note: string | null;
  created_at: string;
}

function fromRow(r: Row): Measurement {
  return {
    id: r.id,
    type: r.type as MeasurementType,
    value: r.value,
    value2: r.value2,
    unit: r.unit as MeasurementUnit,
    subtype: (r.subtype as CholesterolKind | null) ?? null,
    measuredAt: r.measured_at,
    note: r.note,
    createdAt: r.created_at,
  };
}

export async function addMeasurement(input: NewMeasurement, db?: Db): Promise<Measurement> {
  const d = db ?? (await getDb());
  const m: Measurement = { ...input, id: newId(), createdAt: new Date().toISOString() };
  await d.runAsync(
    `INSERT INTO measurements (id, type, value, value2, unit, subtype, measured_at, note, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [m.id, m.type, m.value, m.value2, m.unit, m.subtype, m.measuredAt, m.note, m.createdAt],
  );
  return m;
}

export async function listMeasurements(type?: MeasurementType, db?: Db): Promise<Measurement[]> {
  const d = db ?? (await getDb());
  const rows = type
    ? await d.getAllAsync<Row>('SELECT * FROM measurements WHERE type = ? ORDER BY measured_at DESC', [type])
    : await d.getAllAsync<Row>('SELECT * FROM measurements ORDER BY measured_at DESC', []);
  return rows.map(fromRow);
}

export async function deleteMeasurement(id: string, db?: Db): Promise<void> {
  const d = db ?? (await getDb());
  await d.runAsync('DELETE FROM measurements WHERE id = ?', [id]);
}

export async function deleteAllMeasurements(db?: Db): Promise<void> {
  const d = db ?? (await getDb());
  await d.runAsync('DELETE FROM measurements', []);
}
