import type React from "react";
import {
  Menu,
  LogOut,
  LayoutDashboard,
  CalendarRange,
  Sparkles,
  ChevronDown,
  FolderKanban,
} from "lucide-react";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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

const linkBaseClasses =
  "group relative flex w-full items-center justify-start gap-4 rounded-2xl px-4 py-3 text-sm font-semibold text-left transition-all md:w-auto md:gap-3";

const getLinkClasses = ({ isActive }: { isActive: boolean }) =>
  cn(
    linkBaseClasses,
    isActive
      ? "border border-blue-500/70 bg-gradient-to-r from-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-500/30"
      : "border border-slate-200/70 bg-white/80 text-slate-600 shadow-sm hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white hover:text-blue-700 hover:shadow-md md:border-transparent md:bg-white/75 md:backdrop-blur"
  );

export function SideMenu() {
  const navigate = useNavigate();
  const { signOutUser } = useAuth();
  const { categories } = useExpenseStore();

  const navigationItems: NavigationItem[] = [
    { to: "/", label: "Inicio", icon: LayoutDashboard },
    buildCurrentMonthNavigationItem(),
    { to: "/projected", label: "Gastos proyectados", icon: Sparkles },
    { to: "/projects", label: "Proyectos", icon: FolderKanban },
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
      <nav className="hidden items-center gap-3 md:flex">
        {navigationItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => getLinkClasses({ isActive })}
          >
            {item.icon && (
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600 transition-all md:h-10 md:w-10",
                  "group-hover:border-blue-200 group-hover:bg-blue-100 group-hover:text-blue-700",
                  "group-aria-[current=page]:border-white/40 group-aria-[current=page]:bg-white/20 group-aria-[current=page]:text-white group-aria-[current=page]:shadow-inner"
                )}
              >
                <item.icon className="h-4 w-4" />
              </span>
            )}
            <span className="flex-1 text-sm font-semibold tracking-tight">{item.label}</span>
          </NavLink>
        ))}
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className="ml-2 inline-flex items-center gap-2 rounded-2xl border border-transparent bg-white/70 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white hover:text-blue-700"
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
            <nav className="space-y-4 px-6 pb-4">
              <div className="flex flex-col gap-2">
                {navigationItems.map((item) => (
                  <SheetClose asChild key={item.to}>
                    <NavLink
                      to={item.to}
                      className={({ isActive }) => getLinkClasses({ isActive })}
                    >
                      {item.icon && (
                        <span
                          className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600 transition-all md:h-10 md:w-10",
                            "group-hover:border-blue-200 group-hover:bg-blue-100 group-hover:text-blue-700",
                            "group-aria-[current=page]:border-white/40 group-aria-[current=page]:bg-white/20 group-aria-[current=page]:text-white group-aria-[current=page]:shadow-inner"
                          )}
                        >
                          <item.icon className="h-4 w-4" />
                        </span>
                      )}
                      <span className="flex-1 text-sm font-semibold tracking-tight">
                        {item.label}
                      </span>
                    </NavLink>
                  </SheetClose>
                ))}
              </div>
              {categoryItems.length > 0 && (
                <Collapsible className="overflow-hidden rounded-2xl border border-blue-100/80 bg-white/80 shadow-sm">
                  <CollapsibleTrigger className="group flex w-full items-center justify-between gap-3 px-4 py-3 text-left">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-700">
                        Categorías
                      </span>
                      <span className="text-xs font-medium text-slate-400">
                        {categoryItems.length} disponibles
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-500 transition-transform group-data-[state=open]:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-3 pb-3 pt-1">
                    <div className="flex max-h-80 flex-col gap-2 overflow-y-auto pr-1">
                      {categoryItems.map((category) => (
                        <SheetClose asChild key={category.to}>
                          <NavLink
                            to={category.to}
                            className={({ isActive }) =>
                              cn(getLinkClasses({ isActive }), "text-left")
                            }
                          >
                            <span
                              className={cn(
                                "flex h-9 w-9 items-center justify-center rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-blue-100 text-base transition-all md:h-10 md:w-10 md:text-lg",
                                "group-hover:border-blue-200 group-hover:shadow",
                                "group-aria-[current=page]:border-white/40 group-aria-[current=page]:from-blue-500/30 group-aria-[current=page]:via-indigo-500/20 group-aria-[current=page]:to-indigo-400/30 group-aria-[current=page]:text-white"
                              )}
                            >
                              {category.icon}
                            </span>
                            <div className="flex flex-1 flex-col">
                              <span className="text-sm font-semibold tracking-tight">
                                {category.label}
                              </span>
                              <span className="text-xs text-slate-500 transition-colors group-aria-[current=page]:text-white/80">
                                Ver movimientos
                              </span>
                            </div>
                          </NavLink>
                        </SheetClose>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}
              <div className="pt-2">
                <SheetClose asChild>
                  <Button
                    onClick={handleSignOut}
                    variant="outline"
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border-blue-200 bg-white/80 text-slate-700 transition-all hover:-translate-y-0.5 hover:bg-white hover:text-blue-700"
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                  </Button>
                </SheetClose>
              </div>
            </nav>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
}

export default SideMenu;
