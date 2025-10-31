import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrencyInput, parseCurrencyInput } from '@/lib/formatters';
import { Loader2 } from 'lucide-react';
import { DatePicker } from '@/components/DatePicker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useExpenseStore, Project } from '@/hooks/useExpenseStore';

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  projectId?: string;
}

interface EditExpenseModalProps {
  expense: Expense;
  onSave: (
    updatedExpense: Partial<Omit<Expense, 'id'>>
  ) => Promise<void> | void;
  onClose: () => void;
  onDelete?: (id: string) => Promise<void> | void;
}

export const EditExpenseModal: React.FC<EditExpenseModalProps> = ({
  expense,
  onSave,
  onClose,
  onDelete,
}) => {
  const { projects } = useExpenseStore();
  const [amount, setAmount] = useState(() =>
    formatCurrencyInput(expense.amount.toFixed(2).replace('.', ','))
  );
  const [category, setCategory] = useState(expense.category);
  const [description, setDescription] = useState(expense.description);
  const [date, setDate] = useState(expense.date);
  const [projectId, setProjectId] = useState<string | undefined>(expense.projectId);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!projectId && projects.length > 0) {
      setProjectId(projects[0].id);
    }
  }, [projectId, projects]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await onSave({
        amount: parseCurrencyInput(amount),
        category,
        description,
        date,
        projectId,
      });
      onClose();
    } catch (error) {
      console.error('Error updating expense', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    const confirmed = window.confirm('¿Seguro que deseas eliminar este gasto?');
    if (!confirmed) return;
    setIsDeleting(true);
    try {
      await onDelete(expense.id);
      onClose();
    } catch (error) {
      console.error('Error deleting expense', error);
    } finally {
      setIsDeleting(false);
    }
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
              <Label htmlFor="project">Cuenta</Label>
              <Select
                value={projectId ?? projects[0]?.id ?? ''}
                onValueChange={(value) => setProjectId(value || undefined)}
              >
                <SelectTrigger id="project" className="h-10">
                  <SelectValue placeholder="Selecciona una cuenta" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project: Project) => (
                    <SelectItem key={project.id} value={project.id}>
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-flex h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: project.color }}
                        />
                        {project.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Label htmlFor="edit-date">Fecha</Label>
              <DatePicker
                id="edit-date"
                value={date}
                onChange={setDate}
                buttonClassName="h-10"
              />
            </div>

            <div className="flex justify-between gap-3 mt-6">
              {onDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  className="px-4 py-2 text-sm"
                  disabled={isSaving || isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Eliminando...
                    </>
                  ) : (
                    'Eliminar'
                  )}
                </Button>
              )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="px-4 py-2 text-sm"
                  disabled={isSaving || isDeleting}
                >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="px-4 py-2 text-sm"
                disabled={isSaving || isDeleting}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar Cambios'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};