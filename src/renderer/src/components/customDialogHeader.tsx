import { cn } from '@renderer/lib/utils'
import { LucideIcon } from 'lucide-react'
import { DialogHeader, DialogTitle } from './ui/dialog'

type Props = {
  Icon?: LucideIcon
  title?: string
  subtitle?: string

  iconClassName?: string
  titleClassName?: string
  subtitleClassName?: string
}

export function CustomDialogHeader({
  title,
  titleClassName,
  subtitle,
  subtitleClassName,
  Icon,
  iconClassName,
}: Props) {
  return (
    <DialogHeader className="py-6">
      <DialogTitle asChild>
        <div className="flex flex-col items-center gap-2 mb-2">
          {Icon && (
            <Icon
              size={30}
              className={cn('stroke-primary', iconClassName)}
            />
          )}
          {title && (
            <p className={cn('text-xl text-primary', titleClassName)}>
              {title}
            </p>
          )}
          {subtitle && (
            <p
              className={cn('text-sm text-muted-foreground', subtitleClassName)}
            >
              {subtitle}
            </p>
          )}
        </div>
      </DialogTitle>
    </DialogHeader>
  )
}
