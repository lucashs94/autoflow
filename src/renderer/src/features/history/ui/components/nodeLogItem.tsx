import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@renderer/components/ui/collapsible'
import { Badge } from '@renderer/components/ui/badge'
import { IPCErrorCode } from '@shared/@types/ipc-response'
import {
  CheckCircleIcon,
  XCircleIcon,
  BanIcon,
  ClockIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  AlertTriangleIcon,
  SearchXIcon,
  TimerOffIcon,
  GlobeIcon,
  ServerCrashIcon,
  FileWarningIcon,
} from 'lucide-react'
import { useState } from 'react'
import { NodeExecutionLog } from '../../types'
import { formatDurationMs } from '../../utils/formatters'

interface NodeLogItemProps {
  log: NodeExecutionLog
  index: number
}

interface ErrorTypeInfo {
  label: string
  color: string
  bgColor: string
  borderColor: string
  icon: React.ReactNode
}

function getErrorTypeInfo(errorCode: string | null): ErrorTypeInfo {
  switch (errorCode) {
    case IPCErrorCode.ELEMENT_NOT_FOUND:
      return {
        label: 'Element Not Found',
        color: 'text-orange-500',
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/20',
        icon: <SearchXIcon className="w-4 h-4" />,
      }
    case IPCErrorCode.TIMEOUT_ERROR:
      return {
        label: 'Timeout',
        color: 'text-amber-500',
        bgColor: 'bg-amber-500/10',
        borderColor: 'border-amber-500/20',
        icon: <TimerOffIcon className="w-4 h-4" />,
      }
    case IPCErrorCode.NAVIGATION_ERROR:
      return {
        label: 'Navigation Error',
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/20',
        icon: <GlobeIcon className="w-4 h-4" />,
      }
    case IPCErrorCode.BROWSER_NOT_STARTED:
      return {
        label: 'Browser Not Started',
        color: 'text-purple-500',
        bgColor: 'bg-purple-500/10',
        borderColor: 'border-purple-500/20',
        icon: <ServerCrashIcon className="w-4 h-4" />,
      }
    case IPCErrorCode.VALIDATION_ERROR:
      return {
        label: 'Validation Error',
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/20',
        icon: <FileWarningIcon className="w-4 h-4" />,
      }
    case IPCErrorCode.INVALID_WORKFLOW:
    case IPCErrorCode.WORKFLOW_NOT_FOUND:
    case IPCErrorCode.NODE_NOT_FOUND:
      return {
        label: 'Workflow Error',
        color: 'text-pink-500',
        bgColor: 'bg-pink-500/10',
        borderColor: 'border-pink-500/20',
        icon: <AlertTriangleIcon className="w-4 h-4" />,
      }
    default:
      return {
        label: 'Error',
        color: 'text-red-500',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/20',
        icon: <XCircleIcon className="w-4 h-4" />,
      }
  }
}

export function NodeLogItem({ log, index }: NodeLogItemProps) {
  const [isOpen, setIsOpen] = useState(false)

  const getStatusIcon = (status: string, errorCode: string | null) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
      case 'error': {
        const errorInfo = getErrorTypeInfo(errorCode)
        return <span className={errorInfo.color}>{errorInfo.icon}</span>
      }
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
              {getStatusIcon(log.status, log.error_code)}
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
            {log.error && (() => {
              const errorInfo = getErrorTypeInfo(log.error_code)
              return (
                <div className={`p-3 ${errorInfo.bgColor} border ${errorInfo.borderColor} rounded-md`}>
                  <div className={`text-sm font-medium ${errorInfo.color} flex items-center gap-2`}>
                    {errorInfo.icon}
                    <span>{errorInfo.label}</span>
                    {log.error_code && (
                      <Badge variant="outline" className={`ml-2 text-xs ${errorInfo.color} border-current`}>
                        {log.error_code}
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm mt-2">{log.error}</div>
                </div>
              )
            })()}

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
