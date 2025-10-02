import { useMemo } from "react";
import { ArrowLeft, ArrowUpCircle, CalendarDays, PlusCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useExpenseStore } from "@/hooks/useExpenseStore";
import { formatCurrency } from "@/lib/formatters";

interface GroupedIncome {
  monthKey: string;
  monthLabel: string;
  total: number;
  items: {
    id: string;
    description: string;
    amount: number;
    date: string;
  }[];
}

const formatMonthLabel = (monthKey: string) => {
  const date = new Date(`${monthKey}-01T00:00:00`);
  return date.toLocaleDateString("es", {
    month: "long",
    year: "numeric",
  });
};

const formatIncomeDate = (date: string) => {
  const incomeDate = new Date(`${date}T00:00:00`);
  return incomeDate.toLocaleDateString("es", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const Incomes = () => {
  const navigate = useNavigate();
  const { incomes } = useExpenseStore();

  const { totalIncome, groupedIncomes } = useMemo(() => {
    if (incomes.length === 0) {
      return { totalIncome: 0, groupedIncomes: [] as GroupedIncome[] };
    }

    const sorted = [...incomes].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const groupsMap = new Map<string, GroupedIncome>();

    for (const income of sorted) {
      const monthKey = income.date.slice(0, 7);
      if (!groupsMap.has(monthKey)) {
        const label = formatMonthLabel(monthKey);
        groupsMap.set(monthKey, {
          monthKey,
          monthLabel: label.charAt(0).toUpperCase() + label.slice(1),
          total: 0,
          items: [],
        });
      }

      const group = groupsMap.get(monthKey)!;
      group.items.push(income);
      group.total += income.amount;
    }

    const grouped = Array.from(groupsMap.values()).sort((a, b) =>
      a.monthKey < b.monthKey ? 1 : -1
    );

    const total = sorted.reduce((sum, income) => sum + income.amount, 0);

    return { totalIncome: total, groupedIncomes: grouped };
  }, [incomes]);

  const totalCount = incomes.length;

  return (
    <div className="space-y-6 pb-32 sm:pb-20">
      <section className="space-y-4">
        <div className="rounded-3xl bg-gradient-to-br from-emerald-500 via-sky-500 to-indigo-500 p-6 text-white shadow-xl">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Volver</span>
            </button>
            <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-white/80">
              Ingresos
            </span>
          </div>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/80">
                <ArrowUpCircle className="h-4 w-4" />
                Gestión de ingresos
              </div>
              <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
                {formatCurrency(totalIncome)}
              </h1>
              <p className="text-xs text-white/75">
                {totalCount === 1
                  ? "1 ingreso registrado"
                  : `${totalCount} ingresos registrados`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/incomes/new"
                className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/25"
              >
                <PlusCircle className="h-4 w-4" /> Nuevo ingreso
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        {groupedIncomes.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-emerald-200 bg-white/70 p-6 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <ArrowUpCircle className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              Aún no registraste ingresos
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Agrega tus primeros ingresos para llevar un seguimiento de tu balance mensual.
            </p>
            <Link
              to="/incomes/new"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
            >
              <PlusCircle className="h-4 w-4" /> Registrar un ingreso
            </Link>
          </div>
        ) : (
          groupedIncomes.map((group) => (
            <div
              key={group.monthKey}
              className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                    Mes
                  </p>
                  <h2 className="text-xl font-semibold text-slate-900">
                    {group.monthLabel}
                  </h2>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                    Total
                  </p>
                  <p className="text-2xl font-semibold text-emerald-600">
                    {formatCurrency(group.total)}
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {group.items.map((income) => (
                  <div
                    key={income.id}
                    className="flex flex-col gap-3 rounded-2xl border border-slate-200/70 bg-white/70 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {income.description}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                        <CalendarDays className="h-4 w-4" />
                        <span>{formatIncomeDate(income.date)}</span>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-sm font-semibold text-emerald-600">
                        {formatCurrency(income.amount)}
                      </p>
                      <p className="text-xs text-slate-500">ID #{income.id.slice(-6)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
};

export default Incomes;
