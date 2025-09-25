import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MonthNavigatorProps {
  selectedMonth: Date;
  onMonthChange: (date: Date) => void;
}

export const MonthNavigator: React.FC<MonthNavigatorProps> = ({
  selectedMonth,
  onMonthChange,
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

  const monthText = selectedMonth.toLocaleDateString("es", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="rounded-2xl border border-blue-100 bg-white/90 p-4 shadow-sm backdrop-blur">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full items-center justify-between gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={goToPreviousMonth}
            className="h-10 w-10 rounded-full"
          >
            <ChevronLeft size={16} />
          </Button>

          <div className="flex flex-1 flex-col items-center gap-2 text-center sm:flex-row sm:justify-center sm:text-left">
            <h2 className="text-xl font-semibold capitalize text-slate-900">
              {monthText}
            </h2>
            {!isCurrentMonth && (
              <Button
                variant="outline"
                size="sm"
                onClick={goToCurrentMonth}
                className="border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                Mes actual
              </Button>
            )}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={goToNextMonth}
            className="h-10 w-10 rounded-full"
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};
