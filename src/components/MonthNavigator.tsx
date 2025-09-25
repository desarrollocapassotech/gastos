import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MonthNavigatorProps {
  selectedMonth: Date;
  onMonthChange: (date: Date) => void;
  variant?: "default" | "translucent";
  className?: string;
}

export const MonthNavigator: React.FC<MonthNavigatorProps> = ({
  selectedMonth,
  onMonthChange,
  variant = "default",
  className,
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

  const isTranslucent = variant === "translucent";

  return (
    <div
      className={cn(
        "rounded-2xl border p-4 shadow-sm backdrop-blur",
        isTranslucent
          ? "border-white/40 bg-white/10 text-white"
          : "border-blue-100 bg-white/90 text-slate-900",
        className
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full items-center justify-between gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={goToPreviousMonth}
            className={cn(
              "h-10 w-10 rounded-full",
              isTranslucent
                ? "border-white/40 text-white hover:bg-white/20"
                : "border-blue-200 text-slate-700 hover:bg-blue-50"
            )}
          >
            <ChevronLeft size={16} />
          </Button>

          <div className="flex flex-1 flex-col items-center gap-2 text-center sm:flex-row sm:justify-center sm:text-left">
            <h2
              className={cn(
                "text-xl font-semibold capitalize",
                isTranslucent ? "text-white" : "text-slate-900"
              )}
            >
              {monthText}
            </h2>
            {!isCurrentMonth && (
              <Button
                variant="outline"
                size="sm"
                onClick={goToCurrentMonth}
                className={cn(
                  "rounded-full border",
                  isTranslucent
                    ? "border-white/40 bg-white/10 text-white hover:bg-white/20"
                    : "border-blue-200 text-blue-600 hover:bg-blue-50"
                )}
              >
                Mes actual
              </Button>
            )}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={goToNextMonth}
            className={cn(
              "h-10 w-10 rounded-full",
              isTranslucent
                ? "border-white/40 text-white hover:bg-white/20"
                : "border-blue-200 text-slate-700 hover:bg-blue-50"
            )}
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};
