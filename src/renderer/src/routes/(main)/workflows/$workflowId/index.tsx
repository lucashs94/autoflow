import { Button } from '@renderer/components/ui/button'
import { createFileRoute, useParams, useRouter } from '@tanstack/react-router'

export const Route = createFileRoute('/(main)/workflows/$workflowId/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { workflowId } = useParams({ from: '/(main)/workflows/$workflowId/' })

  const router = useRouter()

  return (
    <div className="flex w-full flex-col gap-8">
      <Button
        onClick={() => router.navigate({ to: `/workflows` })}
        size={'sm'}
        className="max-w-[200px]"
      >
        Go to workflow
      </Button>

      <span className="text-2xl font-bold">Hello {workflowId}</span>
    </div>
  )
}
