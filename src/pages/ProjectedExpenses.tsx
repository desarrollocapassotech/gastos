
import React from 'react';
import { ArrowLeft, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useExpenseStore } from '@/hooks/useExpenseStore';
import { formatCurrency, formatMonth } from '@/lib/formatters';
import { Link } from 'react-router-dom';

const ProjectedExpenses = () => {
  const { getProjectedExpenses, getTotalForMonth } = useExpenseStore();
  const projectedData = getProjectedExpenses();

  // Generate 12 months starting from current month - 6 to current month + 5
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
    const monthKey = date.toISOString().substring(0, 7);
    const isPast = date < new Date(currentYear, currentMonth, 1);
    const isCurrent = date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    const isFuture = date > new Date(currentYear, currentMonth + 1, 0);

    return {
      date,
      total,
      monthKey,
      isPast,
      isCurrent,
      isFuture,
      hasExpenses: total > 0
    };
  };

  const monthsData = months.map(getMonthData);
  const totalPast = monthsData.filter(m => m.isPast).reduce((sum, m) => sum + m.total, 0);
  const totalFuture = monthsData.filter(m => m.isFuture).reduce((sum, m) => sum + m.total, 0);
  const currentTotal = monthsData.find(m => m.isCurrent)?.total || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="outline" size="icon">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="text-blue-600" />
              Gastos Proyectados
            </h1>
            <p className="text-gray-600">Vista global de todos tus gastos por mes</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingDown size={16} />
                Gastos Pasados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{formatCurrency(totalPast)}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Mes Actual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{formatCurrency(currentTotal)}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp size={16} />
                Gastos Futuros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{formatCurrency(totalFuture)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Desglose Mensual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {monthsData.map((monthData) => {
                const { date, total, isPast, isCurrent, isFuture, hasExpenses } = monthData;
                
                let cardClass = "bg-gray-50 border-gray-200";
                let badgeVariant: "default" | "secondary" | "destructive" = "secondary";
                let statusText = "";

                if (isCurrent) {
                  cardClass = "bg-blue-50 border-blue-200";
                  badgeVariant = "default";
                  statusText = "Actual";
                } else if (isPast) {
                  cardClass = hasExpenses ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200";
                  statusText = "Pasado";
                } else if (isFuture) {
                  cardClass = hasExpenses ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200";
                  statusText = "Futuro";
                }

                return (
                  <Link
                    key={date.toISOString()}
                    to={`/month/${date.getFullYear()}/${date.getMonth() + 1}`}
                    className="block"
                  >
                    <div
                      className={`p-4 rounded-lg border transition-colors hover:shadow-md cursor-pointer ${cardClass}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900 capitalize">
                          {formatMonth(date)}
                        </h3>
                        <Badge variant={badgeVariant} className="text-xs">
                          {statusText}
                        </Badge>
                      </div>
                      <div className="text-lg font-semibold text-gray-900">
                        {formatCurrency(total)}
                      </div>
                      {!hasExpenses && (
                        <p className="text-sm text-gray-500 mt-1">Sin gastos</p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProjectedExpenses;
