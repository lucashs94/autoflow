import { useEffect, useState } from 'react'
import { ChromeIcon, WifiIcon, WifiOffIcon } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'
import { useSidebar } from './ui/sidebar'
import { cn } from '@renderer/lib/utils'

type ChromeStatus = {
  available: boolean
  source: 'system' | 'downloaded' | 'none'
  browser: string | null
  path: string | null
}

function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}

function useChromeStatus() {
  const [status, setStatus] = useState<ChromeStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const result = await window.api.chrome.getStatus()
        if (result.success) {
          setStatus(result.data)
        }
      } catch (error) {
        console.error('Failed to check Chrome status:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkStatus()

    // Re-check every 30 seconds
    const interval = setInterval(checkStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  return { status, isLoading }
}

export function StatusIndicators() {
  const isOnline = useOnlineStatus()
  const { status: chromeStatus, isLoading: chromeLoading } = useChromeStatus()
  const { state } = useSidebar()
  const isCollapsed = state === 'collapsed'

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-2',
        isCollapsed && 'flex-col gap-2 px-0',
      )}
    >
      {/* Internet Status */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5 cursor-default">
            {isOnline ? (
              <WifiIcon className="size-3.5 text-emerald-400" />
            ) : (
              <WifiOffIcon className="size-3.5 text-red-400" />
            )}
            <span
              className={cn(
                'size-1.5 rounded-full',
                isOnline ? 'bg-emerald-400' : 'bg-red-400',
              )}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">
          {isOnline ? 'Connected to internet' : 'No internet connection'}
        </TooltipContent>
      </Tooltip>

      {/* Chrome Status */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5 cursor-default">
            <ChromeIcon
              className={cn(
                'size-3.5',
                chromeLoading
                  ? 'text-muted-foreground animate-pulse'
                  : chromeStatus?.available
                    ? 'text-emerald-400'
                    : 'text-amber-400',
              )}
            />
            <span
              className={cn(
                'size-1.5 rounded-full',
                chromeLoading
                  ? 'bg-muted-foreground animate-pulse'
                  : chromeStatus?.available
                    ? 'bg-emerald-400'
                    : 'bg-amber-400',
              )}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">
          {chromeLoading
            ? 'Checking browser...'
            : chromeStatus?.available
              ? `${chromeStatus.browser} (${chromeStatus.source})`
              : 'No browser found'}
        </TooltipContent>
      </Tooltip>
    </div>
  )
}
