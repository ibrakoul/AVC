import { setDatabaseForTesting, wipeLocalDatabase, type Db } from '@/services/storage/database';
import { addMeasurement, deleteAllMeasurements, deleteMeasurement, listMeasurements } from '@/services/storage/measurementsRepository';
import { deleteContact, listContacts, saveContact } from '@/services/storage/contactsRepository';
import { loadPrevention, sanitizeAnswers, savePrevention } from '@/services/storage/preventionRepository';
import { createTestDb } from './helpers/sqlJsDb';

let db: Db;
beforeEach(async () => {
  db = await createTestDb();
  setDatabaseForTesting(db);
});
afterAll(() => setDatabaseForTesting(null));

const bp = { type: 'blood_pressure' as const, value: 130, value2: 85, unit: 'mmHg' as const, subtype: null, note: null };

describe('health measurements (local SQLite)', () => {
  it('adds and lists newest first, filtered by type', async () => {
    await addMeasurement({ ...bp, measuredAt: '2026-11-01T08:00:00.000Z' });
    await addMeasurement({ ...bp, value: 125, measuredAt: '2026-11-10T08:00:00.000Z' });
    await addMeasurement({ type: 'weight', value: 70, value2: null, unit: 'kg', subtype: null, note: 'morning', measuredAt: '2026-11-05T08:00:00.000Z' });
    const all = await listMeasurements();
    expect(all.map((m) => m.measuredAt)).toEqual(['2026-11-10T08:00:00.000Z', '2026-11-05T08:00:00.000Z', '2026-11-01T08:00:00.000Z']);
    const onlyBp = await listMeasurements('blood_pressure');
    expect(onlyBp).toHaveLength(2);
    expect(onlyBp[0]).toMatchObject({ value: 125, value2: 85, unit: 'mmHg' });
  });

  it('deletes one record', async () => {
    const m = await addMeasurement({ ...bp, measuredAt: '2026-11-01T08:00:00.000Z' });
    await addMeasurement({ ...bp, measuredAt: '2026-11-02T08:00:00.000Z' });
    await deleteMeasurement(m.id);
    const left = await listMeasurements();
    expect(left).toHaveLength(1);
    expect(left[0]!.id).not.toBe(m.id);
  });

  it('deletes all records (data deletion)', async () => {
    await addMeasurement({ ...bp, measuredAt: '2026-11-01T08:00:00.000Z' });
    await deleteAllMeasurements();
    expect(await listMeasurements()).toEqual([]);
  });
});

describe('emergency contacts', () => {
  it('creates, edits and removes', async () => {
    const c = await saveContact({ name: 'Anna', phone: '+49 151 1', relationship: 'daughter' });
    await saveContact({ name: 'Anna M.', phone: '+49 151 2', relationship: null }, c.id);
    const list = await listContacts();
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({ id: c.id, name: 'Anna M.', phone: '+49 151 2', relationship: null });
    await deleteContact(c.id);
    expect(await listContacts()).toEqual([]);
  });
});

describe('prevention questionnaire', () => {
  it('saves and loads answers, overwriting previous ones', async () => {
    expect(await loadPrevention()).toBeNull();
    await savePrevention({ hypertension: 'yes' });
    await savePrevention({ hypertension: 'no', smoking: 'unknown' });
    expect((await loadPrevention())?.answers).toEqual({ hypertension: 'no', smoking: 'unknown' });
  });

  it('sanitises corrupted data', () => {
    expect(sanitizeAnswers({ hypertension: 'maybe', smoking: 'yes', hacker: 'yes' })).toEqual({ smoking: 'yes' });
    expect(sanitizeAnswers(null)).toEqual({});
  });
});

describe('wipe local data', () => {
  it('removes measurements, contacts and questionnaire', async () => {
    await addMeasurement({ ...bp, measuredAt: '2026-11-01T08:00:00.000Z' });
    await saveContact({ name: 'A', phone: '123', relationship: null });
    await savePrevention({ diabetes: 'yes' });
    await wipeLocalDatabase(db);
    expect(await listMeasurements()).toEqual([]);
    expect(await listContacts()).toEqual([]);
    expect(await loadPrevention()).toBeNull();
  });
});
