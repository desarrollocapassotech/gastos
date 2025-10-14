import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Plus, Save, Tag, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Category, useExpenseStore } from "@/hooks/useExpenseStore";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/formatters";

interface CategoryEditValues {
  name: string;
  color: string;
  icon: string;
}

const DEFAULT_NEW_CATEGORY_COLOR = "#3B82F6";
const DEFAULT_NEW_CATEGORY_ICON = "🏷️";

const sortCategoriesByName = (categories: Category[]) =>
  [...categories].sort((a, b) =>
    a.name.localeCompare(b.name, "es", { sensitivity: "base" })
  );

const Categories = () => {
  const navigate = useNavigate();
  const {
    categories,
    expenses,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useExpenseStore();
  const { toast } = useToast();

  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState(
    DEFAULT_NEW_CATEGORY_COLOR
  );
  const [newCategoryIcon, setNewCategoryIcon] = useState(
    DEFAULT_NEW_CATEGORY_ICON
  );
  const [categoryEdits, setCategoryEdits] = useState<
    Record<string, CategoryEditValues>
  >({});

  useEffect(() => {
    setCategoryEdits(
      categories.reduce<Record<string, CategoryEditValues>>((acc, category) => {
        acc[category.id] = {
          name: category.name,
          color: category.color,
          icon: category.icon,
        };
        return acc;
      }, {})
    );
  }, [categories]);

  const sortedCategories = useMemo(
    () => sortCategoriesByName(categories),
    [categories]
  );

  const categorySummaries = useMemo(
    () =>
      sortedCategories.map((category) => {
        const relatedExpenses = expenses.filter(
          (expense) => expense.category === category.name
        );
        const totalAmount = relatedExpenses.reduce(
          (sum, expense) => sum + expense.amount,
          0
        );

        return {
          category,
          totalAmount,
          expensesCount: relatedExpenses.length,
        };
      }),
    [expenses, sortedCategories]
  );

  const totalCategories = categories.length;
  const totalTracked = categorySummaries.reduce(
    (sum, summary) => sum + summary.totalAmount,
    0
  );

  const resetNewCategoryForm = () => {
    setNewCategoryName("");
    setNewCategoryColor(DEFAULT_NEW_CATEGORY_COLOR);
    setNewCategoryIcon(DEFAULT_NEW_CATEGORY_ICON);
  };

  const handleAddCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = newCategoryName.trim();
    if (!trimmedName) {
      toast({
        title: "Nombre requerido",
        description: "Ingresa un nombre para la categoría.",
        variant: "destructive",
      });
      return;
    }

    const exists = categories.some(
      (category) =>
        category.name.toLocaleLowerCase("es") ===
        trimmedName.toLocaleLowerCase("es")
    );
    if (exists) {
      toast({
        title: "Categoría duplicada",
        description: "Ya existe una categoría con ese nombre.",
        variant: "destructive",
      });
      return;
    }

    try {
      await addCategory(trimmedName, newCategoryColor, newCategoryIcon);
      toast({
        title: "Categoría creada",
        description: "Ahora puedes asignar gastos a esta categoría.",
      });
      resetNewCategoryForm();
    } catch (error) {
      console.error(error);
      toast({
        title: "No se pudo crear la categoría",
        description: "Revisa los datos ingresados e inténtalo nuevamente.",
        variant: "destructive",
      });
    }
  };

  const handleSaveCategory = async (category: Category) => {
    const edits = categoryEdits[category.id];
    if (!edits || !edits.name.trim()) {
      toast({
        title: "Datos incompletos",
        description: "La categoría debe tener un nombre.",
        variant: "destructive",
      });
      return;
    }

    const duplicated = categories.some(
      (item) =>
        item.id !== category.id &&
        item.name.toLocaleLowerCase("es") ===
          edits.name.trim().toLocaleLowerCase("es")
    );
    if (duplicated) {
      toast({
        title: "Categoría duplicada",
        description: "Ya existe otra categoría con ese nombre.",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateCategory(category.id, {
        name: edits.name.trim(),
        color: edits.color,
        icon: edits.icon,
      });
      toast({
        title: "Cambios guardados",
        description: "La categoría se actualizó correctamente.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "No se pudo actualizar",
        description: "Inténtalo nuevamente en unos minutos.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    try {
      await deleteCategory(category.id);
      toast({
        title: "Categoría eliminada",
        description: "Ya no aparecerá en las opciones de gasto.",
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo eliminar la categoría.";
      toast({
        title: "Acción no disponible",
        description: message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 pb-32 sm:pb-20">
      <section className="space-y-4">
        <div className="rounded-3xl bg-gradient-to-br from-indigo-500 via-sky-500 to-emerald-500 p-5 text-white shadow-xl">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Volver</span>
            </button>
            <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-white">
              Categorías
            </span>
          </div>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
                <Tag className="h-4 w-4" /> Gestión de categorías
              </div>
              <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
                {totalCategories} {totalCategories === 1 ? "categoría" : "categorías"}
              </h1>
              <p className="text-xs text-white/70">
                Gastos registrados: {formatCurrency(totalTracked)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/expenses/new"
                className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/30"
              >
                <Plus className="h-4 w-4" /> Nuevo gasto
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <Card className="border border-slate-200/70 bg-white/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-slate-900">
              Crear una categoría
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleAddCategory}
              className="grid gap-4 sm:grid-cols-[2fr_1fr_auto_auto] sm:items-end"
            >
              <div className="space-y-2">
                <Label htmlFor="category-name">Nombre</Label>
                <Input
                  id="category-name"
                  value={newCategoryName}
                  onChange={(event) => setNewCategoryName(event.target.value)}
                  placeholder="Ej. Supermercado"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category-color">Color</Label>
                <Input
                  id="category-color"
                  type="color"
                  value={newCategoryColor}
                  onChange={(event) => setNewCategoryColor(event.target.value)}
                  className="h-10 w-full cursor-pointer"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category-icon">Icono</Label>
                <Input
                  id="category-icon"
                  value={newCategoryIcon}
                  onChange={(event) => setNewCategoryIcon(event.target.value)}
                  placeholder="Ej. 🛒"
                  maxLength={4}
                />
              </div>
              <Button type="submit" className="mt-2 inline-flex items-center gap-2 sm:mt-0">
                <Plus className="h-4 w-4" /> Agregar
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-sky-600">
              Categorías activas
            </p>
            <h2 className="text-xl font-semibold text-slate-900">
              Personaliza tus clasificaciones
            </h2>
          </div>
        </div>

        {categorySummaries.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white/70 p-10 text-center shadow-sm">
            <div className="mb-2 text-3xl">🏷️</div>
            <p className="text-sm text-slate-500">
              Crea tu primera categoría para organizar mejor tus gastos.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {categorySummaries.map(({ category, totalAmount, expensesCount }) => {
              const edits =
                categoryEdits[category.id] ?? {
                  name: category.name,
                  color: category.color,
                  icon: category.icon,
                };
              const hasExpenses = expensesCount > 0;

              return (
                <Card
                  key={category.id}
                  className="border border-slate-200/70 bg-white/80 shadow-sm"
                >
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-3 text-lg font-semibold text-slate-900">
                      <span className="text-2xl" role="img" aria-hidden="true">
                        {edits.icon || "🏷️"}
                      </span>
                      <span
                        className="inline-flex items-center gap-2"
                        title={category.name}
                      >
                        <span
                          className="inline-flex h-3 w-3 rounded-full"
                          style={{ backgroundColor: edits.color || category.color }}
                        />
                        {edits.name || category.name}
                      </span>
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {expensesCount} {expensesCount === 1 ? "gasto" : "gastos"}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-[2fr_1fr] sm:items-center">
                      <div className="space-y-2">
                        <Label htmlFor={`name-${category.id}`}>Nombre</Label>
                        <Input
                          id={`name-${category.id}`}
                          value={edits.name}
                          onChange={(event) =>
                            setCategoryEdits((prev) => {
                              const previous = prev[category.id] ?? edits;
                              return {
                                ...prev,
                                [category.id]: {
                                  ...previous,
                                  name: event.target.value,
                                },
                              };
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`color-${category.id}`}>Color</Label>
                        <Input
                          id={`color-${category.id}`}
                          type="color"
                          value={edits.color}
                          onChange={(event) =>
                            setCategoryEdits((prev) => {
                              const previous = prev[category.id] ?? edits;
                              return {
                                ...prev,
                                [category.id]: {
                                  ...previous,
                                  color: event.target.value,
                                },
                              };
                            })
                          }
                          className="h-10 w-full cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`icon-${category.id}`}>Icono</Label>
                      <Input
                        id={`icon-${category.id}`}
                        value={edits.icon}
                        onChange={(event) =>
                          setCategoryEdits((prev) => {
                            const previous = prev[category.id] ?? edits;
                            return {
                              ...prev,
                              [category.id]: {
                                ...previous,
                                icon: event.target.value,
                              },
                            };
                          })
                        }
                        maxLength={4}
                      />
                    </div>

                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-3 text-sm text-slate-600">
                      <p>
                        Total registrado: <span className="font-semibold">{formatCurrency(totalAmount)}</span>
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        className="inline-flex items-center gap-2"
                        onClick={() => handleSaveCategory(category)}
                      >
                        <Save className="h-4 w-4" /> Guardar cambios
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        className="inline-flex items-center gap-2 text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteCategory(category)}
                        disabled={hasExpenses}
                        title={
                          hasExpenses
                            ? "No puedes eliminar una categoría con gastos asociados"
                            : undefined
                        }
                      >
                        <Trash2 className="h-4 w-4" /> Eliminar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default Categories;

