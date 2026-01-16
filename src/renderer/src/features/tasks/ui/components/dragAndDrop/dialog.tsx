import { zodResolver } from '@hookform/resolvers/zod'
import { FieldEditChange } from '@renderer/components/fieldEditChange'
import { SelectorInput, SelectorHelpIcon, SelectorTypeSelect } from '@renderer/components/selectorInput'
import { Button } from '@renderer/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@renderer/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@renderer/components/ui/form'
import { Slider } from '@renderer/components/ui/slider'
import { useWorkflow } from '@renderer/features/workflows/hooks/useWorkflows'
import { SelectorType } from '@renderer/types/selectorTypes'
import {
  getAllAvailableVariables,
  getAvailableVariablesWithInfo,
} from '@renderer/utils/getAvailableVariables'
import { useParams } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { RetrySettings } from '../shared/RetrySettings'

const formSchema = z.object({
  sourceSelector: z.string().min(1, { message: 'Source selector is required' }),
  sourceSelectorType: z.nativeEnum(SelectorType).default(SelectorType.CSS),
  targetSelector: z.string().min(1, { message: 'Target selector is required' }),
  targetSelectorType: z.nativeEnum(SelectorType).default(SelectorType.CSS),
  timeout: z.coerce
    .number()
    .min(1)
    .max(60, { message: 'Should be lower than 60' }),
  retryAttempts: z.coerce.number().min(1).max(5).default(1),
  retryDelaySeconds: z.coerce.number().min(1).max(10).default(2),
})

export type FormValues = z.input<typeof formSchema>

interface Props {
  nodeId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: FormValues) => void
  defaultValues?: Partial<FormValues>
}

