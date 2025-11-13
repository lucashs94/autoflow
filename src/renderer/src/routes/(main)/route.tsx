import { AppSidebar } from '@renderer/components/appSidebar'
import { SidebarInset, SidebarProvider } from '@renderer/components/ui/sidebar'
import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(main)')({
  component: MainLayout,
})

function MainLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  )
}
