import { cn } from '@renderer/lib/utils'
import { VariableInfo } from '@renderer/utils/getAvailableVariables'
import { forwardRef, useEffect, useRef, useImperativeHandle, useState } from 'react'
import { EditorView, Decoration, DecorationSet, ViewUpdate, ViewPlugin, drawSelection, keymap } from '@codemirror/view'
import { EditorState, Extension } from '@codemirror/state'
import { autocompletion, CompletionContext, CompletionResult, completionKeymap } from '@codemirror/autocomplete'
import { defaultKeymap } from '@codemirror/commands'

export interface TemplateInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  availableVariables?: string[]
  variablesInfo?: Map<string, VariableInfo>
  value?: string
  onChange?: (value: string) => void
  onValidationChange?: (isValid: boolean, error?: string) => void
}

// Função de validação de template
export function validateTemplate(
  value: string,
  availableVariables: string[],
  variablesInfo?: Map<string, VariableInfo>
): { isValid: boolean; error?: string } {
  if (!value || value.trim() === '') {
    return { isValid: true }
  }

  // Verificar se há {{ sem }} correspondente ou vice-versa
  const openBracesCount = (value.match(/\{\{/g) || []).length
  const closeBracesCount = (value.match(/\}\}/g) || []).length

  if (openBracesCount !== closeBracesCount) {
    return { isValid: false, error: 'Template syntax error: mismatched {{ }}' }
  }

  // Regex para encontrar todas as expressões {{ }}
  const templateRegex = /\{\{([^}]*)\}\}/g
  const matches = [...value.matchAll(templateRegex)]

  // Verificar se todas as variáveis e propriedades usadas estão disponíveis
  for (const match of matches) {
    const content = match[1].trim()

    // Pode estar vazio ({{ }}) - isso é válido mas será tratado pelo handlebars
    if (content === '') continue

    // Verificar se tem propriedade (ponto)
    const dotIndex = content.indexOf('.')

    if (dotIndex !== -1) {
      // Tem propriedade: {{ nodeName.property }}
      const varName = content.substring(0, dotIndex).trim()
      const propertyPath = content.substring(dotIndex + 1).trim()

      // Verificar se a variável existe
      if (!availableVariables.includes(varName)) {
        return { isValid: false, error: `Variable "${varName}" is not available. Use autocomplete to see available variables.` }
      }

      // Verificar se a propriedade existe (se temos info sobre a variável)
      // Skip validation if properties array is empty (e.g., SET_VARIABLES allows arbitrary properties)
      if (variablesInfo && propertyPath) {
        const varInfo = variablesInfo.get(varName)
        if (varInfo && varInfo.properties && varInfo.properties.length > 0) {
          const firstProperty = propertyPath.split('.')[0].trim()
          if (!varInfo.properties.includes(firstProperty)) {
            return { isValid: false, error: `Property "${firstProperty}" does not exist in "${varName}". Use autocomplete to see available properties.` }
          }
        }
      }
    } else {
      // Apenas variável: {{ nodeName }}
      const varName = content.trim()

      if (!availableVariables.includes(varName)) {
        return { isValid: false, error: `Variable "${varName}" is not available. Use autocomplete to see available variables.` }
      }
    }
  }

  return { isValid: true }
}

// Theme
const createTheme = (): Extension => {
  return EditorView.theme({
    '&': {
      width: '100%',
      backgroundColor: 'transparent',
      fontSize: '14px',
      fontFamily: 'var(--font-mono)',
      cursor: 'text'
    },
    '.cm-scroller': {
      fontFamily: 'var(--font-mono)',
      cursor: 'text',
      maxHeight: '72px', // ~3 lines at 14px font
      overflowY: 'auto'
    },
    '.cm-content': {
      padding: '8px 12px',
      fontFamily: 'var(--font-mono)',
      caretColor: 'hsl(var(--foreground))',
      minHeight: '20px',
      cursor: 'text',
      lineHeight: '1.5'
    },
    '.cm-line': {
      padding: 0,
      fontFamily: 'var(--font-mono)',
      cursor: 'text',
      lineHeight: '1.5'
    },
    '&.cm-focused': {
      outline: 'none'
    },
    '.cm-template-variable': {
      color: '#22c55e',
      fontWeight: '600',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      borderRadius: '2px',
      padding: '0 2px'
    },
    '.cm-tooltip.cm-tooltip-autocomplete': {
      backgroundColor: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '6px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
      fontFamily: 'var(--font-mono)',
      padding: '6px',
      overflow: 'hidden',
      maxWidth: '400px'
    },
    '.cm-tooltip.cm-tooltip-autocomplete > ul': {
      fontFamily: 'var(--font-mono)',
      maxHeight: '240px',
      backgroundColor: '#ffffff',
      margin: '0',
      padding: '0'
    },
    '.cm-tooltip-autocomplete ul li': {
      padding: '12px 16px',
      borderRadius: '4px',
      color: '#374151',
      fontWeight: '500',
      backgroundColor: '#ffffff',
      cursor: 'pointer',
      fontSize: '13px'
    },
    '.cm-tooltip-autocomplete ul li:hover': {
      backgroundColor: '#f3f4f6'
    },
    '.cm-tooltip-autocomplete ul li[aria-selected]': {
      backgroundColor: '#22c55e',
      color: '#ffffff'
    }
  })
}

