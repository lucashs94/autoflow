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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@renderer/components/ui/select'
import { Textarea } from '@renderer/components/ui/textarea'
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
  endpoint: z.string().min(1, { message: 'Please enter a valid URL' }),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
  body: z.string().optional(),
})

export type HttpRequestFormValues = z.infer<typeof formSchema>

interface Props {
  nodeId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: HttpRequestFormValues) => void
  defaultValues?: Partial<HttpRequestFormValues>
}

export const HttpRequestDialog = ({
  nodeId,
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const [isEndpointValid, setIsEndpointValid] = useState(true)

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

  const form = useForm<HttpRequestFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      endpoint: defaultValues.endpoint || '',
      method: defaultValues.method || 'GET',
      body: defaultValues.body || '',
    },
  })

  const watchMethod = form.watch('method')
  const isBodyRequired = ['POST', 'PUT', 'PATCH'].includes(watchMethod)

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    console.log('passsoiu')

    onSubmit(values)
    onOpenChange(false)
  }

  useEffect(() => {
    if (open) {
      form.reset({
        endpoint: defaultValues.endpoint || '',
        method: defaultValues.method || 'GET',
        body: defaultValues.body || '',
      })
      // Reset validation state
      setIsEndpointValid(true)
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
            {/* TODO: add suspense ou add loading state */}
            <FieldEditChange id={nodeId} />
          </DialogTitle>

          <DialogDescription>
            Use this name to reference the result in other nodes:{' '}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6 mt-4"
          >
            <FormField
              control={form.control}
              name="method"
              render={({ field }) => (
                <FormItem className="bg-card! p-4 pb-6 rounded-lg gap-2 flex flex-col">
                  <FormLabel>Method</FormLabel>

                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full bg-input/90!">
                        <SelectValue placeholder="Select a method" />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                      <SelectItem value="PATCH">PATCH</SelectItem>
                    </SelectContent>
                  </Select>

                  <FormDescription>
                    The HTTP method to use for this request
                  </FormDescription>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endpoint"
              render={({ field }) => (
                <FormItem className="bg-card! p-4 pb-6 rounded-lg gap-2 flex flex-col">
                  <FormLabel>Endpoint</FormLabel>

                  <FormControl>
                    <TemplateInput
                      {...field}
                      availableVariables={availableVariables}
                      variablesInfo={variablesInfo}
                      onValidationChange={(isValid) => {
                        setIsEndpointValid(isValid)
                      }}
                      className="bg-input/90!"
                      placeholder="https://api.example.com/users/{{ variable }}"
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

            {isBodyRequired && (
              <FormField
                control={form.control}
                name="body"
                render={({ field }) => (
                  <FormItem className="bg-card! p-4 pb-6 rounded-lg gap-2 flex flex-col">
                    <FormLabel>Request Body</FormLabel>

                    <FormControl>
                      <Textarea
                        {...field}
                        className="min-h-[120px] font-mono text-sm bg-input/90!"
                        placeholder={
                          '{\n  "userId": "{{httpResponse.data.id}}",\n  "name": "{{httpResponse.data.name}}",\n  "items": "{{httpResponse.data.items}}"\n}'
                        }
                      />
                    </FormControl>

                    <FormDescription>
                      JSON with template variables. Use {'{{variables}}'} for
                      simple values or {'{{json variable}}'} to stringify
                      objects
                    </FormDescription>

                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter className="mt-4">
              <Button type="submit" disabled={!isEndpointValid}>Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
