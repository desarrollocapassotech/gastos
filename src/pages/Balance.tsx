import { useMemo, useState } from "react";
import { ArrowDownCircle, ArrowUpCircle, Scale } from "lucide-react";
import { Link } from "react-router-dom";
import { MonthNavigator } from "@/components/MonthNavigator";
import { Project, useExpenseStore } from "@/hooks/useExpenseStore";
import { formatCurrency } from "@/lib/formatters";
import { sortAccountsByName } from "@/lib/accounts";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const Balance = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const {
    projects,
    getTotalForMonth,
    getTotalIncomeForMonth,
    getTotalIncomeForMonthByProject,
  } = useExpenseStore();
  const [selectedProjectId, setSelectedProjectId] = useState<string | "all">("all");

  const projectFilter = selectedProjectId === "all" ? null : selectedProjectId;

  const sortedProjects = useMemo(() => sortAccountsByName(projects), [projects]);

  const monthlyTotal = getTotalForMonth(selectedMonth, projectFilter);
  const monthlyIncomeTotal = projectFilter 
    ? getTotalIncomeForMonthByProject(selectedMonth, projectFilter)
    : getTotalIncomeForMonth(selectedMonth);
  const balance = monthlyIncomeTotal - monthlyTotal;
  const balanceIsPositive = balance >= 0;

  const selectedProject: Project | null = useMemo(() => {
    if (!projectFilter) return null;
    return sortedProjects.find((project) => project.id === projectFilter) ?? null;
  }, [projectFilter, sortedProjects]);

  const monthText = selectedMonth.toLocaleDateString("es", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6 pb-32 sm:pb-20">
      <section className="space-y-4">
        <div className="rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-5 text-white shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] font-semibold uppercase tracking-[0.35em] text-white/70">
            <span>Balance</span>
            <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] tracking-[0.3em] text-white">
              {selectedProject ? selectedProject.name : "Todas las cuentas"}
            </span>
          </div>

          <div className="mt-4 space-y-1">
            <h1 className="inline-flex items-center rounded-2xl bg-white/15 px-4 py-2 text-3xl font-semibold leading-tight shadow-inner sm:text-4xl">
              {formatCurrency(balance)}
            </h1>
            <p className="text-sm capitalize text-white/80">{monthText}</p>
            <p className="text-xs text-white/70">
              {balanceIsPositive ? "Superávit mensual" : "Déficit mensual"}
            </p>
          </div>

          <div className="mt-6">
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
              Filtra el balance por cuenta
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
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-sky-600">
                Resumen financiero
              </p>
              <h2 className="text-xl font-semibold text-slate-900">Detalle del balance</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/incomes/new"
                className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-600 transition hover:border-emerald-300 hover:bg-emerald-100"
              >
                <ArrowUpCircle className="h-4 w-4" /> Agregar ingreso
              </Link>
              <Link
                to="/expenses/new"
                className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-600 transition hover:border-rose-300 hover:bg-rose-100"
              >
                <ArrowDownCircle className="h-4 w-4" /> Agregar gasto
              </Link>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
              <div className="flex items-center justify-between">
                <div className="rounded-full bg-emerald-500/10 p-2 text-emerald-600">
                  <ArrowUpCircle className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                  Ingresos
                </span>
              </div>
              <p className="mt-4 text-2xl font-semibold text-emerald-700">
                {formatCurrency(monthlyIncomeTotal)}
              </p>
              <p className="text-xs text-emerald-600/80">Registrados en {monthText}</p>
            </div>

            <div className="rounded-2xl border border-rose-100 bg-rose-50/60 p-4">
              <div className="flex items-center justify-between">
                <div className="rounded-full bg-rose-500/10 p-2 text-rose-600">
                  <ArrowDownCircle className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide text-rose-600">
                  Gastos
                </span>
              </div>
              <p className="mt-4 text-2xl font-semibold text-rose-700">
                {formatCurrency(monthlyTotal)}
              </p>
              <p className="text-xs text-rose-600/80">Registrados en {monthText}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <div className="flex items-center justify-between">
                <div className={`rounded-full p-2 ${balanceIsPositive ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"}`}>
                  <Scale className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Balance
                </span>
              </div>
              <p
                className={`mt-4 text-2xl font-semibold ${balanceIsPositive ? "text-emerald-700" : "text-rose-600"}`}
              >
                {formatCurrency(balance)}
              </p>
              <p className="text-xs text-slate-500">
                {balanceIsPositive ? "Superávit mensual" : "Déficit mensual"}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Balance;

