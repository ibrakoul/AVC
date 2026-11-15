import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

export interface AsyncData<T> {
  data: T | undefined;
  loading: boolean;
  error: unknown;
  reload: () => Promise<void>;
}

/** Loads data when the screen gains focus; exposes loading / error states. */
export function useAsyncData<T>(loader: () => Promise<T>): AsyncData<T> {
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await loaderRef.current());
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  return { data, loading, error, reload };
}
