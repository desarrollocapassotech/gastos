
import React from 'react';
import { ArrowLeft, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useExpenseStore } from '@/hooks/useExpenseStore';
import { formatCurrency, formatMonth } from '@/lib/formatters';
import { CategoryList } from '@/components/CategoryList';

const MonthDetail = () => {
  const { year, month } = useParams<{ year: string; month: string }>();
  const navigate = useNavigate();
  const { getTotalForMonth, getCategoriesWithTotals } = useExpenseStore();
  
  if (!year || !month) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="text-center py-12">
            <CardContent>
              <h2 className="text-xl font-semibold mb-4">Mes no válido</h2>
              <Button onClick={() => navigate('/projected')}>Volver a gastos proyectados</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const selectedDate = new Date(parseInt(year), parseInt(month) - 1, 1);
  const totalAmount = getTotalForMonth(selectedDate);
  const categoriesWithTotals = getCategoriesWithTotals(selectedDate);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/projected">
            <Button variant="outline" size="icon">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="text-blue-600" />
              {formatMonth(selectedDate)}
            </h1>
            <p className="text-gray-600">Desglose detallado de gastos</p>
          </div>
        </div>

        {/* Summary Card */}
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign size={16} />
              Total del mes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(totalAmount)}</div>
            <p className="text-blue-100 text-sm">
              {categoriesWithTotals.length} {categoriesWithTotals.length === 1 ? 'categoría' : 'categorías'} con gastos
            </p>
          </CardContent>
        </Card>

        {/* Categories Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="text-blue-600" size={20} />
              Gastos por Categoría
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categoriesWithTotals.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📊</div>
                <h3 className="text-lg font-medium">No hay gastos registrados</h3>
                <p>No tienes gastos para este mes</p>
              </div>
            ) : (
              <CategoryList categories={categoriesWithTotals} selectedMonth={selectedDate} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MonthDetail;
