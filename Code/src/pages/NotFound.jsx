import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="not-found-page">
      <p className="not-found-page__code">404</p>
      <h1>Page not found</h1>
      <p>The page you're looking for doesn't exist or may have moved.</p>
      <Link to="/dashboard" className="btn btn--primary">Back to Dashboard</Link>
    </div>
  )
}
