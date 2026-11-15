import { useCallback, useEffect, useState } from 'react';

import { loadEmergencyTimes, saveEmergencyTimes, type EmergencyTimes } from '@/services/storage/settingsStore';

export function useEmergencyTimes() {
  const [times, setTimes] = useState<EmergencyTimes>({ onsetAt: null, lastKnownWellAt: null });

  useEffect(() => {
    let mounted = true;
    void loadEmergencyTimes().then((t) => mounted && setTimes(t));
    return () => {
      mounted = false;
    };
  }, []);

  const set = useCallback((patch: Partial<EmergencyTimes>) => {
    setTimes((prev) => {
      const next = { ...prev, ...patch };
      void saveEmergencyTimes(next);
      return next;
    });
  }, []);

  return { times, set };
}
