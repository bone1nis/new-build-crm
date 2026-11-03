import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router'
import { SessionProvider } from '@/entities/session'
import { queryClient } from './providers/queryClient'
import { router } from './router'

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SessionProvider>
      <RouterProvider router={router} />
    </SessionProvider>
  </QueryClientProvider>
)

export default App
