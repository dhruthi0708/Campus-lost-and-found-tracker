import { useState, useCallback } from 'react'
import { runValidation, hasErrors } from '../utils/validators'

// Generic form-state hook with validation-on-submit and validation-on-blur
export function useForm(initialValues, rules, onValid) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target
    setValues((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }, [])

  const handleBlur = useCallback((e) => {
    const { name } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    if (rules[name]) {
      const fieldErrors = runValidation(values, { [name]: rules[name] })
      setErrors((prev) => ({ ...prev, [name]: fieldErrors[name] }))
    }
  }, [values, rules])

  const setFieldValue = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }))
  }, [])

  const handleSubmit = useCallback((e) => {
    if (e && e.preventDefault) e.preventDefault()
    const newErrors = runValidation(values, rules)
    setErrors(newErrors)
    setTouched(Object.keys(rules).reduce((acc, k) => ({ ...acc, [k]: true }), {}))
    if (!hasErrors(newErrors)) {
      onValid(values)
    }
  }, [values, rules, onValid])

  const reset = useCallback((next = initialValues) => {
    setValues(next)
    setErrors({})
    setTouched({})
  }, [initialValues])

  return { values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldValue, setValues, reset }
}
