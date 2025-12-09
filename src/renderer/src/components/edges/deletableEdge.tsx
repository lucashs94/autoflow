import { Button } from '@renderer/components/ui/button'
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
  useReactFlow,
} from '@xyflow/react'
import { TrashIcon } from 'lucide-react'

export function DeletableEdge(props: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath(props)
  const { setEdges } = useReactFlow()

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={props.markerEnd}
        style={{
          vectorEffect: 'non-scaling-stroke',
          strokeWidth: 1,
          strokeDasharray: props.selected ? '3 3' : '0',
          stroke: props.selected ? '#006239' : props.style?.stroke,
          animation: props.selected ? 'edge-dash 3s linear infinite' : undefined,
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
              <TrashIcon className='size-1.5'/>
            </Button>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}
