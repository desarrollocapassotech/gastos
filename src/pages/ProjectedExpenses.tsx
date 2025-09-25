import { ArrowLeft, Calendar, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
    <div className="space-y-6 pb-14">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <Link to="/" className="inline-flex">
          <Button variant="outline" size="icon" className="h-10 w-10 rounded-full">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
            Proyección
          </p>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 sm:text-3xl">
            <Calendar className="text-blue-600" />
            Gastos proyectados
          </h1>
          <p className="text-sm text-slate-600">
            Vista global de todos tus gastos por mes.
          </p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3 sm:gap-6">
        <Card className="border-none bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <TrendingDown size={16} />
              Gastos pasados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{formatCurrency(totalPast)}</p>
          </CardContent>
        </Card>

        <Card className="border-none bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Mes actual</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{formatCurrency(currentTotal)}</p>
          </CardContent>
        </Card>

        <Card className="border-none bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <TrendingUp size={16} />
              Gastos futuros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{formatCurrency(totalFuture)}</p>
          </CardContent>
        </Card>
      </section>

      <Card className="border border-blue-100 bg-white/90 shadow-sm backdrop-blur">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Desglose mensual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {monthsData.map((monthData) => {
              const { date, total, isPast, isCurrent, isFuture, hasExpenses } = monthData;

              let cardClass = "bg-blue-50/40 border-blue-100";
              let badgeVariant: "default" | "secondary" | "destructive" = "secondary";
              let statusText = "";

              if (isCurrent) {
                cardClass = "bg-blue-100/60 border-blue-300";
                badgeVariant = "default";
                statusText = "Actual";
              } else if (isPast) {
                cardClass = hasExpenses ? "bg-red-50/60 border-red-200" : "bg-blue-50/40 border-blue-100";
                statusText = "Pasado";
              } else if (isFuture) {
                cardClass = hasExpenses ? "bg-green-50/60 border-green-200" : "bg-blue-50/40 border-blue-100";
                statusText = "Futuro";
              }

              return (
                <Link
                  key={date.toISOString()}
                  to={`/month/${date.getFullYear()}/${date.getMonth() + 1}`}
                  className="block"
                >
                  <div
                    className={`rounded-xl border p-4 transition-transform hover:-translate-y-1 hover:shadow-md ${cardClass}`}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="text-base font-medium capitalize text-slate-900">
                        {formatMonth(date)}
                      </h3>
                      <Badge variant={badgeVariant} className="text-xs">
                        {statusText}
                      </Badge>
                    </div>
                    <p className="text-lg font-semibold text-slate-900">
                      {formatCurrency(total)}
                    </p>
                    {!hasExpenses && (
                      <p className="mt-1 text-xs text-slate-500">Sin gastos</p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <FloatingExpenseButton />
    </div>
  );
};

export default ProjectedExpenses;
