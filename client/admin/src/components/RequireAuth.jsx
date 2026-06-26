import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RequireAuth({ children, roles }) {
  const { user, isLoading, hasRole } = useAuth();

  if (isLoading) {
    return <div className="full-page-loading">Loading…</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (roles && !hasRole(...roles)) {
    return <div className="app-content"><h1>Access denied</h1><p>Your role does not have permission to view this page.</p></div>;
  }
  return children;
}
