import { clickElementExecutor } from './executor'
import { ClickElementNode } from './node'

export const clickElementTask = {
  node: ClickElementNode,
  executor: clickElementExecutor,
}
