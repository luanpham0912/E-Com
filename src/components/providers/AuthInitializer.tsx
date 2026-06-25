import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useCartSync } from '@/hooks/useCartSync';

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((s) => s.initialize);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    initialize();
  }, [initialize]);

  useCartSync();

  return <>{children}</>;
}