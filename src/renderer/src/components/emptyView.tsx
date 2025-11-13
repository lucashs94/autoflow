import { PackageOpenIcon } from 'lucide-react'
import { Button } from './ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from './ui/empty'

interface EmptyViewProps {
  onNew?: () => void
  message?: string
}

export const EmptyView = ({ message, onNew }: EmptyViewProps) => {
  return (
    <Empty className="border border-dashed bg-white">
      <EmptyHeader>
        <EmptyMedia variant={'icon'}>
          <PackageOpenIcon className="" />
        </EmptyMedia>
      </EmptyHeader>

      <EmptyTitle>No items</EmptyTitle>
      {!!message && <EmptyDescription>{message}</EmptyDescription>}
      {!!onNew && (
        <EmptyContent>
          <Button onClick={onNew}>Add item</Button>
        </EmptyContent>
      )}
    </Empty>
  )
}
