import { Project } from "@/hooks/useExpenseStore";

export const sortProjectsByName = (projects: Project[]): Project[] =>
  [...projects].sort((projectA, projectB) =>
    projectA.name.localeCompare(projectB.name, "es", { sensitivity: "base" })
  );
