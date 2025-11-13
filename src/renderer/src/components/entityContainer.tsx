import { cn } from '@renderer/lib/utils'
import { PropsWithChildren } from 'react'

interface EntityContainerProps {
  className?: string
}

export const EntityContainer = ({
  children,
  className,
}: PropsWithChildren<EntityContainerProps>) => {
  return (
    <div
      className={cn(
        `h-full p-4 md:px-10 md:py-10 min-h-screen w-full`,
        className
      )}
    >
      <div className="mx-auto max-w-7xl w-full flex flex-col gap-y-8 h-full">
        {/* {header} */}

        <div className="flex flex-col gap-y-4 h-full">
          {/* {search} */}
          {children}
        </div>

        {/* {pagination} */}
      </div>
    </div>
  )
}
