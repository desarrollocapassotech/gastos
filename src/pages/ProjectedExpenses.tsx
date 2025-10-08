import { FormEvent, useMemo, useState } from "react";
import { ArrowLeft, Calendar, TrendingUp, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useExpenseStore, Project } from "@/hooks/useExpenseStore";
import { formatCurrency, formatMonth } from "@/lib/formatters";
import { Link, useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ProjectedExpenses = () => {
  const { getTotalForMonth, projects } = useExpenseStore();
  const [selectedProjectId, setSelectedProjectId] = useState<string | "all">("all");
  const [searchMonth, setSearchMonth] = useState<string>("");
  const navigate = useNavigate();

  const projectFilter = selectedProjectId === "all" ? null : selectedProjectId;
  const selectedProject: Project | null = useMemo(() => {
    if (!projectFilter) return null;
    return projects.find((project) => project.id === projectFilter) ?? null;
  }, [projectFilter, projects]);

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const currentMonthStart = useMemo(
    () => new Date(currentYear, currentMonth, 1),
    [currentMonth, currentYear]
  );
  const nextMonthStart = useMemo(
    () => new Date(currentYear, currentMonth + 1, 1),
    [currentMonth, currentYear]
  );

  const months = useMemo(
    () =>
      Array.from({ length: 14 }, (_, index) =>
        new Date(currentYear, currentMonth + index - 1, 1)
      ),
    [currentMonth, currentYear]
  );

  const monthsData = useMemo(
    () =>
      months.map((monthDate) => {
        const total = getTotalForMonth(monthDate, projectFilter);
        const isCurrent = monthDate.getTime() === currentMonthStart.getTime();
        const isPast = monthDate < currentMonthStart;
        const isFuture = monthDate >= nextMonthStart;

        return {
          date: monthDate,
          total,
          isPast,
          isCurrent,
          isFuture,
          hasExpenses: total > 0,
        };
      }),
    [
      months,
      getTotalForMonth,
      projectFilter,
      currentMonthStart,
      nextMonthStart,
    ]
  );

  const totalPast = useMemo(
    () => monthsData.filter((m) => m.isPast).reduce((sum, m) => sum + m.total, 0),
    [monthsData]
  );
  const totalFuture = useMemo(
    () => monthsData.filter((m) => m.isFuture).reduce((sum, m) => sum + m.total, 0),
    [monthsData]
  );
  const currentTotal = useMemo(
    () => monthsData.find((m) => m.isCurrent)?.total || 0,
    [monthsData]
  );

  return (
    <div className="space-y-6 pb-32 sm:pb-20">
      <section className="space-y-4">
        <div className="rounded-3xl bg-gradient-to-br from-violet-500 via-sky-500 to-emerald-500 p-5 text-white shadow-xl">
          <div className="flex items-center justify-between gap-3">
            <Link
              to="/"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Volver al inicio</span>
            </Link>
            <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-white">
              Proyección
            </span>
          </div>

          <div className="mt-4 space-y-1">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
              <Calendar className="h-4 w-4" />
              Resumen de 12 meses
            </p>
            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Gastos proyectados</h1>
            <p className="text-sm text-white/80">Planifica y compara tus gastos pasados, actuales y futuros.</p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/15 p-4">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/70">
                <TrendingDown className="h-4 w-4" /> Gastos pasados
              </p>
              <p className="mt-2 text-lg font-semibold text-white">{formatCurrency(totalPast)}</p>
            </div>
            <div className="rounded-2xl bg-white/15 p-4">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/70">
                <Calendar className="h-4 w-4" /> Mes actual
              </p>
              <p className="mt-2 text-lg font-semibold text-white">{formatCurrency(currentTotal)}</p>
            </div>
            <div className="rounded-2xl bg-white/15 p-4">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/70">
                <TrendingUp className="h-4 w-4" /> Gastos futuros
              </p>
              <p className="mt-2 text-lg font-semibold text-white">{formatCurrency(totalFuture)}</p>
            </div>
          </div>
          <div className="mt-4 rounded-2xl bg-white/15 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
              Proyecto seleccionado
            </p>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-white/80">
                {selectedProject ? selectedProject.name : "Todos los proyectos"}
              </p>
              <Select
                value={selectedProjectId}
                onValueChange={(value) => setSelectedProjectId(value as string | "all")}
              >
                <SelectTrigger className="h-10 w-full border-white/40 bg-white/20 text-left text-sm font-medium text-white sm:w-60">
                  <SelectValue placeholder="Selecciona un proyecto" />
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
        </div>
      </section>

      <section className="space-y-4">
        <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Desglose mensual</h2>
            <span className="text-xs font-medium text-slate-500">{monthsData.length} meses</span>
          </div>

          <form
            className="mb-4 flex flex-col gap-2 rounded-2xl bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between"
            onSubmit={(event: FormEvent<HTMLFormElement>) => {
              event.preventDefault();
              if (!searchMonth) return;

              const [year, month] = searchMonth.split("-");
              if (!year || !month) return;

              navigate(`/month/${year}/${Number(month)}`);
            }}
          >
            <div className="flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Buscar mes específico
              </span>
              <span className="text-xs text-slate-500">
                Ingresa un mes para ver su detalle, incluso si no está en el listado.
              </span>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                type="month"
                value={searchMonth}
                onChange={(event) => setSearchMonth(event.target.value)}
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-200"
              />
              <button
                type="submit"
                className="inline-flex h-10 items-center justify-center rounded-lg bg-sky-600 px-4 text-sm font-semibold text-white transition hover:bg-sky-700"
              >
                Ir al mes
              </button>
            </div>
          </form>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {monthsData.map((monthData) => {
              const { date, total, isPast, isCurrent, isFuture, hasExpenses } = monthData;
              const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

              let cardClass = "border-slate-100 bg-slate-50/60";
              let badgeVariant: "default" | "secondary" | "destructive" = "secondary";
              let statusText = "Planificado";

              if (isCurrent) {
                cardClass = "border-sky-200 bg-sky-50/80";
                badgeVariant = "default";
                statusText = "Actual";
              } else if (isPast) {
                cardClass = hasExpenses ? "border-rose-200 bg-rose-50/80" : "border-slate-100 bg-slate-50/60";
                badgeVariant = hasExpenses ? "destructive" : "secondary";
                statusText = hasExpenses ? "Pasado" : "Sin datos";
              } else if (isFuture) {
                cardClass = hasExpenses ? "border-emerald-200 bg-emerald-50/80" : "border-slate-100 bg-slate-50/60";
                badgeVariant = hasExpenses ? "default" : "secondary";
                statusText = hasExpenses ? "Futuro" : "Planificado";
              }

              return (
                <Link key={monthKey} to={`/month/${date.getFullYear()}/${date.getMonth() + 1}`} className="block">
                  <div
                    className={`rounded-2xl border p-4 transition-transform hover:-translate-y-1 hover:shadow-md ${cardClass}`}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="text-base font-medium capitalize text-slate-900">{formatMonth(date)}</h3>
                      <Badge variant={badgeVariant} className="text-xs">
                        {statusText}
                      </Badge>
                    </div>
                    <p className="text-lg font-semibold text-slate-900">{formatCurrency(total)}</p>
                    {!hasExpenses && (
                      <p className="mt-1 text-xs text-slate-500">Sin gastos registrados</p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
};

export default ProjectedExpenses;
