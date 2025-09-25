import { Menu, LogOut } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const getNavigationItems = () => {
  const today = new Date();
  const currentMonthPath = `/month/${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, "0")}`;

  return [
    { to: "/", label: "Inicio" },
    { to: currentMonthPath, label: "Detalle del mes" },
    { to: "/projected", label: "Gastos proyectados" },
  ];
};

const getLinkClasses = ({ isActive }: { isActive: boolean }) =>
  cn(
    "rounded-full px-4 py-2 text-sm font-medium transition-colors",
    isActive
      ? "bg-blue-600 text-white shadow-sm"
      : "text-slate-600 hover:bg-blue-50 hover:text-blue-600"
  );

export function SideMenu() {
  const navigate = useNavigate();
  const { signOutUser } = useAuth();
  const navigationItems = getNavigationItems();

  const handleSignOut = async () => {
    try {
      await signOutUser();
      navigate("/login");
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  return (
    <>
      <nav className="hidden items-center gap-2 md:flex">
        {navigationItems.map((item) => (
          <NavLink key={item.to} to={item.to} className={getLinkClasses}>
            {item.label}
          </NavLink>
        ))}
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className="ml-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-blue-600"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </Button>
      </nav>

      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="md:hidden h-10 w-10 rounded-full border-blue-200 bg-white/90 shadow-sm"
          >
            <Menu className="h-5 w-5 text-slate-700" />
            <span className="sr-only">Abrir menú</span>
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-full max-w-xs border-r border-blue-100 bg-gradient-to-b from-white to-blue-50 p-0"
        >
          <div className="px-6 pb-2 pt-8">
            <SheetTitle className="text-left text-lg font-semibold text-slate-900">
              Navegación
            </SheetTitle>
          </div>
          <nav className="flex flex-col gap-2 px-6 pb-6">
            {navigationItems.map((item) => (
              <SheetClose asChild key={item.to}>
                <NavLink to={item.to} className={getLinkClasses}>
                  {item.label}
                </NavLink>
              </SheetClose>
            ))}
          </nav>
          <div className="border-t border-blue-100/60 px-6 py-4">
            <SheetClose asChild>
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="flex w-full items-center justify-center gap-2 rounded-full border-blue-200 text-slate-700 hover:bg-blue-50"
              >
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </Button>
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

export default SideMenu;
