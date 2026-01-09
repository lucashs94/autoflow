import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@renderer/components/ui/collapsible'
import { CheckCircleIcon, XCircleIcon, BanIcon, ClockIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react'
import { useState } from 'react'
import { NodeExecutionLog } from '../../types'
import { formatDurationMs } from '../../utils/formatters'

interface NodeLogItemProps {
  log: NodeExecutionLog
  index: number
}

export function NodeLogItem({ log, index }: NodeLogItemProps) {
  const [isOpen, setIsOpen] = useState(false)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
      case 'error':
        return <XCircleIcon className="w-5 h-5 text-red-500" />
      case 'cancelled':
        return <BanIcon className="w-5 h-5 text-yellow-500" />
      default:
        return <ClockIcon className="w-5 h-5 text-blue-500" />
    }
  }

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <div className="border rounded-md p-4">
        <CollapsibleTrigger className="w-full">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
                {index + 1}
              </div>
              {getStatusIcon(log.status)}
            </div>

            <div className="flex-1 text-left">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{log.node_name}</div>
                  <div className="text-sm text-muted-foreground">{log.node_type}</div>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{formatDurationMs(log.duration)}</span>
                  {isOpen ? (
                    <ChevronUpIcon className="w-4 h-4" />
                  ) : (
                    <ChevronDownIcon className="w-4 h-4" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="mt-4 space-y-4 pl-12">
            {log.error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md">
                <div className="text-sm font-medium text-red-500">Error</div>
                <div className="text-sm mt-1">{log.error}</div>
              </div>
            )}

            {log.context_snapshot && (
              <div>
                <div className="text-sm font-medium mb-2">Context After Execution</div>
                <pre className="bg-muted p-3 rounded-md overflow-x-auto text-xs max-h-96">
                  {JSON.stringify(JSON.parse(log.context_snapshot), null, 2)}
                </pre>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}
