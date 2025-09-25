import type { ReactNode } from "react";
import type { TooltipProps } from "recharts";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Expense } from "@/hooks/useExpenseStore";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface ExpenseChartProps {
  expenses: Expense[];
  className?: string;
  innerRadius?: number;
  outerRadius?: number;
  centerLabel?: ReactNode;
}

interface ChartDatum {
  name: string;
  value: number;
  percentage: string;
}

const COLORS = [
  "#10B981",
  "#3B82F6",
  "#EF4444",
  "#8B5CF6",
  "#F59E0B",
  "#EC4899",
  "#6366F1",
  "#64748B",
  "#059669",
  "#2563EB",
];

export const ExpenseChart = ({
  expenses,
  className,
  innerRadius = 40,
  outerRadius = 80,
  centerLabel,
}: ExpenseChartProps) => {
  const categoryTotals = expenses.reduce<Record<string, number>>((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  const chartData: ChartDatum[] = Object.entries(categoryTotals)
    .map(([category, total]) => ({
      name: category,
      value: total,
      percentage: ((total / totalAmount) * 100).toFixed(1),
    }))
    .sort((a, b) => b.value - a.value);

  if (chartData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500">
        <div className="text-center">
          <div className="mb-2 text-4xl">📊</div>
          <p>No hay datos para mostrar</p>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ChartDatum;
      return (
        <div className="rounded-lg border border-blue-100 bg-white p-3 shadow-md">
          <p className="font-medium text-slate-900">{data.name}</p>
          <p className="text-sm text-blue-600">{formatCurrency(data.value)}</p>
          <p className="text-xs text-slate-500">{data.percentage}%</p>
        </div>
      );
    }

    return null;
  };

  return (
    <div className={cn("relative h-64", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      {centerLabel && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-center">
          {centerLabel}
        </div>
      )}
    </div>
  );
};
