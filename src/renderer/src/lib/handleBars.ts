import Handlebars from 'handlebars'

/**
 * Helper 'json' - Converte valores para formato JSON válido
 * - Strings: retorna COM aspas e caracteres escapados
 * - Números/Booleans: retorna como está
 * - Objetos/Arrays: faz JSON.stringify completo
 * - Null/Undefined: retorna "null"
 */
Handlebars.registerHelper('json', (context) => {
  // Null ou undefined
  if (context === undefined || context === null) {
    return new Handlebars.SafeString('null')
  }

  // String: retornar COM aspas para ser JSON válido
  if (typeof context === 'string') {
    // JSON.stringify já escapa caracteres especiais e adiciona aspas
    return new Handlebars.SafeString(JSON.stringify(context))
  }

  // Número ou Boolean: retornar direto
  if (typeof context === 'number' || typeof context === 'boolean') {
    return new Handlebars.SafeString(String(context))
  }

  // Objeto ou Array: fazer stringify completo
  try {
    const jsonString = JSON.stringify(context)
    return new Handlebars.SafeString(jsonString)
  } catch (error) {
    console.error('[handleBars] Error stringifying context:', error)
    return new Handlebars.SafeString('"[Error: Unable to stringify]"')
  }
})

/**
 * Helper 'resolve' - Navega por propriedades aninhadas no contexto
 * Suporta navegação profunda: userData.httpResponse.data.user.id
 */
Handlebars.registerHelper('resolve', function (this: any, expression: string) {
  if (!expression) return undefined

  const expr = String(expression).trim()

  // Dividir por pontos para navegar recursivamente
  const parts = expr.split('.')

  let value: any = this
  for (const part of parts) {
    const trimmedPart = part.trim()

    // Se chegou em null/undefined, parar navegação
    if (value === null || value === undefined) {
      return undefined
    }

    // Navegar para próxima propriedade
    value = value[trimmedPart]
  }

  return value
})

/**
 * Normaliza template substituindo {{ }} por chamadas aos helpers
 * Exemplo: {{ userData.name }} -> {{json (resolve "userData.name")}}
 */
export function normalizeTemplate(template: string): string {
  if (typeof template !== 'string') {
    console.warn('[handleBars] normalizeTemplate received non-string:', typeof template)
    return String(template)
  }

  return template.replace(
    /\{\{([^}]+)\}\}/g,
    (_, expr) => {
      const sanitized = expr.trim().replace(/"/g, '\\"')
      return `{{json (resolve "${sanitized}")}}`
    }
  )
}

/**
 * Compila um template usando Handlebars com normalização
 * Retorna função que recebe contexto e retorna string processada
 */
export function compileTemplate(template: string) {
  return Handlebars.compile(normalizeTemplate(template))
}
