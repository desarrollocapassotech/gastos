import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export const PrivateRoute = () => {
  const { user, profile, loading, profileChecked } = useAuth();

  if (loading || !profileChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        <div className="flex flex-col items-center gap-6 rounded-3xl bg-white/10 p-10 text-white shadow-2xl backdrop-blur-lg">
          <div className="relative">
            <div className="h-24 w-24 animate-spin rounded-full border-4 border-white/30 border-t-white" aria-hidden="true" />
            <div className="absolute inset-0 animate-ping rounded-full border border-white/40" aria-hidden="true" />
            <div className="absolute inset-6 rounded-full bg-white/20" aria-hidden="true" />
          </div>
          <div className="space-y-2 text-center">
            <p className="text-2xl font-semibold tracking-wide">Preparando tu experiencia</p>
            <p className="text-sm text-white/80">Ajustando los detalles para que todo quede perfecto...</p>
          </div>
        </div>
      </div>
    );
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

