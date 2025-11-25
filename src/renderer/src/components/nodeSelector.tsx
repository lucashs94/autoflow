import { createId } from '@paralleldrive/cuid2'
import { NodeType } from '@renderer/types/nodes'
import { makeUniqueName } from '@renderer/utils/uniqueName'
import { useReactFlow } from '@xyflow/react'
import { ChromiumIcon, GlobeIcon } from 'lucide-react'
import { useCallback } from 'react'
import { Separator } from './ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet'

export type NodeTypeOption = {
  type: NodeType
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }> | string
}

const triggerNodes: NodeTypeOption[] = [
  // {
  //   type: NodeType.INITIAL,
  //   label: 'Manual Trigger',
  //   description: 'Trigger the workflow manually clicking a button',
  //   icon: MousePointerIcon,
  // },
]

const executionNodes: NodeTypeOption[] = [
  {
    type: NodeType.HTTP_REQUEST,
    label: 'HTTP Request',
    description: 'Make an HTTP request',
    icon: GlobeIcon,
  },
  {
    type: NodeType.NAVIGATION,
    label: 'Navigate to URL',
    description: 'Go to page based on URL',
    icon: ChromiumIcon,
  },
]

interface NodeSelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

export function NodeSelector({
  open,
  onOpenChange,
  children,
}: NodeSelectorProps) {
  const { setNodes, getNodes, screenToFlowPosition } = useReactFlow()

  const handleNodeSelect = useCallback(
    (selection: NodeTypeOption) => {
      setNodes((nodes) => {
        const centerX = window.innerWidth / 2
        const centerY = window.innerHeight / 2

        const flowPosition = screenToFlowPosition({
          x: centerX + (Math.random() - 0.5) * 800,
          y: centerY + (Math.random() - 0.5) * 100,
        })

        // --- geração de nome padrão único ---
        const baseName = selection.label
        const existingNames = new Set(
          nodes.map((n) =>
            typeof n.data?.name === 'string' ? n.data!.name : ''
          )
        )
        const uniqueName = makeUniqueName(baseName, existingNames)
        // --- fim: geração de nome padrão único ---

        const newNode = {
          id: createId(),
          type: selection.type,
          position: flowPosition,
          data: { name: uniqueName },
        }

        // if (hasInitialTrigger) return [newNode]

        return [...nodes, newNode]
      })

      onOpenChange(false)
    },
    [setNodes, getNodes, onOpenChange, screenToFlowPosition]
  )

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
    >
      <SheetTrigger asChild>{children}</SheetTrigger>

      <SheetContent
        side="right"
        className="w-full sm:max-w-md overflow-y-auto bg-muted!"
      >
        <SheetHeader>
          <SheetTitle>What triggers this workflow?</SheetTitle>

          <SheetDescription>
            A trigger is a step that starts your workflow
          </SheetDescription>
        </SheetHeader>

        <div>
          {triggerNodes.length > 0 && <p>Logic nodes</p>}
          {triggerNodes.length > 0 &&
            triggerNodes.map((nodeType) => {
              const Icon = nodeType.icon

              return (
                <div
                  key={nodeType.type}
                  className="w-full justify-start h-auto py-2 px-4 rounded-none 
                             cursor-pointer border-l-2 border-transparent hover:border-l-primary"
                  onClick={() => handleNodeSelect(nodeType)}
                >
                  <div className="flex items-center gap-6 w-full overflow-hidden">
                    {typeof Icon === 'string' ? (
                      <img
                        src={Icon}
                        alt={nodeType.label}
                        className="size-5 object-contain rounded-sm"
                      />
                    ) : (
                      <Icon className="size-5" />
                    )}

                    <div className="flex flex-col items-start text-left">
                      <span className="font-medium text-sm">
                        {nodeType.label}
                      </span>

                      <span className="text-xs text-muted-foreground">
                        {nodeType.description}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
        </div>

        <div>
          <Separator />

          {executionNodes.length > 0 && (
            <p className="mt-4 px-2">Web interactions nodes</p>
          )}

          {executionNodes.length > 0 &&
            executionNodes.map((nodeType) => {
              const Icon = nodeType.icon

              return (
                <div
                  key={nodeType.type}
                  className="w-full justify-start h-auto py-2 px-4 rounded-none 
                cursor-pointer border-l-2 border-transparent hover:border-l-primary mt-4"
                  onClick={() => handleNodeSelect(nodeType)}
                >
                  <div className="flex items-center gap-6 w-full overflow-hidden">
                    {typeof Icon === 'string' ? (
                      <img
                        src={Icon}
                        alt={nodeType.label}
                        className="size-5 object-contain rounded-sm"
                      />
                    ) : (
                      <Icon className="size-5" />
                    )}

                    <div className="flex flex-col items-start text-left">
                      <span className="font-medium text-sm">
                        {nodeType.label}
                      </span>

                      <span className="text-xs text-muted-foreground">
                        {nodeType.description}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
        </div>
      </SheetContent>
    </Sheet>
  )
}
