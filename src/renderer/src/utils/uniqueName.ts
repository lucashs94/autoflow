export const makeUniqueName = (name: string, names: Set<string>) => {
  if (!names.has(name)) return name

  // procura o maior sufixo (N) existente e incrementa
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  // Suporta ambos os padrões: "Nome (N)" e "NomeN"
  const regexParen = new RegExp(`^${escaped}(?: \\((\\d+)\\))?$`)
  const regexPlain = new RegExp(`^${escaped}(\\d+)?$`)
  let max = 0

  names.forEach((existing) => {
    let n = 0

    const m1 = existing.match(regexParen)

    if (m1) {
      n = m1[1] ? parseInt(m1[1], 10) : 0
    }

    const m2 = existing.match(regexPlain)

    if (m2) {
      const n2 = m2[1] ? parseInt(m2[1], 10) : 0
      if (n2 > n) n = n2
    }

    if (n > max) max = n
  })

  return `${name}${max + 1}`
}
