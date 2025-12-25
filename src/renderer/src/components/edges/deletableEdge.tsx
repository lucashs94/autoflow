import { Button } from '@renderer/components/ui/button'
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
  useReactFlow,
} from '@xyflow/react'
import { TrashIcon } from 'lucide-react'
import { getCustomPath } from './getCustomPath'

export function DeletableEdge(props: EdgeProps) {
  const isForward = props.targetX > props.sourceX

  const { setEdges } = useReactFlow()

  const [path, labelX, labelY] = isForward
    ? getBezierPath(props)
    : getCustomPath(props)

  return (
    <>
      <svg style={{ height: 0 }}>
        <defs>
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="5"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path
              d="M 0 0 L 10 5 L 0 10 z"
              fill="#999"
            />
          </marker>
        </defs>
      </svg>

      <BaseEdge
        path={path}
        markerEnd="url(#arrow)"
        className={props.selected ? 'animated' : ''}
        style={{
          vectorEffect: 'non-scaling-stroke',
          strokeWidth: 1,
          strokeDasharray: props.selected ? '3 3' : '0',
          stroke: props.selected ? '#006239' : props.style?.stroke,
          animation: props.selected
            ? 'edge-dash 6s linear infinite'
            : undefined,
          filter: props.selected ? 'drop-shadow(0 0 3px #4ade80)' : undefined,
        }}
      />

      {props.selected && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -20%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'all',
            }}
          >
            <Button
              size={'icon'}
              className="bg-accent hover:bg-accent/70 size-3 cursor-pointer rounded-full text-destructive hover:text-destructive border-destructive text-xs leading-none"
              onClick={() => {
                setEdges((eds) => eds.filter((e) => e.id !== props.id))
              }}
            >
              <TrashIcon className="size-1.5" />
            </Button>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}
