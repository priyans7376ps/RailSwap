'use client';

import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { getProfile, hasAuthToken } from '../services/api';

const AuthContext = createContext({
  user: null,
  authLoading: true,
  authError: '',
  refreshUser: async () => {},
  signOut: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  const refreshPromiseRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const refreshUser = async () => {
    // Prevent duplicate inflight profile calls.
    if (refreshPromiseRef.current) return refreshPromiseRef.current;

    // Token check is allowed here (effect), not during render.
    if (!hasAuthToken()) {
      if (isMountedRef.current) {
        setUser(null);
        setAuthError('');
        setAuthLoading(false);
      }
      refreshPromiseRef.current = null;
      return null;
    }

    setAuthLoading(true);
    setAuthError('');

    refreshPromiseRef.current = (async () => {
      try {
        const res = await getProfile();
        const nextUser = res?.data?.user ?? res?.user ?? res?.data ?? null;
        if (isMountedRef.current) setUser(nextUser);
        return nextUser;
      } catch (e) {
        if (isMountedRef.current) {
          setUser(null);
          setAuthError(e?.message || 'Failed to load profile');
        }
        return null;
      } finally {
        if (isMountedRef.current) {
          setAuthLoading(false);
          refreshPromiseRef.current = null;
        }
      }
    })();

    return refreshPromiseRef.current;
  };

  const signOut = () => {
    // logoutUser does the redirect; we avoid calling it during render.
    // Imported lazily to avoid circular deps.
    import('../services/api').then(({ logoutUser }) => {
      logoutUser();
    });
  };

  useEffect(() => {
    // On application startup, check auth + fetch current user.
    // Defer to next tick to avoid synchronous cascades.
    const t = setTimeout(() => {
      refreshUser();
    }, 0);

    return () => clearTimeout(t);
     
  }, []);


  const value = useMemo(
    () => ({ user, authLoading, authError, refreshUser, signOut }),
    [user, authLoading, authError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  return useContext(AuthContext);
}

