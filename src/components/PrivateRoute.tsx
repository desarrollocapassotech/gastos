import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import FullScreenLoader from './FullScreenLoader';

export const PrivateRoute = () => {
  const { user, profile, loading, profileChecked } = useAuth();

  if (loading || !profileChecked) {
    return <FullScreenLoader />;
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

