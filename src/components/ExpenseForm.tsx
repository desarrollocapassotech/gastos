
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { useExpenseStore } from '@/hooks/useExpenseStore';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface ExpenseFormProps {
  open: boolean;
  onClose: () => void;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ open, onClose }) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [hasInstallments, setHasInstallments] = useState(false);
  const [installmentCount, setInstallmentCount] = useState('2');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { categories, addExpense, addInstallmentExpense } = useExpenseStore();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !category || !description) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive",
      });
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast({
        title: "Error",
        description: "El monto debe ser un número válido mayor a 0",
        variant: "destructive",
      });
      return;
    }

    const installments = parseInt(installmentCount);

    setIsSubmitting(true);

    try {
      if (hasInstallments) {
        if (installments < 2 || installments > 60) {
          toast({
            title: "Error",
            description: "El número de cuotas debe estar entre 2 y 60",
            variant: "destructive",
          });
          return;
        }

        await addInstallmentExpense(
          numericAmount,
          category,
          description,
          installments,
          new Date(date)
        );

        toast({
          title: "¡Éxito!",
          description: `Gasto agregado en ${installments} cuotas`,
        });
      } else {
        await addExpense({
          amount: numericAmount,
          category,
          description,
          date,
        });

        toast({
          title: "¡Éxito!",
          description: "Gasto agregado correctamente",
        });
      }

      // Reset form
      setAmount('');
      setCategory('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      setHasInstallments(false);
      setInstallmentCount('2');
      onClose();
    } catch (error) {
      console.error('Error saving expense', error);
      toast({
        title: "Error",
        description: "No se pudo guardar el gasto. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Agregar Gasto</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="amount">Monto *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-lg"
            />
          </div>

          <div>
            <Label htmlFor="category">Categoría *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    <div className="flex items-center gap-2">
                      <span>{cat.icon}</span>
                      <span>{cat.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Descripción *</Label>
            <Textarea
              id="description"
              placeholder="Descripción del gasto..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="date">Fecha</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="installments">Pago en cuotas</Label>
                <p className="text-sm text-gray-500">
                  Dividir el gasto en varios meses
                </p>
              </div>
              <Switch
                id="installments"
                checked={hasInstallments}
                onCheckedChange={setHasInstallments}
              />
            </div>
            
            {hasInstallments && (
              <div className="mt-4">
                <Label htmlFor="installment-count">Número de cuotas</Label>
                <Select value={installmentCount} onValueChange={setInstallmentCount}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 11 }, (_, i) => i + 2).map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} cuotas
                      </SelectItem>
                    ))}
                    <SelectItem value="24">24 cuotas</SelectItem>
                    <SelectItem value="36">36 cuotas</SelectItem>
                    <SelectItem value="48">48 cuotas</SelectItem>
                    <SelectItem value="60">60 cuotas</SelectItem>
                  </SelectContent>
                </Select>
                {hasInstallments && amount && (
                  <p className="text-sm text-gray-500 mt-2">
                    Cuota mensual: ${(parseFloat(amount) / parseInt(installmentCount)).toFixed(2)}
                  </p>
                )}
              </div>
            )}
          </Card>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Agregar Gasto'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
