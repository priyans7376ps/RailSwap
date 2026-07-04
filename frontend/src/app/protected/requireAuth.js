'use client';

import RequireAuthComponent from '../../components/RequireAuth';

export function RequireAuth({ children }) {
  return <RequireAuthComponent>{children}</RequireAuthComponent>;
}


