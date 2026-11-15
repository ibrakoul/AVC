import { fireEvent, screen, waitFor } from 'expo-router/testing-library';

import i18n from '@/locales';
import { askAssistant } from '@/services/ai/assistantClient';
import { listContacts } from '@/services/storage/contactsRepository';
import { seedSettings } from '../helpers/settings';
import { renderApp } from '../helpers/render';
import { setOffline, useAppTestEnvironment } from './common';

useAppTestEnvironment();

describe('first launch', () => {
  it('redirects to onboarding, which always shows the emergency button', async () => {
    await seedSettings({ onboardingDone: false });
    const r = await renderApp('/');
    expect(await screen.findByTestId('onboarding-screen')).toBeTruthy();
    expect(r.getPathname()).toBe('/onboarding');
    await fireEvent.press(screen.getByTestId('onboarding-emergency'));
    expect(await screen.findByTestId('emergency-call-button')).toBeTruthy();
  });

  it('completes onboarding with language selection and disclaimer', async () => {
    await seedSettings({ onboardingDone: false });
    await renderApp('/onboarding');
    await fireEvent.press(await screen.findByTestId('language-fr'));
    expect(await screen.findByText('Choisissez votre langue')).toBeTruthy();
    for (let i = 0; i < 4; i += 1) await fireEvent.press(screen.getByTestId('onboarding-next'));
    await fireEvent.press(await screen.findByTestId('onboarding-accept'));
    expect(await screen.findByTestId('home-screen')).toBeTruthy();
    expect(screen.getByText('VOUS PENSEZ À UN AVC ?')).toBeTruthy();
  });
});

describe('home and navigation', () => {
  it('shows the THINK STROKE? emergency card with a call button', async () => {
    await renderApp('/');
    expect(await screen.findByTestId('think-stroke-card')).toBeTruthy();
    expect(screen.getByText('THINK STROKE?')).toBeTruthy();
    expect(screen.getByText('Call 112')).toBeTruthy();
  });

  it('header emergency button is reachable from tabs', async () => {
    const r = await renderApp('/prevention');
    await fireEvent.press((await screen.findAllByTestId('header-emergency-button'))[0]!);
    await waitFor(() => expect(r.getPathname()).toBe('/emergency'));
  });

  it('switches language from the language screen (EN → DE)', async () => {
    await renderApp('/language');
    await fireEvent.press(await screen.findByTestId('language-de'));
    await waitFor(() => expect(i18n.language).toBe('de'));
    await renderApp('/');
    expect(await screen.findByText('VERDACHT AUF SCHLAGANFALL?')).toBeTruthy();
  });
});

describe('user without an account / offline', () => {
  it('profile explains accounts are optional and not configured', async () => {
    await renderApp('/profile');
    expect(await screen.findByTestId('auth-not-configured')).toBeTruthy();
    expect(screen.getByText('You are using the app without an account.')).toBeTruthy();
  });

  it('assistant works offline in FAQ mode and handles emergencies', async () => {
    setOffline(true);
    await renderApp('/assistant');
    expect(await screen.findByTestId('assistant-mode')).toHaveTextContent(/Offline FAQ mode/);
    await fireEvent.changeText(screen.getByTestId('assistant-input'), 'My father suddenly cannot speak');
    await fireEvent.press(screen.getByTestId('assistant-send'));
    expect(await screen.findByTestId('assistant-emergency')).toBeTruthy();
    expect(screen.getByTestId('assistant-call-button')).toBeTruthy();
    await expect(askAssistant('What is a TIA?', 'en', { onlineConsent: false })).resolves.toMatchObject({ mode: 'faq' });
  });

  it('assistant answers a suggested question with sources', async () => {
    await renderApp('/assistant');
    await fireEvent.press(await screen.findByTestId('suggestion-tia'));
    expect(await screen.findByText(/A transient ischemic attack causes stroke-like symptoms/)).toBeTruthy();
    expect(screen.getByText('NHS — Stroke')).toBeTruthy();
  });
});

describe('family module', () => {
  it('adds an emergency contact that then appears on the emergency screen', async () => {
    await renderApp('/family/edit');
    await fireEvent.changeText(await screen.findByTestId('contact-name'), 'Anna');
    await fireEvent.changeText(screen.getByTestId('contact-phone'), '+49 151 2345678');
    await fireEvent.press(screen.getByTestId('save-contact'));
    expect(await screen.findByTestId('family-screen')).toBeTruthy();
    expect(await listContacts()).toHaveLength(1);
    await renderApp('/emergency');
    expect(await screen.findByText('Call Anna')).toBeTruthy();
  });

  it('validates contact input', async () => {
    await renderApp('/family/edit');
    await fireEvent.press(await screen.findByTestId('save-contact'));
    expect(await screen.findByText('Please enter a name.')).toBeTruthy();
    expect(await listContacts()).toHaveLength(0);
  });
});

describe('prevention', () => {
  it('completes the questionnaire and shows discussion topics without a score', async () => {
    await renderApp('/prevention/questionnaire');
    expect(await screen.findByTestId('questionnaire-question')).toHaveTextContent(/high blood pressure/);
    await fireEvent.press(screen.getByTestId('answer-yes'));
    for (let i = 0; i < 9; i += 1) {
      await fireEvent.press(screen.getByTestId('questionnaire-next'));
      await fireEvent.press(screen.getByTestId('answer-no'));
    }
    await fireEvent.press(screen.getByTestId('questionnaire-finish'));
    await renderApp('/prevention');
    expect(await screen.findByTestId('discuss-topics')).toHaveTextContent(/High blood pressure/);
    expect(screen.queryByText(/score:/i)).toBeNull();
  });
});
