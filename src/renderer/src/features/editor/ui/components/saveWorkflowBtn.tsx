import { Button } from '@renderer/components/ui/button'
import { editorAtom } from '@renderer/features/editor/store/atom'
import { useUpdateWorkflow } from '@renderer/features/workflows/hooks/useWorkflows'
import { useAtomValue } from 'jotai'
import { SaveIcon } from 'lucide-react'

export function SaveWorkflowBtn({
  workflowId,
  hasChanges,
}: {
  workflowId: string
  hasChanges: boolean
}) {
  const editor = useAtomValue(editorAtom)
  const saveWorkflow = useUpdateWorkflow()

  const handleSave = () => {
    if (!editor) return

    const nodes = editor.getNodes()
    const edges = editor.getEdges()

    saveWorkflow.mutate({
      workflowId,
      nodes,
      edges,
    })
  }

  return (
    <Button
      size={'lg'}
      onClick={handleSave}
      disabled={saveWorkflow.isPending || !hasChanges}
      className="disabled:cursor-not-allowed! cursor-pointer!"
    >
      <SaveIcon />
      Save
    </Button>
  )
}
