import { createFileRoute } from '@tanstack/react-router'
import { HistoryList } from '@renderer/features/history/ui/screens/historyList'

export const Route = createFileRoute('/(main)/history/')({
  component: HistoryList,
})
