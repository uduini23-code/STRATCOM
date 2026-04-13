import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const { role, isAuthenticated } = useAuth();

  if (!isAuthenticated || role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
