import { createId } from '@paralleldrive/cuid2'
import { Button } from '@renderer/components/ui/button'
import { DEFAULT_STICKY_NOTE_COLOR } from '@renderer/features/tasks/ui/components/stickyNote/colors'
import { NodeType } from '@renderer/types/nodes'
import { useReactFlow } from '@xyflow/react'
import { StickyNoteIcon } from 'lucide-react'
import { memo, useCallback } from 'react'

export const AddStickyNoteBtn = memo(() => {
  const { setNodes, screenToFlowPosition } = useReactFlow()

  const handleAddStickyNote = useCallback(() => {
    const centerX = window.innerWidth / 2
    const centerY = window.innerHeight / 2

    const flowPosition = screenToFlowPosition({
      x: centerX + (Math.random() - 0.5) * 200,
      y: centerY + (Math.random() - 0.5) * 100,
    })

    const newNode = {
      id: createId(),
      type: NodeType.STICKY_NOTE,
      position: flowPosition,
      data: {
        text: '',
        color: DEFAULT_STICKY_NOTE_COLOR.value,
        borderColor: DEFAULT_STICKY_NOTE_COLOR.border,
      },
      zIndex: -1,
      width: 200,
      height: 150,
      style: { width: 200, height: 150 },
    }

    setNodes((nodes) => [...nodes, newNode])
  }, [setNodes, screenToFlowPosition])

  return (
    <Button
      size="icon"
      variant="outline"
      onClick={handleAddStickyNote}
      title="Add Sticky Note"
      className="bg-accent! border-primary! border-2!"
    >
      <StickyNoteIcon className="size-5 text-primary" />
    </Button>
  )
})

AddStickyNoteBtn.displayName = 'AddStickyNoteBtn'
