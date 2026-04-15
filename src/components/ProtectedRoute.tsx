import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
  requireManageEvents?: boolean;
  requireManageUpdates?: boolean;
}

export function ProtectedAdminRoute({ children, requireManageEvents, requireManageUpdates }: ProtectedAdminRouteProps) {
  const { role, isAuthenticated, canManageEvents, canManageUpdates } = useAuth();

  if (!isAuthenticated || role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }

  if (requireManageEvents && !canManageEvents) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (requireManageUpdates && !canManageUpdates) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
}
