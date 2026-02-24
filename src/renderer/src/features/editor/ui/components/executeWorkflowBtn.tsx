import { Button } from '@renderer/components/ui/button'
import { useExecuteWorkflow } from '@renderer/features/workflows/hooks/useWorkflows'
import { motion } from 'framer-motion'
import { FlaskConicalIcon, LoaderIcon, SquareIcon, DownloadIcon } from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'

export function ExecuteWorkflowBtn({
  workflowId,
  hasChanges,
}: {
  workflowId: string
  hasChanges: boolean
}) {
  const executeWorkflow = useExecuteWorkflow()
  const abortControllerRef = useRef<AbortController | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)

  const handleExecute = async () => {
    // Check if online
    if (!navigator.onLine) {
      toast.error('No internet connection', {
        description: 'Please connect to the internet to run automations.',
      })
      return
    }

    // Check Chrome availability
    const chromeStatus = await window.api.chrome.getStatus()
    if (!chromeStatus.success || !chromeStatus.data.available) {
      // Chrome not available, ask to download
      toast.error('Browser not found', {
        description: 'Click the download button to install Chrome.',
        action: {
          label: 'Download',
          onClick: handleDownloadChrome,
        },
        duration: 10000,
      })
      return
    }

    // Create new AbortController for this execution
    abortControllerRef.current = new AbortController()

    executeWorkflow.mutate({
      workflowId,
      signal: abortControllerRef.current.signal,
    })
  }

  const handleDownloadChrome = async () => {
    if (isDownloading) return

    if (!navigator.onLine) {
      toast.error('No internet connection', {
        description: 'Please connect to the internet to download Chrome.',
      })
      return
    }

    setIsDownloading(true)
    setDownloadProgress(0)

    const toastId = toast.loading('Downloading Chrome...', {
      description: '0%',
    })

    // Subscribe to progress updates
    const cleanup = window.api.chrome.onDownloadProgress((progress) => {
      setDownloadProgress(progress.percent)
      toast.loading('Downloading Chrome...', {
        id: toastId,
        description: `${progress.percent}%`,
      })
    })

    try {
      await window.api.chrome.download()
      toast.success('Chrome installed!', {
        id: toastId,
        description: 'You can now execute workflows.',
      })
    } catch (error) {
      toast.error('Download failed', {
        id: toastId,
        description: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      cleanup()
      setIsDownloading(false)
      setDownloadProgress(0)
    }
  }

  const handleCancel = async () => {
    console.log('🛑 Cancel button clicked')

    // Abort the workflow execution in renderer
    abortControllerRef.current?.abort()
    console.log('✅ Renderer signal aborted')

    // Abort any in-flight browser operations in main process
    await window.api.executions.abort()
    console.log('✅ Main process aborted')

    // Show notification
    toast.info('Workflow cancelled')
  }

  const isDisabled = executeWorkflow.isPending || hasChanges || isDownloading

  return (
    <div className="flex flex-row-reverse gap-2">
      <Button
        size={'lg'}
        onClick={handleExecute}
        disabled={isDisabled}
        className="disabled:cursor-not-allowed! cursor-pointer! px-4!"
        style={{ transition: 'none' }}
      >
        {isDownloading ? (
          <>
            <DownloadIcon className="animate-pulse" />
            Downloading... {downloadProgress}%
          </>
        ) : executeWorkflow.isPending ? (
          <>
            <motion.div
              className="size-4 shrink-0 flex items-center justify-center"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear', repeatType: 'loop' }}
            >
              <LoaderIcon className="size-4" />
            </motion.div>
            Execute Workflow
          </>
        ) : (
          <>
            <FlaskConicalIcon />
            Execute Workflow
          </>
        )}
      </Button>

      <Button
        size={'lg'}
        onClick={handleCancel}
        variant={'destructive'}
        disabled={!executeWorkflow.isPending}
        className={`disabled:cursor-not-allowed! cursor-pointer! ${
          executeWorkflow.isPending
            ? 'animate-in fade-in-0 zoom-in-95 slide-in-from-left-2 duration-500 ease-out'
            : 'invisible'
        }`}
      >
        <SquareIcon />
      </Button>
    </div>
  )
}
