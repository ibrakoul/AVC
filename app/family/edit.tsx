import { goBackOr } from '@/utils/navigation';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/common/Button';
import { Screen } from '@/components/common/Screen';
import { ErrorState } from '@/components/common/States';
import { TextField } from '@/components/common/TextField';
import { validateContact, type ContactErrors } from '@/features/family/contactValidation';
import { getContact, saveContact } from '@/services/storage/contactsRepository';

export default function EditContactScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('');
  const [errors, setErrors] = useState<ContactErrors>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    if (!id) return;
    void getContact(id)
      .then((c) => {
        if (!c) return;
        setName(c.name);
        setPhone(c.phone);
        setRelationship(c.relationship ?? '');
      })
      .catch(() => setSaveError(true));
  }, [id]);

  const submit = async () => {
    const v = validateContact(name, phone);
    setErrors(v);
    if (v.name || v.phone) return;
    setSaving(true);
    setSaveError(false);
    try {
      await saveContact({ name: name.trim(), phone: phone.trim(), relationship: relationship.trim() || null }, id);
      goBackOr('/family');
    } catch {
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen testID="edit-contact-screen">
      <Stack.Screen options={{ title: id ? t('family.editTitle') : t('family.addTitle') }} />
      <TextField testID="contact-name" label={t('family.name')} value={name} onChangeText={setName} error={errors.name ? t(errors.name) : undefined} autoComplete="name" />
      <TextField
        testID="contact-phone"
        label={t('family.phone')}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        autoComplete="tel"
        error={errors.phone ? t(errors.phone) : undefined}
      />
      <TextField
        testID="contact-relationship"
        label={`${t('family.relationship')} (${t('common.optional')})`}
        placeholder={t('family.relationshipPlaceholder')}
        value={relationship}
        onChangeText={setRelationship}
      />
      {saveError ? <ErrorState /> : null}
      <Button testID="save-contact" label={t('common.save')} icon="Check" loading={saving} onPress={() => void submit()} />
    </Screen>
  );
}
