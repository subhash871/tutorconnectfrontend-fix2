import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';
import { tokenStore } from '../api/client';

export default function ProtectedRoute({ children, role }) {
  const { isAuthenticated, loading, user, sessionIssue } = useAuth();
  const location = useLocation();

  if (loading) return <Loader full />;

  if (!isAuthenticated) {
    if (sessionIssue && tokenStore.getAccess()) {
      return (
        <div className="container page-shell">
          <div className="alert alert-error">
            <strong>Couldn't load your account:</strong> {sessionIssue}
            <p className="text-sm" style={{ marginTop: 8, marginBottom: 0 }}>
              You're signed in, but the server rejected the request for your profile.
              This usually means a backend permissions setting needs fixing for the
              <code> /api/users/me/ </code> endpoint — it isn't something you can fix from here.
            </p>
          </div>
        </div>
      );
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && user?.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}
