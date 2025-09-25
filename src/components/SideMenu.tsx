import type React from "react";
import { Menu, LogOut, LayoutDashboard, CalendarRange, Sparkles } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { formatMonth } from "@/lib/formatters";
import { useAuth } from "@/hooks/useAuth";
import { useExpenseStore } from "@/hooks/useExpenseStore";

type NavigationItem = {
  to: string;
  label: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

type CategoryNavigationItem = {
  to: string;
  label: string;
  icon: string;
};

const buildCurrentMonthNavigationItem = (): NavigationItem => {
  const today = new Date();
  const currentMonthPath = `/month/${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, "0")}`;

  return {
    to: currentMonthPath,
    label: `Detalle ${formatMonth(today)}`,
    icon: CalendarRange,
  };
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
  const { categories } = useExpenseStore();

  const navigationItems: NavigationItem[] = [
    { to: "/", label: "Inicio", icon: LayoutDashboard },
    buildCurrentMonthNavigationItem(),
    { to: "/projected", label: "Gastos proyectados", icon: Sparkles },
  ];

  const categoryItems: CategoryNavigationItem[] = categories
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name, "es"))
    .map((category) => ({
      to: `/category/${encodeURIComponent(category.name)}`,
      label: category.name,
      icon: category.icon,
    }));

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
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(getLinkClasses({ isActive }), "inline-flex items-center gap-2")
            }
          >
            {item.icon && <item.icon className="h-4 w-4" />}
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
            className="h-10 w-10 rounded-full border-blue-200 bg-white/90 shadow-sm md:hidden"
          >
            <Menu className="h-5 w-5 text-slate-700" />
            <span className="sr-only">Abrir menú</span>
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-full max-w-xs border-r border-blue-100 bg-gradient-to-b from-white to-blue-50 p-0"
        >
          <ScrollArea className="h-full">
            <div className="px-6 pb-2 pt-8">
              <SheetTitle className="text-left text-lg font-semibold text-slate-900">
                Navegación
              </SheetTitle>
            </div>
            <nav className="flex flex-col gap-2 px-6 pb-6">
              {navigationItems.map((item) => (
                <SheetClose asChild key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      cn(getLinkClasses({ isActive }), "flex items-center gap-3")
                    }
                  >
                    {item.icon && <item.icon className="h-4 w-4" />}
                    <span>{item.label}</span>
                  </NavLink>
                </SheetClose>
              ))}
            </nav>
            {categoryItems.length > 0 && (
              <div className="space-y-4 px-6 pb-6">
                <div className="space-y-2">
                  <Separator className="border-blue-100/80" />
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Categorías
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  {categoryItems.map((category) => (
                    <SheetClose asChild key={category.to}>
                      <NavLink
                        to={category.to}
                        className={({ isActive }) =>
                          cn(
                            getLinkClasses({ isActive }),
                            "flex items-center gap-3 text-left"
                          )
                        }
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-lg">
                          {category.icon}
                        </span>
                        <span className="flex-1 text-sm font-medium">
                          {category.label}
                        </span>
                      </NavLink>
                    </SheetClose>
                  ))}
                </div>
              </div>
            )}
          </ScrollArea>
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
