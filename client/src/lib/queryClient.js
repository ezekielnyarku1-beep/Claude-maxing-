import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, error) => (error.status === undefined || error.status === 401) && failureCount < 2,
    },
  },
})
