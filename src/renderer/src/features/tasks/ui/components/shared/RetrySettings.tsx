import { FormControl, FormLabel } from '@renderer/components/ui/form'
import { Slider } from '@renderer/components/ui/slider'
import { Switch } from '@renderer/components/ui/switch'
import { cn } from '@renderer/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { RefreshCwIcon } from 'lucide-react'

interface RetrySettingsProps {
  enabled: boolean
  onEnabledChange: (enabled: boolean) => void
  attempts: number
  onAttemptsChange: (attempts: number) => void
  delaySeconds: number
  onDelayChange: (delaySeconds: number) => void
}

export function RetrySettings({
  enabled,
  onEnabledChange,
  attempts,
  onAttemptsChange,
  delaySeconds,
  onDelayChange,
}: RetrySettingsProps) {
  return (
    <motion.div
      layout
      className={cn(
        'rounded-lg border bg-card! text-card-foreground shadow-sm overflow-hidden',
        !enabled && 'border-border/50 shadow-none'
      )}
      initial={false}
      animate={{
        padding: enabled ? '24px' : '16px',
      }}
      transition={{
        duration: 0.5,
        ease: 'easeInOut',
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RefreshCwIcon className="w-4 h-4 text-muted-foreground" />

          <motion.h3
            layout
            className="font-semibold leading-none tracking-tight"
            animate={{
              fontSize: enabled ? '16px' : '14px',
              color: enabled
                ? 'hsl(var(--foreground))'
                : 'hsl(var(--muted-foreground))',
            }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            Retry on Failure
          </motion.h3>
        </div>

        <Switch
          checked={enabled}
          onCheckedChange={onEnabledChange}
        />
      </div>

      <AnimatePresence initial={false}>
        {enabled && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
            className="px-2 pb-3"
          >
            <div className="mt-1 mb-2">
              <p className="text-sm text-muted-foreground">
                Automatically retry if this node fails
              </p>
            </div>

            <div className="mt-6 space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <FormLabel>Max Attempts:</FormLabel>
                  <span className="text-sm font-medium">{attempts}</span>
                </div>

                <FormControl>
                  <Slider
                    min={2}
                    max={5}
                    step={1}
                    value={[attempts]}
                    onValueChange={([value]) => onAttemptsChange(value)}
                  />
                </FormControl>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <FormLabel>Delay between attempts (seconds):</FormLabel>
                  <span className="text-sm font-medium">{delaySeconds}s</span>
                </div>
                <FormControl>
                  <Slider
                    min={1}
                    max={10}
                    step={1}
                    value={[delaySeconds]}
                    onValueChange={([value]) => onDelayChange(value)}
                  />
                </FormControl>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
