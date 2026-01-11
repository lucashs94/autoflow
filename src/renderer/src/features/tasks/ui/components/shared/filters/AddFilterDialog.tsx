import { Button } from '@renderer/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@renderer/components/ui/dialog'
import { FormLabel } from '@renderer/components/ui/form'
import { Input } from '@renderer/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@renderer/components/ui/select'
import {
  AttributeOperator,
  ElementFilter,
  FilterType,
  PositionOperator,
  TextOperator,
  validateFilter,
} from '@renderer/features/tasks/types/filters'
import { PlusIcon } from 'lucide-react'
import { useState } from 'react'

interface AddFilterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddFilter: (filter: ElementFilter) => void
}

export function AddFilterDialog({
  open,
  onOpenChange,
  onAddFilter,
}: AddFilterDialogProps) {
  const [newFilterType, setNewFilterType] = useState<FilterType>(
    FilterType.TEXT
  )
  const [newTextOperator, setNewTextOperator] = useState<TextOperator>(
    TextOperator.CONTAINS
  )
  const [newTextValue, setNewTextValue] = useState('')
  const [newPositionOperator, setNewPositionOperator] =
    useState<PositionOperator>(PositionOperator.FIRST)
  const [newPositionValue, setNewPositionValue] = useState<number>(0)
  const [newAttributeName, setNewAttributeName] = useState('')
  const [newAttributeOperator, setNewAttributeOperator] =
    useState<AttributeOperator>(AttributeOperator.EQUALS)
  const [newAttributeValue, setNewAttributeValue] = useState('')
  const [error, setError] = useState<string>('')

  const resetForm = () => {
    setNewFilterType(FilterType.TEXT)
    setNewTextOperator(TextOperator.CONTAINS)
    setNewTextValue('')
    setNewPositionOperator(PositionOperator.FIRST)
    setNewPositionValue(0)
    setNewAttributeName('')
    setNewAttributeOperator(AttributeOperator.EQUALS)
    setNewAttributeValue('')
    setError('')
  }

  const handleAddFilter = () => {
    let newFilter: ElementFilter

    if (newFilterType === FilterType.TEXT) {
      newFilter = {
        type: FilterType.TEXT,
        operator: newTextOperator,
        value: newTextValue,
      }
    } else if (newFilterType === FilterType.POSITION) {
      newFilter = {
        type: FilterType.POSITION,
        operator: newPositionOperator,
        value:
          newPositionOperator === PositionOperator.NTH
            ? newPositionValue
            : undefined,
      }
    } else {
      // ATTRIBUTE
      newFilter = {
        type: FilterType.ATTRIBUTE,
        attributeName: newAttributeName,
        operator: newAttributeOperator,
        value:
          newAttributeOperator !== AttributeOperator.EXISTS
            ? newAttributeValue
            : undefined,
      }
    }

    const validation = validateFilter(newFilter)
    if (!validation.valid) {
      setError(validation.error || 'Invalid filter')
      return
    }

    onAddFilter(newFilter)
    resetForm()
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="bg-muted max-h-[80vh] overflow-y-auto scrollbar max-w-sm!">
        <DialogHeader>
          <DialogTitle>Add New Filter</DialogTitle>
          <DialogDescription>
            Configure a filter to refine element selection
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Filter Type Selection */}
          <div className="space-y-2">
            <FormLabel className="text-sm">Filter Type</FormLabel>
            <Select
              value={newFilterType}
              onValueChange={(value) => {
                setNewFilterType(value as FilterType)
                setError('')
              }}
            >
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-w-[calc(100vw-2rem)]">
                <SelectItem
                  value={FilterType.TEXT}
                  className="py-2.5 pl-3"
                >
                  Text Content
                </SelectItem>
                <SelectItem
                  value={FilterType.POSITION}
                  className="py-2.5 pl-3"
                >
                  Element Position
                </SelectItem>
                <SelectItem
                  value={FilterType.ATTRIBUTE}
                  className="py-2.5 pl-3"
                >
                  HTML Attribute
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Text Filter Fields */}
          {newFilterType === FilterType.TEXT && (
            <div className="space-y-4">
              <div className="space-y-2">
                <FormLabel className="text-sm">Match Operator</FormLabel>
                <Select
                  value={newTextOperator}
                  onValueChange={(value) =>
                    setNewTextOperator(value as TextOperator)
                  }
                >
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-w-[calc(100vw-2rem)]">
                    <SelectItem
                      value={TextOperator.CONTAINS}
                      className="py-2.5 pl-3"
                    >
                      Contains
                    </SelectItem>
                    <SelectItem
                      value={TextOperator.EQUALS}
                      className="py-2.5 pl-3"
                    >
                      Equals
                    </SelectItem>
                    <SelectItem
                      value={TextOperator.STARTS_WITH}
                      className="py-2.5 pl-3"
                    >
                      Starts With
                    </SelectItem>
                    <SelectItem
                      value={TextOperator.ENDS_WITH}
                      className="py-2.5 pl-3"
                    >
                      Ends With
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <FormLabel className="text-sm">Text Value</FormLabel>
                <Input
                  placeholder="Enter text to match"
                  value={newTextValue}
                  onChange={(e) => setNewTextValue(e.target.value)}
                  className="h-11 bg-input/90"
                />
              </div>
            </div>
          )}

          {/* Position Filter Fields */}
          {newFilterType === FilterType.POSITION && (
            <div className="space-y-4">
              <div className="space-y-2">
                <FormLabel className="text-sm">Position Type</FormLabel>
                <Select
                  value={newPositionOperator}
                  onValueChange={(value) => {
                    setNewPositionOperator(value as PositionOperator)
                  }}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-w-[calc(100vw-2rem)]">
                    <SelectItem
                      value={PositionOperator.FIRST}
                      className="py-2.5 pl-3"
                    >
                      First Element
                    </SelectItem>
                    <SelectItem
                      value={PositionOperator.LAST}
                      className="py-2.5 pl-3"
                    >
                      Last Element
                    </SelectItem>
                    <SelectItem
                      value={PositionOperator.NTH}
                      className="py-2.5 pl-3"
                    >
                      Nth Element
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {newPositionOperator === PositionOperator.NTH && (
                <div className="space-y-2">
                  <FormLabel className="text-sm">
                    Element Index (0-based)
                  </FormLabel>
                  <Input
                    type="number"
                    placeholder="0"
                    min={0}
                    value={newPositionValue}
                    onChange={(e) =>
                      setNewPositionValue(Number(e.target.value))
                    }
                    className="h-11 bg-input/90"
                  />
                </div>
              )}
            </div>
          )}

          {/* Attribute Filter Fields */}
          {newFilterType === FilterType.ATTRIBUTE && (
            <div className="space-y-4">
              <div className="space-y-2">
                <FormLabel className="text-sm">Attribute Name</FormLabel>
                <Input
                  placeholder="e.g., data-testid, aria-label, class"
                  value={newAttributeName}
                  onChange={(e) => setNewAttributeName(e.target.value)}
                  className="h-11 bg-input/90"
                />
              </div>
              <div className="space-y-2">
                <FormLabel className="text-sm">Match Operator</FormLabel>
                <Select
                  value={newAttributeOperator}
                  onValueChange={(value) => {
                    setNewAttributeOperator(value as AttributeOperator)
                  }}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-w-[calc(100vw-2rem)]">
                    <SelectItem
                      value={AttributeOperator.EQUALS}
                      className="py-2.5 pl-3"
                    >
                      Equals
                    </SelectItem>
                    <SelectItem
                      value={AttributeOperator.CONTAINS}
                      className="py-2.5 pl-3"
                    >
                      Contains
                    </SelectItem>
                    <SelectItem
                      value={AttributeOperator.EXISTS}
                      className="py-2.5 pl-3"
                    >
                      Exists
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {newAttributeOperator !== AttributeOperator.EXISTS && (
                <div className="space-y-2">
                  <FormLabel className="text-sm">Attribute Value</FormLabel>
                  <Input
                    placeholder="Enter attribute value"
                    value={newAttributeValue}
                    onChange={(e) => setNewAttributeValue(e.target.value)}
                    className="h-11 bg-input/90"
                  />
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={handleAddFilter}
            className="gap-2"
          >
            <PlusIcon className="size-4" />
            Add Filter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
