import type { TFunction } from 'i18next';

import type { AuthResult } from './authService';

export function authErrorMessage(result: AuthResult, t: TFunction): string | null {
  if (result.ok) return null;
  switch (result.error) {
    case 'not_configured':
      return t('auth.notConfigured');
    case 'invalid_email':
      return t('auth.invalidEmail');
    case 'invalid_password':
      return t('auth.invalidPassword');
    case 'consent_required':
      return t('auth.consentRequired');
    default:
      return result.message ?? t('common.errorGeneric');
  }
}
