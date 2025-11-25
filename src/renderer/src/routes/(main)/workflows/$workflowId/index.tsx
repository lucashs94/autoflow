import {
  Editor,
  EditorError,
  EditorLoading,
} from '@renderer/features/editor/ui/screens/editor'
import { createFileRoute, useParams } from '@tanstack/react-router'
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

export const Route = createFileRoute('/(main)/workflows/$workflowId/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { workflowId } = useParams({ from: '/(main)/workflows/$workflowId/' })

  return (
    <ErrorBoundary fallback={<EditorError />}>
      <Suspense fallback={<EditorLoading />}>
        <main className="min-h-screen w-full h-full flex flex-col gap-8">
          <Editor workflowId={workflowId} />
        </main>
      </Suspense>
    </ErrorBoundary>
  )
}
