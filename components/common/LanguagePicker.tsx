import { useTranslation } from 'react-i18next';

import { useAppSettings } from '@/hooks/useAppSettings';
import { useTheme } from '@/hooks/useTheme';
import { SUPPORTED_LANGUAGES } from '@/types/i18n';
import { Icon } from './Icon';
import { ListItem } from './ListItem';

export function LanguagePicker({ onSelected }: { onSelected?: () => void }) {
  const { t, i18n } = useTranslation();
  const { c } = useTheme();
  const { update } = useAppSettings();
  return (
    <>
      {SUPPORTED_LANGUAGES.map((lng) => (
        <ListItem
          key={lng}
          testID={`language-${lng}`}
          icon="Languages"
          title={t(`language.${lng}`)}
          right={i18n.language === lng ? <Icon name="Check" color={c.primaryStrong} /> : <></>}
          onPress={async () => {
            await i18n.changeLanguage(lng);
            await update({ language: lng });
            onSelected?.();
          }}
        />
      ))}
    </>
  );
}
