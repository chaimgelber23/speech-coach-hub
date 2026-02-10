'use client';

import UsageTracker from '@/components/UsageTracker';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      <UsageTracker />
      {children}
    </>
  );
}
