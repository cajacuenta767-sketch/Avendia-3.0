import { CircleHelp, Clock3, FileCheck2, ListChecks } from "lucide-react";

import { getToolByPath } from "../../config/tools";
import { useTeacherExperience } from "../../context/TeacherExperienceContext";

type Guidance = { needs: string; result: string; minutes: string };

const SPECIAL_GUIDANCE: Record<string, Guidance> = {
  "/dashboard/recursos/presentaciones-didacticas": {
    needs: "tema, grado, propósito y cantidad de diapositivas",
    result: "diapositivas legibles, actividades y notas para conducir la clase",
    minutes: "5 a 8 minutos",
  },
  "/dashboard/recursos/agrupar-palabras": {
    needs: "tema, categorías y palabras que el estudiante clasificará",
    result: "actividad interactiva, respuestas y archivo para imprimir",
    minutes: "3 a 5 minutos",
  },
  "/dashboard/recursos/ordenar-bloques": {
    needs: "proceso, hechos o pasos y el orden correcto",
    result: "secuencia interactiva con comprobación y solucionario",
    minutes: "3 a 5 minutos",
  },
  "/dashboard/evaluamos/lista-cotejo": {
    needs: "estudiantes, evidencia e indicadores observables",
    result: "tabla por estudiante con Sí/No y observaciones",
    minutes: "4 a 6 minutos",
  },
  "/dashboard/evaluamos/rubrica-evaluacion": {
    needs: "evidencia, criterios y niveles de logro",
    result: "rúbrica con descriptores progresivos y retroalimentación",
    minutes: "6 a 10 minutos",
  },
  "/dashboard/evaluamos/calificador-rubrica": {
    needs: "rúbrica y evidencia del estudiante",
    result: "valoración sustentada para que el docente la confirme",
    minutes: "3 a 6 minutos",
  },
  "/dashboard/evaluamos/ficha-aprendizaje": {
    needs: "tema o archivo, grado y propósito",
    result: "ficha del estudiante y clave separada para el docente",
    minutes: "5 a 8 minutos",
  },
  "/dashboard/evaluamos/preguntas-texto": {
    needs: "texto o archivo y tipos de preguntas",
    result: "preguntas literales, inferenciales y críticas con respuestas",
    minutes: "4 a 7 minutos",
  },
  "/dashboard/evaluamos/ficha-observacion": {
    needs: "estudiantes o equipo, situación e indicadores",
    result: "registro de observación con evidencias y seguimiento",
    minutes: "4 a 7 minutos",
  },
  "/dashboard/evaluamos/carpetas-recuperacion": {
    needs: "estudiantes, necesidades, periodo y aprendizajes prioritarios",
    result: "actividades diferenciadas y seguimiento de recuperación",
    minutes: "7 a 12 minutos",
  },
  "/dashboard/evaluamos/registros-auxiliares": {
    needs: "lista de estudiantes, periodo y evidencias",
    result: "registro con cálculos, filtros y observaciones persistentes",
    minutes: "5 a 9 minutos",
  },
};

export function ToolEntryGuidance({ pathname }: { pathname: string }) {
  const guidance = SPECIAL_GUIDANCE[pathname];
  const tool = getToolByPath(pathname);
  const { preferences } = useTeacherExperience();
  if (!guidance || !tool) return null;

  return (
    <details className="tool-entry-guidance" open={preferences.always_show_help || undefined}>
      <summary><CircleHelp aria-hidden="true" /><span><strong>Antes de comenzar</strong><small>Qué necesitas y qué obtendrás</small></span></summary>
      <div className="tool-entry-guidance__grid">
        <span><ListChecks aria-hidden="true" /><span><small>Prepara</small><strong>{guidance.needs}</strong></span></span>
        <span><FileCheck2 aria-hidden="true" /><span><small>Avendia creará</small><strong>{guidance.result}</strong></span></span>
        <span><Clock3 aria-hidden="true" /><span><small>Tiempo aproximado</small><strong>{guidance.minutes}</strong></span></span>
      </div>
    </details>
  );
}
