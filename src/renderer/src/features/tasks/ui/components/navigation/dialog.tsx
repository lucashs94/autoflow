import { zodResolver } from '@hookform/resolvers/zod'
import { FieldEditChange } from '@renderer/components/fieldEditChange'
import { TemplateInput } from '@renderer/components/templateInput'
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@renderer/components/ui/form'
import { useWorkflow } from '@renderer/features/workflows/hooks/useWorkflows'
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
  url: z.string().min(1, { message: 'Please enter a valid URL' }),
  retryAttempts: z.coerce.number().min(1).max(5).default(1),
  retryDelaySeconds: z.coerce.number().min(1).max(10).default(2),
})

export type FormValues = z.infer<typeof formSchema>

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
  const [isUrlValid, setIsUrlValid] = useState(true)
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

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: defaultValues.url || '',
      retryAttempts: defaultValues.retryAttempts ?? 1,
      retryDelaySeconds: defaultValues.retryDelaySeconds ?? 2,
    },
  })

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values)
    onOpenChange(false)
  }

  useEffect(() => {
    if (open) {
      form.reset({
        url: defaultValues.url || '',
        retryAttempts: defaultValues.retryAttempts ?? 1,
        retryDelaySeconds: defaultValues.retryDelaySeconds ?? 2,
      })
      // Reset validation state
      setIsUrlValid(true)
      setIsRetryEnabled((defaultValues.retryAttempts ?? 1) > 1)
    }
  }, [open, defaultValues, form])

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="bg-muted max-h-11/12 overflow-y-auto scrollbar">
        <DialogHeader>
          <DialogTitle>
            <FieldEditChange id={nodeId} />
          </DialogTitle>

          <DialogDescription>
            Use this name to reference the result in other nodes
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6 mt-4"
          >
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem className="bg-card! p-4 pb-6 rounded-lg gap-2 flex flex-col">
                  <FormLabel>URL</FormLabel>

                  <FormControl>
                    <TemplateInput
                      {...field}
                      availableVariables={availableVariables}
                      variablesInfo={variablesInfo}
                      onValidationChange={(isValid) => {
                        setIsUrlValid(isValid)
                      }}
                      className="bg-input/90!"
                      placeholder="https://example.com/ or use {{ variable }}"
                    />
                  </FormControl>

                  <FormDescription>
                    Static URL or use {'{{variables}}'} for simple values or{' '}
                    {'{{json variable}}'} to stringify objects
                  </FormDescription>

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
              <Button type="submit" disabled={!isUrlValid}>Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
