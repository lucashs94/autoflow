import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete'
import {
  defaultKeymap,
  indentWithTab,
  insertNewlineAndIndent,
} from '@codemirror/commands'
import { json as jsonLang, jsonLanguage } from '@codemirror/lang-json'
import {
  bracketMatching,
  indentOnInput,
  indentUnit,
} from '@codemirror/language'
import { EditorState, Prec } from '@codemirror/state'
import { EditorView, highlightActiveLine, keymap } from '@codemirror/view'
import { zodResolver } from '@hookform/resolvers/zod'
import { FieldEditChange } from '@renderer/components/fieldEditChange'
import { Button } from '@renderer/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@renderer/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from '@renderer/components/ui/form'
import CodeMirror, { ReactCodeMirrorRef } from '@uiw/react-codemirror'
import { useEffect, useRef } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

const formSchema = z.object({
  variables: z
    .string()
    .min(1, { message: 'Variables is required' })
    .superRefine((value, ctx) => {
      try {
        JSON.parse(value || '{}')
      } catch (e: any) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: e.message || 'JSON inválido',
        })
      }
    }),
})

export type FormValues = z.infer<typeof formSchema>

interface Props {
  nodeId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: FormValues) => void
  defaultValues?: Partial<FormValues>
}

export const SettingsDialog = ({
  nodeId,
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variables: defaultValues.variables || '{}',
    },
  })

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    console.log('Form submitted with values:', values)
    onSubmit(values)
    onOpenChange(false)
  }

  useEffect(() => {
    if (open) {
      form.reset({
        variables: defaultValues.variables || '{}',
      })
    }
  }, [open, defaultValues, form])

  const editorRef = useRef<ReactCodeMirrorRef>(null)
  const setCursorToEnd = () => {
    if (editorRef.current) {
      const view = editorRef.current.view
      if (view) {
        const length = view.state.doc.length
        view.dispatch({
          selection: { anchor: length, head: length },
          scrollIntoView: true, // Ensure the end of the text is visible
        })
        view.focus() //Optionally focus the editor
      }
    }
  }
  useEffect(() => {
    setTimeout(() => {
      setCursorToEnd()
    }, 50)
  }, [open])

  const cmTheme = EditorView.theme(
    {
      '&': {
        minHeight: '220px',
        maxHeight: '420px',
        height: 'auto',
        overflow: 'auto',
        borderRadius: '0.5rem',
        outline: '1px solid var(--border) !important',
        // backgroundColor: 'var(--background)',
        backgroundColor: '#292929 !important',
      },
      '.cm-content': {
        fontFamily:
          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        fontSize: '12px',
        padding: '8px',
        height: 'auto !important',
        minHeight: '220px !important',
        maxHeight: '420px !important',
      },
      '.cm-gutters': { display: 'none' },
      '.cm-activeLine': { backgroundColor: 'transparent' },
    },
    { dark: true }
  )
  const smartEnter = keymap.of([
    {
      key: 'Enter',
      run: (view) => {
        const { state } = view
        const sel = state.selection.main
        if (!sel.empty) return insertNewlineAndIndent(view)

        const pos = sel.head
        const prev = state.sliceDoc(Math.max(0, pos - 1), pos)
        const next = state.sliceDoc(pos, pos + 1)
        const line = state.doc.lineAt(pos)
        const unit = state.facet(indentUnit)
        const baseIndent = (line.text.match(/^\s*/) || [''])[0]
        const left = state.sliceDoc(line.from, pos)
        const right = state.sliceDoc(pos, line.to)

        if (prev === '{' || prev === '"' || prev === '(' || prev === '[') {
          const insert =
            '\n' +
            baseIndent +
            unit +
            (next === '}' || next === '"' || next === ')' || next === ']'
              ? '\n' + baseIndent
              : '')
          view.dispatch({
            changes: { from: pos, to: pos, insert },
            selection: { anchor: pos + 1 + baseIndent.length + unit.length },
          })
          return true
        }

        // 2) Linha em branco (apenas espaços): preserva o recuo atual ao quebrar a linha
        if (/^\s*$/.test(left) && /^\s*$/.test(right)) {
          const insert = '\n' + baseIndent
          view.dispatch({
            changes: { from: pos, to: pos, insert },
            selection: { anchor: pos + 1 + baseIndent.length },
          })
          return true
        }

        return insertNewlineAndIndent(view)
      },
    },
  ])
  const cmExtensions = [
    jsonLang(),
    jsonLanguage.data.of({
      closeBrackets: {
        // brackets: `()[]{}""''`,
        brackets: ['(', '[', '{', "'", '"'],
      },
      indentOnInput: /^\s*[}\]]$/,
    }),
    indentOnInput(),
    indentUnit.of('  '),
    EditorState.tabSize.of(2),
    EditorView.lineWrapping,
    bracketMatching(),
    Prec.high(smartEnter),
    closeBrackets(),
    keymap.of([indentWithTab, ...closeBracketsKeymap, ...defaultKeymap]),
    highlightActiveLine(),
    cmTheme,
  ]

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="bg-muted max-h-11/12 overflow-y-auto scrollbar">
        <DialogHeader>
          <DialogTitle>
            <FieldEditChange id={nodeId} />
          </DialogTitle>

          <DialogDescription>
            Use this name to reference the result in other nodes
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-8"
          >
            <Controller
              control={form.control}
              name="variables"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Variables (json format)</FormLabel>

                  <FormControl>
                    <div className="space-y-1 min-h-[220px]">
                      <CodeMirror
                        ref={editorRef}
                        value={field.value}
                        onChange={field.onChange}
                        extensions={cmExtensions}
                        basicSetup={false}
                      />

                      {fieldState.error?.message && (
                        <p className="text-xs text-red-500">
                          {fieldState.error.message}
                        </p>
                      )}
                    </div>
                  </FormControl>

                  <FormMessage />

                  <FormDescription>
                    Always should be a valid json
                  </FormDescription>
                </FormItem>
              )}
            />

            <DialogFooter className="mt-4">
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
