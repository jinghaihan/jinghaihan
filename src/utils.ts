export function isClient(): boolean {
  return typeof document !== 'undefined'
}

export function nameToTitle(name: string): string {
  return name
    .split('-')
    .filter(Boolean)
    .map(word => word[0].toUpperCase() + word.slice(1))
    .join(' ')
}

export function formatDate(dateStr?: string, onlyDate: boolean = true) {
  if (!dateStr)
    return ''

  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime()))
    return ''

  const month = date.toLocaleDateString('en-US', { month: 'short' })
  const day = date.getDate()

  const getOrdinalSuffix = (day: number) => {
    if (day > 3 && day < 21)
      return 'th'
    switch (day % 10) {
      case 1: return 'st'
      case 2: return 'nd'
      case 3: return 'rd'
      default: return 'th'
    }
  }

  const dateText = `${month}. ${day}${getOrdinalSuffix(day)}`
  return onlyDate ? dateText : `${dateText}, ${date.getFullYear()}`
}

export function formatNumber(num: number, precision: number): string {
  if (num < 1000)
    return num.toString()

  const abs = Math.abs(num)
  const sign = Math.sign(num)

  if (typeof precision === 'number' && !Number.isNaN(precision))
    return `${(sign * (abs / 1000)).toFixed(precision)}k`
  if (abs < 1000)
    return `${sign * abs}`

  return `${sign * Number.parseFloat((abs / 1000).toFixed(1))}k`
}
