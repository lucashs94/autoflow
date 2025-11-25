import { NodeStatus } from '@renderer/components/reactFlow/node-status-indicator'
import { useEffect, useState } from 'react'

type StatusEventDetail = { nodeId: string; status: NodeStatus }

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

  useEffect(() => {
    const unsubscribe = subscribeNodeStatus((u) => {
      if (u.nodeId === nodeId) setStatus(u.status)
    })
    return unsubscribe
  }, [nodeId])

  return status
}
