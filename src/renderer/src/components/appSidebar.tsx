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
          <SidebarMenuButton
            asChild
            className="gap-x-4 h-10 px-4"
          >
            <Link to={'/workflows'}>
              {/* <Image
                src={'/logos/logo.svg'}
                alt="Nodebase"
                width={30}
                height={30}
              /> */}

              <span className="font-semibold text-sm text-white!">
                Automations
              </span>
            </Link>
          </SidebarMenuButton>
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
