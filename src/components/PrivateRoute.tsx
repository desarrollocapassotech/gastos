import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export const PrivateRoute = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <div className="p-4">Cargando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!profile) {
    return <Navigate to="/register" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;

