import { Button } from '@renderer/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card'
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
import { PlusIcon, XIcon, FilterIcon } from 'lucide-react'
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
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FilterIcon className="w-4 h-4 text-muted-foreground" />
            <CardTitle className="text-base">Advanced Filters</CardTitle>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={onEnabledChange}
          />
        </div>
        {enabled && (
          <p className="text-sm text-muted-foreground mt-2">
            Refine element selection with multiple criteria
          </p>
        )}
      </CardHeader>

      {enabled && (
        <CardContent className="space-y-6">
          {/* Display existing filters */}
          {filters.length > 0 && (
            <div className="space-y-3">
              <FormLabel className="text-xs text-muted-foreground uppercase tracking-wider">
                Active Filters (Applied in Order)
              </FormLabel>
              <div className="space-y-2">
                {filters.map((filter, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center gap-3 p-3 bg-secondary/50 border border-border rounded-lg">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 text-sm font-medium">
                        {getFilterLabel(filter)}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFilter(index)}
                        className="shrink-0 p-1 hover:bg-destructive/10 rounded transition-colors"
                      >
                        <XIcon className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
                    {index < filters.length - 1 && (
                      <div className="flex items-center justify-center">
                        <div className="px-3 py-1 bg-muted rounded-full text-xs font-semibold text-muted-foreground">
                          AND
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add new filter form */}
          <div className="space-y-4">
            <FormLabel className="text-xs text-muted-foreground uppercase tracking-wider">
              Add New Filter
            </FormLabel>

            {/* Filter Type Selection */}
            <div className="space-y-2">
              <FormLabel className="text-sm">Filter Type</FormLabel>
              <Select
                value={newFilterType}
                onValueChange={(value) => setNewFilterType(value as FilterType)}
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={FilterType.TEXT}>Text Content</SelectItem>
                  <SelectItem value={FilterType.POSITION}>Element Position</SelectItem>
                  <SelectItem value={FilterType.ATTRIBUTE}>HTML Attribute</SelectItem>
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
                    onValueChange={(value) => setNewTextOperator(value as TextOperator)}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={TextOperator.CONTAINS}>Contains</SelectItem>
                      <SelectItem value={TextOperator.EQUALS}>Equals</SelectItem>
                      <SelectItem value={TextOperator.STARTS_WITH}>Starts With</SelectItem>
                      <SelectItem value={TextOperator.ENDS_WITH}>Ends With</SelectItem>
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
                    <SelectContent>
                      <SelectItem value={PositionOperator.FIRST}>First Element</SelectItem>
                      <SelectItem value={PositionOperator.LAST}>Last Element</SelectItem>
                      <SelectItem value={PositionOperator.NTH}>Nth Element</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {newPositionOperator === PositionOperator.NTH && (
                  <div className="space-y-2">
                    <FormLabel className="text-sm">Element Index (0-based)</FormLabel>
                    <Input
                      type="number"
                      placeholder="0"
                      min={0}
                      value={newPositionValue}
                      onChange={(e) => setNewPositionValue(Number(e.target.value))}
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
                    <SelectContent>
                      <SelectItem value={AttributeOperator.EQUALS}>Equals</SelectItem>
                      <SelectItem value={AttributeOperator.CONTAINS}>Contains</SelectItem>
                      <SelectItem value={AttributeOperator.EXISTS}>Exists</SelectItem>
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

            <Button
              variant="default"
              size="lg"
              type="button"
              onClick={handleAddFilter}
              className="w-full"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Filter
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
