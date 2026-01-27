import {
  DEFAULT_STICKY_NOTE_COLOR,
  STICKY_NOTE_COLORS,
} from '@renderer/features/tasks/ui/components/stickyNote/colors'
import { cn } from '@renderer/lib/utils'
import { Node, NodeProps, NodeResizer, useReactFlow } from '@xyflow/react'
import { TrashIcon } from 'lucide-react'
import { memo, useCallback, useRef, useState } from 'react'
import { Separator } from '../ui/separator'

export type StickyNoteData = {
  text?: string
  color?: string
  borderColor?: string
}

type StickyNoteNode = Node<StickyNoteData>

export const StickyNote = memo(
  (props: NodeProps<StickyNoteNode>) => {
    const { setNodes, setEdges } = useReactFlow()
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const [isEditing, setIsEditing] = useState(false)

    const { data, id, selected } = props

    const updateNodeData = useCallback(
      (updates: Partial<StickyNoteData>) => {
        setNodes((nodes) =>
          nodes.map((node) => {
            if (node.id === id) {
              return {
                ...node,
                data: {
                  ...node.data,
                  ...updates,
                },
              }
            }
            return node
          }),
        )
      },
      [id, setNodes],
    )

    const handleDelete = useCallback(() => {
      setNodes((nodes) => nodes.filter((node) => node.id !== id))
      setEdges((edges) =>
        edges.filter((edge) => edge.source !== id && edge.target !== id),
      )
    }, [id, setNodes, setEdges])

    const handleTextChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        updateNodeData({ text: e.target.value })
      },
      [updateNodeData],
    )

    const handleDoubleClick = useCallback(() => {
      setIsEditing(true)
      setTimeout(() => textareaRef.current?.focus(), 0)
      textareaRef.current?.select()
    }, [])

    const handleTextareaBlur = useCallback(() => {
      setIsEditing(false)
    }, [])

    const bgColor = data.color || DEFAULT_STICKY_NOTE_COLOR.value
    const borderColor = data.borderColor || DEFAULT_STICKY_NOTE_COLOR.border

    return (
      <>
        {/* Resizer - always active */}
        <NodeResizer
          minWidth={150}
          minHeight={80}
          isVisible={true}
          lineClassName="border-transparent! hover:border-foreground/30!"
          handleClassName="opacity-0 hover:opacity-100 bg-foreground/50! w-2! h-2! rounded-sm!"
        />

        {/* Sticky note body */}
        <div
          style={{
            backgroundColor: bgColor,
            borderColor: borderColor,
            borderWidth: selected ? 2 : 1,
            outline: 'none',
          }}
          className={cn(
            'w-full h-full rounded border flex flex-col',
            !isEditing && 'cursor-grab active:cursor-grabbing',
          )}
        >
          {/* Toolbar inside the node - only when selected */}
          {selected && (
            <div
              className="relative flex justify-start items-center gap-1 px-1 py-0.5 border-b nodrag nopan"
              style={{ borderColor: borderColor, pointerEvents: 'all' }}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Delete button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  handleDelete()
                }}
                className="p-0.5 rounded cursor-pointer hover:bg-red-500/30 transition-colors"
                title="Delete"
              >
                <TrashIcon className="size-2.5 text-white/70" />
              </button>

              <Separator
                orientation="vertical"
                className="bg-gray-200/20"
              />

              {/* Color picker */}
              <div className="flex items-center">
                {STICKY_NOTE_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      e.preventDefault()
                      updateNodeData({ color: c.value, borderColor: c.border })
                    }}
                    className={cn(
                      'size-2.5 rounded-sm cursor-pointer mx-px border',
                      'hover:scale-110 transition-transform',
                      bgColor === c.value && 'ring-1 ring-white/50',
                    )}
                    style={{ backgroundColor: c.value, borderColor: c.border }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Text area */}
          <textarea
            ref={textareaRef}
            value={data.text || ''}
            onChange={handleTextChange}
            onBlur={handleTextareaBlur}
            placeholder="Double-click to edit..."
            readOnly={!isEditing}
            onDoubleClick={!isEditing ? handleDoubleClick : undefined}
            className={cn(
              'flex-1 w-full p-1.5 resize-none',
              'bg-transparent border-none outline-none',
              'text-[8px] text-white/70 placeholder:text-white/40 leading-relaxed',
              'pointer-events-auto',
              isEditing ? 'nodrag nopan cursor-text' : 'cursor-grab',
            )}
          />
        </div>
      </>
    )
  },
  (prev, next) => {
    return (
      prev.data === next.data &&
      prev.selected === next.selected &&
      prev.dragging === next.dragging
    )
  },
)

StickyNote.displayName = 'StickyNote'
