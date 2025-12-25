import Handlebars from 'handlebars'

Handlebars.registerHelper('json', (context) => {
  const jsonString = JSON.stringify(context, null, 2)
  return new Handlebars.SafeString(jsonString)
})

Handlebars.registerHelper('resolve', function (this: any, expression: string) {
  if (!expression) return undefined

  // separa no último ponto (permite node com ponto no nome, se quiser)
  const lastDot = expression.lastIndexOf('.')
  if (lastDot === -1) return undefined

  const nodeName = expression.slice(0, lastDot).trim()
  const variable = expression.slice(lastDot + 1).trim()

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
