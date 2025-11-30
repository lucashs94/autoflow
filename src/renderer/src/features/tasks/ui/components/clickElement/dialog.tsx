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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@renderer/components/ui/form'
import { Input } from '@renderer/components/ui/input'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const formSchema = z.object({
  selector: z.string().min(1, { message: 'Selector is required' }),
  timeout: z.coerce
    .number<number>()
    .min(1_000)
    .max(60_000, `Should be lower than 60000`),
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
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      selector: defaultValues.selector || '',
      timeout: Number(defaultValues.timeout) || 30_000,
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
        timeout: defaultValues.timeout || 30_000,
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
                  <FormLabel>Timeout (miliseconds)</FormLabel>

                  <FormControl>
                    <Input
                      {...field}
                      className="bg-input/90!"
                      placeholder="30000"
                      type="number"
                    />
                  </FormControl>
                  <FormMessage />

                  <FormDescription>
                    min: 1000 ms (10 s) <br /> max: 60000 ms (60 s)
                  </FormDescription>
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
