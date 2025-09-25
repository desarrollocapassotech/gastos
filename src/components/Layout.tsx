import { Outlet, Link } from "react-router-dom";
import { PiggyBank } from "lucide-react";
import SideMenu from "@/components/SideMenu";

export function Layout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col">
        <header className="sticky top-0 z-40 border-b border-white/60 bg-white/80 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6">
            <Link to="/" className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm">
                <PiggyBank className="h-5 w-5" />
              </span>
              <div className="flex flex-col leading-tight">
                <span className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                  Mis gastos
                </span>
                <span className="text-sm font-semibold text-slate-900">
                  Panel financiero
                </span>
              </div>
            </Link>
            <SideMenu />
          </div>
        </header>
        <main className="flex-1 px-4 pb-28 pt-6 sm:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
