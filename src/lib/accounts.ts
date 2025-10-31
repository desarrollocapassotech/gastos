import { Project } from "@/hooks/useExpenseStore";

export const sortAccountsByName = (projects: Project[]): Project[] =>
  [...projects].sort((projectA, projectB) =>
    projectA.name.localeCompare(projectB.name, "es", { sensitivity: "base" })
  );

