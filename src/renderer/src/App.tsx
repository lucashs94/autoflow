import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { Toaster } from 'sonner'
import { ThemeProvider } from './components/themeProvider'
import { routeTree } from './routeTree.gen'

const queryClient = new QueryClient()

// Create a new router instance
const router = createRouter({ routeTree })

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export function App(): React.JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <RouterProvider router={router} />
        <Toaster richColors />
      </ThemeProvider>
    </QueryClientProvider>
  )
}
