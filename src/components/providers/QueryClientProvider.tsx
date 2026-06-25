import { type ReactNode, useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';

export function QueryClientProviderWrapper({ children }: { children: ReactNode }) {
  useEffect(() => {
    queryClient.clear();
  }, []);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
