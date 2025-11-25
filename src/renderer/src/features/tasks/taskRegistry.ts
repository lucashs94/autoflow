import { NodeType } from '@renderer/types/nodes'
import { httpRequestTask } from './ui/components/httpRequest'
import { navigationTask } from './ui/components/navigation'

export const TaskRegistry = {
  [NodeType.HTTP_REQUEST]: httpRequestTask,
  [NodeType.NAVIGATION]: navigationTask,
}
