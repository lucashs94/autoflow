import { dragAndDropExecutor } from './executor'
import { DragAndDropNode } from './node'

export const dragAndDropTask = {
  node: DragAndDropNode,
  executor: dragAndDropExecutor,
}
