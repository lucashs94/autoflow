import { navigationExecutor } from './executor'
import { NavigationNode } from './node'

export const navigationTask = {
  node: NavigationNode,
  executor: navigationExecutor,
}
