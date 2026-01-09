import { Badge } from '@renderer/components/ui/badge'
import { CheckCircleIcon, XCircleIcon, BanIcon, ClockIcon } from 'lucide-react'

interface StatusBadgeProps {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  switch (status) {
    case 'success':
      return (
        <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">
          <CheckCircleIcon className="w-3 h-3 mr-1" />
          Success
        </Badge>
      )
    case 'error':
    case 'failed':
      return (
        <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20">
          <XCircleIcon className="w-3 h-3 mr-1" />
          Failed
        </Badge>
      )
    case 'cancelled':
      return (
        <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20">
          <BanIcon className="w-3 h-3 mr-1" />
          Cancelled
        </Badge>
      )
    case 'loading':
    case 'running':
      return (
        <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20">
          <ClockIcon className="w-3 h-3 mr-1" />
          Running
        </Badge>
      )
    default:
      return <Badge>{status}</Badge>
  }
}
