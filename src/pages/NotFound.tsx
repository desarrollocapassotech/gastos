import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 pb-14 text-center">
      <div>
        <h1 className="text-5xl font-bold text-blue-600">404</h1>
        <p className="text-sm text-slate-500">La página solicitada no existe.</p>
      </div>
      <Link to="/" className="rounded-full bg-blue-600 px-6 py-2 text-sm font-medium text-white shadow-md transition-colors hover:bg-blue-700">
        Volver al inicio
      </Link>
    </div>
  );
};

export default NotFound;
