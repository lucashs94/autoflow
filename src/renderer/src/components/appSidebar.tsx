import { cn } from '@renderer/lib/utils'
import { Link, useRouterState } from '@tanstack/react-router'
import { FolderOpenIcon, HistoryIcon } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from './ui/sidebar'

const menuItems = [
  {
    title: 'Main',
    items: [
      {
        title: 'Workflows',
        icon: FolderOpenIcon,
        url: '/workflows',
      },
      {
        title: 'Executions',
        icon: HistoryIcon,
        url: '/',
      },
    ],
  },
]

export function AppSidebar() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(path)
  }

  return (
    <Sidebar
      collapsible="icon"
      className="bg-muted"
    >
      <SidebarHeader>
        <SidebarMenuItem>
          {/* <SidebarMenuButton
            asChild
            className="gap-x-4 h-12 px-4"
          > */}
          <Link
            to={'/workflows'}
            // className="text-green-300 border border-green-400/70 bg-green-900/60 hover:bg-green-900/40! backdrop-blur-sm"
            className="flex items-center gap-x-3 h-12 px-4 group-data-[collapsible=icon]:h-8  group-data-[collapsible=icon]:px-0 text-green-300 group-data-[collapsible=icon]:justify-center"
          >
            <img
              src={'/logo.png'}
              alt="node"
              width={60}
              height={60}
              className="size-12 shrink-0 object-contain drop-shadow-[0_0_4px_#00ff7f] animate-pulse"
            />

            <span
              // className="font-semibold text-sm text-white!"
              className="font-semibold text-sm text-white! group-data-[collapsible=icon]:hidden"
            >
              Web Automations
            </span>
          </Link>
          {/* </SidebarMenuButton> */}
        </SidebarMenuItem>
      </SidebarHeader>

      <SidebarContent>
        {menuItems.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={isActive(item.url)}
                      asChild
                      className={cn(
                        'gap-x-4 h-10 px-4',
                        isActive(item.url) &&
                          'bg-sidebar-primary! text-white! hover:text-white!'
                      )}
                    >
                      <Link to={item.url}>
                        <item.icon className="size-4" />
                        <span className="text-sm">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}
