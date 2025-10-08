import { useCallback, useMemo, useState } from "react";
import { ArrowLeft, Calendar, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Project, useExpenseStore } from "@/hooks/useExpenseStore";
import { formatCurrency, formatMonth } from "@/lib/formatters";
import { CategoryList } from "@/components/CategoryList";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MonthDetail = () => {
  const { year, month } = useParams<{ year: string; month: string }>();
  const navigate = useNavigate();
  const { getTotalForMonth, getCategoriesWithTotals, projects } = useExpenseStore();
  const [selectedProjectId, setSelectedProjectId] = useState<string | "all">("all");
  const projectFilter = selectedProjectId === "all" ? null : selectedProjectId;
  const selectedProject: Project | null = useMemo(() => {
    if (!projectFilter) return null;
    return projects.find((project) => project.id === projectFilter) ?? null;
  }, [projectFilter, projects]);

  const selectedDate = useMemo(() => {
    if (!year || !month) {
      return null;
    }

    const parsedYear = parseInt(year, 10);
    const parsedMonth = parseInt(month, 10);

    if (Number.isNaN(parsedYear) || Number.isNaN(parsedMonth)) {
      return null;
    }

    return new Date(parsedYear, parsedMonth - 1, 1);
  }, [month, year]);
  const totalAmount = selectedDate ? getTotalForMonth(selectedDate, projectFilter) : 0;
  const categoriesWithTotals = selectedDate ? getCategoriesWithTotals(selectedDate, projectFilter) : [];
  const monthText = selectedDate ? formatMonth(selectedDate) : "";
  const categoriesCount = categoriesWithTotals.length;
  const daysInMonth = selectedDate
    ? new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate()
    : 0;
  const dailyAverage = daysInMonth > 0 ? totalAmount / daysInMonth : 0;
  const topCategory =
    categoriesWithTotals.length > 0
      ? categoriesWithTotals.reduce((prev, current) => (current.total > prev.total ? current : prev), categoriesWithTotals[0])
      : null;

  const handleCategoryClick = useCallback(
    (categoryName: string) => {
      if (!selectedDate) {
        return;
      }

      const searchParams = new URLSearchParams({
        year: String(selectedDate.getFullYear()),
        month: String(selectedDate.getMonth() + 1),
      });

      navigate(`/category/${encodeURIComponent(categoryName)}?${searchParams.toString()}`);
    },
    [navigate, selectedDate]
  );

  if (!selectedDate) {
    return (
      <div className="space-y-6 pb-32 sm:pb-20">
        <div className="rounded-3xl border border-slate-100 bg-white p-10 text-center shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900">Mes no válido</h2>
          <p className="mt-2 text-sm text-slate-500">Selecciona un período disponible en la proyección.</p>
          <Button onClick={() => navigate("/projected")} className="mt-6">
            Volver a gastos proyectados
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-32 sm:pb-20">
      <section className="space-y-4">
        <div className="rounded-3xl bg-gradient-to-br from-sky-500 via-blue-500 to-indigo-600 p-5 text-white shadow-xl">
          <div className="flex items-center justify-between gap-3">
            <Link
              to="/projected"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Volver a proyección</span>
            </Link>
            <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-white">
              Mes
            </span>
          </div>

          <div className="mt-4 space-y-1">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
              <Calendar className="h-4 w-4" />
              Resumen mensual
            </p>
            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">{formatCurrency(totalAmount)}</h1>
            <p className="text-sm capitalize text-white/80">{monthText}</p>
            <p className="text-xs text-white/70">
              {categoriesCount} {categoriesCount === 1 ? "categoría" : "categorías"} con gastos registrados
            </p>
            <p className="text-xs text-white/70">
              Proyecto: {selectedProject ? selectedProject.name : "Todos"}
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-white/15 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/70">Promedio diario</p>
              <p className="mt-2 text-lg font-semibold text-white">{formatCurrency(dailyAverage)}</p>
            </div>
            <div className="rounded-2xl bg-white/15 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/70">Categoría destacada</p>
              <p className="mt-2 text-lg font-semibold text-white">{topCategory?.name ?? "Sin datos"}</p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-white/15 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/70">Filtrar por proyecto</p>
            <Select
              value={selectedProjectId}
              onValueChange={(value) => setSelectedProjectId(value as string | "all")}
            >
              <SelectTrigger className="mt-2 h-10 border-white/40 bg-white/20 text-left text-sm font-medium text-white sm:w-64">
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
      </section>

      <section className="space-y-4">
        <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
              <TrendingUp className="h-5 w-5 text-sky-500" /> Gastos por categoría
            </h2>
            <span className="text-xs font-medium text-slate-500">
              {categoriesCount} {categoriesCount === 1 ? "categoría" : "categorías"}
            </span>
          </div>
          {categoriesWithTotals.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-10 text-center text-slate-500">
              <div className="mb-2 text-3xl">📊</div>
              <p>No hay gastos registrados en este mes.</p>
            </div>
          ) : (
            <CategoryList
              categories={categoriesWithTotals}
              onCategoryClick={handleCategoryClick}
            />
          )}
        </div>
      </section>

    </div>
  );
};

export default MonthDetail;
