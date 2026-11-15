import type { EmergencyContact } from '@/types/health';
import { newId } from '@/utils/id';
import { getDb, type Db } from './database';

interface Row {
  id: string;
  name: string;
  phone: string;
  relationship: string | null;
  created_at: string;
  updated_at: string;
}

const fromRow = (r: Row): EmergencyContact => ({
  id: r.id,
  name: r.name,
  phone: r.phone,
  relationship: r.relationship,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export interface ContactInput {
  name: string;
  phone: string;
  relationship: string | null;
}

export async function listContacts(db?: Db): Promise<EmergencyContact[]> {
  const d = db ?? (await getDb());
  const rows = await d.getAllAsync<Row>('SELECT * FROM emergency_contacts ORDER BY created_at ASC', []);
  return rows.map(fromRow);
}

export async function getContact(id: string, db?: Db): Promise<EmergencyContact | null> {
  const d = db ?? (await getDb());
  const row = await d.getFirstAsync<Row>('SELECT * FROM emergency_contacts WHERE id = ?', [id]);
  return row ? fromRow(row) : null;
}

export async function saveContact(input: ContactInput, id?: string, db?: Db): Promise<EmergencyContact> {
  const d = db ?? (await getDb());
  const now = new Date().toISOString();
  if (id) {
    await d.runAsync('UPDATE emergency_contacts SET name = ?, phone = ?, relationship = ?, updated_at = ? WHERE id = ?', [
      input.name,
      input.phone,
      input.relationship,
      now,
      id,
    ]);
    const updated = await getContact(id, d);
    if (!updated) throw new Error('Contact not found');
    return updated;
  }
  const contact: EmergencyContact = { id: newId(), ...input, createdAt: now, updatedAt: now };
  await d.runAsync(
    'INSERT INTO emergency_contacts (id, name, phone, relationship, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
    [contact.id, contact.name, contact.phone, contact.relationship, now, now],
  );
  return contact;
}

export async function deleteContact(id: string, db?: Db): Promise<void> {
  const d = db ?? (await getDb());
  await d.runAsync('DELETE FROM emergency_contacts WHERE id = ?', [id]);
}
