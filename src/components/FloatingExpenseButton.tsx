import { ArrowDownCircle, ArrowUpCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";

export const FloatingExpenseButton = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="fixed bottom-6 right-4 z-50 h-14 w-14 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transition hover:from-blue-600 hover:to-blue-700 sm:bottom-8 sm:left-8"
          size="icon"
        >
          <Plus size={24} />
          <span className="sr-only">Acciones rápidas</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={12}
        className="w-52 rounded-2xl border border-blue-100 bg-white/90 p-2 shadow-lg shadow-blue-500/10 backdrop-blur"
      >
        <DropdownMenuItem asChild className="cursor-pointer rounded-xl px-3 py-2">
          <Link to="/expenses/new" className="flex items-center gap-3 text-sm font-medium text-slate-700">
            <ArrowUpCircle className="h-4 w-4 text-rose-500" /> Registrar gasto
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer rounded-xl px-3 py-2">
          <Link to="/incomes/new" className="flex items-center gap-3 text-sm font-medium text-slate-700">
            <ArrowDownCircle className="h-4 w-4 text-emerald-500" /> Registrar ingreso
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
