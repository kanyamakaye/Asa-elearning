import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/** Frontend-side visibility guard only — the API enforces the real access
 * control (see accounts/permissions.py CanManageCourse/CanManageAssessment/
 * CanScheduleLiveClass), this just keeps students from landing on a form
 * that will reject them. */
export default function RequireRole({ roles, children }) {
  const { user } = useAuth()
  if (user && !roles.includes(user.user_type)) {
    return <Navigate to="/dashboard" replace />
  }
  return children
}
