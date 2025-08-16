import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, Home, Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const SidebarMenu = () => {
  const { signOutUser } = useAuth();

  return (
    <aside className="w-56 min-h-screen bg-gray-100 p-4 flex flex-col">
      <nav className="space-y-2">
        <Link to="/" className="flex items-center gap-2 text-sm font-medium hover:underline">
          <Home className="h-4 w-4" /> Inicio
        </Link>
        <Link to="/projected" className="flex items-center gap-2 text-sm font-medium hover:underline">
          <Calendar className="h-4 w-4" /> Gastos Proyectados
        </Link>
      </nav>
      <Button
        variant="outline"
        className="mt-auto flex items-center gap-2"
        onClick={signOutUser}
      >
        <LogOut className="h-4 w-4" /> Cerrar sesión
      </Button>
    </aside>
  );
};

export default SidebarMenu;
