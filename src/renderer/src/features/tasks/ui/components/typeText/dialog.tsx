import { zodResolver } from '@hookform/resolvers/zod'
import { FieldEditChange } from '@renderer/components/fieldEditChange'
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
import { TemplateInput } from '@renderer/components/templateInput'
import { Slider } from '@renderer/components/ui/slider'
import { ElementFilter } from '@renderer/features/tasks/types/filters'
import { getAllAvailableVariables } from '@renderer/utils/getAvailableVariables'
import { useWorkflow } from '@renderer/features/workflows/hooks/useWorkflows'
import { useParams } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { FilterBuilder } from '../shared/FilterBuilder'

const formSchema = z.object({
  selector: z.string().min(1, { message: 'Selector is required' }),
  text: z.string().min(1, { message: 'Text is required' }),
  timeout: z.coerce.number().min(1).max(60, { message: 'Should be lower than 60' }),
  filters: z.array(z.any()).default([]),
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
  const [isAdvancedFiltersEnabled, setIsAdvancedFiltersEnabled] = useState(
    Boolean(defaultValues.filters?.length)
  )

  const { workflowId } = useParams({ from: '/(main)/workflows/$workflowId/' })
  const { data: workflow } = useWorkflow(workflowId)

  // Calculate available variables for autocomplete
  const availableVariables =
    workflow && workflow.nodes && workflow.edges
      ? getAllAvailableVariables(nodeId, workflow.nodes, workflow.edges)
      : []

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      selector: defaultValues.selector || '',
      text: defaultValues.text || '',
      timeout: Number(defaultValues.timeout) || 30,
      filters: defaultValues.filters || [],
    },
  })

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values)
    onOpenChange(false)
  }

  useEffect(() => {
    if (open) {
      form.reset({
        selector: defaultValues.selector || '',
        text: defaultValues.text || '',
        timeout: defaultValues.timeout || 30,
        filters: defaultValues.filters || [],
      })
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
            className="space-y-8 mt-4"
          >
            <FormField
              control={form.control}
              name="selector"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Selector</FormLabel>

                  <FormControl>
                    <TemplateInput
                      {...field}
                      availableVariables={availableVariables}
                      className=" bg-input/90!"
                      placeholder=".class or {{ variable }}"
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Text</FormLabel>

                  <FormControl>
                    <TemplateInput
                      {...field}
                      availableVariables={availableVariables}
                      className=" bg-input/90!"
                      placeholder="Type text or use {{ variable }}"
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
                <FormItem>
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
                      value={[field.value || 30]}
                      onValueChange={(value) => field.onChange(value[0])}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FilterBuilder
              filters={form.watch('filters') as ElementFilter[]}
              onChange={(filters) => form.setValue('filters', filters)}
              enabled={isAdvancedFiltersEnabled}
              onEnabledChange={setIsAdvancedFiltersEnabled}
            />

            <DialogFooter className="mt-4">
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
