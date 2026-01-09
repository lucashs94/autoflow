import { Input } from '@renderer/components/ui/input'
import { cn } from '@renderer/lib/utils'
import { BracesIcon } from 'lucide-react'
import { forwardRef, useEffect, useRef, useState } from 'react'

interface TemplateInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  availableVariables?: string[]
  onVariableSelect?: (variable: string) => void
}

export const TemplateInput = forwardRef<HTMLInputElement, TemplateInputProps>(
  ({ availableVariables = [], className, value, onChange, ...props }, ref) => {
    const [showAutocomplete, setShowAutocomplete] = useState(false)
    const [cursorPosition, setCursorPosition] = useState(0)
    const [filteredVariables, setFilteredVariables] = useState<string[]>([])
    const [selectedIndex, setSelectedIndex] = useState(0)
    const inputRef = useRef<HTMLInputElement>(null)

    // Debug log available variables
    useEffect(() => {
      console.log('[TemplateInput] Available variables:', availableVariables)
    }, [availableVariables])

    // Detect {{ typing
    useEffect(() => {
      const input = inputRef.current
      if (!input || typeof value !== 'string') return

      const text = value as string
      const cursorPos = input.selectionStart || 0

      // Look for {{ before cursor
      const textBeforeCursor = text.substring(0, cursorPos)
      const lastOpenBraces = textBeforeCursor.lastIndexOf('{{')

      if (lastOpenBraces !== -1) {
        const textAfterBraces = textBeforeCursor.substring(lastOpenBraces + 2)
        const hasClosingBraces = textAfterBraces.includes('}}')

        if (!hasClosingBraces) {
          // Show autocomplete
          const searchQuery = textAfterBraces.trim()
          const filtered = availableVariables.filter(v =>
            v.toLowerCase().includes(searchQuery.toLowerCase())
          )
          console.log('[TemplateInput] Search query:', searchQuery, 'Filtered:', filtered)
          setFilteredVariables(filtered)
          setShowAutocomplete(filtered.length > 0)
          setSelectedIndex(0)
          return
        }
      }

      setShowAutocomplete(false)
    }, [value, availableVariables, cursorPosition])

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!showAutocomplete || filteredVariables.length === 0) {
        if (props.onKeyDown) props.onKeyDown(e)
        return
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev =>
            prev < filteredVariables.length - 1 ? prev + 1 : 0
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev =>
            prev > 0 ? prev - 1 : filteredVariables.length - 1
          )
          break
        case 'Enter':
        case 'Tab':
          e.preventDefault()
          insertVariable(filteredVariables[selectedIndex])
          break
        case 'Escape':
          e.preventDefault()
          setShowAutocomplete(false)
          break
        default:
          if (props.onKeyDown) props.onKeyDown(e)
      }
    }

    const insertVariable = (variable: string) => {
      const input = inputRef.current
      if (!input || typeof value !== 'string') return

      const text = value as string
      const cursorPos = input.selectionStart || 0
      const textBeforeCursor = text.substring(0, cursorPos)
      const lastOpenBraces = textBeforeCursor.lastIndexOf('{{')

      if (lastOpenBraces !== -1) {
        const beforeBraces = text.substring(0, lastOpenBraces)
        const afterCursor = text.substring(cursorPos)
        const newValue = `${beforeBraces}{{ ${variable} }}${afterCursor}`

        // Trigger onChange
        const event = {
          target: { value: newValue }
        } as React.ChangeEvent<HTMLInputElement>

        if (onChange) onChange(event)

        // Update cursor position
        setTimeout(() => {
          const newCursorPos = lastOpenBraces + variable.length + 6
          input.setSelectionRange(newCursorPos, newCursorPos)
          input.focus()
        }, 0)
      }

      setShowAutocomplete(false)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) onChange(e)
      setCursorPosition(e.target.selectionStart || 0)
    }

    const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
      setCursorPosition(e.currentTarget.selectionStart || 0)
      if (props.onClick) props.onClick(e)
    }

    // Render with syntax highlighting
    const renderHighlightedValue = () => {
      if (typeof value !== 'string') return null

      const text = value as string
      const parts: { text: string; isVariable: boolean }[] = []
      const regex = /(\{\{[^}]*\}\})/g
      let lastIndex = 0
      let match

      while ((match = regex.exec(text)) !== null) {
        // Add text before match
        if (match.index > lastIndex) {
          parts.push({ text: text.substring(lastIndex, match.index), isVariable: false })
        }
        // Add matched variable
        parts.push({ text: match[0], isVariable: true })
        lastIndex = match.index + match[0].length
      }

      // Add remaining text
      if (lastIndex < text.length) {
        parts.push({ text: text.substring(lastIndex), isVariable: false })
      }

      return parts
    }

    const hasVariables = typeof value === 'string' && value.includes('{{')

    return (
      <div className="relative">
        <div className="relative">
          <Input
            ref={(node) => {
              // @ts-ignore
              inputRef.current = node
              if (typeof ref === 'function') {
                ref(node)
              } else if (ref) {
                ref.current = node
              }
            }}
            value={value}
            onChange={handleChange}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            className={cn(hasVariables && 'text-transparent caret-black', className)}
            {...props}
          />

          {/* Syntax highlighting overlay */}
          {hasVariables && (
            <div
              className="absolute inset-0 pointer-events-none px-3 py-2 text-sm flex items-center overflow-hidden whitespace-nowrap"
              style={{
                font: 'inherit',
                letterSpacing: 'inherit'
              }}
            >
              {renderHighlightedValue()?.map((part, index) => (
                <span
                  key={index}
                  className={cn(
                    part.isVariable && 'text-primary font-medium bg-primary/10 px-1 rounded'
                  )}
                >
                  {part.text}
                </span>
              ))}
            </div>
          )}

          {/* Template icon indicator */}
          {hasVariables && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <BracesIcon className="w-4 h-4 text-primary" />
            </div>
          )}
        </div>

        {/* Autocomplete popover */}
        {showAutocomplete && filteredVariables.length > 0 && (
          <div
            className="absolute z-[100] mt-1 w-full min-w-[200px] bg-popover border border-border rounded-md shadow-xl"
            style={{
              maxHeight: '200px',
              overflowY: 'auto',
              top: '100%',
              left: 0,
            }}
          >
            <div className="p-1">
              <div className="px-3 py-1 text-xs text-muted-foreground border-b border-border mb-1">
                Available variables ({filteredVariables.length})
              </div>
              {filteredVariables.map((variable, index) => (
                <button
                  key={variable}
                  type="button"
                  onClick={() => insertVariable(variable)}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded text-sm transition-colors',
                    'hover:bg-accent hover:text-accent-foreground',
                    index === selectedIndex && 'bg-accent text-accent-foreground'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <BracesIcon className="w-3 h-3 text-muted-foreground" />
                    <span className="font-mono">{variable}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }
)

TemplateInput.displayName = 'TemplateInput'
