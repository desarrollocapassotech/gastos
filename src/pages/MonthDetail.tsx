import { ArrowLeft, Calendar, DollarSign, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useExpenseStore } from "@/hooks/useExpenseStore";
import { formatCurrency, formatMonth } from "@/lib/formatters";
import { CategoryList } from "@/components/CategoryList";
import { FloatingExpenseButton } from "@/components/FloatingExpenseButton";

const MonthDetail = () => {
  const { year, month } = useParams<{ year: string; month: string }>();
  const navigate = useNavigate();
  const { getTotalForMonth, getCategoriesWithTotals } = useExpenseStore();

  if (!year || !month) {
    return (
      <div className="space-y-6 pb-14">
        <Card className="border border-blue-100 bg-white/90 py-12 text-center shadow-sm backdrop-blur">
          <CardContent className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">Mes no válido</h2>
            <Button onClick={() => navigate("/projected")} className="mt-2">
              Volver a gastos proyectados
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedDate = new Date(parseInt(year), parseInt(month) - 1, 1);
  const totalAmount = getTotalForMonth(selectedDate);
  const categoriesWithTotals = getCategoriesWithTotals(selectedDate);

  return (
    <div className="space-y-6 pb-14">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <Link to="/projected" className="inline-flex">
          <Button variant="outline" size="icon" className="h-10 w-10 rounded-full">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
            Resumen mensual
          </p>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 sm:text-3xl">
            <Calendar className="text-blue-600" />
            {formatMonth(selectedDate)}
          </h1>
          <p className="text-sm text-slate-600">Desglose detallado de gastos.</p>
        </div>
      </section>

      <Card className="border-none bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <DollarSign size={16} />
            Total del mes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <p className="text-3xl font-semibold leading-tight">{formatCurrency(totalAmount)}</p>
          <p className="text-xs uppercase tracking-wide text-blue-100">
            {categoriesWithTotals.length} {categoriesWithTotals.length === 1 ? "categoría" : "categorías"} con gastos
          </p>
        </CardContent>
      </Card>

      <Card className="border border-blue-100 bg-white/90 shadow-sm backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="text-blue-600" size={20} />
            Gastos por categoría
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {categoriesWithTotals.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500">
              <div className="mb-2 text-3xl">📊</div>
              <p>No hay gastos registrados en este mes.</p>
            </div>
          ) : (
            <CategoryList categories={categoriesWithTotals} />
          )}
        </CardContent>
      </Card>

      <FloatingExpenseButton />
    </div>
  );
};

export default MonthDetail;
