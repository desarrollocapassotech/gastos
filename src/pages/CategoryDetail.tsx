import React, { useState } from 'react';
import { ArrowLeft, Calendar, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Expense, useExpenseStore } from '@/hooks/useExpenseStore';
import { formatCurrency } from '@/lib/formatters';
import { FloatingExpenseButton } from '@/components/FloatingExpenseButton';
import { EditExpenseModal } from '@/components/EditExpenseModal';

const CategoryDetail = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const { expenses, categories, getExpensesForMonth } = useExpenseStore();
  
  const selectedMonth = new Date(); // Por ahora usamos el mes actual, se puede expandir
  
  const categoryInfo = categories.find(cat => cat.name === category);
  const categoryExpenses = expenses.filter(expense => 
    expense.category === category &&
    new Date(expense.date).getMonth() === selectedMonth.getMonth() &&
    new Date(expense.date).getFullYear() === selectedMonth.getFullYear()
  );

  const totalAmount = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const { updateExpense } = useExpenseStore();
const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  if (!categoryInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="text-center py-12">
            <CardContent>
              <h2 className="text-xl font-semibold mb-4">Categoría no encontrada</h2>
              <Button onClick={() => navigate('/')}>Volver al inicio</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="outline" size="icon">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div 
              className="w-6 h-6 rounded-full"
              style={{ backgroundColor: categoryInfo.color }}
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span>{categoryInfo.icon}</span>
                {categoryInfo.name}
              </h1>
              <p className="text-gray-600">
                Gastos de {selectedMonth.toLocaleDateString('es', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign size={16} />
              Total en {categoryInfo.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(totalAmount)}</div>
            <p className="text-blue-100 text-sm">
              {categoryExpenses.length} {categoryExpenses.length === 1 ? 'gasto' : 'gastos'} registrados
            </p>
          </CardContent>
        </Card>

        {/* Expenses List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="text-blue-600" size={20} />
              Detalle de Gastos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categoryExpenses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">{categoryInfo.icon}</div>
                <h3 className="text-lg font-medium">No hay gastos registrados</h3>
                <p>No tienes gastos en esta categoría para este mes</p>
              </div>
            ) : (
              <div className="space-y-3">
                {categoryExpenses
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((expense) => (
                    <div 
  key={expense.id} 
  className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
>
  <div className="flex-1">
    <div className="font-medium text-gray-900 mb-1">
      {expense.description}
    </div>
    <div className="flex items-center gap-3 text-sm text-gray-500">
      <span className="flex items-center gap-1">
        <Calendar size={14} />
        {new Date(expense.date).toLocaleDateString('es')}
      </span>
      {expense.installments && (
        <Badge variant="outline" className="text-xs">
          Cuota {expense.installments.current}/{expense.installments.total}
        </Badge>
      )}
    </div>
    {expense.installments && (
      <div className="text-xs text-gray-400 mt-1">
        Total original: {formatCurrency(expense.installments.originalAmount)}
      </div>
    )}
  </div>
  <div className="flex items-center gap-2">
    <button
      onClick={() => setEditingExpense(expense)}
      className="text-blue-600 hover:text-blue-800 text-sm"
    >
      Editar
    </button>
    <div className="text-lg font-semibold text-gray-900">
      {formatCurrency(expense.amount)}
    </div>
  </div>
</div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal de edición */}
{editingExpense && (
  <EditExpenseModal
    expense={editingExpense}
    onSave={(updatedData) => {
      updateExpense(editingExpense.id, updatedData);
      setEditingExpense(null);
    }}
    onClose={() => setEditingExpense(null)}
  />
)}
      
      <FloatingExpenseButton />
    </div>
  );
};

export default CategoryDetail;
