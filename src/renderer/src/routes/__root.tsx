import { createRootRoute, Outlet } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: RootLayout,
})

export function RootLayout() {
  return <Outlet />
}
