import { fireEvent, screen, waitFor } from 'expo-router/testing-library';
import { Alert } from 'react-native';

import { addMeasurement, listMeasurements } from '@/services/storage/measurementsRepository';
import { renderApp } from '../helpers/render';
import { useAppTestEnvironment } from './common';

useAppTestEnvironment();

describe('Health tracker', () => {
  it('shows the disclaimer and an empty state', async () => {
    await renderApp('/health-tracker');
    expect(await screen.findByTestId('measurement-disclaimer')).toHaveTextContent(/not verified medical measurements/);
    expect(await screen.findByTestId('empty-state')).toBeTruthy();
  });

  it('adds a blood pressure measurement and shows it on the dashboard', async () => {
    await renderApp('/tracker/add');
    await fireEvent.changeText(await screen.findByTestId('input-value'), '128');
    await fireEvent.changeText(screen.getByTestId('input-value2'), '82');
    await fireEvent.press(screen.getByTestId('save-measurement'));
    expect(await screen.findByTestId('trend-blood_pressure')).toBeTruthy();
    const [m] = await listMeasurements();
    expect(m).toMatchObject({ type: 'blood_pressure', value: 128, value2: 82, unit: 'mmHg' });
  });

  it('shows validation errors and does not save invalid data', async () => {
    await renderApp('/tracker/add');
    await fireEvent.press(await screen.findByTestId('type-heart_rate'));
    await fireEvent.changeText(screen.getByTestId('input-value'), '999');
    await fireEvent.press(screen.getByTestId('save-measurement'));
    expect(await screen.findByText('Please enter a value between 20 and 250.')).toBeTruthy();
    expect(await listMeasurements()).toHaveLength(0);
  });

  it('lists history and deletes a record after confirmation', async () => {
    const m = await addMeasurement({ type: 'heart_rate', value: 70, value2: null, unit: 'bpm', subtype: null, note: null, measuredAt: new Date().toISOString() });
    jest.spyOn(Alert, 'alert').mockImplementation((_t, _m, buttons) => buttons?.find((b) => b.style === 'destructive')?.onPress?.());
    await renderApp('/tracker/history');
    expect(await screen.findByTestId(`measurement-${m.id}`)).toBeTruthy();
    await fireEvent.press(screen.getByTestId(`delete-${m.id}`));
    await waitFor(() => expect(screen.queryByTestId(`measurement-${m.id}`)).toBeNull());
    expect(await listMeasurements()).toHaveLength(0);
  });

  it('deletes all records', async () => {
    await addMeasurement({ type: 'weight', value: 70, value2: null, unit: 'kg', subtype: null, note: null, measuredAt: new Date().toISOString() });
    jest.spyOn(Alert, 'alert').mockImplementation((_t, _m, buttons) => buttons?.find((b) => b.style === 'destructive')?.onPress?.());
    await renderApp('/tracker/history');
    await fireEvent.press(await screen.findByTestId('delete-all-measurements'));
    expect(await screen.findByTestId('empty-state')).toBeTruthy();
    expect(await listMeasurements()).toHaveLength(0);
  });

  it('renders a trend chart with an accessible summary', async () => {
    for (const v of [70, 75]) {
      await addMeasurement({ type: 'heart_rate', value: v, value2: null, unit: 'bpm', subtype: null, note: null, measuredAt: new Date(Date.now() - v * 60_000).toISOString() });
    }
    await renderApp('/health-tracker');
    expect(await screen.findByTestId('trend-heart_rate')).toBeTruthy();
    expect(screen.getByLabelText(/Chart of Heart rate: 2 values/)).toBeTruthy();
  });
});
