import { cn } from '@renderer/lib/utils'
import { Link } from '@tanstack/react-router'
import { LucideIcon, MoreVerticalIcon } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardTitle } from './ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

export interface MenuItemConfig {
  label: string
  icon?: LucideIcon
  onClick: () => void | Promise<void>
  disabled?: boolean
  variant?: 'default' | 'destructive'
  separator?: boolean
}

interface EntityItemProps {
  href: string
  title: string
  subtitle?: React.ReactNode
  image?: React.ReactNode
  actions?: React.ReactNode
  menuItems?: MenuItemConfig[]
  disabled?: boolean
  className?: string
}

export const EntityItem = ({
  href,
  title,
  subtitle,
  image,
  actions,
  menuItems,
  disabled,
  className,
}: EntityItemProps) => {
  return (
    <Link to={href}>
      <Card
        className={cn(
          'p-4 shadow-none! hover:shadow! cursor-pointer hover:scale-[1.01]',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
      >
        <CardContent className="flex flex-row items-center justify-between p-0">
          <div className="flex items-center gap-3">
            {image}
            <div>
              <CardTitle className="text-base font-medium">{title}</CardTitle>
              {!!subtitle && (
                <CardDescription className="text-xs">
                  {subtitle}
                </CardDescription>
              )}
            </div>
          </div>

          {(actions || (menuItems && menuItems.length > 0)) && (
            <div className="flex gap-x-4 items-center">
              {actions}
              {menuItems && menuItems.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size={'icon'}
                      variant={'ghost'}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVerticalIcon className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align="end"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {menuItems.map((item, index) => (
                      <div key={index}>
                        {item.separator && index > 0 && <DropdownMenuSeparator />}
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            item.onClick()
                          }}
                          disabled={item.disabled}
                          className={cn(
                            item.variant === 'destructive' &&
                              'text-destructive hover:text-destructive!'
                          )}
                        >
                          {item.icon && (
                            <item.icon
                              className={cn(
                                'size-4',
                                item.variant === 'destructive' && 'text-destructive'
                              )}
                            />
                          )}
                          {item.label}
                        </DropdownMenuItem>
                      </div>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
