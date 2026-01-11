import { StreamLanguage } from '@codemirror/language'
import { tags as t } from '@lezer/highlight'

// Simple parser for {{ variable }} syntax
const templateLanguage = StreamLanguage.define({
  token(stream) {
    // Check if we're starting a template
    if (stream.match('{{')) {
      // Continue until we find }}
      let inTemplate = true
      while (inTemplate && !stream.eol()) {
        if (stream.match('}}')) {
          return t.special(t.string) as any
        }
        stream.next()
      }
      return t.special(t.string) as any
    }

    // Regular text
    stream.next()
    return null
  }
})

export { templateLanguage }
