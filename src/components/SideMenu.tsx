import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export function SideMenu() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 right-4 z-50"
        onClick={() => setOpen((prev) => !prev)}
      >
        {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        <span className="sr-only">{open ? "Cerrar" : "Abrir"} menú</span>
      </Button>
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
