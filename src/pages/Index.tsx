import { useMemo, useState } from "react";
import { Calendar, Plus, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { ExpenseChart } from "@/components/ExpenseChart";
import { CategoryList } from "@/components/CategoryList";
import { MonthNavigator } from "@/components/MonthNavigator";
import { Expense, Project, useExpenseStore } from "@/hooks/useExpenseStore";
import { formatCompactCurrency, formatCurrency } from "@/lib/formatters";
import { EditExpenseModal } from "@/components/EditExpenseModal";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { sortAccountsByName } from "@/lib/accounts";

const Index = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const {
    projects,
    getExpensesForMonthByProject,
    getTotalForMonth,
    getCategoriesWithTotals,
    updateExpense,
  } = useExpenseStore();
  const [selectedProjectId, setSelectedProjectId] = useState<string | "all">("all");
  const navigate = useNavigate();

  const projectFilter = selectedProjectId === "all" ? null : selectedProjectId;

  const sortedProjects = useMemo(() => sortAccountsByName(projects), [projects]);

  const monthlyExpenses = getExpensesForMonthByProject(selectedMonth, projectFilter);
  const monthlyTotal = getTotalForMonth(selectedMonth, projectFilter);
  const categoriesWithTotals = getCategoriesWithTotals(selectedMonth, projectFilter);

  const totalCategoriesAmount = useMemo(
    () => categoriesWithTotals.reduce((sum, category) => sum + category.total, 0),
    [categoriesWithTotals]
  );

  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const selectedProject: Project | null = useMemo(() => {
    if (!projectFilter) return null;
    return sortedProjects.find((project) => project.id === projectFilter) ?? null;
  }, [projectFilter, sortedProjects]);

  const monthText = selectedMonth.toLocaleDateString("es", {
    month: "long",
    year: "numeric",
  });

  const summaryLabel = selectedProject ? selectedProject.name : "Total mensual";

  return (
    <div className="space-y-6 pb-32 sm:pb-20">
      <section className="space-y-4">
        <div className="rounded-3xl bg-gradient-to-br from-emerald-400 via-sky-500 to-indigo-500 p-5 text-white shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] font-semibold uppercase tracking-[0.35em] text-white/70">
            <span>Gastos</span>
            <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] tracking-[0.3em] text-white">Total</span>
          </div>

          <div className="mt-4 space-y-1">
            <h1 className="inline-flex items-center rounded-2xl bg-white/15 px-4 py-2 text-3xl font-semibold leading-tight shadow-inner sm:text-4xl">
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
                  className="h-[260px] w-[260px] sm:h-[320px] sm:w-[320px]"
                  innerRadius={95}
                  outerRadius={125}
                  centerLabel={
                    <div className="flex flex-col items-center text-white">
                      <span className="text-[10px] uppercase tracking-[0.35em] text-white/70">
                        {summaryLabel}
                      </span>
                      <span className="mt-2 text-5xl font-semibold leading-tight tracking-tight sm:text-6xl">
                        {formatCompactCurrency(monthlyTotal)}
                      </span>
                      <span className="mt-2 text-xs capitalize text-white/80">{monthText}</span>
                    </div>
                  }
                />
              ) : (
                <div className="flex h-[260px] w-[260px] flex-col items-center justify-center rounded-full border border-white/30 bg-white/10 text-center text-white/80 sm:h-[320px] sm:w-[320px]">
                  <span className="text-4xl">📊</span>
                  <p className="mt-2 text-sm font-medium">Sin datos por ahora</p>
                  <p className="mt-1 text-xs text-white/70">Agrega tu primer gasto</p>
                </div>
              )}
              <button
                type="button"
                onClick={() => navigate("/expenses/new")}
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

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-sky-600">
              Cuentas
            </p>
            <h2 className="text-sm font-semibold text-slate-900">
              Filtra los gastos por cuenta
            </h2>
          </div>
          <Link
            to="/accounts"
            className="text-xs font-semibold text-sky-600 underline hover:text-sky-500"
          >
            Gestionar
          </Link>
        </div>
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-2 pb-2">
            <button
              type="button"
              onClick={() => setSelectedProjectId("all")}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
                selectedProjectId === "all"
                  ? "border-sky-500 bg-sky-500 text-white shadow"
                  : "border-slate-200 bg-white text-slate-600 hover:border-sky-200 hover:text-sky-600"
              }`}
            >
              Todos
            </button>
            {sortedProjects.map((project) => {
              const isActive = selectedProjectId === project.id;
              return (
                <button
                  type="button"
                  key={project.id}
                  onClick={() => setSelectedProjectId(project.id)}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? "border-sky-500 bg-sky-500 text-white shadow"
                      : "border-slate-200 bg-white text-slate-600 hover:border-sky-200 hover:text-sky-600"
                  }`}
                >
                  <span
                    className="inline-flex h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: project.color }}
                  />
                  {project.name}
                </button>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
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
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900">
              <Calendar className="h-5 w-5 text-sky-500" /> Categorías del mes
            </h3>
            <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500">
              <span>{formatCurrency(totalCategoriesAmount)} totales</span>
              <Link
                to="/categories"
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-sky-600 transition hover:border-sky-200 hover:text-sky-500"
              >
                Gestionar
              </Link>
            </div>
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