export const SettingsDialog = ({
  nodeId,
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const [isSourceSelectorValid, setIsSourceSelectorValid] = useState(true)
  const [isTargetSelectorValid, setIsTargetSelectorValid] = useState(true)
  const [isRetryEnabled, setIsRetryEnabled] = useState(
    (defaultValues.retryAttempts ?? 1) > 1
  )

  const { workflowId } = useParams({ from: '/(main)/workflows/$workflowId/' })
  const { data: workflow } = useWorkflow(workflowId)

  // Calculate available variables for autocomplete
  const availableVariables =
    workflow && workflow.nodes && workflow.edges
      ? getAllAvailableVariables(nodeId, workflow.nodes, workflow.edges)
      : []

  // Get variable info with properties
  const variablesInfo =
    workflow && workflow.nodes && workflow.edges
      ? getAvailableVariablesWithInfo(nodeId, workflow.nodes, workflow.edges)
      : undefined

  const normalizedDefaultValues: FormValues = {
    sourceSelector: defaultValues?.sourceSelector ?? '',
    sourceSelectorType: defaultValues?.sourceSelectorType ?? SelectorType.CSS,
    targetSelector: defaultValues?.targetSelector ?? '',
    targetSelectorType: defaultValues?.targetSelectorType ?? SelectorType.CSS,
    timeout: defaultValues?.timeout ?? 30,
    retryAttempts: defaultValues?.retryAttempts ?? 1,
    retryDelaySeconds: defaultValues?.retryDelaySeconds ?? 2,
  }

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: normalizedDefaultValues,
  })

  const selectedSourceSelectorType = form.watch('sourceSelectorType')
  const selectedTargetSelectorType = form.watch('targetSelectorType')

  const handleSubmit = (values: FormValues) => {
    onSubmit(values)
    onOpenChange(false)
  }

  useEffect(() => {
    if (open) {
      form.reset({
        sourceSelector: defaultValues.sourceSelector || '',
        sourceSelectorType: defaultValues.sourceSelectorType || SelectorType.CSS,
        targetSelector: defaultValues.targetSelector || '',
        targetSelectorType: defaultValues.targetSelectorType || SelectorType.CSS,
        timeout: Number(defaultValues.timeout || 30),
        retryAttempts: defaultValues.retryAttempts ?? 1,
        retryDelaySeconds: defaultValues.retryDelaySeconds ?? 2,
      })
      setIsSourceSelectorValid(true)
      setIsTargetSelectorValid(true)
      setIsRetryEnabled((defaultValues.retryAttempts ?? 1) > 1)
    }
  }, [open, defaultValues, form])

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="bg-muted max-h-11/12 overflow-y-auto scrollbar">
        <DialogHeader className="gap-0">
          <DialogTitle>
            <FieldEditChange id={nodeId} />
          </DialogTitle>

          <DialogDescription>
            Drag an element from source to target location
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6 mt-4"
          >
            {/* Hidden fields for selector types */}
            <FormField
              control={form.control}
              name="sourceSelectorType"
              render={({ field }) => (
                <input
                  type="hidden"
                  {...field}
                />
              )}
            />
            <FormField
              control={form.control}
              name="targetSelectorType"
              render={({ field }) => (
                <input
                  type="hidden"
                  {...field}
                />
              )}
            />

            {/* Source Selector */}
            <FormField
              control={form.control}
              name="sourceSelector"
              render={({ field }) => (
                <FormItem className="bg-card! p-4 pb-6 rounded-lg gap-2 flex flex-col">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FormLabel>Source Element (drag from)</FormLabel>
                      <SelectorHelpIcon selectorType={selectedSourceSelectorType || SelectorType.CSS} />
                    </div>
                    <SelectorTypeSelect
                      value={selectedSourceSelectorType || SelectorType.CSS}
                      onValueChange={(type) => form.setValue('sourceSelectorType', type)}
                    />
                  </div>

                  <FormControl>
                    <SelectorInput
                      {...field}
                      selectorType={selectedSourceSelectorType || SelectorType.CSS}
                      onValidationChange={(isValid) => {
                        setIsSourceSelectorValid(isValid)
                      }}
                      availableVariables={availableVariables}
                      variablesInfo={variablesInfo}
                      className="bg-input/90!"
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Target Selector */}
            <FormField
              control={form.control}
              name="targetSelector"
              render={({ field }) => (
                <FormItem className="bg-card! p-4 pb-6 rounded-lg gap-2 flex flex-col">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FormLabel>Target Element (drop to)</FormLabel>
                      <SelectorHelpIcon selectorType={selectedTargetSelectorType || SelectorType.CSS} />
                    </div>
                    <SelectorTypeSelect
                      value={selectedTargetSelectorType || SelectorType.CSS}
                      onValueChange={(type) => form.setValue('targetSelectorType', type)}
                    />
                  </div>

                  <FormControl>
                    <SelectorInput
                      {...field}
                      selectorType={selectedTargetSelectorType || SelectorType.CSS}
                      onValidationChange={(isValid) => {
                        setIsTargetSelectorValid(isValid)
                      }}
                      availableVariables={availableVariables}
                      variablesInfo={variablesInfo}
                      className="bg-input/90!"
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="timeout"
              render={({ field }) => (
                <FormItem className="bg-card! p-4 pb-6 rounded-lg gap-4 flex flex-col">
                  <div className="flex justify-between">
                    <FormLabel>Timeout (seconds):</FormLabel>

                    {form.watch('timeout')}
                  </div>

                  <FormControl>
                    <Slider
                      {...field}
                      min={1}
                      max={60}
                      step={1}
                      value={[field.value]}
                      onValueChange={([value]) => field.onChange(value)}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <RetrySettings
              enabled={isRetryEnabled}
              onEnabledChange={(enabled) => {
                setIsRetryEnabled(enabled)
                if (!enabled) {
                  form.setValue('retryAttempts', 1)
                } else {
                  form.setValue('retryAttempts', 2)
                }
              }}
              attempts={form.watch('retryAttempts')}
              onAttemptsChange={(attempts) => form.setValue('retryAttempts', attempts)}
              delaySeconds={form.watch('retryDelaySeconds')}
              onDelayChange={(delay) => form.setValue('retryDelaySeconds', delay)}
            />

            <DialogFooter className="mt-4">
              <Button type="submit" disabled={!isSourceSelectorValid || !isTargetSelectorValid}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
