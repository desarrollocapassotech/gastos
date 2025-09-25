import { Menu } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navigationItems = [
  { to: "/", label: "Inicio" },
  { to: "/projected", label: "Gastos proyectados" },
];

const getLinkClasses = ({ isActive }: { isActive: boolean }) =>
  cn(
    "rounded-full px-4 py-2 text-sm font-medium transition-colors",
    isActive
      ? "bg-blue-600 text-white shadow-sm"
      : "text-slate-600 hover:bg-blue-50 hover:text-blue-600"
  );

export function SideMenu() {
  return (
    <>
      <nav className="hidden items-center gap-2 md:flex">
        {navigationItems.map((item) => (
          <NavLink key={item.to} to={item.to} className={getLinkClasses}>
            {item.label}
          </NavLink>
        ))}
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
        </SheetContent>
      </Sheet>
    </>
  );
}

export default SideMenu;
