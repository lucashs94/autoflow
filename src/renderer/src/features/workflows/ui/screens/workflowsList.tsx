import { EntityContainer } from '@renderer/components/entityContainer'
import { EntityItem, MenuItemConfig } from '@renderer/components/entityItem'
import { EntityList } from '@renderer/components/entityList'
import { Button } from '@renderer/components/ui/button'
import { DeleteWorkflowDialog } from '@renderer/features/editor/ui/components/deleteWorkflowDialog'
import { isSuccess } from '@shared/@types/ipc-response'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { formatDistanceToNow } from 'date-fns'
import { CopyIcon, Trash2Icon, WorkflowIcon } from 'lucide-react'
import { Suspense, useCallback, useState } from 'react'
import { useWorkflows } from '../../hooks/useWorkflows'
import { CreateWorkflowDialog } from '../components/dialog/createWorkflowDialog'
import { WorkflowsSkeleton } from '../components/skeleton'

export function WorkflowsList() {
  const [openDialog, setOpenDialog] = useState(false)
  const queryClient = useQueryClient()

  const { data: workflows } = useWorkflows()

  const handleWorkflowDeleted = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['workflows'] })
  }, [queryClient])

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
                renderItem={(item) => (
                  <WorkflowItem
                    data={item}
                    onDeleted={handleWorkflowDeleted}
                  />
                )}
              />
            </Suspense>
          </div>
        </div>
      </EntityContainer>
    </>
  )
}

export const WorkflowItem = ({
  data,
  onDeleted,
}: {
  data: any
  onDeleted?: () => void
}) => {
  const navigate = useNavigate()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDuplicating, setIsDuplicating] = useState(false)

  const handleDuplicate = async () => {
    if (isDuplicating) return

    try {
      setIsDuplicating(true)
      const result = await window.api.workflows.duplicate(data.id)

      if (isSuccess(result)) {
        navigate({
          to: '/workflows/$workflowId',
          params: { workflowId: result.data.workflowId },
        })
      }
    } catch (error) {
      console.error('Failed to duplicate workflow:', error)
    } finally {
      setIsDuplicating(false)
    }
  }

  const menuItems: MenuItemConfig[] = [
    {
      label: isDuplicating ? 'Duplicating...' : 'Duplicate',
      icon: CopyIcon,
      onClick: handleDuplicate,
      disabled: isDuplicating,
    },
    {
      label: 'Delete',
      icon: Trash2Icon,
      onClick: () => setIsDeleteDialogOpen(true),
      variant: 'destructive',
      separator: true,
    },
  ]

  return (
    <>
      <EntityItem
        href={`/workflows/${data.id}`}
        title={data.name}
        subtitle={
          <>
            Updated{' '}
            {formatDistanceToNow(data.updatedAt, {
              addSuffix: true,
            })}{' '}
            &bull; Created{' '}
            {formatDistanceToNow(data.createdAt, {
              addSuffix: true,
            })}
          </>
        }
        image={
          <div className="size-8 flex items-center justify-center">
            <WorkflowIcon className="size-5 text-muted-foreground " />
          </div>
        }
        menuItems={menuItems}
        disabled={isDuplicating}
      />

      <DeleteWorkflowDialog
        workflowId={data.id}
        workflowName={data.name}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onDeleted={onDeleted}
      />
    </>
  )
}
