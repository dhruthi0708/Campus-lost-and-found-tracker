export const isRequired = (value) => (value !== undefined && value !== null && String(value).trim() !== '')

export const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

export const isPositiveNumber = (value) => !isNaN(parseFloat(value)) && parseFloat(value) > 0

export const minLength = (value, len) => String(value || '').trim().length >= len

export function runValidation(values, rules) {
  const errors = {}
  Object.entries(rules).forEach(([field, tests]) => {
    for (const [test, message] of tests) {
      if (!test(values[field])) {
        errors[field] = message
        break
      }
    }
  })
  return errors
}

export const hasErrors = (errors) => Object.keys(errors).length > 0
