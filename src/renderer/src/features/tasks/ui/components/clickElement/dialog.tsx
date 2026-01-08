import { zodResolver } from '@hookform/resolvers/zod'
import { FieldEditChange } from '@renderer/components/fieldEditChange'
import { Button } from '@renderer/components/ui/button'
import { Card, CardTitle } from '@renderer/components/ui/card'
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
import { Input } from '@renderer/components/ui/input'
import { Slider } from '@renderer/components/ui/slider'
import { Switch } from '@renderer/components/ui/switch'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const formSchema = z.object({
  selector: z.string().min(1, { message: 'Selector is required' }),
  timeout: z.coerce.number<number>().min(1).max(60, `Should be lower than 60`),
  filters: z
    .array(
      z.object({
        property: z.string().min(1, { message: 'Property is required' }),
        operator: z.string().min(1, { message: 'Operator is required' }),
        value: z.string().min(1, { message: 'Value is required' }),
      })
    )
    .catch([]),
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

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      selector: defaultValues.selector || '',
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
                  {/* Add info tooltip */}

                  <FormControl>
                    <Input
                      {...field}
                      className=" bg-input/90!"
                      placeholder=".class"
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

            <Card className="py-4">
              <div className="flex items-center justify-between px-4">
                <CardTitle className="text-sm">Advanced filters</CardTitle>

                <Switch
                  checked={isAdvancedFiltersEnabled}
                  onCheckedChange={setIsAdvancedFiltersEnabled}
                />
              </div>

              {isAdvancedFiltersEnabled && (
                <div className="px-4 space-y-4">
                  <div className="flex gap-2">
                    <div className="flex flex-col gap-2">
                      <FormLabel>Type</FormLabel>
                      <Button
                        size={'sm'}
                        type="button"
                      >
                        Text
                      </Button>
                    </div>
                    <div className="flex flex-col gap-2">
                      <FormLabel>Operator</FormLabel>
                      <Button
                        size={'sm'}
                        type="button"
                      >
                        contains
                      </Button>
                    </div>
                    <div className="flex flex-col gap-2 w-full">
                      <FormLabel>Value</FormLabel>
                      <Input placeholder="value" />
                    </div>
                  </div>

                  <Button
                    variant={'outline'}
                    size={'sm'}
                    type="button"
                    onClick={() => {}}
                  >
                    Add filter
                  </Button>
                </div>
              )}
            </Card>

            <DialogFooter className="mt-4">
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
