import { Position } from '@xyflow/react'

export function getCustomPath({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
}) {
  const isForward = targetX >= sourceX
  const isAbove = targetY <= sourceY

  // 🔹 FORWARD → Bezier suave
  if (isForward) {
    const curvature = 0.4
    const dx = Math.abs(targetX - sourceX)

    const controlX1 = sourceX + dx * curvature
    const controlY1 = sourceY
    const controlX2 = targetX - dx * curvature
    const controlY2 = targetY

    const labelX = sourceX + (targetX - sourceX) * 0.5
    const labelY = sourceY + (targetY - sourceY) * 0.5

    return [
      `
        M ${sourceX},${sourceY}
        C ${controlX1},${controlY1}
          ${controlX2},${controlY2}
          ${targetX},${targetY}
      `,
      labelX,
      labelY,
    ]
  }

  // 🔹 BACKWARD → step híbrido (n8n-like)
  const offset = 20
  const targetOffset = 15
  const downShift = 80

  let midX = sourceX
  let midY = sourceY

  switch (sourcePosition) {
    case Position.Right:
      midX = sourceX + offset
      break
    case Position.Left:
      midX = sourceX - offset
      break
    case Position.Bottom:
      midY = sourceY + offset
      break
    case Position.Top:
      midY = sourceY - offset
      break
  }

  const bendY = isAbove
    ? Math.max(sourceY, targetY) + downShift
    : Math.min(sourceY, targetY) + downShift

  const preTargetX = targetX - targetOffset

  const labelX = midX + (preTargetX - midX) * 0.5
  const labelY = bendY

  const radius = 6

  const dirX = Math.sign(preTargetX - midX) || 1
  const dirY = Math.sign(bendY - midY) || 1
  const dirToBend = Math.sign(bendY - midY) || 1
  const dirToTarget = Math.sign(targetY - bendY) || dirToBend
  const dirAfterBend = Math.sign(targetY - bendY) || 1

  return [
    `
      M ${sourceX},${sourceY}

      L ${midX - radius},${midY}
      Q ${midX},${midY} ${midX},${midY + dirY * radius}

      L ${midX},${bendY - dirY * radius}
      Q ${midX},${bendY} ${midX + dirX * radius},${bendY}

      L ${preTargetX + radius},${bendY}
      Q ${preTargetX},${bendY} ${preTargetX},${bendY + dirAfterBend * radius}

      L ${preTargetX},${targetY - dirToTarget * radius}
      Q ${preTargetX},${targetY} ${preTargetX + radius},${targetY}

      L ${targetX},${targetY}
    `,
    labelX,
    labelY,
  ]
}
