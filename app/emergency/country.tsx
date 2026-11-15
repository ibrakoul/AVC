import { goBackOr } from '@/utils/navigation';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/common/AppText';
import { Icon } from '@/components/common/Icon';
import { ListItem } from '@/components/common/ListItem';
import { Screen } from '@/components/common/Screen';
import { TextField } from '@/components/common/TextField';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useTheme } from '@/hooks/useTheme';
import { listCountries } from '@/services/emergency/emergencyService';
import { normalizeText } from '@/utils/text';

export default function CountrySelectScreen() {
  const { t } = useTranslation();
  const { c } = useTheme();
  const { settings, update, effectiveCountry } = useAppSettings();
  const [query, setQuery] = useState('');

  const countries = useMemo(() => {
    const q = normalizeText(query.trim());
    return listCountries()
      .map((country) => ({ country, name: t(country.nameKey as 'countries.DE') }))
      .filter(({ name, country }) => !q || normalizeText(name).includes(q) || country.code.toLowerCase() === q)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [query, t]);

  const choose = async (code: string | null) => {
    await update({ countryCode: code, countryConfirmed: true });
    goBackOr('/emergency');
  };

  return (
    <Screen testID="country-screen">
      <TextField label={t('emergency.searchCountry')} value={query} onChangeText={setQuery} autoCorrect={false} testID="country-search" />
      {countries.length === 0 ? <AppText tone="muted">{t('emergency.noCountryMatch')}</AppText> : null}
      {countries.map(({ country, name }) => (
        <ListItem
          key={country.code}
          testID={`country-${country.code}`}
          title={name}
          subtitle={`${country.primary.number} · ${t(country.primary.labelKey as 'emergency.numbers.euGeneral')}`}
          onPress={() => void choose(country.code)}
          right={effectiveCountry === country.code && settings.countryConfirmed ? <Icon name="Check" color={c.primaryStrong} /> : undefined}
        />
      ))}
      <ListItem testID="country-not-listed" icon="CircleHelp" title={t('emergency.countryNotListed')} onPress={() => void choose(null)} />
    </Screen>
  );
}
