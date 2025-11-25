import { NodeType } from '@renderer/types/nodes'
import { httpRequestTask } from '../ui/components/httpRequest'
import { navigationTask } from '../ui/components/navigation'
import { waitForElementTask } from '../ui/components/waitForElement'

export const TaskRegistry = {
  [NodeType.HTTP_REQUEST]: httpRequestTask,
  [NodeType.NAVIGATION]: navigationTask,
  [NodeType.WAIT_FOR_ELEMENT]: waitForElementTask,
}
