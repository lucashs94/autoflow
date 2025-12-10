import { NodeType } from '@renderer/types/nodes'
import { clickElementTask } from '../ui/components/clickElement'
import { httpRequestTask } from '../ui/components/httpRequest'
import { navigationTask } from '../ui/components/navigation'
import { setVariableTask } from '../ui/components/setVariables'
import { typeTextTask } from '../ui/components/typeText'
import { waitForElementTask } from '../ui/components/waitForElement'
import { waitTimeTask } from '../ui/components/waitTime'

export const TaskRegistry = {
  [NodeType.HTTP_REQUEST]: httpRequestTask,
  [NodeType.NAVIGATION]: navigationTask,
  [NodeType.WAIT_FOR_ELEMENT]: waitForElementTask,
  [NodeType.TYPE_TEXT]: typeTextTask,
  [NodeType.CLICK_ELEMENT]: clickElementTask,
  [NodeType.WAIT_TIME]: waitTimeTask,
  [NodeType.SET_VARIABLES]: setVariableTask,
}
