'use client';

import RequireAdminComponent from '../../../components/RequireAdmin';

export function RequireAdminAuth({ children }) {
  return <RequireAdminComponent>{children}</RequireAdminComponent>;
}




