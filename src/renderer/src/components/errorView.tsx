import { AlertTriangleIcon } from 'lucide-react'

interface StateViewProps {
  message?: string
}

export const ErrorView = ({ message }: StateViewProps) => {
  return (
    <div className="flex flex-col justify-center items-center h-full flex-1 gap-y-4">
      <AlertTriangleIcon className="size-6 text-primary" />

      {!!message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  )
}
