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
import { Input } from '@renderer/components/ui/input'
import { Slider } from '@renderer/components/ui/slider'
import { Switch } from '@renderer/components/ui/switch'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const formSchema = z.object({
  selector: z.string().min(1, { message: 'Selector is required' }),
  shouldBe: z.enum(['visible', 'hidden']),
  timeout: z.coerce.number<number>().optional(),
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
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      selector: defaultValues.selector || '',
      shouldBe: defaultValues.shouldBe || 'visible',
      timeout: Number(defaultValues.timeout) || 30,
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
        shouldBe: defaultValues.shouldBe || 'visible',
        timeout: Number(defaultValues.timeout) || 30,
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
            className="space-y-8"
          >
            <FormField
              control={form.control}
              name="selector"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Selector:</FormLabel>

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
              name="shouldBe"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Should be:</FormLabel>

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

            <DialogFooter className="mt-4">
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
