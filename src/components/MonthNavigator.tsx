
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MonthNavigatorProps {
  selectedMonth: Date;
  onMonthChange: (date: Date) => void;
}

export const MonthNavigator: React.FC<MonthNavigatorProps> = ({ 
  selectedMonth, 
  onMonthChange 
}) => {
  const goToPreviousMonth = () => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    onMonthChange(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    onMonthChange(newDate);
  };

  const goToCurrentMonth = () => {
    onMonthChange(new Date());
  };

  const isCurrentMonth = 
    selectedMonth.getMonth() === new Date().getMonth() &&
    selectedMonth.getFullYear() === new Date().getFullYear();

  const monthText = selectedMonth.toLocaleDateString('es', { 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm">
      <Button
        variant="outline"
        size="icon"
        onClick={goToPreviousMonth}
        className="h-10 w-10"
      >
        <ChevronLeft size={16} />
      </Button>

      <div className="flex items-center gap-4">
        <h2 className="text-xl font-semibold capitalize text-gray-900">
          {monthText}
        </h2>
        {!isCurrentMonth && (
          <Button
            variant="outline"
            size="sm"
            onClick={goToCurrentMonth}
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            Mes actual
          </Button>
        )}
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={goToNextMonth}
        className="h-10 w-10"
      >
        <ChevronRight size={16} />
      </Button>
    </div>
  );
};
