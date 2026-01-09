import { Button } from '@renderer/components/ui/button'
import { Card, CardTitle } from '@renderer/components/ui/card'
import { Input } from '@renderer/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@renderer/components/ui/select'
import { Switch } from '@renderer/components/ui/switch'
import { FormLabel } from '@renderer/components/ui/form'
import {
  AttributeOperator,
  ElementFilter,
  FilterType,
  PositionOperator,
  TextOperator,
  validateFilter,
} from '@renderer/features/tasks/types/filters'
import { PlusIcon, TrashIcon } from 'lucide-react'
import { useState } from 'react'

interface FilterBuilderProps {
  filters: ElementFilter[]
  onChange: (filters: ElementFilter[]) => void
  enabled: boolean
  onEnabledChange: (enabled: boolean) => void
}

export function FilterBuilder({
  filters,
  onChange,
  enabled,
  onEnabledChange,
}: FilterBuilderProps) {
  const [newFilterType, setNewFilterType] = useState<FilterType>(FilterType.TEXT)
  const [newTextOperator, setNewTextOperator] = useState<TextOperator>(TextOperator.CONTAINS)
  const [newTextValue, setNewTextValue] = useState('')
  const [newPositionOperator, setNewPositionOperator] = useState<PositionOperator>(
    PositionOperator.FIRST
  )
  const [newPositionValue, setNewPositionValue] = useState<number>(0)
  const [newAttributeName, setNewAttributeName] = useState('')
  const [newAttributeOperator, setNewAttributeOperator] = useState<AttributeOperator>(
    AttributeOperator.EQUALS
  )
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
        value: newPositionOperator === PositionOperator.NTH ? newPositionValue : undefined,
      }
    } else {
      // ATTRIBUTE
      newFilter = {
        type: FilterType.ATTRIBUTE,
        attributeName: newAttributeName,
        operator: newAttributeOperator,
        value:
          newAttributeOperator !== AttributeOperator.EXISTS ? newAttributeValue : undefined,
      }
    }

    const validation = validateFilter(newFilter)
    if (!validation.valid) {
      setError(validation.error || 'Invalid filter')
      return
    }

    onChange([...filters, newFilter])
    resetForm()
  }

  const handleRemoveFilter = (index: number) => {
    onChange(filters.filter((_, i) => i !== index))
  }

  const getFilterLabel = (filter: ElementFilter): string => {
    if (filter.type === FilterType.TEXT) {
      return `Text ${filter.operator.toLowerCase()} "${filter.value}"`
    }
    if (filter.type === FilterType.POSITION) {
      return `Position ${filter.operator.toLowerCase()}${filter.value !== undefined ? ` (${filter.value})` : ''}`
    }
    if (filter.type === FilterType.ATTRIBUTE) {
      const valueStr = filter.value ? ` "${filter.value}"` : ''
      return `[${filter.attributeName}] ${filter.operator.toLowerCase()}${valueStr}`
    }
    return 'Unknown filter'
  }

  return (
    <Card className="py-4">
      <div className="flex items-center justify-between px-4">
        <CardTitle className="text-sm">Advanced filters</CardTitle>
        <Switch
          checked={enabled}
          onCheckedChange={onEnabledChange}
        />
      </div>

      {enabled && (
        <div className="px-4 space-y-4 mt-4">
          {/* Display existing filters */}
          {filters.length > 0 && (
            <div className="space-y-2">
              {filters.map((filter, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-2 p-2 bg-muted/50 rounded text-sm"
                >
                  <span>{getFilterLabel(filter)}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    type="button"
                    onClick={() => handleRemoveFilter(index)}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Add new filter form */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="flex flex-col gap-2">
                <FormLabel>Type</FormLabel>
                <Select
                  value={newFilterType}
                  onValueChange={(value) => setNewFilterType(value as FilterType)}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={FilterType.TEXT}>Text</SelectItem>
                    <SelectItem value={FilterType.POSITION}>Position</SelectItem>
                    <SelectItem value={FilterType.ATTRIBUTE}>Attribute</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Text Filter Fields */}
              {newFilterType === FilterType.TEXT && (
                <>
                  <div className="flex flex-col gap-2">
                    <FormLabel>Operator</FormLabel>
                    <Select
                      value={newTextOperator}
                      onValueChange={(value) => setNewTextOperator(value as TextOperator)}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={TextOperator.CONTAINS}>Contains</SelectItem>
                        <SelectItem value={TextOperator.EQUALS}>Equals</SelectItem>
                        <SelectItem value={TextOperator.STARTS_WITH}>Starts with</SelectItem>
                        <SelectItem value={TextOperator.ENDS_WITH}>Ends with</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2 flex-1">
                    <FormLabel>Value</FormLabel>
                    <Input
                      placeholder="text value"
                      value={newTextValue}
                      onChange={(e) => setNewTextValue(e.target.value)}
                      className="bg-input/90"
                    />
                  </div>
                </>
              )}

              {/* Position Filter Fields */}
              {newFilterType === FilterType.POSITION && (
                <>
                  <div className="flex flex-col gap-2">
                    <FormLabel>Operator</FormLabel>
                    <Select
                      value={newPositionOperator}
                      onValueChange={(value) => {
                        setNewPositionOperator(value as PositionOperator)
                      }}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={PositionOperator.FIRST}>First</SelectItem>
                        <SelectItem value={PositionOperator.LAST}>Last</SelectItem>
                        <SelectItem value={PositionOperator.NTH}>Nth</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {newPositionOperator === PositionOperator.NTH && (
                    <div className="flex flex-col gap-2 flex-1">
                      <FormLabel>Index</FormLabel>
                      <Input
                        type="number"
                        placeholder="0"
                        min={0}
                        value={newPositionValue}
                        onChange={(e) => setNewPositionValue(Number(e.target.value))}
                        className="bg-input/90"
                      />
                    </div>
                  )}
                </>
              )}

              {/* Attribute Filter Fields */}
              {newFilterType === FilterType.ATTRIBUTE && (
                <>
                  <div className="flex flex-col gap-2 flex-1">
                    <FormLabel>Attribute</FormLabel>
                    <Input
                      placeholder="data-testid"
                      value={newAttributeName}
                      onChange={(e) => setNewAttributeName(e.target.value)}
                      className="bg-input/90"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <FormLabel>Operator</FormLabel>
                    <Select
                      value={newAttributeOperator}
                      onValueChange={(value) => {
                        setNewAttributeOperator(value as AttributeOperator)
                      }}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={AttributeOperator.EQUALS}>Equals</SelectItem>
                        <SelectItem value={AttributeOperator.CONTAINS}>Contains</SelectItem>
                        <SelectItem value={AttributeOperator.EXISTS}>Exists</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {newAttributeOperator !== AttributeOperator.EXISTS && (
                    <div className="flex flex-col gap-2 flex-1">
                      <FormLabel>Value</FormLabel>
                      <Input
                        placeholder="value"
                        value={newAttributeValue}
                        onChange={(e) => setNewAttributeValue(e.target.value)}
                        className="bg-input/90"
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={handleAddFilter}
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add filter
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}
