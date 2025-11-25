import { NodeType } from '@renderer/types/nodes'
import { clickElementTask } from '../ui/components/clickElement'
import { httpRequestTask } from '../ui/components/httpRequest'
import { navigationTask } from '../ui/components/navigation'
import { typeTextTask } from '../ui/components/typeText'
import { waitForElementTask } from '../ui/components/waitForElement'

export const TaskRegistry = {
  [NodeType.HTTP_REQUEST]: httpRequestTask,
  [NodeType.NAVIGATION]: navigationTask,
  [NodeType.WAIT_FOR_ELEMENT]: waitForElementTask,
  [NodeType.TYPE_TEXT]: typeTextTask,
  [NodeType.CLICK_ELEMENT]: clickElementTask,
}
