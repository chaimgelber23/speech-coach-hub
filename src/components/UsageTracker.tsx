'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { logUsage } from '@/lib/hooks';

/**
 * Silent usage tracking component.
 * Logs page views on route changes, debounced to max 1 per page per 30s.
 * No UI — completely invisible.
 */
export default function UsageTracker() {
  const pathname = usePathname();
  const lastLog = useRef<{ page: string; time: number }>({ page: '', time: 0 });

  useEffect(() => {
    const now = Date.now();
    // Debounce: skip if same page within 30 seconds
    if (
      lastLog.current.page === pathname &&
      now - lastLog.current.time < 30_000
    ) {
      return;
    }
    lastLog.current = { page: pathname, time: now };
    // Fire and forget — don't block rendering
    logUsage(pathname, 'page_view').catch(() => {});
  }, [pathname]);

  return null;
}
