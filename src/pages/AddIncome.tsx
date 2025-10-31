import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Calendar, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/DatePicker";
import { useExpenseStore } from "@/hooks/useExpenseStore";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatCurrencyInput, parseCurrencyInput } from "@/lib/formatters";
import { sortAccountsByName } from "@/lib/accounts";
import { cn } from "@/lib/utils";

const formatDateValue = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const formatDateLabel = (date: Date) =>
  date.toLocaleDateString("es", {
    day: "numeric",
    month: "numeric",
  });

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

const AddIncome = () => {
  const navigate = useNavigate();
  const { addIncome, projects } = useExpenseStore();
  const { toast } = useToast();

  const amountInputRef = useRef<HTMLInputElement>(null);

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(() => formatDateValue(new Date()));
  const [projectId, setProjectId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sortedProjects = useMemo(() => sortAccountsByName(projects), [projects]);

  useEffect(() => {
    if (!projectId && sortedProjects.length > 0) {
      setProjectId(sortedProjects[0].id);
    }
  }, [projectId, sortedProjects]);

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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!amount || !description || !projectId) {
      toast({
        title: "Faltan datos",
        description: "Completa el monto, una descripción y la cuenta",
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
      await addIncome({
        amount: numericAmount,
        description,
        date,
        projectId,
      });

      toast({
        title: "Ingreso agregado",
        description: `Registraste ${formatCurrency(numericAmount)}`,
      });

      setAmount("");
      setDescription("");
      setDate(formatDateValue(new Date()));
      setProjectId(sortedProjects[0]?.id ?? null);
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
            Ingresos
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
        <div className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-sky-600">
            Cuenta
          </h2>
          <p className="text-sm text-slate-500">
            Organiza tus ingresos por cuenta para analizarlos fácilmente
          </p>
          <Select value={projectId ?? undefined} onValueChange={setProjectId}>
            <SelectTrigger id="account" className="h-12">
              <SelectValue placeholder="Selecciona una cuenta" />
            </SelectTrigger>
            <SelectContent>
              {sortedProjects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-flex h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                    {project.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-slate-500">
            ¿Necesitas otra cuenta?{' '}
            <Link
              to="/accounts"
              className="font-medium text-sky-600 underline hover:text-sky-500"
            >
              Gestionar cuentas
            </Link>
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-sky-600">
              Fecha del ingreso
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
                  "rounded-2xl p-3 text-center text-sm font-semibold transition hover:-translate-y-1 hover:shadow-md",
                  isActive
                    ? "border-transparent bg-sky-500 text-white shadow-lg"
                    : "border border-slate-200 bg-white text-slate-600 shadow-sm"
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
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-sky-600">
            Comentario
          </h3>
          <p className="text-sm text-slate-500">Describe rápidamente este ingreso</p>
        </div>
        <Textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Comentario"
          rows={3}
        />
      </section>

      <div className="h-24" />
      <div className="fixed inset-x-0 bottom-6 flex justify-center px-4 sm:px-6">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full max-w-md rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-base font-semibold shadow-lg transition hover:from-green-600 hover:to-emerald-700"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Guardando
            </span>
          ) : (
            "Guardar ingreso"
          )}
        </Button>
      </div>
    </form>
  );
};

export default AddIncome;
