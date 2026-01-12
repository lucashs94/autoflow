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
import { Switch } from '@renderer/components/ui/switch'
import { ElementFilter } from '@renderer/features/tasks/types/filters'
import { SelectorType } from '@renderer/types/selectorTypes'
import { useWorkflow } from '@renderer/features/workflows/hooks/useWorkflows'
import {
  getAllAvailableVariables,
  getAvailableVariablesWithInfo,
} from '@renderer/utils/getAvailableVariables'
import { useParams } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { FilterBuilder } from '../shared/filters/FilterBuilder'

const formSchema = z.object({
  selector: z.string().min(1, { message: 'Selector is required' }),
  selectorType: z.nativeEnum(SelectorType).default(SelectorType.CSS),
  shouldBe: z.enum(['visible', 'hidden']),
  timeout: z.coerce.number().optional(),
  filters: z.array(z.any()).default([]),
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
  const [isAdvancedFiltersEnabled, setIsAdvancedFiltersEnabled] = useState(
    Boolean(defaultValues.filters?.length)
  )
  const [isSelectorValid, setIsSelectorValid] = useState(true)

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
    selector: defaultValues?.selector ?? '',
    selectorType: defaultValues?.selectorType ?? SelectorType.CSS,
    shouldBe: defaultValues?.shouldBe ?? 'visible',
    timeout: defaultValues?.timeout ?? 30,
    filters: defaultValues?.filters ?? [],
  }

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: normalizedDefaultValues,
  })

  const selectedSelectorType = form.watch('selectorType')

  const handleSubmit = (values: FormValues) => {
    onSubmit(values)
    onOpenChange(false)
  }

  useEffect(() => {
    if (!isAdvancedFiltersEnabled) {
      form.setValue('filters', [])
    }
  }, [isAdvancedFiltersEnabled, form])

  useEffect(() => {
    // Disable filters when XPath is selected
    if (selectedSelectorType === SelectorType.XPATH) {
      setIsAdvancedFiltersEnabled(false)
      form.setValue('filters', [])
    }
  }, [selectedSelectorType, form])

  useEffect(() => {
    if (open) {
      form.reset({
        selector: defaultValues.selector || '',
        selectorType: defaultValues.selectorType || SelectorType.CSS,
        shouldBe: defaultValues.shouldBe || 'visible',
        timeout: Number(defaultValues.timeout) || 30,
        filters: defaultValues.filters || [],
      })
      // Reset validation state
      setIsSelectorValid(true)
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
            {/* Hidden field for selectorType */}
            <FormField
              control={form.control}
              name="selectorType"
              render={({ field }) => (
                <input
                  type="hidden"
                  {...field}
                />
              )}
            />

            <FormField
              control={form.control}
              name="selector"
              render={({ field }) => (
                <FormItem className="bg-card! p-4 pb-6 rounded-lg gap-2 flex flex-col">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FormLabel>Selector</FormLabel>
                      <SelectorHelpIcon selectorType={selectedSelectorType || SelectorType.CSS} />
                    </div>
                    <SelectorTypeSelect
                      value={selectedSelectorType || SelectorType.CSS}
                      onValueChange={(type) => form.setValue('selectorType', type)}
                    />
                  </div>

                  <FormControl>
                    <SelectorInput
                      {...field}
                      selectorType={selectedSelectorType || SelectorType.CSS}
                      onValidationChange={(isValid) => {
                        setIsSelectorValid(isValid)
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
              name="shouldBe"
              render={({ field }) => (
                <FormItem className="bg-card! p-4 pb-6 rounded-lg gap-4 flex flex-col">
                  <FormLabel>Should be</FormLabel>

                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={field.value === 'visible'}
                        onCheckedChange={(checked) =>
                          field.onChange(checked ? 'visible' : 'hidden')
                        }
                      />
                      <span className="text-sm">
                        {field.value === 'visible' ? 'Visible' : 'Hidden'}
                      </span>
                    </div>
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
              disabled={selectedSelectorType === SelectorType.XPATH}
              disabledReason="Advanced filters are not compatible with XPath selectors. Please use CSS selector type to enable filters."
            />

            <DialogFooter className="mt-4">
              <Button type="submit" disabled={!isSelectorValid}>Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
