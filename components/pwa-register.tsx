'use client';
import { useEffect } from 'react';

export default function PWARegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    // Only register in production. For localhost testing, temporarily remove this check.
    if (process.env.NODE_ENV !== 'production') return;

    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .catch(() => { /* optional: console.warn('SW registration failed', e); */ });
  }, []);

  return null;
}
