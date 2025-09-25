import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrencyInput, parseCurrencyInput } from '@/lib/formatters';

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}

interface EditExpenseModalProps {
  expense: Expense;
  onSave: (updatedExpense: Partial<Omit<Expense, 'id'>>) => void;
  onClose: () => void;
}

export const EditExpenseModal: React.FC<EditExpenseModalProps> = ({
  expense,
  onSave,
  onClose,
}) => {
  const [amount, setAmount] = useState(formatCurrencyInput(expense.amount.toFixed(2)));
  const [category, setCategory] = useState(expense.category);
  const [description, setDescription] = useState(expense.description);
  const [date, setDate] = useState(expense.date);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      amount: parseCurrencyInput(amount),
      category,
      description,
      date,
    });
    onClose();

    window.location.reload();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Editar Gasto</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Monto</Label>
              <Input
                id="amount"
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(formatCurrencyInput(e.target.value))}
                required
                placeholder="Ejemplo: 150,50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Input
                id="category"
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                placeholder="Ejemplo: Alimentación"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Input
                id="description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                placeholder="Ejemplo: Compra de supermercado"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="px-4 py-2 text-sm"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="px-4 py-2 text-sm"
              >
                Guardar Cambios
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};