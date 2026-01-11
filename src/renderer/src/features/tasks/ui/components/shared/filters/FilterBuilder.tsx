import { Button } from '@renderer/components/ui/button'
import { FormLabel } from '@renderer/components/ui/form'
import { Switch } from '@renderer/components/ui/switch'
import {
  ElementFilter,
  FilterType,
} from '@renderer/features/tasks/types/filters'
import { cn } from '@renderer/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { FilterIcon, PlusIcon, XIcon } from 'lucide-react'
import { useState } from 'react'
import { AddFilterDialog } from './AddFilterDialog'

interface FilterBuilderProps {
  filters: ElementFilter[]
  onChange: (filters: ElementFilter[]) => void
  enabled: boolean
  onEnabledChange: (enabled: boolean) => void
  disabled?: boolean
  disabledReason?: string
}

export function FilterBuilder({
  filters,
  onChange,
  enabled,
  onEnabledChange,
  disabled = false,
  disabledReason = 'Filters are not available',
}: FilterBuilderProps) {
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleRemoveFilter = (index: number) => {
    onChange(filters.filter((_, i) => i !== index))
  }

  const handleAddFilter = (filter: ElementFilter) => {
    onChange([...filters, filter])
  }

  const getFilterLabel = (filter: ElementFilter): string => {
    if (filter.type === FilterType.TEXT) {
      return `Text ${filter.operator.toLowerCase()} "${filter.value}"`
    }
    if (filter.type === FilterType.POSITION) {
      return `Position ${filter.operator.toLowerCase()}${filter.value !== undefined ? ` (${filter.value})` : ''}`
    }
    if (filter.type === FilterType.ATTRIBUTE) {
      const valueStr = filter.value ? ` "${filter.value}"` : ''
      return `[${filter.attributeName}] ${filter.operator.toLowerCase()}${valueStr}`
    }
    return 'Unknown filter'
  }

  return (
    <>
      <AddFilterDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onAddFilter={handleAddFilter}
      />

      <motion.div
        layout
        className={cn(
          'rounded-lg border bg-card! text-card-foreground shadow-sm overflow-hidden',
          !enabled && 'border-border/50 shadow-none',
          disabled && 'opacity-60'
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
            <FilterIcon className="w-4 h-4 text-muted-foreground" />

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
              Advanced Filters
            </motion.h3>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={onEnabledChange}
            disabled={disabled}
          />
        </div>

        {disabled && disabledReason && (
          <p className="text-xs text-muted-foreground mt-2">
            {disabledReason}
          </p>
        )}

        <AnimatePresence initial={false}>
          {enabled && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              style={{ overflow: 'hidden' }}
            >
              <div className="mt-4 mb-2">
                <p className="text-sm text-muted-foreground">
                  Refine element selection with multiple criteria
                </p>
              </div>

              <div className="mt-6 space-y-4">
                {/* Display existing filters */}
                {filters.length > 0 && (
                  <div className="space-y-3">
                    <FormLabel className="text-xs text-muted-foreground uppercase tracking-wider">
                      Active Filters (Applied in Order)
                    </FormLabel>

                    <div className="space-y-2">
                      {filters.map((filter, index) => (
                        <div
                          key={index}
                          className="space-y-2"
                        >
                          <div className="flex items-center gap-3 p-3 bg-secondary/50 border border-border rounded-lg">
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold shrink-0">
                              {index + 1}
                            </div>
                            <div className="flex-1 text-sm font-medium">
                              {getFilterLabel(filter)}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveFilter(index)}
                              className="shrink-0 p-1 hover:bg-destructive/10 rounded transition-colors"
                            >
                              <XIcon className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                            </button>
                          </div>
                          {index < filters.length - 1 && (
                            <div className="flex items-center justify-center">
                              <div className="px-3 py-1 bg-muted rounded-full text-xs font-semibold text-muted-foreground">
                                AND
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Filter Button */}
                <Button
                  variant="outline"
                  size="lg"
                  type="button"
                  onClick={() => setDialogOpen(true)}
                  className="w-full"
                >
                  <PlusIcon className="size-4" />
                  Add Filter
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  )
}
