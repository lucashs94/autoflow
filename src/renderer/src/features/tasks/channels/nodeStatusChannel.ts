import { NodeStatus } from '@renderer/components/reactFlow/node-status-indicator'
import { useEffect, useState } from 'react'

export type NodeProgress = {
  current: number
  total: number
}

type StatusEventDetail = {
  nodeId: string
  status: NodeStatus
  progress?: NodeProgress
}

const emitter = new EventTarget()

export function publishStatus(update: StatusEventDetail) {
  emitter.dispatchEvent(
    new CustomEvent<StatusEventDetail>('node-status', { detail: update })
  )
}

export function subscribeNodeStatus(
  listener: (update: StatusEventDetail) => void
) {
  const handler = (event: Event) =>
    listener((event as CustomEvent<StatusEventDetail>).detail)

  emitter.addEventListener('node-status', handler as EventListener)

  return () =>
    emitter.removeEventListener('node-status', handler as EventListener)
}

export function useNodeStatus(params: {
  nodeId: string
  initialStatus?: NodeStatus
}) {
  const { nodeId, initialStatus = 'initial' } = params
  const [status, setStatus] = useState<NodeStatus>(initialStatus)
  const [progress, setProgress] = useState<NodeProgress | undefined>(undefined)

  useEffect(() => {
    const unsubscribe = subscribeNodeStatus((u) => {
      if (u.nodeId === nodeId) {
        setStatus(u.status)
        setProgress(u.progress)
      }
    })
    return unsubscribe
  }, [nodeId])

  return { status, progress }
}
