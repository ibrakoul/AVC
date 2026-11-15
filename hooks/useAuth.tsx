import type { Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { getSupabase } from '@/services/supabase/client';

interface AuthContextValue {
  configured: boolean;
  session: Session | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({ configured: false, session: null, loading: false });

export function AuthProvider({ children }: { children: ReactNode }) {
  const sb = getSupabase();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(sb !== null);

  useEffect(() => {
    if (!sb) return;
    let mounted = true;
    sb.auth
      .getSession()
      .then(({ data }) => mounted && setSession(data.session))
      .catch(() => undefined)
      .finally(() => mounted && setLoading(false));
    const { data } = sb.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, [sb]);

  const value = useMemo(() => ({ configured: sb !== null, session, loading }), [sb, session, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
