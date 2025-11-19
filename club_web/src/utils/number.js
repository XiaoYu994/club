export const isNumber = (value) =>
  value !== null && value !== '' && value !== false && !Number.isNaN(Number(value))

export const formatNumber = (value, options = {}) => {
  if (!isNumber(value)) return value ?? '-'
  const { decimals = 0, compact = false, suffix = '' } = options
  const num = Number(value)
  if (compact) {
    return `${compactNumber(num, decimals)}${suffix}`
  }
  return `${num.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}${suffix}`
}

export const compactNumber = (value, decimals = 1) => {
  if (!isNumber(value)) return value ?? '-'
  const num = Number(value)
  if (Math.abs(num) >= 1_0000_0000) {
    return `${(num / 1_0000_0000).toFixed(decimals)}亿`
  }
  if (Math.abs(num) >= 1_0000) {
    return `${(num / 1_0000).toFixed(decimals)}万`
  }
  return num.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

