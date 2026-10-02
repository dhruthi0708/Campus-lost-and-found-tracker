import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { useForm } from '../hooks/useForm'
import FormInput from '../components/FormInput'
import { isRequired, isEmail, minLength } from '../utils/validators'

const rules = {
  name: [[isRequired, 'Full name is required.']],
  email: [[isRequired, 'Email is required.'], [isEmail, 'Enter a valid email address.']],
  password: [[isRequired, 'Password is required.'], [(v) => minLength(v, 6), 'Password must be at least 6 characters.']],
  confirmPassword: [[isRequired, 'Please confirm your password.']],
}

export default function Register() {
  const { register } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const { values, errors, touched, handleChange, handleBlur, handleSubmit, setValues } = useForm(
    { name: '', email: '', password: '', confirmPassword: '' },
    rules,
    async (vals) => {
      if (vals.password !== vals.confirmPassword) {
        showToast('Passwords do not match.', 'error')
        return
      }
      const result = await register(vals)
      if (result.ok) {
        showToast(`Account created. Welcome, ${result.user.name.split(' ')[0]}!`, 'success')
        navigate('/dashboard', { replace: true })
      } else {
        showToast(result.error, 'error')
      }
    }
  )

  return (
    <div className="auth-form">
      <h1>Create your account</h1>
      <p className="auth-form__subtitle">Start reporting lost and found items in minutes.</p>
      <form onSubmit={handleSubmit} noValidate>
        <FormInput
          label="Full name" name="name" required autoComplete="name"
          value={values.name} onChange={handleChange} onBlur={handleBlur}
          error={errors.name} touched={touched.name} placeholder="Jordan Reyes"
        />
        <FormInput
          label="Email" name="email" type="email" required autoComplete="email"
          value={values.email} onChange={handleChange} onBlur={handleBlur}
          error={errors.email} touched={touched.email} placeholder="you@example.com"
        />
        <FormInput
          label="Password" name="password" type="password" required autoComplete="new-password"
          value={values.password} onChange={handleChange} onBlur={handleBlur}
          error={errors.password} touched={touched.password} placeholder="At least 6 characters"
        />
        <FormInput
          label="Confirm password" name="confirmPassword" type="password" required autoComplete="new-password"
          value={values.confirmPassword} onChange={handleChange} onBlur={handleBlur}
          error={errors.confirmPassword} touched={touched.confirmPassword} placeholder="Re-enter password"
        />
        <button type="submit" className="btn btn--primary btn--block">Create Account</button>
      </form>
      <p className="auth-form__switch">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  )
}
