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
