import { useState } from 'react';
import { TrendingUp, Calendar, PieChart, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { ExpenseChart } from '@/components/ExpenseChart';
import { CategoryList } from '@/components/CategoryList';
import { MonthNavigator } from '@/components/MonthNavigator';
import { Expense, useExpenseStore } from '@/hooks/useExpenseStore';
import { formatCurrency } from '@/lib/formatters';
import { FloatingExpenseButton } from '@/components/FloatingExpenseButton';
import { EditExpenseModal } from '@/components/EditExpenseModal'; // Asegúrate de tener este componente

const Index = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const { getExpensesForMonth, getTotalForMonth, getCategoriesWithTotals } = useExpenseStore();

  const monthlyExpenses = getExpensesForMonth(selectedMonth);
  const monthlyTotal = getTotalForMonth(selectedMonth);
  const categoriesWithTotals = getCategoriesWithTotals(selectedMonth);

  const currentMonth = new Date().getMonth() === selectedMonth.getMonth() &&
    new Date().getFullYear() === selectedMonth.getFullYear();

  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const { updateExpense } = useExpenseStore(); // Asegúrate de haber agregado `updateExpense` al store

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <DollarSign className="text-green-600" />
            Mis Gastos
          </h1>
          <p className="text-gray-600">Controla tus finanzas de manera simple y efectiva</p>
        </div>

        {/* Month Navigator */}
        <MonthNavigator
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
        />

        {/* Summary Cards & Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link to="/projected">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp size={16} />
                  Total del Mes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(monthlyTotal)}</div>
                <p className="text-blue-100 text-sm">
                  {currentMonth ? 'Mes actual' : selectedMonth.toLocaleDateString('es', { month: 'long', year: 'numeric' })}
                </p>
              </CardContent>
            </Card>
          </Link>

          <Card>
            <CardHeader>
              <CardTitle>Categorías</CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryList
                categories={categoriesWithTotals}
                selectedMonth={selectedMonth}
              />
            </CardContent>
          </Card>
        </div>

        {/* Recent Expenses */}
        {monthlyExpenses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Gastos Recientes ({monthlyExpenses.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {monthlyExpenses.slice(0, 5).map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{expense.description}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <Badge variant="secondary">{expense.category}</Badge>
                        <span>{new Date(expense.date).toLocaleDateString('es')}</span>
                      </div>
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
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {monthlyExpenses.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-gray-500 space-y-2">
                <DollarSign size={48} className="mx-auto text-gray-300" />
                <h3 className="text-lg font-medium">No hay gastos registrados</h3>
                <p>Comienza agregando tu primer gasto del mes</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <FloatingExpenseButton />

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
    </div>
  );
};

export default Index;