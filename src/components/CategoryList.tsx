import React from "react";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "@/lib/formatters";

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

  return (
    <div className="space-y-2">
      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          onClick={() => handleCategoryClick(category.name)}
          className="flex w-full items-center justify-between rounded-xl border border-blue-100 bg-blue-50/40 p-3 text-left transition-colors hover:bg-blue-50"
        >
          <div className="flex items-center gap-3">
            <span
              className="h-4 w-4 rounded-full"
              style={{ backgroundColor: category.color }}
            />
            <span className="flex items-center gap-2 text-sm font-medium text-slate-900">
              <span>{category.icon}</span>
              {category.name}
            </span>
          </div>
          <span className="text-sm font-semibold text-slate-900">
            {formatCurrency(category.total)}
          </span>
        </button>
      ))}
    </div>
  );
};
