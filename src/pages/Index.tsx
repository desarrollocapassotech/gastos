import { useMemo, useState } from "react";
import { Calendar, Clock, Plus, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ExpenseChart } from "@/components/ExpenseChart";
import { CategoryList } from "@/components/CategoryList";
import { MonthNavigator } from "@/components/MonthNavigator";
import { Expense, useExpenseStore } from "@/hooks/useExpenseStore";
import { formatCurrency } from "@/lib/formatters";
import { EditExpenseModal } from "@/components/EditExpenseModal";
import { ExpenseForm } from "@/components/ExpenseForm";

const Index = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const { getExpensesForMonth, getTotalForMonth, getCategoriesWithTotals, updateExpense } = useExpenseStore();

  const monthlyExpenses = getExpensesForMonth(selectedMonth);
  const monthlyTotal = getTotalForMonth(selectedMonth);
  const categoriesWithTotals = getCategoriesWithTotals(selectedMonth);

  const totalCategoriesAmount = useMemo(
    () => categoriesWithTotals.reduce((sum, category) => sum + category.total, 0),
    [categoriesWithTotals]
  );

  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const monthText = selectedMonth.toLocaleDateString("es", {
    month: "long",
    year: "numeric",
  });

  const summaryLabel = "Total mensual";

  return (
    <div className="space-y-6 pb-32 sm:pb-20">
      <section className="space-y-4">
        <div className="rounded-3xl bg-gradient-to-br from-emerald-400 via-sky-500 to-indigo-500 p-5 text-white shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] font-semibold uppercase tracking-[0.35em] text-white/70">
            <span>Gastos</span>
            <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] tracking-[0.3em] text-white">Total</span>
          </div>

          <div className="mt-4 space-y-1">
            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
              {formatCurrency(monthlyTotal)}
            </h1>
            <p className="text-sm capitalize text-white/80">{monthText}</p>
            <p className="text-xs text-white/70">Controla tus finanzas día a día.</p>
          </div>

          <div className="mt-6 flex flex-col items-center gap-6">
            <div className="relative flex w-full justify-center">
              {monthlyExpenses.length > 0 ? (
                <ExpenseChart
                  expenses={monthlyExpenses}
                  className="h-[220px] w-[220px] sm:h-[260px] sm:w-[260px]"
                  innerRadius={80}
                  outerRadius={110}
                  centerLabel={
                    <div className="flex flex-col items-center text-white">
                      <span className="text-xs uppercase tracking-[0.25em] text-white/70">
                        {summaryLabel}
                      </span>
                      <span className="mt-1 text-3xl font-semibold">
                        {formatCurrency(monthlyTotal)}
                      </span>
                      <span className="mt-1 text-xs capitalize text-white/80">{monthText}</span>
                    </div>
                  }
                />
              ) : (
                <div className="flex h-[220px] w-[220px] flex-col items-center justify-center rounded-full border border-white/30 bg-white/10 text-center text-white/80 sm:h-[260px] sm:w-[260px]">
                  <span className="text-4xl">📊</span>
                  <p className="mt-2 text-sm font-medium">Sin datos por ahora</p>
                  <p className="mt-1 text-xs text-white/70">Agrega tu primer gasto</p>
                </div>
              )}
              <button
                type="button"
                onClick={() => setShowExpenseForm(true)}
                className="absolute bottom-4 right-[22%] flex h-12 w-12 items-center justify-center rounded-full bg-white text-sky-600 shadow-lg transition hover:scale-105"
              >
                <Plus className="h-6 w-6" />
                <span className="sr-only">Agregar gasto</span>
              </button>
            </div>

            <MonthNavigator
              selectedMonth={selectedMonth}
              onMonthChange={setSelectedMonth}
              variant="translucent"
              className="w-full border-white/30"
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-sky-600">
              Resumen
            </p>
            <h2 className="text-xl font-semibold text-slate-900">Movimientos del mes</h2>
          </div>
          <Link
            to="/projected"
            className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-4 py-2 text-xs font-semibold text-sky-600 transition hover:bg-sky-100"
          >
            <Sparkles className="h-4 w-4" /> Proyección
          </Link>
        </div>
      </section>

      <section className="space-y-4">
        <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900">
              <Calendar className="h-5 w-5 text-sky-500" /> Categorías del mes
            </h3>
            <span className="text-xs font-medium text-slate-500">
              {formatCurrency(totalCategoriesAmount)} totales
            </span>
          </div>
          <CategoryList categories={categoriesWithTotals} />
        </div>

        {monthlyExpenses.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white/70 p-10 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sky-50 text-sky-500">
              <Plus className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">
              No hay gastos registrados
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Comienza agregando tu primer gasto del mes para ver el resumen.
            </p>
          </div>
        )}
      </section>

      <ExpenseForm open={showExpenseForm} onClose={() => setShowExpenseForm(false)} />

      {editingExpense && (
        <EditExpenseModal
          expense={editingExpense}
          onSave={async (updatedData) => {
            await updateExpense(editingExpense.id, updatedData);
            setEditingExpense(null);
          }}
          onClose={() => setEditingExpense(null)}
        />
      )}
    </div>
  );
};

export default Index;
