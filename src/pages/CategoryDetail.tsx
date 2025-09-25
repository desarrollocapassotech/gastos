import { useMemo, useState } from "react";
import { ArrowLeft, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Expense, Project, useExpenseStore } from "@/hooks/useExpenseStore";
import { formatCurrency } from "@/lib/formatters";
import { EditExpenseModal } from "@/components/EditExpenseModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CategoryDetail = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const { expenses, categories, updateExpense, projects } = useExpenseStore();
  const [selectedProjectId, setSelectedProjectId] = useState<string | "all">("all");

  const selectedMonth = new Date();
  const monthText = selectedMonth.toLocaleDateString("es", { month: "long", year: "numeric" });

  const categoryInfo = categories.find((cat) => cat.name === category);
  const projectFilter = selectedProjectId === "all" ? null : selectedProjectId;
  const projectMap = useMemo(
    () =>
      projects.reduce<Record<string, Project>>((acc, project) => {
        acc[project.id] = project;
        return acc;
      }, {}),
    [projects]
  );
  const selectedProject = projectFilter ? projectMap[projectFilter] ?? null : null;
  const categoryExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date);
    const matchesProject = projectFilter ? expense.projectId === projectFilter : true;
    return (
      expense.category === category &&
      expenseDate.getMonth() === selectedMonth.getMonth() &&
      expenseDate.getFullYear() === selectedMonth.getFullYear() &&
      matchesProject
    );
  });

  const totalAmount = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const expensesCount = categoryExpenses.length;
  const averageExpense = expensesCount > 0 ? totalAmount / expensesCount : 0;
  const lastExpenseDate = categoryExpenses.reduce<Date | null>((latest, expense) => {
    const expenseDate = new Date(expense.date);
    if (!latest || expenseDate.getTime() > latest.getTime()) {
      return expenseDate;
    }
    return latest;
  }, null);

  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  if (!categoryInfo) {
    return (
      <div className="space-y-6 pb-32 sm:pb-20">
        <div className="rounded-3xl border border-slate-100 bg-white p-10 text-center shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900">Categoría no encontrada</h2>
          <p className="mt-2 text-sm text-slate-500">Revisa el listado de categorías disponibles e inténtalo nuevamente.</p>
          <Button onClick={() => navigate("/")} className="mt-6">
            Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-32 sm:pb-20">
      <section className="space-y-4">
        <div className="rounded-3xl bg-gradient-to-br from-indigo-500 via-violet-500 to-sky-500 p-5 text-white shadow-xl">
          <div className="flex items-center justify-between gap-3">
            <Link
              to="/"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Volver al inicio</span>
            </Link>
            <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-white">
              Categoría
            </span>
          </div>

          <div className="mt-4 flex items-start gap-3">
            <span
              className="flex h-12 w-12 items-center justify-center rounded-2xl text-xl"
              style={{ backgroundColor: categoryInfo.color }}
            >
              {categoryInfo.icon}
            </span>
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">Gastos por categoría</p>
              <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">{categoryInfo.name}</h1>
              <p className="text-sm capitalize text-white/80">{monthText}</p>
              <p className="text-xs text-white/70">
                {expensesCount} {expensesCount === 1 ? "gasto" : "gastos"} registrados este mes
              </p>
              <p className="text-xs text-white/70">
                Proyecto: {selectedProject ? selectedProject.name : "Todos"}
              </p>
          </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-white/15 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/70">Total del mes</p>
              <p className="mt-2 text-lg font-semibold text-white">{formatCurrency(totalAmount)}</p>
            </div>
            <div className="rounded-2xl bg-white/15 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/70">Promedio por gasto</p>
              <p className="mt-2 text-lg font-semibold text-white">{formatCurrency(averageExpense)}</p>
            </div>
            <div className="rounded-2xl bg-white/15 p-4 sm:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/70">Última compra</p>
              <p className="mt-2 text-lg font-semibold text-white">
                {lastExpenseDate ? lastExpenseDate.toLocaleDateString("es") : "Sin datos"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-sky-500" />
              <h2 className="text-base font-semibold text-slate-900">Detalle de gastos</h2>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <span className="text-xs font-medium text-slate-500">
                {expensesCount} {expensesCount === 1 ? "gasto" : "gastos"}
              </span>
              <Select
                value={selectedProjectId}
                onValueChange={(value) => setSelectedProjectId(value as string | "all")}
              >
                <SelectTrigger className="h-9 w-full border-slate-200 text-left text-xs font-medium text-slate-600 sm:w-56">
                  <SelectValue placeholder="Filtrar por proyecto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los proyectos</SelectItem>
                  {projects.map((project) => (
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
          </div>

          {categoryExpenses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-10 text-center text-slate-500">
              <div className="mb-2 text-3xl">{categoryInfo.icon}</div>
              <p>No hay gastos registrados en esta categoría para este mes.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {categoryExpenses
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((expense) => (
                  <button
                    key={expense.id}
                    onClick={() => setEditingExpense(expense)}
                    className="flex w-full items-start justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 text-left transition hover:bg-slate-50"
                  >
                    <div className="flex-1 space-y-1">
                      <p className="font-medium text-slate-900">{expense.description}</p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(expense.date).toLocaleDateString("es")}
                        </span>
                        {expense.projectId && projectMap[expense.projectId] && (
                          <Badge variant="outline" className="text-xs">
                            {projectMap[expense.projectId].name}
                          </Badge>
                        )}
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
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Editar</span>
                      <p className="text-lg font-semibold text-slate-900">{formatCurrency(expense.amount)}</p>
                    </div>
                  </button>
                ))}
            </div>
          )}
        </div>
      </section>

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

export default CategoryDetail;
