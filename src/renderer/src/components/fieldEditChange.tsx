import { CardTitle } from '@renderer/components/ui/card'
import { Input } from '@renderer/components/ui/input'
import { makeUniqueName } from '@renderer/utils/uniqueName'
import { useReactFlow } from '@xyflow/react'
import { EditIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

type Props = {
  id: string
}

export function FieldEditChange({ id }: Props) {
  const { getNodes, setNodes } = useReactFlow()
  const nodes = getNodes()
  const nodeFromReactFlow = nodes.find((n) => n.id === id)
  const nodeName = nodeFromReactFlow?.data.name as string

  const [name, setName] = useState(nodeName || '')
  const [isEditing, setIsEditing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSave = async () => {
    if (name === nodeName) {
      setIsEditing(false)
      return
    }

    const existingNames = new Set(
      nodes.map((n) => (typeof n.data?.name === 'string' ? n.data!.name : ''))
    )
    const uniqueName = makeUniqueName(name, existingNames)

    const updatedNodes = nodes.map((n) =>
      n.id === id ? { ...n, data: { ...n.data, name: uniqueName } } : n
    )

    setNodes(() => updatedNodes)
    setName(uniqueName)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    }

    if (e.key === 'Escape') {
      setName(nodeName)
      setIsEditing(false)
    }
  }

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        // disabled={updateName.isPending}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleSave}
        className="h-8 w-auto min-w-[300px] px-2 leading-tight text-md bg-input/90!"
      />
    )
  }

  return (
    <div className=" flex gap-2 items-center">
      <CardTitle
        className="cursor-pointer hover:text-foreground! hover:bg-input/90! leading-tight py-1 w-fit px-1 rounded-md"
        onClick={() => setIsEditing(true)}
      >
        {name}
      </CardTitle>
      <EditIcon className="size-4" />
    </div>
  )
}
