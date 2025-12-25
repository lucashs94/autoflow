import { ConnectionLineComponentProps, useConnection } from '@xyflow/react'
import { getCustomPath } from './getCustomPath'

export function ConnectionLineCustom({
  fromX,
  fromY,
  toX,
  toY,
}: ConnectionLineComponentProps) {
  const { fromHandle } = useConnection()

  const [path] = getCustomPath({
    sourceX: fromX,
    sourceY: fromY,
    targetX: toX,
    targetY: toY,
    sourcePosition: fromHandle?.position,
  })

  return (
    <path
      d={path}
      fill="none"
      stroke="#999"
      strokeWidth={1}
      className="animated"
    />
  )
}
