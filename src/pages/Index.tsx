import { useState } from "react";
import { TrendingUp, Calendar, PieChart, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ExpenseChart } from "@/components/ExpenseChart";
import { CategoryList } from "@/components/CategoryList";
import { MonthNavigator } from "@/components/MonthNavigator";
import { Expense, useExpenseStore } from "@/hooks/useExpenseStore";
import { formatCurrency } from "@/lib/formatters";
import { FloatingExpenseButton } from "@/components/FloatingExpenseButton";
import { EditExpenseModal } from "@/components/EditExpenseModal";

const Index = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const { getExpensesForMonth, getTotalForMonth, getCategoriesWithTotals, updateExpense } = useExpenseStore();

  const monthlyExpenses = getExpensesForMonth(selectedMonth);
  const monthlyTotal = getTotalForMonth(selectedMonth);
  const categoriesWithTotals = getCategoriesWithTotals(selectedMonth);

  const currentMonth =
    new Date().getMonth() === selectedMonth.getMonth() &&
    new Date().getFullYear() === selectedMonth.getFullYear();

  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  return (
    <div className="space-y-6 pb-14">
      <section className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
          Resumen mensual
        </p>
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Mis gastos</h1>
        <p className="text-sm text-slate-600">
          Controla tus finanzas de manera simple y efectiva.
        </p>
      </section>

      <MonthNavigator selectedMonth={selectedMonth} onMonthChange={setSelectedMonth} />

      <section className="grid gap-4 sm:grid-cols-2 sm:gap-6">
        <Link to="/projected" className="group">
          <Card className="overflow-hidden border-none bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md transition-transform group-hover:-translate-y-1 group-focus-visible:-translate-y-1">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <TrendingUp size={16} />
                Total del mes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="text-3xl font-semibold leading-tight">{formatCurrency(monthlyTotal)}</p>
              <p className="text-xs uppercase tracking-wide text-blue-100">
                {currentMonth
                  ? "Mes actual"
                  : selectedMonth.toLocaleDateString("es", { month: "long", year: "numeric" })}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Card className="border border-blue-100 bg-white/90 shadow-sm backdrop-blur">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <PieChart size={18} className="text-blue-600" />
              Categorías
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <CategoryList categories={categoriesWithTotals} />
          </CardContent>
        </Card>

        {monthlyExpenses.length > 0 && (
          <Card className="border border-blue-100 bg-white/90 shadow-sm backdrop-blur sm:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <PieChart size={18} className="text-blue-600" />
                Distribución por categoría
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ExpenseChart expenses={monthlyExpenses} />
            </CardContent>
          </Card>
        )}
      </section>

      {monthlyExpenses.length > 0 && (
        <Card className="border border-blue-100 bg-white/90 shadow-sm backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar size={18} className="text-blue-600" />
              Gastos recientes ({monthlyExpenses.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {monthlyExpenses.slice(0, 5).map((expense) => (
              <button
                key={expense.id}
                onClick={() => setEditingExpense(expense)}
                className="flex w-full items-center justify-between rounded-xl border border-blue-100 bg-blue-50/50 p-3 text-left transition-colors hover:bg-blue-50"
              >
                <div className="flex-1 pr-4">
                  <p className="font-medium text-slate-900">{expense.description}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <Badge variant="secondary">{expense.category}</Badge>
                    <span>{new Date(expense.date).toLocaleDateString("es")}</span>
                  </div>
                </div>
                <div className="text-right text-lg font-semibold text-slate-900">
                  {formatCurrency(expense.amount)}
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {monthlyExpenses.length === 0 && (
        <Card className="border border-blue-100 bg-white/90 py-12 text-center shadow-sm backdrop-blur">
          <CardContent className="space-y-3">
            <DollarSign size={48} className="mx-auto text-blue-200" />
            <h3 className="text-lg font-medium text-slate-900">No hay gastos registrados</h3>
            <p className="text-sm text-slate-500">Comienza agregando tu primer gasto del mes.</p>
          </CardContent>
        </Card>
      )}

      <FloatingExpenseButton />

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
