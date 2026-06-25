import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProviderWrapper } from '@/components/providers/QueryClientProvider';
import { AuthInitializer } from '@/components/providers/AuthInitializer';
import Router from '@/routes/router';
import { Toaster } from 'sonner';
import '@/styles/globals.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProviderWrapper>
      <AuthInitializer>
        <Router />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'hsl(var(--card))',
              color: 'hsl(var(--card-foreground))',
              border: '1px solid hsl(var(--border))',
            },
          }}
        />
      </AuthInitializer>
    </QueryClientProviderWrapper>
  </StrictMode>
);
