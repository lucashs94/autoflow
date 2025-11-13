import { cn } from '@renderer/lib/utils'
import { Link } from '@tanstack/react-router'
import { MoreVerticalIcon, TrashIcon } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardTitle } from './ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

interface EntityItemProps {
  href: string
  title: string
  subtitle?: React.ReactNode
  image?: React.ReactNode
  actions?: React.ReactNode
  onRemove?: () => void | Promise<void>
  isRemoving?: boolean
  className?: string
}

export const EntityItem = ({
  href,
  title,
  subtitle,
  image,
  actions,
  onRemove,
  isRemoving,
  className,
}: EntityItemProps) => {
  const handleRemove = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isRemoving) return

    if (onRemove) await onRemove()
  }

  return (
    <Link to={href}>
      <Card
        className={cn(
          'p-4 shadow-none! hover:shadow! cursor-pointer hover:scale-[1.01]',
          isRemoving && 'opacity-50 cursor-not-allowed',
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

          {(actions || onRemove) && (
            <div className="flex gap-x-4 items-center">
              {actions}
              {onRemove && (
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
                    <DropdownMenuItem onClick={handleRemove}>
                      <TrashIcon className="size-4" />
                      Delete
                    </DropdownMenuItem>
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
