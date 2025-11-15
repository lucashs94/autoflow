'use client'

import { NodeSelector } from '@renderer/components/nodeSelector'
import { Button } from '@renderer/components/ui/button'
import { PlusIcon } from 'lucide-react'
import { memo, useState } from 'react'

export const AddNodeBtn = memo(() => {
  const [open, setOpen] = useState(false)

  return (
    <NodeSelector
      open={open}
      onOpenChange={setOpen}
    >
      <Button
        size={'icon'}
        variant={'outline'}
        className="bg-accent! border-primary! border-2!"
      >
        <PlusIcon className="size-5 text-primary" />
      </Button>
    </NodeSelector>
  )
})

AddNodeBtn.displayName = 'AddNodeBtn'
