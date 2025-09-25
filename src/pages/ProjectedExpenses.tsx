import { ArrowLeft, Calendar, TrendingUp, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useExpenseStore } from "@/hooks/useExpenseStore";
import { formatCurrency, formatMonth } from "@/lib/formatters";
import { Link } from "react-router-dom";
import { FloatingExpenseButton } from "@/components/FloatingExpenseButton";

const ProjectedExpenses = () => {
  const { getTotalForMonth } = useExpenseStore();

  const currentDate = new Date();
  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(currentDate);
    date.setMonth(currentDate.getMonth() - 6 + i);
    return date;
  });

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const getMonthData = (date: Date) => {
    const total = getTotalForMonth(date);
    const isPast = date < new Date(currentYear, currentMonth, 1);
    const isCurrent = date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    const isFuture = date > new Date(currentYear, currentMonth + 1, 0);

    return {
      date,
      total,
      isPast,
      isCurrent,
      isFuture,
      hasExpenses: total > 0,
    };
  };

  const monthsData = months.map(getMonthData);
  const totalPast = monthsData.filter((m) => m.isPast).reduce((sum, m) => sum + m.total, 0);
  const totalFuture = monthsData.filter((m) => m.isFuture).reduce((sum, m) => sum + m.total, 0);
  const currentTotal = monthsData.find((m) => m.isCurrent)?.total || 0;

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
        </div>
      </section>

      <section className="space-y-4">
        <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Desglose mensual</h2>
            <span className="text-xs font-medium text-slate-500">{monthsData.length} meses</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {monthsData.map((monthData) => {
              const { date, total, isPast, isCurrent, isFuture, hasExpenses } = monthData;

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
                <Link key={date.toISOString()} to={`/month/${date.getFullYear()}/${date.getMonth() + 1}`} className="block">
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

      <FloatingExpenseButton />
    </div>
  );
};

export default ProjectedExpenses;
