
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ExpenseForm } from '@/components/ExpenseForm';

export const FloatingExpenseButton = () => {
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  return (
    <>
      <Button
        onClick={() => setShowExpenseForm(true)}
        className="fixed bottom-24 right-5 z-50 h-14 w-14 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg hover:from-blue-600 hover:to-blue-700 sm:bottom-8 sm:right-8"
        size="icon"
      >
        <Plus size={24} />
      </Button>

      <ExpenseForm 
        open={showExpenseForm}
        onClose={() => setShowExpenseForm(false)}
      />
    </>
  );
};
