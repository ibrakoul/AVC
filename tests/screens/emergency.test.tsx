import { Linking } from 'react-native';
import { fireEvent, screen, waitFor } from 'expo-router/testing-library';
import AsyncStorage from '@react-native-async-storage/async-storage';

import i18n from '@/locales';
import { setDatabaseForTesting } from '@/services/storage/database';
import { createTestDb } from '../helpers/sqlJsDb';
import { seedSettings } from '../helpers/settings';
import { renderApp } from '../helpers/render';

const g = globalThis as { __TEST_OFFLINE__?: boolean; __TEST_REGION__?: string };

beforeEach(async () => {
  await AsyncStorage.clear();
  setDatabaseForTesting(await createTestDb());
  g.__TEST_OFFLINE__ = false;
  g.__TEST_REGION__ = 'DE';
  await i18n.changeLanguage('en');
  jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
});
afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
});

describe('Emergency screen', () => {
  it('renders the warning and a call button for the device-region country (DE → 112)', async () => {
    await renderApp('/emergency');
    expect(await screen.findByTestId('emergency-screen')).toBeTruthy();
    expect(screen.getByText(/Possible stroke symptoms are a medical emergency/)).toBeTruthy();
    expect(screen.getByText('Call 112 now')).toBeTruthy();
    expect(screen.getByText(/Suggested from your phone's region settings/)).toBeTruthy();
  });

  it('opens the native dialer with tel: and never claims the call was placed', async () => {
    await renderApp('/emergency');
    await fireEvent.press(await screen.findByTestId('emergency-call-button'));
    await waitFor(() => expect(Linking.openURL).toHaveBeenCalledWith('tel:112'));
    const feedback = await screen.findByTestId('dial-feedback');
    expect(feedback).toHaveTextContent(/Your phone app should now be open/);
    expect(screen.queryByText(/call (has been|was) placed|calling now|connected/i)).toBeNull();
  });

  it('shows manual-dial guidance if the OS cannot open the dialer', async () => {
    jest.spyOn(Linking, 'openURL').mockRejectedValue(new Error('no telephony'));
    await renderApp('/emergency');
    await fireEvent.press(await screen.findByTestId('emergency-call-button'));
    expect(await screen.findByText(/Dial 112 manually/)).toBeTruthy();
  });

  it('uses the user-selected country (FR → 15, with 112 and 114 alternatives)', async () => {
    await seedSettings({ countryCode: 'FR', countryConfirmed: true });
    await renderApp('/emergency');
    expect(await screen.findByText('Call 15 now')).toBeTruthy();
    expect(screen.getByTestId('alt-number-112')).toBeTruthy();
    expect(screen.getByTestId('alt-number-114')).toBeTruthy();
  });

  it('does not assume 112 when the country is unknown; offers labelled options', async () => {
    g.__TEST_REGION__ = 'ZZ';
    await renderApp('/emergency');
    expect(await screen.findByTestId('unknown-country')).toBeTruthy();
    expect(screen.queryByTestId('emergency-call-button')).toBeNull();
    expect(screen.getByText(/European Union and many other countries/)).toBeTruthy();
    expect(screen.getByText(/USA, Canada/)).toBeTruthy();
  });

  it('allows manual country selection', async () => {
    await renderApp('/emergency');
    await fireEvent.press(await screen.findByTestId('emergency-country-row'));
    await fireEvent.press(await screen.findByTestId('country-GB'));
    expect(await screen.findByText('Call 999 now')).toBeTruthy();
  });

  it('works OFFLINE without an account: instructions, times and version info are shown', async () => {
    g.__TEST_OFFLINE__ = true;
    await renderApp('/emergency');
    expect(await screen.findByTestId('offline-banner')).toBeTruthy();
    expect(screen.getByText(/What to do now/)).toBeTruthy();
    expect(screen.getAllByText(/Do not give aspirin, blood thinners/).length).toBeGreaterThan(0);
    expect(screen.getByTestId('emergency-call-button')).toBeTruthy();
    expect(screen.getByTestId('verification-status')).toHaveTextContent(/not yet been verified/);
  });

  it('is reachable before onboarding is completed (no gate)', async () => {
    await seedSettings({ onboardingDone: false });
    await renderApp('/emergency');
    expect(await screen.findByTestId('emergency-call-button')).toBeTruthy();
  });

  it('records symptom onset and last-known-well times', async () => {
    await renderApp('/emergency');
    expect(await screen.findByTestId('onset-time-value')).toHaveTextContent('Not recorded');
    await fireEvent.press(screen.getByTestId('onset-time-now'));
    await waitFor(() => expect(screen.getByTestId('onset-time-value')).toHaveTextContent(/0 min ago/));
    await fireEvent.press(screen.getByTestId('lkw-time-now'));
    await waitFor(() => expect(screen.getByTestId('lkw-time-value')).toHaveTextContent(/min ago/));
  });

  it('shows the trigger banner, and the TIA message when symptoms disappeared', async () => {
    await renderApp('/emergency?trigger=signs_disappeared');
    expect(await screen.findByTestId('emergency-trigger-banner')).toBeTruthy();
    expect(screen.getByText(/can be a warning sign \(TIA\)/)).toBeTruthy();
  });

  it('is fully translated (German)', async () => {
    await seedSettings({ language: 'de' });
    await renderApp('/emergency');
    expect(await screen.findByText('Jetzt 112 anrufen')).toBeTruthy();
    expect(screen.getByText(/Mögliche Schlaganfall-Symptome sind ein medizinischer Notfall/)).toBeTruthy();
  });
});
