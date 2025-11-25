import { NodeToolbar, Position, useStore } from '@xyflow/react'
import { SettingsIcon, TrashIcon } from 'lucide-react'
import { Button } from '../ui/button'

interface WorkflowNodeProps {
  children: React.ReactNode
  showToolbar?: boolean
  onDelete?: () => void
  onSettings?: () => void
  name?: string
  description?: string
}

export function WorkflowNode({
  children,
  showToolbar = true,
  onDelete,
  onSettings,
  name,
  description,
}: WorkflowNodeProps) {
  const zoom = useStore((s) => s.transform[2])

  return (
    <>
      {showToolbar && (
        <NodeToolbar>
          <Button
            size={'sm'}
            variant={'ghost'}
            onClick={onSettings}
          >
            <SettingsIcon className="size-4" />
          </Button>

          <Button
            size={'sm'}
            variant={'ghost'}
            onClick={onDelete}
          >
            <TrashIcon className="size-4" />
          </Button>
        </NodeToolbar>
      )}

      {children}

      {name && (
        <NodeToolbar
          position={Position.Bottom}
          isVisible
          className="max-w-[200px] text-center"
        >
          <div
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top center',
            }}
            className="max-w-[100px]"
          >
            <p className="font-medium text-[8px]">{name}</p>

            {description && (
              <p className="text-muted-foreground truncate text-[7px]">
                {description}
              </p>
            )}
          </div>
        </NodeToolbar>
      )}
    </>
  )
}
