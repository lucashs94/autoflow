import { createId } from '@paralleldrive/cuid2'
import { NodeType } from '@renderer/types/nodes'
import { makeUniqueName } from '@renderer/utils/uniqueName'
import { useReactFlow } from '@xyflow/react'
import {
  BracesIcon,
  ChromiumIcon,
  GlobeIcon,
  HourglassIcon,
  MousePointerIcon,
  RepeatIcon,
  TimerResetIcon,
  TypeIcon,
} from 'lucide-react'
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

const integrationNodes: NodeTypeOption[] = [
  {
    type: NodeType.HTTP_REQUEST,
    label: 'HTTP Request',
    description: 'Make an HTTP request',
    icon: GlobeIcon,
  },
]

const navigationNodes: NodeTypeOption[] = [
  {
    type: NodeType.NAVIGATION,
    label: 'Navigate to URL',
    description: 'Go to page based on URL',
    icon: ChromiumIcon,
  },
  {
    type: NodeType.WAIT_FOR_ELEMENT,
    label: 'Wait for Element',
    description: 'Wait for element to be visible or hidden',
    icon: HourglassIcon,
  },
  {
    type: NodeType.WAIT_TIME,
    label: 'Wait Time',
    description: 'Wait for a specified time',
    icon: TimerResetIcon,
  },
]

const interactionsNodes: NodeTypeOption[] = [
  {
    type: NodeType.TYPE_TEXT,
    label: 'Type Text',
    description: 'Type text into an input field',
    icon: TypeIcon,
  },
  {
    type: NodeType.CLICK_ELEMENT,
    label: 'Click Element',
    description: 'Click on an element',
    icon: MousePointerIcon,
  },
]

const contextNodes: NodeTypeOption[] = [
  {
    type: NodeType.SET_VARIABLES,
    label: 'Set Variables',
    description: 'Set variables in the flow',
    icon: BracesIcon,
  },
]

const logicNodes: NodeTypeOption[] = [
  {
    type: NodeType.LOOP,
    label: 'Loop',
    description: 'Repeat a set of actions',
    icon: RepeatIcon,
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
        className="w-full md:max-w-md overflow-y-auto bg-muted! pb-4!"
      >
        <SheetHeader className="pb-0">
          <SheetTitle className="text-xl">Select a node</SheetTitle>

          <SheetDescription>
            Choose the node you want to add to the flow
          </SheetDescription>
        </SheetHeader>

        <div>
          <Separator />

          {navigationNodes.length > 0 && (
            <p className="mt-2 px-2 text-primary">Navigation</p>
          )}

          {navigationNodes.length > 0 &&
            navigationNodes.map((nodeType) => {
              const Icon = nodeType.icon

              return (
                <div
                  key={nodeType.type}
                  className="w-full justify-start h-auto py-2 px-4 rounded-none 
                cursor-pointer border-l-2 border-transparent hover:border-l-primary mt-2"
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

          {contextNodes.length > 0 && (
            <p className="mt-2 px-2  text-primary">Context</p>
          )}

          {contextNodes.length > 0 &&
            contextNodes.map((nodeType) => {
              const Icon = nodeType.icon

              return (
                <div
                  key={nodeType.type}
                  className="w-full justify-start h-auto py-2 px-4 rounded-none 
                cursor-pointer border-l-2 border-transparent hover:border-l-primary mt-2"
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

          {logicNodes.length > 0 && (
            <p className="mt-2 px-2  text-primary">Logic</p>
          )}

          {logicNodes.length > 0 &&
            logicNodes.map((nodeType) => {
              const Icon = nodeType.icon

              return (
                <div
                  key={nodeType.type}
                  className="w-full justify-start h-auto py-2 px-4 rounded-none 
                cursor-pointer border-l-2 border-transparent hover:border-l-primary mt-2"
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

          {interactionsNodes.length > 0 && (
            <p className="mt-2 px-2  text-primary">Web interactions</p>
          )}

          {interactionsNodes.length > 0 &&
            interactionsNodes.map((nodeType) => {
              const Icon = nodeType.icon

              return (
                <div
                  key={nodeType.type}
                  className="w-full justify-start h-auto py-2 px-4 rounded-none 
                cursor-pointer border-l-2 border-transparent hover:border-l-primary mt-2"
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

          {integrationNodes.length > 0 && (
            <p className="mt-2 px-2 text-primary">Integration</p>
          )}

          {integrationNodes.length > 0 &&
            integrationNodes.map((nodeType) => {
              const Icon = nodeType.icon

              return (
                <div
                  key={nodeType.type}
                  className="w-full justify-start h-auto py-2 px-4 rounded-none 
                cursor-pointer border-l-2 border-transparent hover:border-l-primary mt-2"
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
