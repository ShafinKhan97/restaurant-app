'use client';

import { AuthProvider } from '@/context/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';

export default function Providers({ children }: { children: React.ReactNode }) {
  // Use state to preserve query client across re-renders in App Router
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, 
            retry: 1, 
          },
        },
      })
  );

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#22263a',
              color: '#f1f3f9',
              border: '1px solid #2e3347',
              borderRadius: '0.625rem',
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.875rem',
            },
            success: {
              iconTheme: {
                primary: '#22c55e',
                secondary: '#052e16',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#2d0a0a',
              },
            },
          }}
        />
      </QueryClientProvider>
    </AuthProvider>
  );
}
