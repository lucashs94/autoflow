const MIN_NODE_TIME = 500 // ms

export async function verifyMinimunNodeExecutionTime(start: number) {
  const end = performance.now()
  const duration = end - start

  if (duration < MIN_NODE_TIME) {
    await new Promise((resolve) =>
      setTimeout(resolve, MIN_NODE_TIME - duration)
    )
  }
}
