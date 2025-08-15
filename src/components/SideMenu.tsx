import { Link } from "react-router-dom";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function SideMenu() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed top-4 right-4 z-50"
        >
          <Menu className="h-4 w-4" />
          <span className="sr-only">Abrir menú</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64">
        <nav className="mt-8 flex flex-col gap-4">
          <Link to="/" className="text-lg font-medium">
            Inicio
          </Link>
          <Link to="/projected" className="text-lg font-medium">
            Gastos proyectados
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}

export default SideMenu;
