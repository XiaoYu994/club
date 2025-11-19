export const isPlainObject = (value) =>
  Object.prototype.toString.call(value) === '[object Object]'

export const deepMerge = (target = {}, source = {}) => {
  const output = { ...target }
  if (!isPlainObject(source)) {
    return output
  }

  Object.keys(source).forEach((key) => {
    const targetValue = output[key]
    const sourceValue = source[key]

    if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
      output[key] = [...targetValue, ...sourceValue]
    } else if (isPlainObject(targetValue) && isPlainObject(sourceValue)) {
      output[key] = deepMerge(targetValue, sourceValue)
    } else {
      output[key] = sourceValue
    }
  })

  return output
}

