import {
  SelectorType,
  SelectorTypeHelp,
  SelectorTypeLabels,
  SelectorTypePlaceholders,
} from '@renderer/types/selectorTypes'
import { InfoIcon } from 'lucide-react'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { TemplateInput, TemplateInputProps } from './templateInput'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'

interface SelectorInputProps extends Omit<TemplateInputProps, 'placeholder'> {
  selectorType: SelectorType
  onValidationChange?: (isValid: boolean, error?: string) => void
}

// Componente separado para o help icon
export function SelectorHelpIcon({
  selectorType,
}: {
  selectorType: SelectorType
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Popover
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          className="p-1 hover:bg-muted rounded-full transition-colors"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          <InfoIcon className="w-4 h-4 text-muted-foreground" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-80 max-h-[400px] overflow-y-auto"
        align="start"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        <div className="space-y-3">
          <div className="font-semibold text-sm border-b pb-2 text-accent-foreground">
            {SelectorTypeLabels[selectorType]} Help
          </div>

          <div className="text-xs text-accent-foreground prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>{SelectorTypeHelp[selectorType]}</ReactMarkdown>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function SelectorInput({
  selectorType,
  onValidationChange,
  className,
  ...props
}: SelectorInputProps) {
  return (
    <TemplateInput
      {...props}
      placeholder={SelectorTypePlaceholders[selectorType]}
      onValidationChange={onValidationChange}
      className={className}
    />
  )
}

// Componente separado para o select de tipo de seletor
export function SelectorTypeSelect({
  value,
  onValueChange,
}: {
  value: SelectorType
  onValueChange: (type: SelectorType) => void
}) {
  return (
    <Select
      value={value}
      onValueChange={(value) => onValueChange(value as SelectorType)}
    >
      <SelectTrigger className="h-8 w-[100px] text-xs">
        <SelectValue />
      </SelectTrigger>

      <SelectContent
        align="start"
        className="max-w-[calc(100vw-2rem)]"
      >
        {Object.values(SelectorType).map((type) => (
          <SelectItem
            key={type}
            value={type}
            className="text-xs py-2.5 pl-3"
          >
            {SelectorTypeLabels[type]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
