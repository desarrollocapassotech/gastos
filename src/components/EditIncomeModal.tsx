import { FormEvent, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/DatePicker";
import { formatCurrencyInput, parseCurrencyInput } from "@/lib/formatters";
import { Loader2 } from "lucide-react";
import type { Income } from "@/hooks/useExpenseStore";

interface EditIncomeModalProps {
  income: Income;
  onSave: (
    updatedIncome: Partial<Omit<Income, "id" | "userId">>
  ) => Promise<void> | void;
  onClose: () => void;
  onDelete?: (id: string) => Promise<void> | void;
}

export const EditIncomeModal = ({
  income,
  onSave,
  onClose,
  onDelete,
}: EditIncomeModalProps) => {
  const [amount, setAmount] = useState(() =>
    formatCurrencyInput(income.amount.toFixed(2).replace('.', ','))
  );
  const [description, setDescription] = useState(income.description);
  const [date, setDate] = useState(income.date);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSaving) return;
    setIsSaving(true);

    try {
      const numericAmount = parseCurrencyInput(amount);
      if (Number.isNaN(numericAmount) || numericAmount <= 0) {
        window.alert("El monto debe ser mayor a 0");
        setIsSaving(false);
        return;
      }

      await onSave({
        amount: numericAmount,
        description,
        date,
      });
      onClose();
    } catch (error) {
      console.error("Error updating income", error);
      window.alert("No se pudo actualizar el ingreso. Intenta nuevamente.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete || isDeleting) return;
    const confirmed = window.confirm(
      "¿Seguro que deseas eliminar este ingreso?"
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await onDelete(income.id);
      onClose();
    } catch (error) {
      console.error("Error deleting income", error);
      window.alert("No se pudo eliminar el ingreso. Intenta nuevamente.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md overflow-hidden rounded-lg bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Editar ingreso</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="income-amount">Monto</Label>
              <Input
                id="income-amount"
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(event) =>
                  setAmount(formatCurrencyInput(event.target.value))
                }
                required
                placeholder="Ejemplo: 200.000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="income-description">Descripción</Label>
              <Input
                id="income-description"
                type="text"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                required
                placeholder="Ejemplo: Sueldo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="income-date">Fecha</Label>
              <DatePicker
                id="income-date"
                value={date}
                onChange={setDate}
                buttonClassName="h-10"
              />
            </div>

            <div className="mt-6 flex justify-between gap-3">
              {onDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isSaving || isDeleting}
                  className="px-4 py-2 text-sm"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Eliminando...
                    </>
                  ) : (
                    "Eliminar"
                  )}
                </Button>
              )}
              <div className="ml-auto flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSaving || isDeleting}
                  className="px-4 py-2 text-sm"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving || isDeleting}
                  className="px-4 py-2 text-sm"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar cambios"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
