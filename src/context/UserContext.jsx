'use client';

import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { getProfile, hasAuthToken } from '../services/api';

const UserContext = createContext({
  user: null,
  loading: false,
  error: '',
  refreshUser: async () => {},
});

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refreshPromiseRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);


  const refreshUser = () => {

    // Prevent duplicate inflight profile calls.
    if (refreshPromiseRef.current) return refreshPromiseRef.current;

    // Do not call profile until token exists.
    if (!hasAuthToken()) {
      setUser(null);
      setError('');
      setLoading(false);
      refreshPromiseRef.current = null;
      // No token: do not perform request.
      return null;
    }





    setLoading(true);
    setError('');

    refreshPromiseRef.current = (async () => {
      try {
        const res = await getProfile();
        const nextUser = res?.data?.user ?? res?.user ?? res?.data;
        if (isMountedRef.current) {
          setUser(nextUser || null);
          return nextUser;
        }
        return null;
      } catch (e) {
        if (isMountedRef.current) {
          setUser(null);
          setError(e?.message || 'Failed to load profile');
        }
        return null;
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
          refreshPromiseRef.current = null;
        }
      }

    })();

    return refreshPromiseRef.current;
  };

  useEffect(() => {
    // On refresh, only attempt profile fetch when token exists.
    // Skip refresh if no token is present.
    if (!hasAuthToken()) return;





    // Schedule async refresh to avoid React cascading-render warnings.
    const t = setTimeout(() => {
      refreshUser();
    }, 0);

    return () => clearTimeout(t);

  }, []);


  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      refreshUser,
    }),
    [user, loading, error]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}


