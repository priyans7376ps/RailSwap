'use client';

import { useState } from 'react';

export function useVerificationDemo() {
  const [status, setStatus] = useState('idle');

  function verify(pnr) {
    if (!pnr || pnr.length < 8) {
      setStatus('failed');
      return;
    }

    setStatus('loading');
    window.setTimeout(() => {
      setStatus(pnr.endsWith('0') ? 'failed' : 'success');
    }, 900);
  }

  return { status, verify, setStatus };
}
