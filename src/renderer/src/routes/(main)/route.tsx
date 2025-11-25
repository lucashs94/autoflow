import { AppSidebar } from '@renderer/components/appSidebar'
import { SidebarInset, SidebarProvider } from '@renderer/components/ui/sidebar'
import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(main)')({
  component: MainLayout,
})

function MainLayout() {
  const cookies = document.cookie

  const defaultOpen =
    cookies
      .split(';')
      .find((cookie) => cookie.trim().startsWith('sidebar_state='))
      ?.trim()
      .split('=')[1] === 'true'

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />

      <SidebarInset>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  )
}
