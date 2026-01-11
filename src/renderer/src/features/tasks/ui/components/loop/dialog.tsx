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

const formSchema = z.object({
  variableList: z.string().min(1, { message: 'Variable list is required' }),
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
  const [isVariableValid, setIsVariableValid] = useState(true)

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
      variableList: defaultValues.variableList || '',
    },
  })

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values)
    onOpenChange(false)
  }

  useEffect(() => {
    if (open) {
      form.reset({
        variableList: defaultValues.variableList || '',
      })
      // Reset validation state
      setIsVariableValid(true)
    }
  }, [open, defaultValues, form])

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="bg-muted max-h-11/12 overflow-y-auto scrollbar gap-6">
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
              name="variableList"
              render={({ field }) => (
                <FormItem className="bg-card! p-4 pb-6 rounded-lg gap-2 flex flex-col">
                  <FormLabel>Variable</FormLabel>

                  <FormControl>
                    <TemplateInput
                      {...field}
                      availableVariables={availableVariables}
                      variablesInfo={variablesInfo}
                      onValidationChange={(isValid) => {
                        setIsVariableValid(isValid)
                      }}
                      className="bg-input/90!"
                      placeholder="Enter the variable name, e.g. {{ variableName }}"
                    />
                  </FormControl>
                  <FormMessage />

                  <FormDescription>{`e.g. {{variableName}}`}</FormDescription>
                </FormItem>
              )}
            />

            <DialogFooter className="mt-4">
              <Button type="submit" disabled={!isVariableValid}>Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
