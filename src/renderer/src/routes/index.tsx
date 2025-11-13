import { Navigate, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    return {
      to: '/workflows',
      replace: true,
    }
  },
  component: () => <Navigate to="/workflows" />,
})
