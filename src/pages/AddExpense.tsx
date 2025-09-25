import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Calendar, ChevronRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useExpenseStore } from "@/hooks/useExpenseStore";
import { useToast } from "@/hooks/use-toast";
import { DatePicker } from "@/components/DatePicker";
import { formatCurrency, formatCurrencyInput, parseCurrencyInput } from "@/lib/formatters";

const formatDateLabel = (date: Date) =>
  date.toLocaleDateString("es", {
    day: "numeric",
    month: "numeric",
  });

const formatDateValue = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const parseDateValue = (value: string) => {
  const segments = value.split("-");
  if (segments.length !== 3) {
    return new Date();
  }

  const [year, month, day] = segments.map(Number);
  if (!year || !month || !day) {
    return new Date();
  }

  return new Date(year, month - 1, day);
};

const AddExpense = () => {
  const navigate = useNavigate();
  const { categories, addExpense, addInstallmentExpense } = useExpenseStore();
  const { toast } = useToast();

  const amountInputRef = useRef<HTMLInputElement>(null);

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(() => formatDateValue(new Date()));
  const [hasInstallments, setHasInstallments] = useState(false);
  const [installmentCount, setInstallmentCount] = useState("2");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    amountInputRef.current?.focus();
  }, []);

  const quickDateOptions = useMemo(() => {
    const today = new Date();
    return [0, 1, 2].map((offset) => {
      const optionDate = new Date(today);
      optionDate.setDate(today.getDate() - offset);
      const value = formatDateValue(optionDate);
      return {
        value,
        label: formatDateLabel(optionDate),
        description:
          offset === 0 ? "hoy" : offset === 1 ? "ayer" : `hace ${offset} días`,
      };
    });
  }, []);

  const parsedAmount = parseCurrencyInput(amount);
  const hasAmountValue = amount !== "";
  const installmentsNumber = parseInt(installmentCount, 10);
  const installmentPreview =
    hasAmountValue &&
    !Number.isNaN(parsedAmount) &&
    !Number.isNaN(installmentsNumber) &&
    installmentsNumber > 0
      ? formatCurrency(parsedAmount / installmentsNumber)
      : null;

  const resetForm = () => {
    setAmount("");
    setCategory(null);
    setDescription("");
    setDate(formatDateValue(new Date()));
    setHasInstallments(false);
    setInstallmentCount("2");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!amount || !category || !description) {
      toast({
        title: "Faltan datos",
        description: "Completa el monto, la categoría y el comentario",
        variant: "destructive",
      });
      return;
    }

    const numericAmount = parseCurrencyInput(amount);
    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      toast({
        title: "Monto inválido",
        description: "Ingresa un monto mayor a 0",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (hasInstallments) {
        if (
          Number.isNaN(installmentsNumber) ||
          installmentsNumber < 2 ||
          installmentsNumber > 60
        ) {
          toast({
            title: "Cuotas inválidas",
            description: "El número de cuotas debe estar entre 2 y 60",
            variant: "destructive",
          });
          return;
        }

        await addInstallmentExpense(
          numericAmount,
          category,
          description,
          installmentsNumber,
          new Date(date)
        );

        toast({
          title: "Gasto agregado",
          description: `Distribuido en ${installmentsNumber} cuotas`,
        });
      } else {
        await addExpense({
          amount: numericAmount,
          category,
          description,
          date,
        });

        toast({
          title: "Gasto agregado",
          description: "Se registró correctamente",
        });
      }

      resetForm();
      navigate("/", { replace: true });
    } catch (error) {
      toast({
        title: "Error al guardar",
        description: "Intenta nuevamente en unos instantes",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-40">
      <div className="rounded-3xl bg-gradient-to-br from-emerald-400 via-sky-500 to-indigo-500 p-6 text-white shadow-xl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-medium text-white/80 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Volver
        </button>

        <div className="mt-6 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
            Gastos
          </div>
          <div className="flex items-baseline gap-2">
            <input
              type="text"
              inputMode="decimal"
              ref={amountInputRef}
              value={amount}
              onChange={(event) => setAmount(formatCurrencyInput(event.target.value))}
              placeholder="0,00"
              className="w-full bg-transparent text-4xl font-semibold text-white placeholder:text-white/70 focus:outline-none"
            />
            <span className="text-sm font-semibold uppercase tracking-[0.3em] text-white/80">
              ARS
            </span>
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-sky-600">
            Categorías
          </h2>
          <p className="text-sm text-slate-500">Elige dónde registrarás el gasto</p>
        </div>
        <div className="grid grid-cols-4 gap-4 sm:grid-cols-6">
          {categories.map((cat) => {
            const isSelected = category === cat.name;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.name)}
                className="group flex flex-col items-center gap-2"
              >
                <span
                  className={cn(
                    "flex h-16 w-16 items-center justify-center rounded-2xl border border-white/60 bg-white text-lg font-semibold text-slate-700 shadow-sm transition duration-200 group-hover:-translate-y-1 group-hover:shadow-lg",
                    isSelected && "scale-105 border-transparent text-white shadow-xl"
                  )}
                  style={isSelected ? { backgroundColor: cat.color } : {}}
                >
                  {cat.icon}
                </span>
                <span className="text-xs font-medium text-slate-600 group-hover:text-slate-900">
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-sky-600">
              Fecha del gasto
            </h3>
            <p className="text-sm text-slate-500">Selecciona cuándo se registró</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Calendar className="h-4 w-4" />
            <span>{parseDateValue(date).toLocaleDateString("es", { dateStyle: "long" })}</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {quickDateOptions.map((option) => {
            const isActive = option.value === date;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setDate(option.value)}
                className={cn(
                  "rounded-2xl border border-slate-200 bg-white p-3 text-center text-sm font-semibold text-slate-600 shadow-sm transition hover:-translate-y-1 hover:shadow-md",
                  isActive && "border-transparent bg-sky-500 text-white shadow-lg"
                )}
              >
                <div className="text-base font-bold">{option.label}</div>
                <div className="text-xs font-medium uppercase tracking-wide">
                  {option.description}
                </div>
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white/80 p-4">
          <div className="flex-1">
            <Label htmlFor="date" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Otra fecha
            </Label>
            <DatePicker
              id="date"
              value={date}
              onChange={setDate}
              buttonClassName="mt-1"
              placeholder="Elegí una fecha"
            />
          </div>
          <ChevronRight className="h-5 w-5 text-slate-400" />
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-sky-600">
            Comentario
          </h3>
          <p className="text-sm text-slate-500">Describe rápidamente este gasto</p>
        </div>
        <Textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Comentario"
          rows={3}
        />
      </section>

      <section className="space-y-4">
        <Card className="border border-slate-200 bg-white/70 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-slate-800">Pago en cuotas</h4>
              <p className="text-xs text-slate-500">Divide el gasto entre varios meses</p>
            </div>
            <Switch checked={hasInstallments} onCheckedChange={setHasInstallments} />
          </div>

          {hasInstallments && (
            <div className="mt-4 space-y-2">
              <Label htmlFor="installments" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Número de cuotas
              </Label>
              <Select value={installmentCount} onValueChange={setInstallmentCount}>
                <SelectTrigger id="installments">
                  <SelectValue placeholder="Selecciona cuotas" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 11 }, (_, index) => index + 2).map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} cuotas
                    </SelectItem>
                  ))}
                  {[24, 36, 48, 60].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} cuotas
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {installmentPreview && (
                <p className="text-xs text-slate-500">Cuota estimada: {installmentPreview}</p>
              )}
            </div>
          )}
        </Card>
      </section>

      <div className="h-24" />
      <div className="fixed inset-x-0 bottom-6 flex justify-center px-4 sm:px-6">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full max-w-md rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-base font-semibold shadow-lg transition hover:from-blue-600 hover:to-blue-700"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Guardando
            </span>
          ) : (
            "Guardar gasto"
          )}
        </Button>
      </div>
    </form>
  );
};

export default AddExpense;
