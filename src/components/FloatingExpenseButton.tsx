
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
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 z-50"
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
