import { goBackOr } from '@/utils/navigation';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/common/AppText';
import { Banner } from '@/components/common/Banner';
import { Button } from '@/components/common/Button';
import { Icon } from '@/components/common/Icon';
import { Screen } from '@/components/common/Screen';
import { Segmented } from '@/components/common/Segmented';
import { ErrorState } from '@/components/common/States';
import { TextField } from '@/components/common/TextField';
import { MIN_TOUCH, radius, spacing } from '@/constants/theme';
import { MEASUREMENT_CONFIG } from '@/features/tracker/measurementConfig';
import { validateMeasurement, type FieldError, type MeasurementForm } from '@/features/tracker/validation';
import { useTheme } from '@/hooks/useTheme';
import { addMeasurement } from '@/services/storage/measurementsRepository';
import { MEASUREMENT_TYPES, type CholesterolKind, type MeasurementType, type MeasurementUnit } from '@/types/health';
import { toLocalInput } from '@/utils/date';

export default function AddMeasurementScreen() {
  const { t } = useTranslation();
  const { c } = useTheme();
  const [form, setForm] = useState<MeasurementForm>({
    type: 'blood_pressure',
    unit: 'mmHg',
    value: '',
    value2: '',
    subtype: null,
    dateTime: toLocalInput(new Date()),
    note: '',
  });
  const [errors, setErrors] = useState<Partial<Record<'value' | 'value2' | 'dateTime', FieldError>>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const config = MEASUREMENT_CONFIG[form.type];
  const msg = (e?: FieldError) => (e ? t(e.key, e.params ?? {}) : undefined);

  const selectType = (type: MeasurementType) =>
    setForm((f) => ({ ...f, type, unit: MEASUREMENT_CONFIG[type].units[0]!, value: '', value2: '', subtype: type === 'cholesterol' ? 'total' : null }));

  const submit = async () => {
    const result = validateMeasurement(form);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    setSaving(true);
    setSaveError(false);
    try {
      await addMeasurement(result.measurement);
      goBackOr('/health-tracker');
    } catch {
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen testID="add-measurement-screen">
      <AppText variant="bodyStrong">{t('tracker.form.type')}</AppText>
      <View style={styles.grid} accessibilityRole="radiogroup">
        {MEASUREMENT_TYPES.map((type) => {
          const selected = type === form.type;
          return (
            <Pressable
              key={type}
              testID={`type-${type}`}
              accessibilityRole="radio"
              accessibilityState={{ selected, checked: selected }}
              onPress={() => selectType(type)}
              style={[styles.typeBtn, { borderColor: selected ? c.primaryStrong : c.border, backgroundColor: selected ? c.surfaceAlt : c.surface }]}
            >
              <Icon name={MEASUREMENT_CONFIG[type].icon} color={selected ? c.primaryStrong : c.textMuted} />
              <AppText variant="small" style={styles.flex}>
                {t(`tracker.types.${type}`)}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      {config.units.length > 1 ? (
        <Segmented<MeasurementUnit>
          testIDPrefix="unit"
          accessibilityLabel={t('tracker.form.unit')}
          value={form.unit}
          onChange={(unit) => setForm((f) => ({ ...f, unit }))}
          options={config.units.map((u) => ({ value: u, label: t(`tracker.units.${u}`) }))}
        />
      ) : null}
      {form.type === 'cholesterol' ? (
        <Segmented<CholesterolKind>
          testIDPrefix="chol"
          accessibilityLabel={t('tracker.form.cholesterolKind')}
          value={form.subtype}
          onChange={(subtype) => setForm((f) => ({ ...f, subtype }))}
          options={(['total', 'ldl', 'hdl'] as const).map((k) => ({ value: k, label: t(`tracker.form.${k}`) }))}
        />
      ) : null}

      <TextField
        testID="input-value"
        label={`${config.dual ? t('tracker.form.systolic') : t('tracker.form.value')} (${t(`tracker.units.${form.unit}`)})`}
        keyboardType="decimal-pad"
        value={form.value}
        onChangeText={(value) => setForm((f) => ({ ...f, value }))}
        error={msg(errors.value)}
      />
      {config.dual ? (
        <TextField
          testID="input-value2"
          label={`${t('tracker.form.diastolic')} (${t(`tracker.units.${form.unit}`)})`}
          keyboardType="decimal-pad"
          value={form.value2}
          onChangeText={(value2) => setForm((f) => ({ ...f, value2 }))}
          error={msg(errors.value2)}
        />
      ) : null}
      <TextField
        testID="input-date"
        label={t('tracker.form.dateTime')}
        placeholder={t('tracker.form.datePlaceholder')}
        value={form.dateTime}
        onChangeText={(dateTime) => setForm((f) => ({ ...f, dateTime }))}
        error={msg(errors.dateTime)}
      />
      <Button variant="ghost" label={t('tracker.form.now')} icon="Clock" onPress={() => setForm((f) => ({ ...f, dateTime: toLocalInput(new Date()) }))} />
      <TextField
        testID="input-note"
        label={`${t('tracker.form.note')} (${t('common.optional')})`}
        placeholder={t('tracker.form.notePlaceholder')}
        value={form.note}
        maxLength={500}
        onChangeText={(note) => setForm((f) => ({ ...f, note }))}
      />
      {saveError ? <ErrorState /> : null}
      <Button testID="save-measurement" label={t('common.save')} icon="Check" loading={saving} onPress={() => void submit()} />
      <Banner tone="info" text={t('safety.measurementDisclaimer')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  typeBtn: { flexBasis: '47%', flexGrow: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, minHeight: MIN_TOUCH, padding: spacing.sm, borderWidth: 2, borderRadius: radius.md },
  flex: { flex: 1 },
});
