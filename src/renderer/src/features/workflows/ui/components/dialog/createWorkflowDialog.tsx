'use client'

// import { CustomDialogHeader } from '@/components/CustomDialogHeader'
import { zodResolver } from '@hookform/resolvers/zod'
import { CustomDialogHeader } from '@renderer/components/customDialogHeader'
import { Button } from '@renderer/components/ui/button'
import { Dialog, DialogContent } from '@renderer/components/ui/dialog'
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
import { useCreateWorkflow } from '@renderer/features/workflows/hooks/useWorkflows'
import { useRouter } from '@tanstack/react-router'
import { Layers2Icon, Loader2 } from 'lucide-react'
import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

export const formSchema = z.object({
  name: z.string().max(50),
})

export type FormType = z.infer<typeof formSchema>

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateWorkflowDialog({ open, onOpenChange }: Props) {
  const router = useRouter()

  const form = useForm<FormType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  })

  const { mutate, isPending } = useCreateWorkflow()

  const onSubmit = useCallback(
    (values: FormType) => {
      toast.loading('Criando workflow...', { id: 'create-workflow' })
      mutate(values.name, {
        onSuccess: (data) => {
          router.navigate({ to: `/workflows/${data.id}` })
          onOpenChange(false)
        },
      })
    },
    [mutate, router]
  )

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="px-0">
        <CustomDialogHeader
          Icon={Layers2Icon}
          title="Criar Workflow"
          subtitle="Comece a construir seu workflow"
        />

        <div className="p-6">
          <Form {...form}>
            <form
              className="space-y-8 w-full"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex gap-1 items-center">
                      Name
                      <p className="text-xs text-primary">(required)</p>
                    </FormLabel>

                    <FormControl>
                      <Input {...field} />
                    </FormControl>

                    <FormDescription>
                      Choose a descriptive and unique name.
                    </FormDescription>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={isPending}
              >
                {!isPending && 'Create'}
                {isPending && <Loader2 className="animate-spin" />}
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
