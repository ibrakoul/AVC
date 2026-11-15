import { loadPrevention } from '@/services/storage/preventionRepository';
import { useAsyncData } from './useAsyncData';

export function usePrevention() {
  return useAsyncData(() => loadPrevention());
}
