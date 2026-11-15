import { listMeasurements } from '@/services/storage/measurementsRepository';
import { useAsyncData } from './useAsyncData';

export function useMeasurements() {
  return useAsyncData(() => listMeasurements());
}
