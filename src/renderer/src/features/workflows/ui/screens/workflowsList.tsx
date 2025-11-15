import { EntityContainer } from '@renderer/components/entityContainer'
import { EntityItem } from '@renderer/components/entityItem'
import { EntityList } from '@renderer/components/entityList'
import { Button } from '@renderer/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import { WorkflowIcon } from 'lucide-react'
import { Suspense, useState } from 'react'
import { useWorkflows } from '../../hooks/useWorkflows'
import { CreateWorkflowDialog } from '../components/dialog/createWorkflowDialog'
import { WorkflowsSkeleton } from '../components/skeleton'

export function WorkflowsList() {
  const [openDialog, setOpenDialog] = useState(false)

  const { data: workflows } = useWorkflows()

  const handleCreate = () => {
    setOpenDialog(true)
  }

  return (
    <>
      <CreateWorkflowDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
      />

      <EntityContainer className="bg-muted">
        <div className="flex flex-col h-full">
          <div className="flex justify-between">
            <div className="flex flex-col">
              <h1 className="text-3xl font-bold">Workflows</h1>

              <p className="text-muted-foreground">Manage your workflows</p>
            </div>

            <Button onClick={handleCreate}>Novo Workflow</Button>
          </div>

          <div className="h-full py-6">
            <Suspense fallback={<WorkflowsSkeleton />}>
              <EntityList
                items={workflows || []}
                getKey={(item) => item.id}
                renderItem={(item) => <WorkflowItem data={item} />}
              />
            </Suspense>
          </div>
        </div>
      </EntityContainer>
    </>
  )
}

export const WorkflowItem = ({ data }: { data: any }) => {
  // const removeWorkflow = useRemoveWorkflow()

  const handleRemove = () => {
    // removeWorkflow.mutate({ id: data.id })
  }

  return (
    <EntityItem
      href={`/workflows/${data.id}`}
      title={data.name}
      subtitle={
        <>
          Updated {formatDistanceToNow(data.updatedAt, { addSuffix: true })}{' '}
          &bull; Created{' '}
          {formatDistanceToNow(data.createdAt, { addSuffix: true })}
        </>
      }
      image={
        <div className="size-8 flex items-center justify-center">
          <WorkflowIcon className="size-5 text-muted-foreground " />
        </div>
      }
      onRemove={handleRemove}
      // isRemoving={removeWorkflow.isPending}
    />
  )
}
