import React from "react";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  total: number;
}

interface CategoryListProps {
  categories: Category[];
}

export const CategoryList: React.FC<CategoryListProps> = ({ categories }) => {
  const navigate = useNavigate();

  if (categories.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-slate-500">
        <div className="mb-2 text-3xl">🏷️</div>
        <p>No hay categorías con gastos</p>
      </div>
    );
  }

  const handleCategoryClick = (categoryName: string) => {
    navigate(`/category/${encodeURIComponent(categoryName)}`);
  };

  const totalAmount = categories.reduce((sum, category) => sum + category.total, 0);

  return (
    <div className="space-y-3">
      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          onClick={() => handleCategoryClick(category.name)}
          className="group w-full rounded-2xl border border-blue-100/60 bg-white/80 p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:bg-white"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-xl shadow-sm">
                <span
                  className="absolute inset-0 rounded-2xl opacity-30"
                  style={{ backgroundColor: category.color }}
                />
                <span className="relative drop-shadow-sm">{category.icon}</span>
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {category.name}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {formatCurrency(category.total)} registrados este mes
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end justify-center gap-1 text-right">
              <span className="text-sm font-semibold text-slate-900">
                {formatCurrency(category.total)}
              </span>
              <span
                className={cn(
                  "text-xs font-medium",
                  totalAmount > 0 ? "text-blue-600" : "text-slate-400"
                )}
              >
                {totalAmount > 0
                  ? `${Math.round((category.total / totalAmount) * 100)}%`
                  : "0%"}
              </span>
            </div>
          </div>
          <div className="mt-4">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-blue-100/60">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: totalAmount > 0 ? `${Math.min(100, Math.round((category.total / totalAmount) * 100))}%` : "0%",
                  backgroundColor: category.color,
                }}
              />
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};
