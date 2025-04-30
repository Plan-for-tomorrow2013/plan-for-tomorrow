'use client'

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// Optional: Import DevTools if you want them
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Create a client
// It's often recommended to create the client outside the component
// to ensure it persists across renders, but for simplicity in App Router
// client components, creating it in state is a common pattern.
// Alternatively, you could create it in a separate module and import it.

export function Providers({ children }: { children: React.ReactNode }) {
  // Use state to ensure QueryClient is only created once per component instance
  const [queryClient] = React.useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Optional: React Query DevTools - useful for debugging */}
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
}
