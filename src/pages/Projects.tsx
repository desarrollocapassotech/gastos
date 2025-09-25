import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowLeft, FolderKanban, Plus, Save, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useExpenseStore, Project } from "@/hooks/useExpenseStore";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";

interface ProjectEditValues {
  name: string;
  color: string;
}

const DEFAULT_NEW_PROJECT_COLOR = "#2563EB";

const Projects = () => {
  const navigate = useNavigate();
  const { projects, expenses, addProject, updateProject, deleteProject } = useExpenseStore();
  const { toast } = useToast();

  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectColor, setNewProjectColor] = useState(DEFAULT_NEW_PROJECT_COLOR);
  const [projectEdits, setProjectEdits] = useState<Record<string, ProjectEditValues>>({});

  useEffect(() => {
    setProjectEdits(
      projects.reduce<Record<string, ProjectEditValues>>((acc, project) => {
        acc[project.id] = { name: project.name, color: project.color };
        return acc;
      }, {})
    );
  }, [projects]);

  const projectSummaries = useMemo(
    () =>
      projects.map((project) => {
        const relatedExpenses = expenses.filter((expense) => expense.projectId === project.id);
        const totalAmount = relatedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        return {
          project,
          totalAmount,
          expensesCount: relatedExpenses.length,
        };
      }),
    [expenses, projects]
  );

  const totalProjects = projects.length;
  const totalTracked = projectSummaries.reduce((sum, summary) => sum + summary.totalAmount, 0);

  const handleAddProject = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newProjectName.trim()) {
      toast({
        title: "Nombre requerido",
        description: "Ingresa un nombre para el proyecto.",
        variant: "destructive",
      });
      return;
    }

    try {
      await addProject(newProjectName.trim(), newProjectColor);
      toast({
        title: "Proyecto creado",
        description: "Ahora puedes asignar gastos a este proyecto.",
      });
      setNewProjectName("");
      setNewProjectColor(DEFAULT_NEW_PROJECT_COLOR);
    } catch (error) {
      console.error(error);
      toast({
        title: "No se pudo crear el proyecto",
        description: "Inténtalo nuevamente en unos instantes.",
        variant: "destructive",
      });
    }
  };

  const handleSaveProject = async (project: Project) => {
    const edits = projectEdits[project.id];
    if (!edits || !edits.name.trim()) {
      toast({
        title: "Datos incompletos",
        description: "El proyecto debe tener un nombre.",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateProject(project.id, {
        name: edits.name.trim(),
        color: edits.color,
      });
      toast({
        title: "Proyecto actualizado",
        description: "Los cambios se guardaron correctamente.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "No se pudo actualizar",
        description: "Revisa la conexión y vuelve a intentarlo.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProject = async (project: Project) => {
    try {
      await deleteProject(project.id);
      toast({
        title: "Proyecto eliminado",
        description: "Los gastos permanecerán registrados en otros proyectos.",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo eliminar el proyecto.";
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
        <div className="rounded-3xl bg-gradient-to-br from-blue-500 via-sky-500 to-emerald-500 p-5 text-white shadow-xl">
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
              Proyectos
            </span>
          </div>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
                <FolderKanban className="h-4 w-4" />
                Gestión de proyectos
              </div>
              <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
                {totalProjects} {totalProjects === 1 ? "proyecto" : "proyectos"}
              </h1>
              <p className="text-xs text-white/70">
                Seguimiento total: {formatCurrency(totalTracked)}
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
              Crear un proyecto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddProject} className="grid gap-4 sm:grid-cols-[1fr_auto_auto] sm:items-end">
              <div className="space-y-2">
                <Label htmlFor="project-name">Nombre</Label>
                <Input
                  id="project-name"
                  value={newProjectName}
                  onChange={(event) => setNewProjectName(event.target.value)}
                  placeholder="Ej. Casa nueva"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-color">Color</Label>
                <Input
                  id="project-color"
                  type="color"
                  value={newProjectColor}
                  onChange={(event) => setNewProjectColor(event.target.value)}
                  className="h-10 w-full cursor-pointer"
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
              Proyectos activos
            </p>
            <h2 className="text-xl font-semibold text-slate-900">Gestiona tus proyectos</h2>
          </div>
        </div>

        {projectSummaries.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white/70 p-10 text-center shadow-sm">
            <div className="mb-2 text-3xl">📂</div>
            <p className="text-sm text-slate-500">
              Crea tu primer proyecto para organizar los gastos.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {projectSummaries.map(({ project, totalAmount, expensesCount }) => {
              const edits = projectEdits[project.id] ?? { name: project.name, color: project.color };
              const hasExpenses = expensesCount > 0;
              return (
                <Card key={project.id} className="border border-slate-200/70 bg-white/80 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                      <span
                        className="inline-flex h-3 w-3 rounded-full"
                        style={{ backgroundColor: edits.color }}
                      />
                      {project.name}
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {expensesCount} {expensesCount === 1 ? "gasto" : "gastos"}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-[2fr_1fr] sm:items-center">
                      <div className="space-y-2">
                        <Label htmlFor={`name-${project.id}`}>Nombre</Label>
                        <Input
                          id={`name-${project.id}`}
                          value={edits.name}
                          onChange={(event) =>
                            setProjectEdits((prev) => ({
                              ...prev,
                              [project.id]: {
                                ...(prev[project.id] ?? edits),
                                name: event.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`color-${project.id}`}>Color</Label>
                        <Input
                          id={`color-${project.id}`}
                          type="color"
                          value={edits.color}
                          onChange={(event) =>
                            setProjectEdits((prev) => ({
                              ...prev,
                              [project.id]: {
                                ...(prev[project.id] ?? edits),
                                color: event.target.value,
                              },
                            }))
                          }
                          className="h-10 w-full cursor-pointer"
                        />
                      </div>
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
                        onClick={() => handleSaveProject(project)}
                      >
                        <Save className="h-4 w-4" /> Guardar cambios
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        className="inline-flex items-center gap-2 text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteProject(project)}
                        disabled={hasExpenses}
                        title={
                          hasExpenses
                            ? "No puedes eliminar un proyecto con gastos asociados"
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

export default Projects;
