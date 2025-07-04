
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '@/lib/formatters';

interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  total: number;
}

interface CategoryListProps {
  categories: Category[];
  selectedMonth: Date;
}

export const CategoryList: React.FC<CategoryListProps> = ({ categories }) => {
  const navigate = useNavigate();

  if (categories.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-4xl mb-2">🏷️</div>
        <p>No hay categorías con gastos</p>
      </div>
    );
  }

  const handleCategoryClick = (categoryName: string) => {
    navigate(`/category/${encodeURIComponent(categoryName)}`);
  };

  return (
    <div className="space-y-3">
      {categories.map((category) => (
        <div 
          key={category.id}
          className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          onClick={() => handleCategoryClick(category.name)}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: category.color }}
            />
            <div>
              <div className="font-medium flex items-center gap-2">
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-semibold text-gray-900">
              {formatCurrency(category.total)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
