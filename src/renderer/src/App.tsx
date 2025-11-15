import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { Provider as JotaiProvider } from 'jotai'
import { BadgeAlertIcon, BadgeCheckIcon, BadgeXIcon } from 'lucide-react'
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
        <JotaiProvider>
          <RouterProvider router={router} />
          <Toaster
            closeButton
            swipeDirections={['bottom', 'right']}
            icons={{
              success: <BadgeCheckIcon className="text-emerald-500" />,
              error: <BadgeXIcon className="text-red-500" />,
              warning: <BadgeAlertIcon className="text-yellow-600" />,
            }}
          />
        </JotaiProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
