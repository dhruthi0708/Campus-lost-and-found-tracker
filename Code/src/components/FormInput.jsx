export default function FormInput({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  touched,
  placeholder,
  required,
  as = 'input',
  children,
  rows = 3,
  min,
  step,
  autoComplete,
}) {
  const showError = touched && error
  const describedBy = showError ? `${name}-error` : undefined

  return (
    <div className={`form-field ${showError ? 'form-field--error' : ''}`}>
      <label htmlFor={name}>
        {label}{required && <span className="form-field__required" aria-hidden="true"> *</span>}
      </label>
      {as === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          rows={rows}
          aria-invalid={!!showError}
          aria-describedby={describedBy}
        />
      ) : as === 'select' ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          aria-invalid={!!showError}
          aria-describedby={describedBy}
        >
          {children}
        </select>
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          min={min}
          step={step}
          autoComplete={autoComplete}
          aria-invalid={!!showError}
          aria-describedby={describedBy}
        />
      )}
      {showError && <p className="form-field__error" id={describedBy} role="alert">{error}</p>}
    </div>
  )
}
