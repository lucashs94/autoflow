import { cn } from '@renderer/lib/utils'
import { EmptyView } from './emptyView'

interface EntityListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  getKey?: (item: T, index: number) => string | number
  emptyView?: React.ReactNode
  className?: string
}

export function EntityList<T>({
  items,
  renderItem,
  getKey,
  emptyView,
  className,
}: EntityListProps<T>) {
  if (items.length === 0) {
    return (
      <div className="flex-1 flex justify-center items-center">
        <div className="w-full max-w-md mx-auto border">
          {emptyView || <EmptyView />}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col gap-y-4', className)}>
      {items.map((item, index) => (
        <div key={getKey ? getKey(item, index) : index}>
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  )
}
