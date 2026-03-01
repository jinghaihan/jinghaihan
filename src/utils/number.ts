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
