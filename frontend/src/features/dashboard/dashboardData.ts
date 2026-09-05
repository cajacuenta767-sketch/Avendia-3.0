import type { LucideIcon } from "lucide-react";
import { ClipboardCheck, FilePlus2, FolderPlus } from "lucide-react";

export type RecentDocument = {
  title: string;
  updatedLabel: string;
  color: "blue" | "teal" | "violet";
  path: string;
};

export const recentDocuments: RecentDocument[] = [
  { title: "Plan anual · Matemática", updatedLabel: "Borrador de ejemplo", color: "blue", path: "/dashboard/planificamos/plan-curricular-anual" },
  { title: "Unidad 2 · Cuidamos nuestra comunidad", updatedLabel: "Borrador de ejemplo", color: "teal", path: "/dashboard/planificamos/unidad-aprendizaje" },
  { title: "Sesión 4 · Resolvemos problemas", updatedLabel: "Borrador de ejemplo", color: "violet", path: "/dashboard/planificamos/sesion-aprendizaje" },
];

export type QuickTool = {
  title: string;
  icon: LucideIcon;
  tone: "blue" | "teal";
  path: string;
};

export const quickTools: QuickTool[] = [
  { title: "Crear sesión", icon: FilePlus2, tone: "blue", path: "/dashboard/planificamos/sesion-aprendizaje" },
  { title: "Diseñar evaluación", icon: ClipboardCheck, tone: "blue", path: "/dashboard/evaluamos" },
  { title: "Generar recurso", icon: FolderPlus, tone: "teal", path: "/dashboard/recursos" },
];
