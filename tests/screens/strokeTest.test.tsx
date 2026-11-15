import { fireEvent, screen } from 'expo-router/testing-library';

import { renderApp } from '../helpers/render';
import { useAppTestEnvironment } from './common';

useAppTestEnvironment();

describe('FAST / BE-FAST screen', () => {
  it('shows BE-FAST (6 signs) by default and FAST (4 signs) on switch', async () => {
    await renderApp('/stroke-test');
    expect(await screen.findByTestId('stroke-test-screen')).toBeTruthy();
    for (const l of ['B', 'E', 'F', 'A', 'S', 'T']) expect(screen.getByTestId(`sign-${l}`)).toBeTruthy();
    await fireEvent.press(screen.getByTestId('protocol-FAST'));
    for (const l of ['F', 'A', 'S', 'T']) expect(screen.getByTestId(`sign-${l}`)).toBeTruthy();
    expect(screen.queryByTestId('sign-B')).toBeNull();
    expect(screen.queryByTestId('sign-E')).toBeNull();
  });

  it('shows the emergency call button at the top, before any assessment', async () => {
    await renderApp('/stroke-test');
    expect(await screen.findAllByText('Call 112 now')).toBeTruthy();
  });

  it.each([
    ['F', 'sudden facial drooping'],
    ['A', 'sudden arm weakness'],
    ['S', 'sudden speech difficulty'],
    ['E', 'sudden vision loss'],
    ['B', 'sudden balance problems'],
  ])('reporting %s (%s) opens emergency instructions IMMEDIATELY', async (letter) => {
    const r = await renderApp('/stroke-test');
    await fireEvent.press(await screen.findByTestId(`observe-${letter}`));
    expect(await screen.findByTestId('emergency-trigger-banner')).toBeTruthy();
    expect(r.getPathname()).toBe('/emergency');
    expect(r.getSearchParams()).toMatchObject({ trigger: 'sign_observed', sign: letter });
    expect(screen.getByTestId('emergency-call-button')).toBeTruthy();
  });

  it('symptoms that disappeared still lead to emergency instructions (TIA)', async () => {
    const r = await renderApp('/stroke-test');
    await fireEvent.press(await screen.findByTestId('signs-disappeared'));
    expect(await screen.findByText(/can be a warning sign \(TIA\)/)).toBeTruthy();
    expect(r.getPathname()).toBe('/emergency');
  });

  it('"not sure" leads to emergency instructions', async () => {
    const r = await renderApp('/stroke-test');
    await fireEvent.press(await screen.findByTestId('not-sure'));
    expect(await screen.findByTestId('emergency-trigger-banner')).toBeTruthy();
    expect(r.getPathname()).toBe('/emergency');
  });

  it('never states that the absence of signs rules out stroke', async () => {
    await renderApp('/stroke-test');
    expect(await screen.findByTestId('no-signs-note')).toHaveTextContent(/does NOT rule out a stroke/);
    expect(screen.queryByText(/you are not having a stroke|no stroke|you are fine/i)).toBeNull();
  });
});
