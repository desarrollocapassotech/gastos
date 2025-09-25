
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const FloatingExpenseButton = () => {
  return (
    <Button
      asChild
      className="fixed bottom-6 right-4 z-50 h-14 w-14 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transition hover:from-blue-600 hover:to-blue-700 sm:bottom-8 sm:left-8"
      size="icon"
    >
      <Link to="/expenses/new">
        <Plus size={24} />
        <span className="sr-only">Agregar gasto</span>
      </Link>
    </Button>
  );
};
