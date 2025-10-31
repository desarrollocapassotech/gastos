import { FormEvent, useMemo, useState } from "react";
import { ArrowLeft, Loader2, ArrowDownUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/DatePicker";
import { useExpenseStore } from "@/hooks/useExpenseStore";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatCurrencyInput, parseCurrencyInput } from "@/lib/formatters";
import { sortAccountsByName } from "@/lib/accounts";

const formatDateValue = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const Transfers = () => {
  const navigate = useNavigate();
  const { projects, addExpense, addIncome } = useExpenseStore();
  const { toast } = useToast();

  const [amount, setAmount] = useState("");
  const [fromAccountId, setFromAccountId] = useState<string | null>(null);
  const [toAccountId, setToAccountId] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(() => formatDateValue(new Date()));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sortedProjects = useMemo(() => sortAccountsByName(projects), [projects]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!amount || !fromAccountId || !toAccountId || !description) {
      toast({
        title: "Faltan datos",
        description: "Completa todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    if (fromAccountId === toAccountId) {
      toast({
        title: "Cuentas inválidas",
        description: "La cuenta origen y destino deben ser diferentes",
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
      const fromAccount = sortedProjects.find(p => p.id === fromAccountId);
      const toAccount = sortedProjects.find(p => p.id === toAccountId);

      // Crear gasto en la cuenta origen
      await addExpense({
        amount: numericAmount,
        category: "Transferencias",
        description: `Transferencia a ${toAccount?.name || 'otra cuenta'}: ${description}`,
        date,
        projectId: fromAccountId,
      });

      // Crear ingreso en la cuenta destino
      await addIncome({
        amount: numericAmount,
        description: `Transferencia de ${fromAccount?.name || 'otra cuenta'}: ${description}`,
        date,
        projectId: toAccountId,
      });

      toast({
        title: "Transferencia realizada",
        description: `${formatCurrency(numericAmount)} transferido correctamente`,
      });

      setAmount("");
      setFromAccountId(null);
      setToAccountId(null);
      setDescription("");
      setDate(formatDateValue(new Date()));
    } catch (error) {
      toast({
        title: "Error al transferir",
        description: "Intenta nuevamente en unos instantes",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fromAccount = fromAccountId ? sortedProjects.find(p => p.id === fromAccountId) : null;
  const toAccount = toAccountId ? sortedProjects.find(p => p.id === toAccountId) : null;

  return (
    <div className="space-y-6 pb-40">
      <section className="space-y-4">
        <div className="rounded-3xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 p-5 text-white shadow-xl">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-sm font-medium text-white/80 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" /> Volver
            </button>
            <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-white">
              Transferencias
            </span>
          </div>

          <div className="mt-6 space-y-3">
            <div className="text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
              Entre cuentas
            </div>
            <div className="flex items-baseline gap-2">
              <input
                type="text"
                inputMode="decimal"
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
      </section>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="from-account" className="text-xs font-semibold uppercase tracking-wide text-sky-600">
                Cuenta origen
              </Label>
              <Select value={fromAccountId ?? undefined} onValueChange={setFromAccountId}>
                <SelectTrigger id="from-account" className="h-12">
                  <SelectValue placeholder="Selecciona la cuenta origen" />
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="to-account" className="text-xs font-semibold uppercase tracking-wide text-sky-600">
                Cuenta destino
              </Label>
              <Select value={toAccountId ?? undefined} onValueChange={setToAccountId}>
                <SelectTrigger id="to-account" className="h-12">
                  <SelectValue placeholder="Selecciona la cuenta destino" />
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
            </div>
          </div>

          {fromAccountId && toAccountId && fromAccountId === toAccountId && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              ⚠️ La cuenta origen y destino deben ser diferentes
            </div>
          )}

          {fromAccountId && toAccountId && fromAccountId !== toAccountId && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-purple-100 p-2 text-purple-600">
                    <span
                      className="inline-flex h-3 w-3 rounded-full"
                      style={{ backgroundColor: fromAccount?.color }}
                    />
                  </div>
                  <span className="font-semibold text-slate-700">{fromAccount?.name}</span>
                </div>
                <ArrowDownUp className="h-5 w-5 text-slate-400" />
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-purple-100 p-2 text-purple-600">
                    <span
                      className="inline-flex h-3 w-3 rounded-full"
                      style={{ backgroundColor: toAccount?.color }}
                    />
                  </div>
                  <span className="font-semibold text-slate-700">{toAccount?.name}</span>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description" className="text-xs font-semibold uppercase tracking-wide text-sky-600">
              Descripción
            </Label>
            <Input
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Descripción de la transferencia"
              required
            />
          </div>
        </section>

        <section className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date" className="text-xs font-semibold uppercase tracking-wide text-sky-600">
              Fecha
            </Label>
            <DatePicker
              id="date"
              value={date}
              onChange={setDate}
              buttonClassName="h-12"
              placeholder="Selecciona una fecha"
            />
          </div>
        </section>

        <div className="fixed inset-x-0 bottom-6 flex justify-center px-4 sm:px-6">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full max-w-md rounded-full bg-gradient-to-r from-purple-500 to-pink-600 text-base font-semibold shadow-lg transition hover:from-purple-600 hover:to-pink-700"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Procesando...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <ArrowDownUp className="h-5 w-5" /> Realizar transferencia
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Transfers;

