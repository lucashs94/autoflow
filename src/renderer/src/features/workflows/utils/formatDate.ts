export const parseUtcToDate = (value: string | Date) => {
  if (value instanceof Date) return value
  const m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/.exec(value)
  if (!m) {
    // Fallback: tenta normalizar para ISO UTC
    return new Date(`${value.replace(' ', 'T')}Z`)
  }
  const [_, y, mo, d, h, mi, se] = m
  return new Date(
    Date.UTC(
      Number(y),
      Number(mo) - 1,
      Number(d),
      Number(h),
      Number(mi),
      Number(se)
    )
  )
}
