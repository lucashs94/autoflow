import { EntityItem } from '@renderer/components/entityItem'
import { formatDistanceToNow } from 'date-fns'
import { HistoryIcon } from 'lucide-react'
import { ExecutionHistory } from '../../types'
import { formatDuration } from '../../utils/formatters'
import { StatusBadge } from './statusBadge'

interface ExecutionItemProps {
  data: ExecutionHistory
}

export function ExecutionItem({ data }: ExecutionItemProps) {
  return (
    <EntityItem
      href={`/history/${data.id}`}
      title={data.workflow_name}
      subtitle={
        <div className="flex items-center gap-4 text-sm">
          <StatusBadge status={data.status} />
          <span className="text-muted-foreground">
            {formatDistanceToNow(new Date(data.started_at), { addSuffix: true })}
          </span>
          <span className="text-muted-foreground">{formatDuration(data.duration)}</span>
        </div>
      }
      image={<HistoryIcon className="size-8 text-muted-foreground" />}
    />
  )
}
