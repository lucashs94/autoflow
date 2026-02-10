import { isSuccess } from '@shared/@types/ipc-response'

interface ExportedWorkflow {
  version: string
  exportedAt: string
  workflow: {
    name: string
    description?: string
    settings: {
      headless: boolean
    }
    nodes: Array<{
      id: string
      type: string
      position: { x: number; y: number }
      data: Record<string, unknown>
      width?: number
      height?: number
      zIndex?: number
      style?: Record<string, unknown>
    }>
    edges: Array<{
      id: string
      source: string
      target: string
      sourceHandle?: string
      targetHandle?: string
    }>
  }
}

export async function exportWorkflow(workflowId: string): Promise<void> {
  // Fetch the workflow
  const result = await window.api.workflows.getOne(workflowId)

  if (!isSuccess(result)) {
    throw new Error(`Failed to fetch workflow: ${result.error.message}`)
  }

  const workflow = result.data

  // Build export structure
  const exportData: ExportedWorkflow = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    workflow: {
      name: workflow.name,
      settings: {
        headless: workflow.headless ?? true,
      },
      nodes: workflow.nodes.map((node) => {
        const base = {
          id: node.id,
          type: node.type || 'unknown',
          position: node.position,
          data: node.data as Record<string, unknown>,
        }
        if (node.type === 'STICKY_NOTE') {
          return {
            ...base,
            ...(node.width !== undefined && { width: node.width }),
            ...(node.height !== undefined && { height: node.height }),
            ...(node.zIndex !== undefined && { zIndex: node.zIndex }),
            ...(node.style && { style: node.style as Record<string, unknown> }),
          }
        }
        return base
      }),
      edges: workflow.edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle || undefined,
        targetHandle: edge.targetHandle || undefined,
      })),
    },
  }

  // Create blob and trigger download
  const jsonString = JSON.stringify(exportData, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  // Create download link
  const link = document.createElement('a')
  link.href = url
  link.download = `${sanitizeFilename(workflow.name)}.json`
  document.body.appendChild(link)
  link.click()

  // Cleanup
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9-_\s]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
    .slice(0, 50)
}
