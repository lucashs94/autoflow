import { Loader2Icon } from 'lucide-react'
interface StateViewProps {
  message?: string
}

export const LoadingView = ({ message }: StateViewProps) => {
  return (
    <div className="flex flex-col justify-center items-center h-full flex-1 gap-y-4">
      <Loader2Icon className="size-6 animate-spin text-primary" />

      {!!message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  )
}
