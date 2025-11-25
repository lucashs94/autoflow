import { CardTitle } from '@renderer/components/ui/card'
import { Input } from '@renderer/components/ui/input'
import {
  useNode,
  useUpdateNodeName,
} from '@renderer/features/tasks/hooks/useNodes'
import { makeUniqueName } from '@renderer/utils/uniqueName'
import { useReactFlow } from '@xyflow/react'
import { useEffect, useRef, useState } from 'react'

type Props = {
  id: string
}

export function FieldEditChange({ id }: Props) {
  const { getNodes, setNodes } = useReactFlow()
  const nodes = getNodes()

  const nameFromReactFlow = nodes.find((n) => n.id === id)?.data.name

  const { data: node } = useNode(id)

  const [name, setName] = useState(node?.data?.name ?? nameFromReactFlow ?? '')
  const [isEditing, setIsEditing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const updateName = useUpdateNodeName()

  const handleSave = async () => {
    if (!node) return

    if (name === node.data.name) {
      setIsEditing(false)
      return
    }

    const existingNames = new Set(
      nodes.map((n) => (typeof n.data?.name === 'string' ? n.data!.name : ''))
    )
    const uniqueName = makeUniqueName(name, existingNames)

    updateName.mutate(
      { nodeId: node.id, name: uniqueName },
      {
        onSuccess: () => {
          setName(name)

          setNodes((prevNodes) => {
            const updatedNode = node
            updatedNode.data.name = name

            return [...prevNodes, updatedNode]
          })
        },
        onError: () => {
          setName(node.data.name)
        },
      }
    )

    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    }

    if (e.key === 'Escape') {
      setName(node.data.name)
      setIsEditing(false)
    }
  }

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  useEffect(() => {
    if (node) setName(node.data.name || '')
  }, [node?.data.name])

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        disabled={updateName.isPending}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleSave}
        className="h-8 w-auto min-w-[300px] px-2 leading-tight text-md bg-input/90!"
      />
    )
  }

  return (
    <CardTitle
      className="cursor-pointer hover:text-foreground! hover:bg-input/90! leading-tight py-1 w-fit px-1 rounded-md"
      onClick={() => setIsEditing(true)}
    >
      {name}
    </CardTitle>
  )
}
