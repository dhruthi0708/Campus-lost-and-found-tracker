import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { useForm } from '../hooks/useForm'
import FormInput from '../components/FormInput'
import { isRequired, isEmail } from '../utils/validators'

const rules = {
  email: [[isRequired, 'Email is required.'], [isEmail, 'Enter a valid email address.']],
  password: [[isRequired, 'Password is required.']],
}

export default function Login() {
  const { login } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  const { values, errors, touched, handleChange, handleBlur, handleSubmit } = useForm(
    { email: '', password: '' },
    rules,
    async (vals) => {
      const result = await login(vals)
      if (result.ok) {
        showToast(`Welcome back, ${result.user.name.split(' ')[0]}!`, 'success')
        navigate(location.state?.from?.pathname || '/dashboard', { replace: true })
      } else {
        showToast(result.error, 'error')
      }
    }
  )

  return (
    <div className="auth-form">
      <h1>Log in</h1>
      <p className="auth-form__subtitle">Welcome back. Enter your details to continue.</p>
      <form onSubmit={handleSubmit} noValidate>
        <FormInput
          label="Email" name="email" type="email" required autoComplete="email"
          value={values.email} onChange={handleChange} onBlur={handleBlur}
          error={errors.email} touched={touched.email} placeholder="you@example.com"
        />
        <FormInput
          label="Password" name="password" type="password" required autoComplete="current-password"
          value={values.password} onChange={handleChange} onBlur={handleBlur}
          error={errors.password} touched={touched.password} placeholder="••••••••"
        />
        <button type="submit" className="btn btn--primary btn--block">Log In</button>
      </form>
      <p className="auth-form__switch">
        Don't have an account? <Link to="/register">Create one</Link>
      </p>
      <p className="auth-form__hint">Demo tip: register a new account — data is stored only in your browser.</p>
    </div>
  )
}