// Highlight {{ }}
const templateHighlighter = ViewPlugin.fromClass(class {
  decorations: DecorationSet

  constructor(view: EditorView) {
    this.decorations = this.buildDecorations(view)
  }

  update(update: ViewUpdate) {
    if (update.docChanged || update.viewportChanged) {
      this.decorations = this.buildDecorations(update.view)
    }
  }

  buildDecorations(view: EditorView): DecorationSet {
    const decorations: any[] = []
    const text = view.state.doc.toString()
    const regex = /\{\{[^}]*\}\}/g
    let match

    while ((match = regex.exec(text)) !== null) {
      const from = match.index
      const to = from + match[0].length
      decorations.push(
        Decoration.mark({
          class: 'cm-template-variable'
        }).range(from, to)
      )
    }

    return Decoration.set(decorations)
  }
}, {
  decorations: v => v.decorations
})

export const TemplateInput = forwardRef<HTMLInputElement, TemplateInputProps>(
  ({ availableVariables = [], variablesInfo, className, value = '', onChange, placeholder, onValidationChange }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const viewRef = useRef<EditorView | null>(null)
    const varsRef = useRef(availableVariables)
    const varsInfoRef = useRef(variablesInfo)
    const [hasError, setHasError] = useState(false)

    varsRef.current = availableVariables
    varsInfoRef.current = variablesInfo

    // Validar quando o valor mudar
    useEffect(() => {
      const validation = validateTemplate(value, availableVariables, variablesInfo)
      setHasError(!validation.isValid)
      onValidationChange?.(validation.isValid, validation.error)
    }, [value, availableVariables, variablesInfo, onValidationChange])

    useImperativeHandle(ref, () => ({
      focus: () => viewRef.current?.focus(),
      blur: () => viewRef.current?.contentDOM.blur(),
      value: viewRef.current?.state.doc.toString() || ''
    } as any))

    useEffect(() => {
      if (!containerRef.current || viewRef.current) return

      const completionSource = (context: CompletionContext): CompletionResult | null => {
        const word = context.matchBefore(/\{\{\s*[\w\s.]*/)
        if (!word) return null

        const text = word.text
        if (!text.startsWith('{{')) return null

        const afterBraces = text.substring(2).trim()
        const dotIndex = afterBraces.lastIndexOf('.')

        if (dotIndex !== -1) {
          // Property autocomplete
          const nodeName = afterBraces.substring(0, dotIndex).trim()
          const varInfo = varsInfoRef.current?.get(nodeName)
          const properties = varInfo?.properties || []

          return {
            from: word.from + text.lastIndexOf('.') + 1,
            options: properties.map(prop => ({
              label: prop,
              type: 'property',
              apply: `${prop} }}`
            }))
          }
        } else {
          // Variable autocomplete
          return {
            from: word.from + 2,
            options: varsRef.current.map(v => ({
              label: v,
              type: 'variable',
              apply: ` ${v} }}`
            }))
          }
        }
      }

      const state = EditorState.create({
        doc: value,
        extensions: [
          drawSelection(),
          createTheme(),
          keymap.of([...completionKeymap, ...defaultKeymap]),
          templateHighlighter,
          autocompletion({
            override: [completionSource],
            activateOnTyping: true,
            closeOnBlur: true,
            maxRenderedOptions: 20
          }),
          EditorView.lineWrapping,
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              onChange?.(update.state.doc.toString())
            }
          }),
          EditorView.contentAttributes.of({
            'aria-placeholder': placeholder || '',
            'data-placeholder': placeholder || ''
          })
        ]
      })

      const view = new EditorView({
        state,
        parent: containerRef.current
      })

      viewRef.current = view

      return () => {
        view.destroy()
        viewRef.current = null
      }
    }, [])

    useEffect(() => {
      if (!viewRef.current) return
      const current = viewRef.current.state.doc.toString()
      if (current !== value) {
        viewRef.current.dispatch({
          changes: { from: 0, to: current.length, insert: value }
        })
      }
    }, [value])

    return (
      <>
        {hasError && (
          <style>{`
            .template-input-error .cm-template-variable {
              color: #ef4444 !important;
              background-color: rgba(239, 68, 68, 0.15) !important;
              font-weight: 600;
              border-radius: 2px;
              padding: 0 2px;
            }
          `}</style>
        )}
        <div
          ref={containerRef}
          onClick={() => viewRef.current?.focus()}
          className={cn(
            'flex min-h-9 w-full rounded-md border border-input bg-transparent shadow-xs cursor-text',
            'focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]',
            hasError && 'template-input-error',
            className
          )}
        />
      </>
    )
  }
)

TemplateInput.displayName = 'TemplateInput'
