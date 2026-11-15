export interface ContactErrors {
  name?: 'family.nameRequired';
  phone?: 'family.phoneInvalid';
}

export function validateContact(name: string, phone: string): ContactErrors {
  const errors: ContactErrors = {};
  if (name.trim().length === 0) errors.name = 'family.nameRequired';
  const p = phone.trim();
  if (!/^\+?[\d\s\-().]{3,20}$/.test(p) || (p.match(/\d/g) ?? []).length < 3) errors.phone = 'family.phoneInvalid';
  return errors;
}
