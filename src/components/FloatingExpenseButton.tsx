
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExpenseForm } from "@/components/ExpenseForm";

export const FloatingExpenseButton = () => {
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  return (
    <>
      <Button
        onClick={() => setShowExpenseForm(true)}
        className="fixed bottom-6 right-4 z-50 h-14 w-14 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transition hover:from-blue-600 hover:to-blue-700 sm:bottom-8 sm:left-8"
        size="icon"
      >
        <Plus size={24} />
        <span className="sr-only">Agregar gasto</span>
      </Button>

      <ExpenseForm
        open={showExpenseForm}
        onClose={() => setShowExpenseForm(false)}
      />
    </>
  );
};
