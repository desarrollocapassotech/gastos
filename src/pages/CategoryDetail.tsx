import { useState } from "react";
import { ArrowLeft, Calendar, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Expense, useExpenseStore } from "@/hooks/useExpenseStore";
import { formatCurrency } from "@/lib/formatters";
import { FloatingExpenseButton } from "@/components/FloatingExpenseButton";
import { EditExpenseModal } from "@/components/EditExpenseModal";

const CategoryDetail = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const { expenses, categories, updateExpense } = useExpenseStore();

  const selectedMonth = new Date();

  const categoryInfo = categories.find((cat) => cat.name === category);
  const categoryExpenses = expenses.filter(
    (expense) =>
      expense.category === category &&
      new Date(expense.date).getMonth() === selectedMonth.getMonth() &&
      new Date(expense.date).getFullYear() === selectedMonth.getFullYear(),
  );

  const totalAmount = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  if (!categoryInfo) {
    return (
      <div className="space-y-6 pb-14">
        <Card className="border border-blue-100 bg-white/90 py-12 text-center shadow-sm backdrop-blur">
          <CardContent className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">Categoría no encontrada</h2>
            <Button onClick={() => navigate("/")}>Volver al inicio</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-14">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <Link to="/" className="inline-flex">
          <Button variant="outline" size="icon" className="h-10 w-10 rounded-full">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-full text-lg"
            style={{ backgroundColor: categoryInfo.color }}
          >
            {categoryInfo.icon}
          </span>
          <div className="flex flex-col gap-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
              Gastos por categoría
            </p>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{categoryInfo.name}</h1>
            <p className="text-sm text-slate-600">
              Gastos de {selectedMonth.toLocaleDateString("es", { month: "long", year: "numeric" })}
            </p>
          </div>
        </div>
      </section>

      <Card className="border-none bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <DollarSign size={16} />
            Total en {categoryInfo.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <p className="text-3xl font-semibold leading-tight">{formatCurrency(totalAmount)}</p>
          <p className="text-xs uppercase tracking-wide text-blue-100">
            {categoryExpenses.length} {categoryExpenses.length === 1 ? "gasto" : "gastos"} registrados
          </p>
        </CardContent>
      </Card>

      <Card className="border border-blue-100 bg-white/90 shadow-sm backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="text-blue-600" size={20} />
            Detalle de gastos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {categoryExpenses.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500">
              <div className="mb-2 text-3xl">{categoryInfo.icon}</div>
              <p>No hay gastos registrados en esta categoría para este mes.</p>
            </div>
          ) : (
            categoryExpenses
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50/40 p-4"
                >
                  <div className="flex-1 space-y-1">
                    <p className="font-medium text-slate-900">{expense.description}</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(expense.date).toLocaleDateString("es")}
                      </span>
                      {expense.installments && (
                        <Badge variant="outline" className="text-xs">
                          Cuota {expense.installments.current}/{expense.installments.total}
                        </Badge>
                      )}
                    </div>
                    {expense.installments && (
                      <p className="text-xs text-slate-400">
                        Total original: {formatCurrency(expense.installments.originalAmount)}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => setEditingExpense(expense)}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                      Editar
                    </button>
                    <p className="text-lg font-semibold text-slate-900">
                      {formatCurrency(expense.amount)}
                    </p>
                  </div>
                </div>
              ))
          )}
        </CardContent>
      </Card>

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
