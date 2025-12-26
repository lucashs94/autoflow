import Handlebars from 'handlebars'

Handlebars.registerHelper('json', (context) => {
  const jsonString =
    context === undefined ? 'null' : JSON.stringify(context, null, 2)
  return new Handlebars.SafeString(jsonString)
})

Handlebars.registerHelper('resolve', function (this: any, expression: string) {
  if (!expression) return undefined

  const expr = String(expression).trim()
  const lastDot = expr.lastIndexOf('.')
  if (lastDot === -1) {
    return this?.[expr]
  }

  const nodeName = expr.slice(0, lastDot).trim()
  const variable = expr.slice(lastDot + 1).trim()

  return this?.[nodeName]?.[variable]
})

export function normalizeTemplate(template: string) {
  return template.replace(
    /\{\{([^}]+)\}\}/g,
    (_, expr) => `{{json (resolve "${expr.trim()}")}}`
  )
}

export function compileTemplate(template: string) {
  return Handlebars.compile(normalizeTemplate(template))
}
