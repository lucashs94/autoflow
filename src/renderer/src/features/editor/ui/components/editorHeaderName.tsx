import { CardTitle } from '@renderer/components/ui/card'
import { Input } from '@renderer/components/ui/input'
import {
  useUpdateWorkflowName,
  useWorkflow,
} from '@renderer/features/workflows/hooks/useWorkflows'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

export function EditorHeaderName({ workflowId }: { workflowId: string }) {
  const { data: workflow } = useWorkflow(workflowId)

  const [name, setName] = useState(workflow.name || '')
  const [isEditing, setIsEditing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const updateWorkflowName = useUpdateWorkflowName()

  const handleSave = async () => {
    if (!workflow) return

    if (name === workflow.name) {
      setIsEditing(false)
      return
    }

    toast.loading('Atualizando workflow...', { id: 'update-workflow-name' })

    updateWorkflowName.mutate(
      { workflowId: workflow.id, name },
      {
        onSuccess: () => {
          setName(name)
        },
        onError: () => {
          setName(workflow.name)
        },
      }
    )

    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    }
    if (e.key === 'Escape') {
      setName(workflow.name)
      setIsEditing(false)
    }
  }

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  useEffect(() => {
    if (workflow) setName(workflow.name || '')
  }, [workflow.name])

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        disabled={updateWorkflowName.isPending}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleSave}
        className="h-7 w-auto min-w-[300px] px-2"
      />
    )
  }

  return (
    <CardTitle
      className="cursor-pointer hover:text-foreground leading-tight py-1"
      onClick={() => setIsEditing(true)}
    >
      {name}
    </CardTitle>
  )
}
