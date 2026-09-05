"use client";

import React, { useState, useEffect } from "react";
import TopNav from "@/components/layout/TopNav";
import { createPortal } from "react-dom";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { Check, ArrowRight, ArrowLeft, Save, Loader2, Sparkles, Calendar, Trash, Plus, X } from "lucide-react";
import { validatePedagogicalText as isValidPedagogicalText } from "../../../utils/pedagogicalValidation";
import { getMineduBooks } from "../../../utils/mineduBooks";
import { CNEB_DATA } from "@/config/cnebData";
import { saveDocumentToHistory } from "@/services/documentService";
import AISuggestButton from "@/components/ui/AISuggestButton";

// Wizard Steps definition
const STEPS = [
  { number: 1, label: "Datos" },
  { number: 2, label: "Descripción" },
  { number: 3, label: "Calendar." },
  { number: 4, label: "Demandas" },
  { number: 5, label: "Competencias y enfoques" },
  { number: 6, label: "Materiales" },
  { number: 7, label: "Referencias" },
  { number: 8, label: "Bibliografía" },
  { number: 9, label: "Cierre" }
];

// Area options list
const AREAS = [
  "Comunicación",
  "Matemática",
  "Ciencia y Tecnología",
  "Personal Social",
  "Arte y Cultura",
  "Educación Física",
  "Educación Religiosa",
  "Inglés"
];

// Grados / Ciclos lists per academic level
const OPTIONS_BY_LEVEL = {
  Inicial: {
    grados: ["3 años", "4 años", "5 años"],
    ciclos: ["Ciclo I", "Ciclo II"]
  },
  Primaria: {
    grados: ["1ro de Primaria", "2do de Primaria", "3ro de Primaria", "4to de Primaria", "5to de Primaria", "6to de Primaria"],
    ciclos: ["Ciclo III", "Ciclo IV", "Ciclo V"]
  },
  Secundaria: {
    grados: ["1ro de Secundaria", "2do de Secundaria", "3ro de Secundaria", "4to de Secundaria", "5to de Secundaria"],
    ciclos: ["Ciclo VI", "Ciclo VII"]
  }
};

const BIENESTAR_OPTIONS = [
  "Promover la escucha activa y el diálogo en el aula",
  "Desarrollar actividades de autoconocimiento y regulación emocional",
  "Fortalecer vínculos entre pares y con el docente",
  "Incluir momentos de reflexión y bienestar en la jornada"
];

const INCLUSIVA_OPTIONS = [
  "Valorar y articular los saberes y la cultura de los estudiantes",
  "Asegurar accesibilidad y ajustes razonables según necesidades",
  "Promover el respeto a la diversidad cultural y lingüística",
  "Evitar estereotipos y prácticas discriminatorias",
  "Desarrollar proyectos que conecten con la comunidad y el territorio"
];

// Chips contextuales por campo — se muestran en el modal de IA según qué textarea lo abrió
const CHIPS_POR_CAMPO: Record<string, string[]> = {
  // Paso 2: Descripción y Diagnóstico
  justificacion: ["📚 Comprensión lectora baja", "🧮 Dificultades en matemática", "🤝 Trabajo en equipo deficiente", "⏳ Falta de hábitos de estudio", "🧠 Problemas de razonamiento lógico"],
  perfil_egreso: ["🛡️ Ciudadanos con valores", "💡 Pensamiento crítico y reflexivo", "🌱 Estudiantes autónomos", "💬 Habilidades comunicativas sólidas", "🌍 Conciencia ambiental y social"],
  estudiantes: ["🎨 Estilos de aprendizaje creativos/artísticos", "🏃‍♂️ Estudiantes kinestésicos y prácticos", "📈 Ritmos de aprendizaje variados", "❤️ Apoyo socioemocional requerido", "👥 Preferencia por el juego colaborativo"],
  contexto: ["🏔️ Zona rural / Sierra profunda", "🚫 Sin acceso a internet ni PCs", "🌾 Comunidad agrícola/ganadera", "❄️ Época de heladas y frío extremo", "🏫 Infraestructura escolar limitada"],

  // Paso 4: Matriz de Diagnóstico
  matriz_diagnostico: [
    "🗑️ Contaminación por basura",
    "🥦 Hábitos alimenticios / Anemia",
    "📈 Bajo rendimiento académico",
    "❄️ Heladas y frío extremo",
    "🌾 Pérdida de identidad local"
  ],

  // Paso 5: Tutoría y enfoques
  tutoria: ["🤝 Enfoque de Orientación al Bien Común", "🌱 Enfoque Ambiental y Ecológico", "⚖️ Enfoque de Igualdad de Género", "🌐 Enfoque Intercultural", "🏆 Enfoque de Búsqueda de la Excelencia"],

  // Paso 7: Bibliografía / Referencias
  docente: ["📘 Manual del Docente (MINEDU)", "📖 Rutas del Aprendizaje oficial", "📑 Currículo Nacional de Educación Básica", "📚 Textos pedagógicos de especialidad", "🌐 Guías metodológicas de Santillana/SM"],
  estudiante: ["📓 Cuaderno de trabajo (MINEDU)", "📕 Libro escolar de área de consulta", "📄 Fichas de autoaprendizaje impresas", "📖 Lecturas seleccionadas de biblioteca", "📓 Módulos de práctica del grado"],
};

// Preguntas dinámicas por campo — personalizan los inputs del modal de contexto
const PREGUNTAS_POR_CAMPO: Record<string, { q1_label: string; q1_placeholder: string; q2_label: string; q2_placeholder: string }> = {
  justificacion: {
    q1_label: "¿Cuál es la principal dificultad de aprendizaje detectada?",
    q1_placeholder: "Ej. Comprensión lectora baja, dificultades en resolución de problemas...",
    q2_label: "¿Qué gran logro o competencia buscas alcanzar en esta área?",
    q2_placeholder: "Ej. Estudiantes que redacten con fluidez, razonamiento lógico autónomo..."
  },
  perfil_egreso: {
    q1_label: "¿Qué valores o características de ciudadano buscas formar?",
    q1_placeholder: "Ej. Estudiantes autónomos, con valores éticos y conciencia ambiental...",
    q2_label: "¿Qué habilidades clave del CNEB priorizarás este año?",
    q2_placeholder: "Ej. Pensamiento crítico, resolución pacífica de conflictos..."
  },
  estudiantes: {
    q1_label: "¿Cómo describirías los ritmos y estilos de aprendizaje de tu aula?",
    q1_placeholder: "Ej. Mayormente prácticos/kinestésicos, ritmos muy variados...",
    q2_label: "¿Qué necesidades socioemocionales específicas tienen tus alumnos?",
    q2_placeholder: "Ej. Falta de motivación, necesidad de soporte afectivo, baja autoestima..."
  },
  contexto: {
    q1_label: "¿Cómo es el entorno geográfico, climático o cultural de la localidad?",
    q1_placeholder: "Ej. Zona rural andina expuesta a heladas, comunidad agrícola quechua-hablante...",
    q2_label: "¿Qué limitaciones de infraestructura o servicios tiene la I.E.?",
    q2_placeholder: "Ej. Sin conexión a internet estable, carencia de computadoras o proyector..."
  },
  tutoria: {
    q1_label: "¿Qué situaciones socioemocionales requieren atención prioritaria?",
    q1_placeholder: "Ej. Casos de bullying, baja autoestima, dificultades en la gestión emocional...",
    q2_label: "¿Qué enfoque transversal guiará el plan de tutoría?",
    q2_placeholder: "Ej. Orientación al bien común, enfoque intercultural, equidad de género..."
  },
  matriz_diagnostico: {
    q1_label: "¿Cuál es la problemática social, ambiental o académica más urgente en la localidad o aula?",
    q1_placeholder: "Ej. Acumulación de residuos, malos hábitos de alimentación, clima frío extremo...",
    q2_label: "¿Qué tipo de proyectos o alternativas de solución te gustaría priorizar?",
    q2_placeholder: "Ej. Proyectos de reciclaje, biohuertos escolares, revalorización comunitaria..."
  },
  docente: {
    q1_label: "¿Qué tipo de referencia bibliográfica necesitas?",
    q1_placeholder: "Ej. Textos del MINEDU, manuales pedagógicos, libros de didáctica...",
    q2_label: "¿En qué área o competencia se centra la bibliografía?",
    q2_placeholder: "Ej. Didáctica de la Comunicación, evaluación formativa, pedagogía crítica..."
  },
  estudiante: {
    q1_label: "¿Qué tipo de material de estudio requiere el estudiante?",
    q1_placeholder: "Ej. Cuadernos de trabajo, fichas impresas, lecturas seleccionadas...",
    q2_label: "¿A qué nivel o grado va orientado el material?",
    q2_placeholder: "Ej. Primaria (4to grado), Secundaria (2do año), nivel inicial..."
  },
};

const ENFOQUES_INFO = [
  {
    key: "Enfoque de Derechos",
    valores: "Conciencia de derechos, Libertad y responsabilidad, Diálogo y concertación",
    desc: "Fomenta el reconocimiento de los derechos y deberes para promover la participación democrática."
  },
  {
    key: "Enfoque Inclusivo o de Atención a la Diversidad",
    valores: "Respeto por las diferencias, Equidad en la enseñanza, Confianza en la persona",
    desc: "Garantiza la igualdad de oportunidades pedagógicas reconociendo la diversidad de capacidades de los estudiantes."
  },
  {
    key: "Enfoque Intercultural",
    valores: "Respeto a la identidad cultural, Justicia, Diálogo intercultural",
    desc: "Promueve el intercambio de saberes y la convivencia armónica libre de discriminación étnica."
  },
  {
    key: "Enfoque de Igualdad de Género",
    valores: "Igualdad y Dignidad, Justicia, Empatía",
    desc: "Reconoce el mismo valor en hombres y mujeres, erradicando estereotipos y roles de género preestablecidos."
  },
  {
    key: "Enfoque Ambiental",
    valores: "Solidaridad planetaria, Justicia y solidaridad, Respeto a toda forma de vida",
    desc: "Desarrolla conciencia ecológica orientada a la sostenibilidad y conservación del patrimonio natural y la salud."
  },
  {
    key: "Enfoque de Orientación al Bien Común",
    valores: "Equidad y justicia, Solidaridad, Empatía, Responsabilidad",
    desc: "Incentiva la ayuda mutua, la solidaridad social y el cuidado de los espacios compartidos e institucionales."
  },
  {
    key: "Enfoque de Búsqueda de la Excelencia",
    valores: "Flexibilidad y apertura, Superación personal",
    desc: "Estimula la capacidad de adaptación al cambio para lograr el éxito personal y académico continuo."
  }
];

const TUTORIA_DIMENSIONES = [
  "Personal",
  "Social",
  "De los Aprendizajes",
  "Vocacional",
  "Salud corporal y mental",
  "Cultura y actualidad",
  "Convivencia y disciplina"
];

const RECURSOS_TECNOLOGICOS = [
  "Computadoras, laptops o tablets para uso pedagógico en el aula o sala de cómputo",
  "Proyector multimedia o monitor/TV para proyección de contenidos",
  "Conectividad a internet (Wifi o datos) para consultas y recursos digitales",
  "Plataformas educativas (PerúEduca, Aprendo en casa, etc.) y recursos digitales MINEDU",
  "Equipos de audio (parlantes, micrófono) para audios y videos educativos",
  "Material impreso digitalizado (PDF, guías) accesibles desde dispositivos"
];

const MATERIALES_EDUCATIVOS = [
  "Textos escolares oficiales del MINEDU (por área y grado)",
  "Cuadernos de trabajo, fichas y guías del docente",
  "Material concreto y manipulable (según área: regletas, material base 10, mapas, etc.)",
  "Biblioteca de aula: libros, cuentos, enciclopedias y diccionarios",
  "Material del entorno local (muestras, recursos de la comunidad, periódicos locales)",
  "Instrumentos de evaluación e insumos básicos (papel, lápices, cartulinas, etc.)"
];

const ACCIONES_DOCENTE = [
  "Elaborar y aplicar instrumentos de evaluación coherentes con los aprendizajes.",
  "Registrar y analizar los resultados para tomar decisiones pedagógicas.",
  "Comunicar criterios de evaluación y retroalimentar a los estudiantes.",
  "Ajustar la enseñanza según los resultados de la evaluación.",
  "Devolver evidencias y dialogar con las familias sobre los avances."
];

const ACCIONES_FAMILIAS = [
  "Participar en la coevaluación y autoevaluación.",
  "Recibir retroalimentación clara y oportuna.",
  "Dialogar con el docente sobre sus logros y dificultades.",
  "Familias: reuniones y comunicación sobre el progreso.",
  "Familias: apoyar en las metas de aprendizaje en casa."
];

interface ProblemaFila {
  problema: string;
  causa: string;
  alternativa: string;
  demanda: string;
}

interface UnidadFila {
  titulo: string;
  situacionSignificativa: string;
  competenciasCapacidades: string;
  producto: string;
  campoTematico: string;
  duracion: string;
  periodo: string;
}

interface FormState {
  // Paso 1
  dre: string;
  ugel: string;
  ie: string;
  mse: string;
  modalidad: string;
  nivel: "Inicial" | "Primaria" | "Secundaria";
  generarPor: "Grado" | "Ciclo";
  gradoCiclo: string;
  secciones: string;
  tiempo: string;
  areas: string[];
  docenteResponsable: string;
  director: string;
  subdirector: string;
  anioLectivo: string;
  // Paso 2
  justificacion: string;
  perfilEgreso: string;
  caracteristicasEstudiantes: string;
  caracteristicasContexto: string;
  // Paso 3
  calendarizacion_img: string | null;
  // Paso 4
  problemas_matriz: ProblemaFila[];
  organizacion_periodo: "Bimestral" | "Trimestral" | "Semestral";
  unidades_malla: UnidadFila[];
  prioridad1: string;
  prioridad2: string;
  prioridad3: string;
  bienestarSocioemocional: string[];
  educacionInclusiva: string[];
  // Paso 5
  enfoques_transversales: string[];
  tutoria_dimensiones: string[];
  tutoria_plan: string;
  // Paso 6
  recursos_tecnologicos: string[];
  materiales_educativos: string[];
  // Paso 7
  referencias_docente: string;
  referencias_estudiante: string;
  bibliografia_docente: string[];
  bibliografia_estudiante: string[];
  acciones_docente: string[];
  acciones_familias: string[];
  libros_minedu_seleccionados: string[];
  libros_docente_propios: { titulo: string; autor_editorial: string; anio?: string }[];
  // Preferencias de IA
  preferencia_enfoque: string;
  preferencia_tono: string;
  preferencia_evaluacion: string;
}

const DEFAULT_VALUES: FormState = {
  dre: "",
  ugel: "",
  ie: "",
  mse: "JER",
  modalidad: "EBR",
  nivel: "Secundaria",
  generarPor: "Grado",
  gradoCiclo: "",
  secciones: "",
  tiempo: "",
  areas: [],
  docenteResponsable: "",
  director: "",
  subdirector: "",
  anioLectivo: "2026",
  justificacion: "",
  perfilEgreso: "",
  caracteristicasEstudiantes: "",
  caracteristicasContexto: "",
  calendarizacion_img: null,
  problemas_matriz: [],
  organizacion_periodo: "Bimestral",
  unidades_malla: [],
  prioridad1: "",
  prioridad2: "",
  prioridad3: "",
  bienestarSocioemocional: [],
  educacionInclusiva: [],
  enfoques_transversales: [],
  tutoria_dimensiones: [],
  tutoria_plan: "",
  recursos_tecnologicos: [],
  materiales_educativos: [],
  referencias_docente: "",
  referencias_estudiante: "",
  bibliografia_docente: [],
  bibliografia_estudiante: [],
  acciones_docente: [],
  acciones_familias: [],
  libros_minedu_seleccionados: [],
  libros_docente_propios: [],
  preferencia_enfoque: "Constructivista / Sociocognitivo",
  preferencia_tono: "Técnico y Formal",
  preferencia_evaluacion: "Evaluación Formativa (Retroalimentación continua)"
};

export default function PlanificacionAnualPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [draftId, setDraftId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [suggestingField, setSuggestingField] = useState<Record<string, boolean>>({});

  const [isContextModalOpen, setIsContextModalOpen] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);
  const [contextInput, setContextInput] = useState("");
  const [retoPrincipal, setRetoPrincipal] = useState("");
  const [enfoqueInput, setEnfoqueInput] = useState("");
  const [modalValidationError, setModalValidationError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Paste problems textbox states
  const [showPasteBox, setShowPasteBox] = useState(false);
  const [pasteText, setPasteText] = useState("");

  // Step 8 Preview states
  const [showPreview, setShowPreview] = useState(false);
  const [hasGeneratedPreview, setHasGeneratedPreview] = useState(false);

  // Step 9 Word export download state
  const [exporting, setExporting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<FormState>({
    defaultValues: DEFAULT_VALUES
  });

  // Field Arrays for Paso 4
  const {
    fields: problemaFields,
    append: appendProblema,
    remove: removeProblema,
    replace: replaceProblemas
  } = useFieldArray({
    control,
    name: "problemas_matriz"
  });

  const {
    fields: unidadFields,
    append: appendUnidad,
    remove: removeUnidad
  } = useFieldArray({
    control,
    name: "unidades_malla"
  });

  const {
    fields: librosPropiosFields,
    append: appendLibroPropio,
    remove: removeLibroPropio
  } = useFieldArray({
    control,
    name: "libros_docente_propios"
  });

  // Form watches
  const dre = watch("dre");
  const ugel = watch("ugel");
  const ie = watch("ie");
  const mse = watch("mse");
  const modalidad = watch("modalidad");
  const nivel = watch("nivel");
  const generarPor = watch("generarPor");
  const gradoCiclo = watch("gradoCiclo");
  const secciones = watch("secciones");
  const tiempo = watch("tiempo");
  const areas = watch("areas") || [];
  const docenteResponsable = watch("docenteResponsable");
  const director = watch("director");
  const subdirector = watch("subdirector");
  const anioLectivo = watch("anioLectivo");
  
  const justificacion = watch("justificacion");
  const perfilEgreso = watch("perfilEgreso");
  const watchJustificacion = justificacion;
  const watchPerfilEgreso = perfilEgreso;
  const caracteristicasEstudiantes = watch("caracteristicasEstudiantes");
  const caracteristicasContexto = watch("caracteristicasContexto");
  const watchEstudiantes = caracteristicasEstudiantes;
  const watchContexto = caracteristicasContexto;

  const calendarizacionImg = watch("calendarizacion_img");
  const organizacionPeriodo = watch("organizacion_periodo");
  const allUnidades = watch("unidades_malla") || [];
  const problemasMatriz = watch("problemas_matriz") || [];
  const unidadesMalla = watch("unidades_malla") || [];
  const prioridad1 = watch("prioridad1");
  const prioridad2 = watch("prioridad2");
  const prioridad3 = watch("prioridad3");
  const bienestarSocioemocional = watch("bienestarSocioemocional") || [];
  const educacionInclusiva = watch("educacionInclusiva") || [];

  // Paso 5 watches
  const enfoquesTransversales = watch("enfoques_transversales") || [];
  const tutoriaDimensiones = watch("tutoria_dimensiones") || [];

  // Paso 6 watches
  const recursosTecnologicos = watch("recursos_tecnologicos") || [];
  const materialesEducativos = watch("materiales_educativos") || [];

  // Paso 7 watches
  const referenciasDocenteText = watch("referencias_docente") || "";
  const referenciasEstudianteText = watch("referencias_estudiante") || "";
  const tutoriaPlan = watch("tutoria_plan") || "";
  const watchTutoria = tutoriaPlan;
  const watchDocente = referenciasDocenteText;
  const watchEstudiante = referenciasEstudianteText;

  const referenciasDocente = watch("bibliografia_docente") || [];
  const referenciasEstudiante = watch("bibliografia_estudiante") || [];
  const totalReferencias = referenciasDocente.length + referenciasEstudiante.length;
  const accionesDocente = watch("acciones_docente") || [];
  const accionesFamilias = watch("acciones_familias") || [];
  const librosMineduSeleccionados = watch("libros_minedu_seleccionados") || [];
  const librosDocentePropios = watch("libros_docente_propios") || [];

  const getFormFieldName = (backendFieldKey: string): string => {
    if (backendFieldKey === "perfil_egreso") return "perfilEgreso";
    if (backendFieldKey === "estudiantes") return "caracteristicasEstudiantes";
    if (backendFieldKey === "contexto") return "caracteristicasContexto";
    if (backendFieldKey === "tutoria") return "tutoria_plan";
    if (backendFieldKey === "docente") return "referencias_docente";
    if (backendFieldKey === "estudiante") return "referencias_estudiante";
    if (backendFieldKey === "matriz_diagnostico") return "problemas_matriz";
    return backendFieldKey;
  };

  const handleImproveTextDirectly = async (fieldName: string, currentValue: string) => {
    const backendFieldKey = fieldName;
    const formFieldName = getFormFieldName(fieldName);
    setSuggestingField((prev) => ({ ...prev, [backendFieldKey]: true }));
    try {
      const payload: any = {
        field: backendFieldKey,
        draftId,
        textToImprove: currentValue
      };
      if (backendFieldKey === "tutoria") {
        payload.dimensiones = tutoriaDimensiones;
      }
      const res = await fetch("/api/planificacion-anual/sugerir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const result = await res.json();
        if (result.suggestion) {
          setValue(formFieldName as any, result.suggestion, { shouldDirty: true, shouldValidate: true });
        }
      }
    } catch (err) {
      console.error(`Error al mejorar texto para ${fieldName}:`, err);
    } finally {
      setSuggestingField((prev) => ({ ...prev, [backendFieldKey]: false }));
    }
  };

  const handleAiButtonClick = (fieldName: string) => {
    const formFieldName = getFormFieldName(fieldName);
    const currentValue = watch(formFieldName as any);
    
    // Validación segura: si es un string, usamos trim(). Si es un array, validamos que tenga elementos.
    const hasValue = Array.isArray(currentValue) 
      ? currentValue.length > 0 
      : (currentValue && typeof currentValue === "string" && currentValue.trim().length > 0);

    if (hasValue) {
      handleImproveTextDirectly(fieldName, currentValue);
    } else {
      setActiveField(fieldName);
      setContextInput("");
      setIsContextModalOpen(true);
    }
  };

  // Local state for Step 4 Period selector
  const [selectedPeriod, setSelectedPeriod] = useState("Bimestre 1");
  const [bookTab, setBookTab] = useState<"minedu" | "propios">("minedu");

  // Get dynamic periods based on organization
  const getPeriodsList = () => {
    if (organizacionPeriodo === "Trimestral") {
      return ["Trimestre 1", "Trimestre 2", "Trimestre 3"];
    }
    if (organizacionPeriodo === "Semestral") {
      return ["Semestre 1", "Semestre 2"];
    }
    return ["Bimestre 1", "Bimestre 2", "Bimestre 3", "Bimestre 4"];
  };

  // Adjust selectedPeriod if the list of available periods changes
  useEffect(() => {
    const list = getPeriodsList();
    if (!list.includes(selectedPeriod)) {
      setSelectedPeriod(list[0]);
    }
  }, [organizacionPeriodo]);

  // Load draft from PostgreSQL API on mount
  useEffect(() => {
    async function loadDraft() {
      try {
        const res = await fetch("/api/planificacion/anual/draft");
        if (res.ok) {
          const draft = await res.json();
          if (draft && draft.data && Object.keys(draft.data).length > 0) {
            reset({ ...DEFAULT_VALUES, ...draft.data });
            if (draft.step) {
              setCurrentStep(draft.step);
            }
          }
          if (draft && draft.id) {
            setDraftId(draft.id);
          }
        }
      } catch (err) {
        console.error("Error al cargar el borrador de planificación:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDraft();
  }, [reset]);

  // Sincronizar por defecto las bibliografías recomendadas del MINEDU
  const hasInitializedBooks = React.useRef(false);
  useEffect(() => {
    if (!loading && areas.length > 0 && gradoCiclo && !hasInitializedBooks.current) {
      hasInitializedBooks.current = true;
      const mineduBooks = areas.flatMap(area => getMineduBooks(area, gradoCiclo));
      const currentSelected = watch("libros_minedu_seleccionados") || [];
      const currentDocente = watch("bibliografia_docente") || [];
      const currentEstudiante = watch("bibliografia_estudiante") || [];
      
      if (currentSelected.length === 0 && currentDocente.length === 0 && currentEstudiante.length === 0) {
        const defaultTitles = mineduBooks.map(b => b.title);
        setValue("libros_minedu_seleccionados", defaultTitles);

        const defaultDocente = mineduBooks.filter(b => b.type === "docente").map(b => b.title);
        const defaultEstudiante = mineduBooks.filter(b => b.type === "estudiante").map(b => b.title);

        setValue("bibliografia_docente", defaultDocente);
        setValue("bibliografia_estudiante", defaultEstudiante);
      }
    }
  }, [loading, areas, gradoCiclo, setValue]);

  // Dynamic Options for Grado/Ciclo based on Nivel and GenerarPor choice
  const getGradoCicloOptions = () => {
    const levelOpts = CNEB_DATA[nivel || "Secundaria"];
    if (generarPor === "Ciclo") {
      return levelOpts.ciclos || [];
    }
    return levelOpts.grados;
  };

  // Auto-fill first option when Nivel or GenerarPor changes
  useEffect(() => {
    const opts = getGradoCicloOptions();
    if (opts && opts.length > 0) {
      setValue("gradoCiclo", opts[0]);
    }
  }, [nivel, generarPor]);

  const prevNivel = React.useRef(nivel);
  useEffect(() => {
    if (!loading && prevNivel.current !== nivel) {
      setValue("areas", []);
      setValue("gradoCiclo", "");
    }
    prevNivel.current = nivel;
  }, [nivel, loading, setValue]);

  // Save current step state to database
  const saveDraftToDB = async (step: number, data: FormState) => {
    setSaving(true);
    try {
      const res = await fetch("/api/planificacion/anual/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step, data })
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      }
    } catch (err) {
      console.error("Error al guardar borrador:", err);
    } finally {
      setSaving(false);
    }
  };

  // Trigger Gemini AI suggestion for a specific field
  const handleSuggestField = async (
    fieldKey: "justificacion" | "perfil_egreso" | "estudiantes" | "contexto" | "problemas" | "prioridades" | "tutoria" | "docente" | "estudiante",
    formFieldName: keyof FormState | "problemas" | "prioridades" | "tutoria"
  ) => {
    setSuggestingField((prev) => ({ ...prev, [fieldKey]: true }));
    try {
      const payload: any = { field: fieldKey, draftId };
      if (fieldKey === "tutoria") {
        payload.dimensiones = tutoriaDimensiones;
      }

      const res = await fetch("/api/planificacion-anual/sugerir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const result = await res.json();
        
        if (fieldKey === "problemas" && result.problems) {
          replaceProblemas(result.problems);
        } else if (fieldKey === "prioridades" && result.priorities) {
          setValue("prioridad1", result.priorities[0] || "", { shouldDirty: true, shouldValidate: true });
          setValue("prioridad2", result.priorities[1] || "", { shouldDirty: true, shouldValidate: true });
          setValue("prioridad3", result.priorities[2] || "", { shouldDirty: true, shouldValidate: true });
        } else if (fieldKey === "tutoria" && result.suggestion) {
          setValue("tutoria_plan", result.suggestion, { shouldDirty: true, shouldValidate: true });
        } else if (result.suggestion) {
          setValue(formFieldName as any, result.suggestion, { shouldDirty: true, shouldValidate: true });
        }
      }
    } catch (err) {
      console.error(`Error al sugerir campo ${fieldKey}:`, err);
    } finally {
      setSuggestingField((prev) => ({ ...prev, [fieldKey]: false }));
    }
  };

  // Drag and Drop files handling
  const preventDefault = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    const validTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      return;
    }
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setValue("calendarizacion_img", reader.result as string);
    };
    reader.onerror = (error) => {
      console.error("Error al leer archivo:", error);
    };
  };

  const handleDeleteImage = () => {
    setValue("calendarizacion_img", null);
  };

  // Paste problems text processor
  const handleProcessPastedProblems = () => {
    if (!pasteText.trim()) return;
    const lines = pasteText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    
    lines.forEach((line) => {
      appendProblema({
        problema: line,
        causa: "",
        alternativa: "",
        demanda: ""
      });
    });
    setPasteText("");
    setShowPasteBox(false);
  };

  // Selection in block logic (Step 6)
  const isAllRecursosChecked = RECURSOS_TECNOLOGICOS.every((opt) => recursosTecnologicos.includes(opt));
  const isAllMaterialesChecked = MATERIALES_EDUCATIVOS.every((opt) => materialesEducativos.includes(opt));

  const handleToggleAllRecursos = (checked: boolean) => {
    if (checked) {
      setValue("recursos_tecnologicos", [...RECURSOS_TECNOLOGICOS]);
    } else {
      setValue("recursos_tecnologicos", []);
    }
  };

  const handleToggleAllMateriales = (checked: boolean) => {
    if (checked) {
      setValue("materiales_educativos", [...MATERIALES_EDUCATIVOS]);
    } else {
      setValue("materiales_educativos", []);
    }
  };

  const handleToggleRecurso = (option: string, checked: boolean) => {
    const current = recursosTecnologicos;
    if (checked) {
      setValue("recursos_tecnologicos", [...current, option]);
    } else {
      setValue("recursos_tecnologicos", current.filter((opt) => opt !== option));
    }
  };

  const handleToggleMaterial = (option: string, checked: boolean) => {
    const current = materialesEducativos;
    if (checked) {
      setValue("materiales_educativos", [...current, option]);
    } else {
      setValue("materiales_educativos", current.filter((opt) => opt !== option));
    }
  };

  // Selection in block logic (Step 7)
  const isAllDocenteChecked = ACCIONES_DOCENTE.every((opt) => accionesDocente.includes(opt));
  const isAllFamiliasChecked = ACCIONES_FAMILIAS.every((opt) => accionesFamilias.includes(opt));

  const handleToggleAllDocente = (checked: boolean) => {
    if (checked) {
      setValue("acciones_docente", [...ACCIONES_DOCENTE]);
    } else {
      setValue("acciones_docente", []);
    }
  };

  const handleToggleAllFamilias = (checked: boolean) => {
    if (checked) {
      setValue("acciones_familias", [...ACCIONES_FAMILIAS]);
    } else {
      setValue("acciones_familias", []);
    }
  };

  const handleToggleDocenteAction = (option: string, checked: boolean) => {
    const current = accionesDocente;
    if (checked) {
      setValue("acciones_docente", [...current, option]);
    } else {
      setValue("acciones_docente", current.filter((opt) => opt !== option));
    }
  };

  const handleToggleFamiliasAction = (option: string, checked: boolean) => {
    const current = accionesFamilias;
    if (checked) {
      setValue("acciones_familias", [...current, option]);
    } else {
      setValue("acciones_familias", current.filter((opt) => opt !== option));
    }
  };

  // References count logic (Step 8)
  const getReferencesCount = () => {
    const docLines = referenciasDocenteText.split("\n").map(l => l.trim()).filter(l => l.length > 0);
    const estLines = referenciasEstudianteText.split("\n").map(l => l.trim()).filter(l => l.length > 0);
    return docLines.length + estLines.length;
  };

  // Trigger bin export Word (.docx)
  const handleExportWord = async () => {
    if (!draftId) return;
    setExporting(true);
    try {
      const areaStr = Array.isArray(watch("areas")) ? watch("areas").join(", ") : "General";
      saveDocumentToHistory(`Plan Curricular Anual (PCA): ${areaStr}`, "Plan Curricular Anual", watch());
      window.location.href = `/api/planificacion-anual/exportar?draftId=${draftId}`;
    } catch (err) {
      console.error("Error al exportar Word:", err);
    } finally {
      setTimeout(() => setExporting(false), 3000);
    }
  };

  // Next step handler with validation checks
  const handleNext = async (data: FormState) => {
    if (currentStep === 1) {
      // Validation: DRE, UGEL, I.E, and at least one Area selected
      if (!data.dre || !data.ugel || !data.ie || !data.areas || data.areas.length === 0) {
        return;
      }
    }

    const nextStep = Math.min(currentStep + 1, STEPS.length);
    setCurrentStep(nextStep);
    await saveDraftToDB(nextStep, data);
  };

  const handleBack = async () => {
    const prevStep = Math.max(currentStep - 1, 1);
    setCurrentStep(prevStep);
    // Fetch values manually to persist current changes on back click
    handleSubmit(async (data) => {
      await saveDraftToDB(prevStep, data);
    })();
  };

  const handleSaveOnly = async () => {
    handleSubmit(async (data) => {
      await saveDraftToDB(currentStep, data);
    })();
  };

  const handleStepJump = async (targetStep: number) => {
    if (targetStep === currentStep) return;
    handleSubmit(async (data) => {
      if (currentStep === 1) {
        if (!data.dre || !data.ugel || !data.ie || !data.areas || data.areas.length === 0) {
          return;
        }
      }
      await saveDraftToDB(targetStep, data);
      setCurrentStep(targetStep);
    })();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-3 text-slate-500">
        <Loader2 className="animate-spin text-indigo-600" size={36} />
        <p className="text-sm font-semibold uppercase tracking-wider">Cargando borrador...</p>
      </div>
    );
  }

  const totalReferences = totalReferencias;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 pt-1 pb-8 font-body space-y-5 select-none">
      <TopNav title="GENERADOR DE PLANIFICACIÓN ANUAL" />
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black font-headings tracking-tight text-slate-900">
            Generador de Planificación Anual
          </h1>
          <p className="text-sm text-slate-550 font-medium">
            Planificación curricular de largo plazo alineada a los estándares del CNEB y UGEL
          </p>
        </div>
        <button
          onClick={handleSaveOnly}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 text-xs font-black uppercase bg-emerald-50 text-emerald-700 hover:bg-emerald-100/80 border border-emerald-200 rounded-xl transition-all cursor-pointer shadow-3xs"
        >
          {saving ? (
            <Loader2 className="animate-spin" size={14} />
          ) : (
            <Save size={14} />
          )}
          {saveSuccess ? "¡Guardado!" : "Guardar Borrador"}
        </button>
      </div>

      {/* STEPPER BAR PROGRESS */}
      <div className="bg-white/80 dark:bg-[#0D121F] backdrop-blur-md border border-slate-100 dark:border-[#1E293B] rounded-2xl py-5 px-6 sm:px-10 shadow-sm overflow-x-auto scrollbar-none select-none">
        <div className="relative w-full min-w-[900px]">
          
          {/* LÍNEA DE CONEXIÓN CONTINUA CENTRADA VERTICALMENTE A LA MITAD DE LOS CÍRCULOS (36px/40px -> top 17px/19px) */}
          <div
            className="absolute top-[17px] sm:top-[19px] h-[2px] bg-slate-200 dark:bg-slate-800 z-0 pointer-events-none"
            style={{
              left: `${100 / (STEPS.length * 2)}%`,
              right: `${100 / (STEPS.length * 2)}%`,
            }}
          >
            {/* LÍNEA DE PROGRESO ACTIVO */}
            <div
              className="h-full bg-indigo-600 dark:bg-violet-500 transition-all duration-300"
              style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
            />
          </div>

          {/* FILA DE PASOS CON CÍRCULOS DE FONDO SÓLIDO Y Z-10 */}
          <div className="flex items-center justify-between relative z-10 w-full">
            {STEPS.map((step) => {
              const isCompleted = step.number < currentStep;
              const isActive = step.number === currentStep;

              return (
                <button
                  type="button"
                  key={step.number}
                  onClick={() => handleStepJump(step.number)}
                  className="flex flex-col items-center gap-2 flex-1 group focus:outline-none cursor-pointer hover:scale-105 transition-all duration-200"
                >
                  {/* Step Circle con fondo 100% sólido opaco z-10 que cubre perfectamente la línea por debajo */}
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-300 group-hover:shadow-md ${
                      isCompleted
                        ? "bg-indigo-600 border-indigo-600 text-white shadow-sm group-hover:bg-indigo-700 group-hover:border-indigo-700"
                        : isActive
                        ? "bg-white dark:bg-[#0D121F] border-indigo-600 dark:border-violet-500 text-indigo-600 dark:text-violet-300 shadow-md ring-4 ring-indigo-50 dark:ring-violet-500/20 font-black"
                        : "bg-white dark:bg-[#0D121F] border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 group-hover:border-indigo-300 dark:group-hover:border-violet-500/30 group-hover:text-indigo-400 dark:group-hover:text-violet-400"
                    }`}
                  >
                    {isCompleted ? <Check size={16} strokeWidth={3} /> : step.number}
                  </div>

                  {/* Step Label */}
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider text-center max-w-[95px] truncate px-1 transition-colors duration-200 ${
                      isActive
                        ? "text-indigo-600 dark:text-violet-300 font-bold"
                        : "text-slate-400 dark:text-slate-500 font-medium group-hover:text-indigo-500"
                    }`}
                  >
                    {step.label}
                  </span>
                </button>
              );
            })}
          </div>

        </div>
      </div>

      {/* FORM AND VIEWPORTS */}
      <div className="bg-white dark:bg-[#0D121F] border border-slate-100 dark:border-[#1E293B] rounded-3xl p-6 md:p-8 shadow-sm">
        
        {/* PASO 1 */}
        {currentStep === 1 && (
          <form onSubmit={handleSubmit(handleNext)} className="space-y-8 animate-in fade-in duration-200">
            
            {/* Datos Informativos */}
            <div>
              <h3 className="text-xs font-black uppercase text-indigo-600 tracking-wider mb-5">
                1. Datos Informativos (DRE / UGEL / I.E.)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* DRE */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">DRE *</label>
                  <input
                    type="text"
                    {...register("dre", { required: true })}
                    placeholder="Ej: SAN MARTÍN"
                    className="px-4 py-2.5 text-sm border border-slate-200 dark:border-[#1E293B] rounded-xl outline-none focus:border-violet-500 dark:focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all font-semibold text-slate-800 dark:text-white bg-white dark:bg-[#070A13] placeholder:text-slate-400 dark:placeholder:text-slate-600"
                  />
                  {errors.dre && <span className="text-[10px] text-red-500 font-bold">La DRE es requerida</span>}
                </div>

                {/* UGEL */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">UGEL *</label>
                  <input
                    type="text"
                    {...register("ugel", { required: true })}
                    placeholder="Ej: LAMAS"
                    className="px-4 py-2.5 text-sm border border-slate-200 dark:border-[#1E293B] rounded-xl outline-none focus:border-violet-500 dark:focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all font-semibold text-slate-800 dark:text-white bg-white dark:bg-[#070A13] placeholder:text-slate-400 dark:placeholder:text-slate-600"
                  />
                  {errors.ugel && <span className="text-[10px] text-red-500 font-bold">La UGEL es requerida</span>}
                </div>

                {/* Institución Educativa */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Institución Educativa *</label>
                  <input
                    type="text"
                    {...register("ie", { required: true })}
                    placeholder="Ej: MARTÍN DE LA RIVA Y HERRERA"
                    className="px-4 py-2.5 text-sm border border-slate-200 dark:border-[#1E293B] rounded-xl outline-none focus:border-violet-500 dark:focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all font-semibold text-slate-800 dark:text-white bg-white dark:bg-[#070A13] placeholder:text-slate-400 dark:placeholder:text-slate-600"
                  />
                  {errors.ie && <span className="text-[10px] text-red-500 font-bold">La I.E. es requerida</span>}
                </div>

              </div>
            </div>

            {/* Separador */}
            <hr className="border-slate-100" />

            {/* Sección: Estructura y Modalidad */}
            <div>
              <h3 className="text-xs font-black uppercase text-indigo-600 tracking-wider mb-5">
                2. Estructura y Modalidad Curricular
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* MSE */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Modelo de Servicio Educativo (MSE)</label>
                  <select
                    {...register("mse")}
                    className="px-4 py-2.5 text-sm border border-slate-200 dark:border-[#1E293B] bg-white dark:bg-[#070A13] rounded-xl outline-none focus:border-violet-500 dark:focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all font-semibold text-slate-700 dark:text-white"
                  >
                    <option value="JER">JER (Jornada Escolar Regular)</option>
                    <option value="JEC">JEC (Jornada Escolar Completa)</option>
                    <option value="COAR">COAR (Colegio de Alto Rendimiento)</option>
                    <option value="Alternativa">Alternativa</option>
                  </select>
                </div>

                {/* Modalidad */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Modalidad</label>
                  <select
                    {...register("modalidad")}
                    className="px-4 py-2.5 text-sm border border-slate-200 dark:border-[#1E293B] bg-white dark:bg-[#070A13] rounded-xl outline-none focus:border-violet-500 dark:focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all font-semibold text-slate-700 dark:text-white"
                  >
                    <option value="EBR">EBR (Educación Básica Regular)</option>
                    <option value="EBA">EBA (Educación Básica Alternativa)</option>
                    <option value="EBE">EBE (Educación Básica Especial)</option>
                  </select>
                </div>

                {/* Nivel */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Nivel Académico</label>
                  <select
                    {...register("nivel")}
                    className="px-4 py-2.5 text-sm border border-slate-200 dark:border-[#1E293B] bg-white dark:bg-[#070A13] rounded-xl outline-none focus:border-violet-500 dark:focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all font-semibold text-slate-700 dark:text-white"
                  >
                    <option value="Inicial">Inicial</option>
                    <option value="Primaria">Primaria</option>
                    <option value="Secundaria">Secundaria</option>
                  </select>
                </div>

                {/* Generar Por (Radio buttons) */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-700">Generar PCA por</label>
                  <div className="flex items-center gap-6 mt-1">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-655 cursor-pointer">
                      <input
                        type="radio"
                        value="Grado"
                        {...register("generarPor")}
                        className="w-4 h-4 text-violet-600 accent-violet-600 border-slate-600 bg-[#070A13] focus:ring-violet-500/50 rounded"
                      />
                      Grado
                    </label>
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-655 cursor-pointer">
                      <input
                        type="radio"
                        value="Ciclo"
                        {...register("generarPor")}
                        className="w-4 h-4 text-violet-600 accent-violet-600 border-slate-600 bg-[#070A13] focus:ring-violet-500/50 rounded"
                      />
                      Ciclo
                    </label>
                  </div>
                </div>

                {/* Grado / Ciclo (select dinámico) */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    {generarPor === "Ciclo" ? "Ciclo Académico" : "Grado Académico"}
                  </label>
                  <select
                    {...register("gradoCiclo")}
                    className="px-4 py-2.5 text-sm border border-slate-200 dark:border-[#1E293B] bg-white dark:bg-[#070A13] rounded-xl outline-none focus:border-violet-500 dark:focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all font-semibold text-slate-700 dark:text-white"
                  >
                    {getGradoCicloOptions().map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Secciones */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Secciones</label>
                  <input
                    type="text"
                    {...register("secciones")}
                    placeholder="Ej: A, B, C, D"
                    className="px-4 py-2.5 text-sm border border-slate-200 dark:border-[#1E293B] rounded-xl outline-none focus:border-violet-500 dark:focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all font-semibold text-slate-800 dark:text-white bg-white dark:bg-[#070A13] placeholder:text-slate-400 dark:placeholder:text-slate-600"
                  />
                </div>

                {/* Tiempo / Calendario Escolar */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Tiempo de Ejecución</label>
                  <input
                    type="text"
                    {...register("tiempo")}
                    placeholder="Ej: Del 16 de marzo al 18 de diciembre"
                    className="px-4 py-2.5 text-sm border border-slate-200 dark:border-[#1E293B] rounded-xl outline-none focus:border-violet-500 dark:focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all font-semibold text-slate-800 dark:text-white bg-white dark:bg-[#070A13] placeholder:text-slate-400 dark:placeholder:text-slate-600"
                  />
                </div>

                {/* Año Lectivo */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Año Lectivo</label>
                  <input
                    type="text"
                    {...register("anioLectivo")}
                    disabled
                    className="px-4 py-2.5 text-sm border border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#0D121F] text-slate-400 dark:text-slate-600 rounded-xl outline-none cursor-not-allowed font-semibold"
                  />
                </div>

              </div>
            </div>

            {/* Separador */}
            <hr className="border-slate-100" />

            {/* Selección de Áreas */}
            <div>
              <h3 className="text-xs font-black uppercase text-indigo-600 tracking-wider mb-2">
                3. Selección de Áreas Curriculares *
              </h3>
              <p className="text-[10px] text-slate-400 font-bold mb-4 uppercase tracking-wider">
                Selecciona al menos una área a desarrollar en la planificación
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(CNEB_DATA[nivel || "Secundaria"]?.areas || []).map((area) => (
                  <label
                    key={area}
                    className="flex items-center gap-3 p-3.5 border border-slate-150 dark:border-slate-700/60 rounded-2xl bg-white dark:bg-[#070A13] hover:border-violet-400 dark:hover:border-violet-500/50 hover:bg-violet-50 dark:hover:bg-violet-950/10 transition-all duration-200 cursor-pointer"
                  >
                    <Controller
                      name="areas"
                      control={control}
                      render={({ field }) => (
                        <input
                          type="checkbox"
                          checked={field.value?.includes(area)}
                          onChange={(e) => {
                            const current = field.value || [];
                            if (e.target.checked) {
                              field.onChange([...current, area]);
                            } else {
                              field.onChange(current.filter((a) => a !== area));
                            }
                          }}
                          className="w-4 h-4 text-violet-600 accent-violet-600 border-slate-600 bg-[#070A13] focus:ring-violet-500/50 rounded"
                        />
                      )}
                    />
                    <span className="text-xs font-black text-slate-750 dark:text-slate-200">{area}</span>
                  </label>
                ))}
              </div>
              {errors.areas && <span className="text-[10px] text-red-500 font-bold block mt-2">Debes seleccionar al menos un área curricular</span>}
            </div>

            {/* Separador */}
            <hr className="border-slate-100" />

            {/* Firmas y Responsables */}
            <div>
              <h3 className="text-xs font-black uppercase text-indigo-600 tracking-wider mb-5">
                4. Firmas y Validaciones de Responsabilidad
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Docente Responsable */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Docente Responsable</label>
                  <input
                    type="text"
                    {...register("docenteResponsable")}
                    placeholder="Ej: Lic. Juan Pérez"
                    className="px-4 py-2.5 text-sm border border-slate-200 dark:border-[#1E293B] rounded-xl outline-none focus:border-violet-500 dark:focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all font-semibold text-slate-800 dark:text-white bg-white dark:bg-[#070A13] placeholder:text-slate-400 dark:placeholder:text-slate-600"
                  />
                </div>

                {/* Director */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Director de I.E.</label>
                  <input
                    type="text"
                    {...register("director")}
                    placeholder="Ej: Dr. Carlos Ramos"
                    className="px-4 py-2.5 text-sm border border-slate-200 dark:border-[#1E293B] rounded-xl outline-none focus:border-violet-500 dark:focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all font-semibold text-slate-800 dark:text-white bg-white dark:bg-[#070A13] placeholder:text-slate-400 dark:placeholder:text-slate-600"
                  />
                </div>

                {/* Subdirector */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Subdirector</label>
                  <input
                    type="text"
                    {...register("subdirector")}
                    placeholder="Ej: Mg. Ana Torres"
                    className="px-4 py-2.5 text-sm border border-slate-200 dark:border-[#1E293B] rounded-xl outline-none focus:border-violet-500 dark:focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all font-semibold text-slate-800 dark:text-white bg-white dark:bg-[#070A13] placeholder:text-slate-400 dark:placeholder:text-slate-600"
                  />
                </div>

              </div>
            </div>

            {/* Separador */}
            <hr className="border-slate-100" />

            {/* Configuración del Asistente de IA (Preferencias de Redacción) */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider mb-2 flex items-center gap-1.5">
                ⚙️ Configuración del Asistente de IA (Preferencias de Redacción)
              </h3>
              <p className="text-[10px] text-slate-400 font-bold mb-4 uppercase tracking-wider">
                Personaliza el enfoque pedagógico y de redacción que usará la Inteligencia Artificial
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Enfoque Pedagógico Predominante */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Enfoque Pedagógico Predominante</label>
                  <select
                    {...register("preferencia_enfoque")}
                    className="px-4 py-2.5 text-sm border border-slate-200 dark:border-[#1E293B] bg-white dark:bg-[#070A13] rounded-xl outline-none focus:border-violet-500 dark:focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all font-semibold text-slate-700 dark:text-white"
                  >
                    <option value="Constructivista / Sociocognitivo">Constructivista / Sociocognitivo (Por defecto)</option>
                    <option value="Aprendizaje Basado en Proyectos (ABP)">Aprendizaje Basado en Proyectos (ABP)</option>
                    <option value="Aula Invertida (Flipped Classroom)">Aula Invertida (Flipped Classroom)</option>
                    <option value="Metodología STEM">Metodología STEM</option>
                  </select>
                </div>

                {/* Tono y Estilo de Redacción */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Tono y Estilo de Redacción</label>
                  <select
                    {...register("preferencia_tono")}
                    className="px-4 py-2.5 text-sm border border-slate-200 dark:border-[#1E293B] bg-white dark:bg-[#070A13] rounded-xl outline-none focus:border-violet-500 dark:focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all font-semibold text-slate-700 dark:text-white"
                  >
                    <option value="Técnico y Formal">Técnico y Formal (Por defecto)</option>
                    <option value="Práctico y Sencillo">Práctico y Sencillo</option>
                    <option value="Innovador y Tecnológico">Innovador y Tecnológico</option>
                  </select>
                </div>

                {/* Enfoque de Evaluación */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Enfoque de Evaluación</label>
                  <select
                    {...register("preferencia_evaluacion")}
                    className="px-4 py-2.5 text-sm border border-slate-200 dark:border-[#1E293B] bg-white dark:bg-[#070A13] rounded-xl outline-none focus:border-violet-500 dark:focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all font-semibold text-slate-700 dark:text-white"
                  >
                    <option value="Evaluación Formativa (Retroalimentación continua)">Evaluación Formativa (Retroalimentación continua) (Por defecto)</option>
                    <option value="Evaluación Sumativa (Enfoque en evidencias e instrumentos cuantitativos)">Evaluación Sumativa (Enfoque en evidencias e instrumentos cuantitativos)</option>
                    <option value="Autoevaluación y Coevaluación">Autoevaluación y Coevaluación</option>
                  </select>
                </div>
              </div>
            </div>

            {/* BOTONES NAVEGACIÓN */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
              <button
                type="button"
                disabled
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-black uppercase text-slate-400 bg-slate-50 border border-slate-200 rounded-xl cursor-not-allowed transition-all"
              >
                <ArrowLeft size={14} />
                Atrás
              </button>

              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-black uppercase text-white bg-indigo-650 hover:bg-indigo-700 rounded-xl transition-all shadow-md cursor-pointer"
              >
                Siguiente
                <ArrowRight size={14} />
              </button>
            </div>

          </form>
        )}

        {/* PASO 2 */}
        {currentStep === 2 && (
          <form onSubmit={handleSubmit(handleNext)} className="space-y-8 animate-in fade-in duration-200">
            <div>
              <h3 className="text-xs font-black uppercase text-indigo-600 tracking-wider mb-2">
                Paso 2: Descripción General y Análisis Diagnóstico
              </h3>
              <p className="text-[10px] text-slate-400 font-bold mb-6 uppercase tracking-wider">
                Completa los datos descriptivos del año lectivo utilizando asistencia de Inteligencia Artificial
              </p>

              <div className="space-y-6">
                
                {/* 2.1 Justificación */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800">2.1 Justificación (Necesidades de Aprendizaje)</label>
                    <AISuggestButton
                      isLoading={suggestingField["justificacion"]}
                      onClick={() => handleAiButtonClick("justificacion")}
                      label={watchJustificacion && watchJustificacion.trim().length > 0 ? "PULIR CON IA" : "SUGERIR CON IA"}
                    />
                  </div>
                  <textarea
                    {...register("justificacion", {
                      validate: (val) => {
                        const res = isValidPedagogicalText(val);
                        return res.isValid || "⚠️ Ingrese información pedagógica válida. Evite caracteres repetidos o incoherencias.";
                      }
                    })}
                    placeholder="Describe la justificación y las necesidades de aprendizaje identificadas..."
                    className={`border rounded-xl p-4 w-full h-[120px] resize-y text-slate-700 bg-white shadow-inner text-sm outline-none transition-all ${
                      errors.justificacion ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-violet-500"
                    }`}
                  />
                  {errors.justificacion && (
                    <p className="text-red-500 text-xs mt-1 font-medium">
                      {errors.justificacion.message}
                    </p>
                  )}
                </div>

                {/* 2.2 Perfil de Egreso */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800">2.2 Perfil de Egreso Esperado</label>
                    <AISuggestButton
                      isLoading={suggestingField["perfil_egreso"]}
                      onClick={() => handleAiButtonClick("perfil_egreso")}
                      label={watchPerfilEgreso && watchPerfilEgreso.trim().length > 0 ? "PULIR CON IA" : "SUGERIR CON IA"}
                    />
                  </div>
                  <textarea
                    {...register("perfilEgreso", {
                      validate: (val) => {
                        const res = isValidPedagogicalText(val);
                        return res.isValid || "⚠️ Ingrese información pedagógica válida. Evite caracteres repetidos o incoherencias.";
                      }
                    })}
                    placeholder="Describe el perfil de egreso y los estándares de aprendizaje esperados..."
                    className={`border rounded-xl p-4 w-full h-[120px] resize-y text-slate-700 bg-white shadow-inner text-sm outline-none transition-all ${
                      errors.perfilEgreso ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-violet-500"
                    }`}
                  />
                  {errors.perfilEgreso && (
                    <p className="text-red-500 text-xs mt-1 font-medium">
                      {errors.perfilEgreso.message}
                    </p>
                  )}
                </div>

                {/* 2.3 Características de los Estudiantes */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-850">2.3 Características de los Estudiantes (Ritmos y Necesidades)</label>
                    <AISuggestButton
                      isLoading={suggestingField["estudiantes"]}
                      onClick={() => handleAiButtonClick("estudiantes")}
                      label={watchEstudiantes && watchEstudiantes.trim().length > 0 ? "PULIR CON IA" : "SUGERIR CON IA"}
                    />
                  </div>
                  <textarea
                    {...register("caracteristicasEstudiantes", {
                      validate: (val) => {
                        const res = isValidPedagogicalText(val);
                        return res.isValid || "⚠️ Ingrese información pedagógica válida. Evite caracteres repetidos o incoherencias.";
                      }
                    })}
                    placeholder="Describe las características cognitivas, sociales y ritmos de aprendizaje de tus estudiantes..."
                    className={`border rounded-xl p-4 w-full h-[120px] resize-y text-slate-700 bg-white shadow-inner text-sm outline-none transition-all ${
                      errors.caracteristicasEstudiantes ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-violet-500"
                    }`}
                  />
                  {errors.caracteristicasEstudiantes && (
                    <p className="text-red-500 text-xs mt-1 font-medium">
                      {errors.caracteristicasEstudiantes.message}
                    </p>
                  )}
                </div>

                {/* 2.4 Características del Contexto */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800">2.4 Características del Contexto (Localidad e Institución)</label>
                    <AISuggestButton
                      isLoading={suggestingField["contexto"]}
                      onClick={() => handleAiButtonClick("contexto")}
                      label={watchContexto && watchContexto.trim().length > 0 ? "PULIR CON IA" : "SUGERIR CON IA"}
                    />
                  </div>
                  <textarea
                    {...register("caracteristicasContexto", {
                      validate: (val) => {
                        const res = isValidPedagogicalText(val);
                        return res.isValid || "⚠️ Ingrese información pedagógica válida. Evite caracteres repetidos o incoherencias.";
                      }
                    })}
                    placeholder="Describe el contexto territorial, socio-cultural y de la institución educativa..."
                    className={`border rounded-xl p-4 w-full h-[120px] resize-y text-slate-700 bg-white shadow-inner text-sm outline-none transition-all ${
                      errors.caracteristicasContexto ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-violet-500"
                    }`}
                  />
                  {errors.caracteristicasContexto && (
                    <p className="text-red-500 text-xs mt-1 font-medium">
                      {errors.caracteristicasContexto.message}
                    </p>
                  )}
                </div>

              </div>
            </div>

            {/* BOTONES NAVEGACIÓN */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-black uppercase text-slate-655 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-all cursor-pointer"
              >
                <ArrowLeft size={14} />
                Atrás
              </button>

              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-black uppercase text-white bg-indigo-650 hover:bg-indigo-700 rounded-xl transition-all shadow-md cursor-pointer"
              >
                Siguiente
                <ArrowRight size={14} />
              </button>
            </div>
          </form>
        )}

        {/* PASO 3 */}
        {currentStep === 3 && (
          <form onSubmit={handleSubmit(handleNext)} className="space-y-8 animate-in fade-in duration-200">
            <div>
              <h3 className="text-xs font-black uppercase text-indigo-600 tracking-wider mb-2">
                Paso 3: Calendarización del Año Escolar
              </h3>
              <p className="text-[10px] text-slate-400 font-bold mb-6 uppercase tracking-wider">
                Suba la imagen de su calendarización del año escolar (opcional). Si no la sube, en el documento Word aparecerá un espacio para que la pegue después.
              </p>

              <div className="space-y-6 max-w-2xl mx-auto">
                {/* Drag and Drop Zone */}
                <div
                  onDragOver={preventDefault}
                  onDragEnter={preventDefault}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById("file-upload-input")?.click()}
                  className="border-2 border-dashed border-slate-200 rounded-2xl p-10 bg-slate-50/50 hover:bg-slate-50 hover:border-violet-400 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 min-h-[220px]"
                >
                  <input
                    id="file-upload-input"
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  {calendarizacionImg ? (
                    <div className="relative group max-w-full flex flex-col items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <img
                        src={calendarizacionImg}
                        alt="Vista previa de calendarización"
                        className="max-h-[160px] object-contain rounded-lg shadow-sm border border-slate-200"
                      />
                      <button
                        type="button"
                        onClick={handleDeleteImage}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-md transition-all cursor-pointer"
                        title="Eliminar imagen"
                      >
                        <Trash size={14} />
                      </button>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Imagen cargada con éxito</span>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-violet-50 flex items-center justify-center text-violet-650">
                        <Calendar size={24} />
                      </div>
                      <p className="text-xs font-black text-slate-700 uppercase tracking-wide">
                        Haga clic o arrastre aquí una imagen (PNG, JPG)
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        Tamaño máximo recomendado: 5MB
                      </p>
                    </>
                  )}
                </div>

                {/* Fallback Info Box */}
                <div className="bg-violet-50/50 border border-violet-100 rounded-xl p-4 flex gap-3 text-sm text-slate-655">
                  <span className="text-base select-none">💡</span>
                  <div>
                    <span className="font-bold text-slate-700 block text-xs mb-0.5">Consejo metodológico:</span>
                    <p className="text-[11px] font-semibold leading-relaxed">
                      Si decide omitir este paso, generaremos una sección en blanco perfectamente rotulada en su documento final para que pueda insertar su cronograma manualmente en Microsoft Word.
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* BOTONES NAVEGACIÓN */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-black uppercase text-slate-655 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-all cursor-pointer"
              >
                <ArrowLeft size={14} />
                Atrás
              </button>

              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-black uppercase text-white bg-indigo-650 hover:bg-indigo-700 rounded-xl transition-all shadow-md cursor-pointer"
              >
                Siguiente
                <ArrowRight size={14} />
              </button>
            </div>
          </form>
        )}

        {/* PASO 4 */}
        {currentStep === 4 && (
          <form onSubmit={handleSubmit(handleNext)} className="space-y-8 animate-in fade-in duration-200">
            <div>
              <h3 className="text-xs font-black uppercase text-indigo-600 tracking-wider mb-2">
                Paso 4: Identificación de Demandas, Necesidades e Intereses
              </h3>
              <p className="text-[10px] text-slate-400 font-bold mb-6 uppercase tracking-wider">
                Estructure la matriz de demandas del contexto, organice las unidades de aprendizaje y priorice la gestión escolar
              </p>

              {/* 4.1 Matriz de Problemas */}
              <div className="space-y-4 border border-slate-100 rounded-2xl p-5 bg-slate-50/20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">
                      4.1 Matriz de Diagnóstico Territorio/Aula
                    </h4>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
                      Problemas priorizados, causas raíz y demandas curriculares asociadas
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <AISuggestButton
                      isLoading={suggestingField["problemas"] || suggestingField["matriz_diagnostico"]}
                      onClick={() => handleAiButtonClick("matriz_diagnostico")}
                      label="SUGERIR 5 PROBLEMAS CON IA"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasteBox(!showPasteBox)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-black uppercase bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-250 rounded-xl transition-all cursor-pointer"
                    >
                      📋 Pegar mis problemas
                    </button>
                  </div>
                </div>

                {/* Paste Problems Area */}
                {showPasteBox && (
                  <div className="p-4 border border-slate-150 rounded-xl bg-white space-y-3 animate-in slide-in-from-top-2 duration-200">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                      Pegue sus problemas (uno por línea):
                    </label>
                    <textarea
                      value={pasteText}
                      onChange={(e) => setPasteText(e.target.value)}
                      placeholder="Ej:&#10;Bajo nivel de comprensión lectora&#10;Bajo rendimiento en matemática"
                      className="w-full h-[100px] p-3 text-xs border border-slate-200 rounded-xl bg-slate-50/50 shadow-inner outline-none focus:border-indigo-500 focus:bg-white"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowPasteBox(false)}
                        className="px-3 py-1.5 text-[9px] font-black uppercase border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={handleProcessPastedProblems}
                        className="px-3 py-1.5 text-[9px] font-black uppercase bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl cursor-pointer"
                      >
                        Procesar y Agregar
                      </button>
                    </div>
                  </div>
                )}

                {/* Table Matriz de Problemas */}
                <div className="overflow-x-auto border border-slate-150 rounded-2xl bg-white shadow-3xs">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-150 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                        <th className="p-3 w-1/4">Problema Priorizado</th>
                        <th className="p-3 w-1/4">Causa Raíz</th>
                        <th className="p-3 w-1/4">Alternativa de Solución</th>
                        <th className="p-3 w-1/4">Demanda Educativa</th>
                        <th className="p-3 text-center w-[50px]">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {problemaFields.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-xs text-slate-400 font-bold uppercase tracking-wider">
                            No hay problemas registrados. Utilice el botón de IA o añada una fila manual.
                          </td>
                        </tr>
                      ) : (
                        problemaFields.map((field, idx) => (
                          <tr key={field.id} className="border-b border-slate-100 hover:bg-slate-50/30 transition-colors">
                            <td className="p-2">
                              <textarea
                                {...register(`problemas_matriz.${idx}.problema` as const, {
                                  validate: (val) => {
                                    const res = isValidPedagogicalText(val);
                                    return res.isValid || "⚠️ Ingrese información pedagógica válida. Evite caracteres repetidos o incoherencias.";
                                  }
                                })}
                                className={`shadow-sm border rounded-lg p-2 text-xs w-full min-h-[60px] resize-y bg-white outline-none ${
                                  errors.problemas_matriz?.[idx]?.problema ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-violet-500"
                                }`}
                              />
                              {errors.problemas_matriz?.[idx]?.problema && (
                                <p className="text-red-500 text-[10px] mt-0.5 font-medium leading-tight">
                                  {errors.problemas_matriz[idx]?.problema?.message}
                                </p>
                              )}
                            </td>
                            <td className="p-2">
                              <textarea
                                {...register(`problemas_matriz.${idx}.causa` as const, {
                                  validate: (val) => {
                                    const res = isValidPedagogicalText(val);
                                    return res.isValid || "⚠️ Ingrese información pedagógica válida. Evite caracteres repetidos o incoherencias.";
                                  }
                                })}
                                className={`shadow-sm border rounded-lg p-2 text-xs w-full min-h-[60px] resize-y bg-white outline-none ${
                                  errors.problemas_matriz?.[idx]?.causa ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-violet-500"
                                }`}
                              />
                              {errors.problemas_matriz?.[idx]?.causa && (
                                <p className="text-red-500 text-[10px] mt-0.5 font-medium leading-tight">
                                  {errors.problemas_matriz[idx]?.causa?.message}
                                </p>
                              )}
                            </td>
                            <td className="p-2">
                              <textarea
                                {...register(`problemas_matriz.${idx}.alternativa` as const, {
                                  validate: (val) => {
                                    const res = isValidPedagogicalText(val);
                                    return res.isValid || "⚠️ Ingrese información pedagógica válida. Evite caracteres repetidos o incoherencias.";
                                  }
                                })}
                                className={`shadow-sm border rounded-lg p-2 text-xs w-full min-h-[60px] resize-y bg-white outline-none ${
                                  errors.problemas_matriz?.[idx]?.alternativa ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-violet-550"
                                }`}
                              />
                              {errors.problemas_matriz?.[idx]?.alternativa && (
                                <p className="text-red-500 text-[10px] mt-0.5 font-medium leading-tight">
                                  {errors.problemas_matriz[idx]?.alternativa?.message}
                                </p>
                              )}
                            </td>
                            <td className="p-2">
                              <textarea
                                {...register(`problemas_matriz.${idx}.demanda` as const, {
                                  validate: (val) => {
                                    const res = isValidPedagogicalText(val);
                                    return res.isValid || "⚠️ Ingrese información pedagógica válida. Evite caracteres repetidos o incoherencias.";
                                  }
                                })}
                                className={`shadow-sm border rounded-lg p-2 text-xs w-full min-h-[60px] resize-y bg-white outline-none ${
                                  errors.problemas_matriz?.[idx]?.demanda ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-violet-500"
                                }`}
                              />
                              {errors.problemas_matriz?.[idx]?.demanda && (
                                <p className="text-red-500 text-[10px] mt-0.5 font-medium leading-tight">
                                  {errors.problemas_matriz[idx]?.demanda?.message}
                                </p>
                              )}
                            </td>
                            <td className="p-2 text-center">
                              <button
                                type="button"
                                onClick={() => removeProblema(idx)}
                                className="text-red-505 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="Eliminar fila"
                              >
                                <X size={15} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => appendProblema({ problema: "", causa: "", alternativa: "", demanda: "" })}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-black uppercase bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl transition-all cursor-pointer shadow-3xs"
                  >
                    <Plus size={12} />
                    Añadir fila manual
                  </button>
                </div>
              </div>

              {/* Separador */}
              <hr className="border-slate-100 my-8" />

              {/* 4.2 Organización y Malla de Unidades */}
              <div className="space-y-4 border border-slate-100 rounded-2xl p-5 bg-slate-50/20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">
                      4.2 Malla Curricular y Distribución de Unidades
                    </h4>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
                      Configure la temporalidad didáctica y planifique los títulos, evidencias y campos temáticos de las unidades
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Select Organización */}
                    <div className="flex items-center gap-2">
                      <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Organización:</label>
                      <select
                        {...register("organizacion_periodo")}
                        className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all"
                      >
                        <option value="Bimestral">Bimestral</option>
                        <option value="Trimestral">Trimestral</option>
                        <option value="Semestral">Semestral</option>
                      </select>
                    </div>

                    {/* Select Periodo */}
                    <div className="flex items-center gap-2">
                      <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Periodo Activo:</label>
                      <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all"
                      >
                        {getPeriodsList().map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Table Unidades */}
                <div className="overflow-x-auto border border-slate-150 rounded-2xl bg-white shadow-3xs">
                  <table className="w-full text-left border-collapse min-w-[900px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-150 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                        <th className="p-3 w-[60px] text-center">Unidad</th>
                        <th className="p-3 w-1/6">Título de la Unidad</th>
                        <th className="p-3 w-1/4">Situación Significativa</th>
                        <th className="p-3 w-1/6">Competencias y Capacidades</th>
                        <th className="p-3 w-1/6">Producto/Evidencia</th>
                        <th className="p-3 w-1/6">Campo Temático</th>
                        <th className="p-3 w-[90px]">Duración</th>
                        <th className="p-3 text-center w-[50px]">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allUnidades.filter((u) => u.periodo === selectedPeriod).length === 0 ? (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-xs text-slate-400 font-bold uppercase tracking-wider">
                            No hay unidades planificadas para el periodo ({selectedPeriod}). Haga clic en Añadir unidad.
                          </td>
                        </tr>
                      ) : (
                        unidadFields.map((field, idx) => {
                          if (field.periodo !== selectedPeriod) return null;
                          
                          // Find sequential number for this unit inside the filtered list
                          const filteredIdx = allUnidades
                            .slice(0, idx + 1)
                            .filter((u) => u.periodo === selectedPeriod).length;

                          return (
                            <tr key={field.id} className="border-b border-slate-100 hover:bg-slate-50/30 transition-colors">
                              <td className="p-3 text-center text-xs font-black text-slate-500">
                                U{filteredIdx}
                              </td>
                            <td className="p-2">
                              <textarea
                                {...register(`unidades_malla.${idx}.titulo` as const, {
                                  validate: (val) => {
                                    const res = isValidPedagogicalText(val);
                                    return res.isValid || "⚠️ Ingrese información pedagógica válida. Evite caracteres repetidos o incoherencias.";
                                  }
                                })}
                                className={`shadow-sm border rounded-lg p-2 text-xs w-full min-h-[50px] resize-y bg-white outline-none ${
                                  errors.unidades_malla?.[idx]?.titulo ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-violet-500"
                                }`}
                              />
                              {errors.unidades_malla?.[idx]?.titulo && (
                                <p className="text-red-500 text-[10px] mt-0.5 font-medium leading-tight">
                                  {errors.unidades_malla[idx]?.titulo?.message}
                                </p>
                              )}
                            </td>
                            <td className="p-2">
                              <textarea
                                {...register(`unidades_malla.${idx}.situacionSignificativa` as const, {
                                  validate: (val) => {
                                    const res = isValidPedagogicalText(val);
                                    return res.isValid || "⚠️ Ingrese información pedagógica válida. Evite caracteres repetidos o incoherencias.";
                                  }
                                })}
                                className={`shadow-sm border rounded-lg p-2 text-xs w-full min-h-[50px] resize-y bg-white outline-none ${
                                  errors.unidades_malla?.[idx]?.situacionSignificativa ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-violet-550"
                                }`}
                              />
                              {errors.unidades_malla?.[idx]?.situacionSignificativa && (
                                <p className="text-red-500 text-[10px] mt-0.5 font-medium leading-tight">
                                  {errors.unidades_malla[idx]?.situacionSignificativa?.message}
                                </p>
                              )}
                            </td>
                            <td className="p-2">
                              <textarea
                                {...register(`unidades_malla.${idx}.competenciasCapacidades` as const, {
                                  validate: (val) => {
                                    const res = isValidPedagogicalText(val);
                                    return res.isValid || "⚠️ Ingrese información pedagógica válida. Evite caracteres repetidos o incoherencias.";
                                  }
                                })}
                                className={`shadow-sm border rounded-lg p-2 text-xs w-full min-h-[50px] resize-y bg-white outline-none ${
                                  errors.unidades_malla?.[idx]?.competenciasCapacidades ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-violet-500"
                                }`}
                              />
                              {errors.unidades_malla?.[idx]?.competenciasCapacidades && (
                                <p className="text-red-500 text-[10px] mt-0.5 font-medium leading-tight">
                                  {errors.unidades_malla[idx]?.competenciasCapacidades?.message}
                                </p>
                              )}
                            </td>
                            <td className="p-2">
                              <textarea
                                {...register(`unidades_malla.${idx}.producto` as const, {
                                  validate: (val) => {
                                    const res = isValidPedagogicalText(val);
                                    return res.isValid || "⚠️ Ingrese información pedagógica válida. Evite caracteres repetidos o incoherencias.";
                                  }
                                })}
                                className={`shadow-sm border rounded-lg p-2 text-xs w-full min-h-[50px] resize-y bg-white outline-none ${
                                  errors.unidades_malla?.[idx]?.producto ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-violet-500"
                                }`}
                              />
                              {errors.unidades_malla?.[idx]?.producto && (
                                <p className="text-red-500 text-[10px] mt-0.5 font-medium leading-tight">
                                  {errors.unidades_malla[idx]?.producto?.message}
                                </p>
                              )}
                            </td>
                            <td className="p-2">
                              <textarea
                                {...register(`unidades_malla.${idx}.campoTematico` as const, {
                                  validate: (val) => {
                                    const res = isValidPedagogicalText(val);
                                    return res.isValid || "⚠️ Ingrese información pedagógica válida. Evite caracteres repetidos o incoherencias.";
                                  }
                                })}
                                className={`shadow-sm border rounded-lg p-2 text-xs w-full min-h-[50px] resize-y bg-white outline-none ${
                                  errors.unidades_malla?.[idx]?.campoTematico ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-violet-500"
                                }`}
                              />
                              {errors.unidades_malla?.[idx]?.campoTematico && (
                                <p className="text-red-500 text-[10px] mt-0.5 font-medium leading-tight">
                                  {errors.unidades_malla[idx]?.campoTematico?.message}
                                </p>
                              )}
                            </td>
                            <td className="p-2">
                              <input
                                type="text"
                                placeholder="Ej: 4 sem."
                                {...register(`unidades_malla.${idx}.duracion` as const, {
                                  validate: (val) => {
                                    if (!val || val.trim().length < 2) return "⚠️ Duración muy corta";
                                    return true;
                                  }
                                })}
                                className={`shadow-sm border rounded-lg p-2 text-xs w-full bg-white outline-none ${
                                  errors.unidades_malla?.[idx]?.duracion ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-violet-500"
                                }`}
                              />
                              {errors.unidades_malla?.[idx]?.duracion && (
                                <p className="text-red-500 text-[10px] mt-0.5 font-medium leading-tight">
                                  {errors.unidades_malla[idx]?.duracion?.message}
                                </p>
                              )}
                            </td>
                              <td className="p-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => removeUnidad(idx)}
                                  className="text-red-500 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                  title="Eliminar unidad"
                                >
                                  <X size={15} />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      appendUnidad({
                        titulo: "",
                        situacionSignificativa: "",
                        competenciasCapacidades: "",
                        producto: "",
                        campoTematico: "",
                        duracion: "",
                        periodo: selectedPeriod
                      })
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-black uppercase bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl transition-all cursor-pointer shadow-3xs"
                  >
                    <Plus size={12} />
                    Añadir unidad ({selectedPeriod})
                  </button>
                </div>
              </div>

              {/* Separador */}
              <hr className="border-slate-100 my-8" />

              {/* 4.3 Prioridades de Gestión y Bienestar */}
              <div className="space-y-6">
                
                {/* 4.3.1 Prioridades de Gestión */}
                <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50/20 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">
                        4.3 Prioridades de Gestión Escolar (Año Lectivo 2026)
                      </h4>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
                        Defina las metas y líneas estratégicas prioritarias de la institución educativa
                      </span>
                    </div>

                    <AISuggestButton
                      isLoading={suggestingField["prioridades"]}
                      onClick={() => handleSuggestField("prioridades", "prioridades")}
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700">Prioridad 1</label>
                      <input
                        type="text"
                        {...register("prioridad1")}
                        placeholder="Ej: Incrementar un 15% los niveles de logro satisfactorio en la evaluación de comprensión lectora..."
                        className="px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all font-semibold text-slate-800 placeholder:text-slate-400"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700">Prioridad 2</label>
                      <input
                        type="text"
                        {...register("prioridad2")}
                        placeholder="Ej: Fortalecer el clima institucional a través de círculos de interaprendizaje docente..."
                        className="px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all font-semibold text-slate-800 placeholder:text-slate-400"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700">Prioridad 3</label>
                      <input
                        type="text"
                        {...register("prioridad3")}
                        placeholder="Ej: Implementar proyectos de tutoría grupal enfocados en la contención socioemocional..."
                        className="px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all font-semibold text-slate-800 placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Grid Checkboxes de Bienestar e Inclusión */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* 4.3.1 Bienestar Socioemocional */}
                  <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50/20 space-y-4">
                    <div>
                      <h4 className="text-xs font-black text-slate-850 uppercase tracking-wide">
                        4.3.1 Acciones de Bienestar Socioemocional
                      </h4>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
                        Selección múltiple de estrategias afectivas y contención
                      </span>
                    </div>

                    <div className="space-y-3">
                      {BIENESTAR_OPTIONS.map((option) => (
                        <label
                          key={option}
                          className="flex items-start gap-3 p-3 border border-slate-150 rounded-xl bg-white hover:bg-slate-50 transition-all cursor-pointer"
                        >
                          <Controller
                            name="bienestarSocioemocional"
                            control={control}
                            render={({ field }) => (
                              <input
                                type="checkbox"
                                checked={field.value?.includes(option)}
                                onChange={(e) => {
                                  const current = field.value || [];
                                  if (e.target.checked) {
                                    field.onChange([...current, option]);
                                  } else {
                                    field.onChange(current.filter((o) => o !== option));
                                  }
                                }}
                                className="w-4 h-4 text-indigo-650 border-slate-200 focus:ring-indigo-500 rounded mt-0.5"
                              />
                            )}
                          />
                          <span className="text-xs font-bold text-slate-700 leading-normal">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* 4.3.2 Educación Inclusiva */}
                  <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50/20 space-y-4">
                    <div>
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">
                        4.3.2 Acciones de Educación Inclusiva
                      </h4>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
                        Selección múltiple de estrategias de atención a la diversidad
                      </span>
                    </div>

                    <div className="space-y-3">
                      {INCLUSIVA_OPTIONS.map((option) => (
                        <label
                          key={option}
                          className="flex items-start gap-3 p-3 border border-slate-150 rounded-xl bg-white hover:bg-slate-50 transition-all cursor-pointer"
                        >
                          <Controller
                            name="educacionInclusiva"
                            control={control}
                            render={({ field }) => (
                              <input
                                type="checkbox"
                                checked={field.value?.includes(option)}
                                onChange={(e) => {
                                  const current = field.value || [];
                                  if (e.target.checked) {
                                    field.onChange([...current, option]);
                                  } else {
                                    field.onChange(current.filter((o) => o !== option));
                                  }
                                }}
                                className="w-4 h-4 text-indigo-650 border-slate-200 focus:ring-indigo-500 rounded mt-0.5"
                              />
                            )}
                          />
                          <span className="text-xs font-bold text-slate-700 leading-normal">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            </div>

            {/* BOTONES NAVEGACIÓN */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-black uppercase text-slate-655 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-all cursor-pointer"
              >
                <ArrowLeft size={14} />
                Atrás
              </button>

              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-black uppercase text-white bg-indigo-650 hover:bg-indigo-700 rounded-xl transition-all shadow-md cursor-pointer"
              >
                Siguiente
                <ArrowRight size={14} />
              </button>
            </div>
          </form>
        )}

        {/* PASO 5 */}
        {currentStep === 5 && (
          <form onSubmit={handleSubmit(handleNext)} className="space-y-8 animate-in fade-in duration-200">
            <div>
              <h3 className="text-xs font-black uppercase text-indigo-600 tracking-wider mb-2">
                Paso 5: Competencias, Enfoques Transversales y Tutoría
              </h3>
              <p className="text-[10px] text-slate-400 font-bold mb-6 uppercase tracking-wider">
                Defina los enfoques transversales prioritarios y organice las estrategias de tutoría y orientación escolar
              </p>

              <div className="space-y-8">
                
                {/* A. Competencias Transversales (Solo lectura) */}
                <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50/20 space-y-3">
                  <h4 className="text-xs font-black text-slate-805 uppercase tracking-wide">
                    A. Competencias Transversales (CNEB)
                  </h4>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
                    Competencias obligatorias alineadas al Currículo Nacional — Se incluyen automáticamente en la planificación final
                  </span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div className="p-4 border border-slate-150 rounded-xl bg-white flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 text-xs font-bold">1</div>
                      <span className="text-xs font-bold text-slate-700">Gestiona su aprendizaje de manera autónoma.</span>
                    </div>
                    <div className="p-4 border border-slate-150 rounded-xl bg-white flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 text-xs font-bold">2</div>
                      <span className="text-xs font-bold text-slate-700">Se desenvuelve en entornos virtuales generados por las TIC.</span>
                    </div>
                  </div>
                </div>

                {/* B. Enfoques Transversales (Card Checkbox Grid) */}
                <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50/20 space-y-4">
                  <div>
                    <h4 className="text-xs font-black text-slate-850 uppercase tracking-wide">
                      B. Enfoques Transversales Priorizados (CNEB)
                    </h4>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
                      Seleccione los enfoques que se priorizarán en el año escolar (se activará borde violeta y sombreado al marcar)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ENFOQUES_INFO.map((enfoque) => {
                      const isChecked = enfoquesTransversales.includes(enfoque.key);
                      return (
                        <label
                          key={enfoque.key}
                          className={`flex items-start gap-4 p-4 border rounded-2xl transition-all cursor-pointer ${
                            isChecked
                              ? "border-violet-500 bg-violet-50/10 shadow-3xs"
                              : "border-slate-150 bg-white hover:bg-slate-50"
                          }`}
                        >
                          <Controller
                            name="enfoques_transversales"
                            control={control}
                            render={({ field }) => (
                              <input
                                type="checkbox"
                                checked={field.value?.includes(enfoque.key)}
                                onChange={(e) => {
                                  const current = field.value || [];
                                  if (e.target.checked) {
                                    field.onChange([...current, enfoque.key]);
                                  } else {
                                    field.onChange(current.filter((val) => val !== enfoque.key));
                                  }
                                }}
                                className="w-4 h-4 text-violet-600 border-slate-200 focus:ring-violet-500 rounded mt-1 cursor-pointer"
                              />
                            )}
                          />
                          <div className="space-y-1">
                            <span className="text-xs font-black text-slate-800 block uppercase tracking-wide">{enfoque.key}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Valores: {enfoque.valores}</span>
                            <p className="text-[11px] text-slate-550 leading-relaxed font-semibold">{enfoque.desc}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* C. Tutoría y Orientación Educativa (Bloque Opcional) */}
                <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50/20 space-y-4">
                  <div>
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">
                      C. Tutoría y Orientación Educativa (Opcional)
                    </h4>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
                      Solo si corresponde a su rol: dimensiones a trabajar y actividades o estrategias de acompañamiento
                    </span>
                  </div>

                  {/* Dimensiones Checkboxes */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-505 tracking-wider">Dimensiones a Trabajar:</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {TUTORIA_DIMENSIONES.map((dim) => (
                        <label
                          key={dim}
                          className="flex items-center gap-3 p-3 border border-slate-150 dark:border-slate-700/60 rounded-xl bg-white dark:bg-[#070A13] hover:border-violet-400 dark:hover:border-violet-500/50 hover:bg-violet-50 dark:hover:bg-violet-950/10 transition-all duration-200 cursor-pointer"
                        >
                          <Controller
                            name="tutoria_dimensiones"
                            control={control}
                            render={({ field }) => (
                              <input
                                type="checkbox"
                                checked={field.value?.includes(dim)}
                                onChange={(e) => {
                                  const current = field.value || [];
                                  if (e.target.checked) {
                                    field.onChange([...current, dim]);
                                  } else {
                                    field.onChange(current.filter((val) => val !== dim));
                                  }
                                }}
                                className="w-4 h-4 text-violet-600 accent-violet-600 border-slate-600 bg-[#070A13] focus:ring-violet-500/50 rounded"
                              />
                            )}
                          />
                          <span className="text-xs font-bold text-slate-700">{dim}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Plan / Actividades Textarea */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800">Actividades y estrategias de tutoría</label>
                      <AISuggestButton
                        disabled={tutoriaDimensiones.length === 0}
                        isLoading={suggestingField["tutoria"]}
                        onClick={() => handleAiButtonClick("tutoria")}
                        label={watchTutoria && watchTutoria.trim().length > 0 ? "PULIR CON IA" : "SUGERIR CON IA"}
                      />
                    </div>
                    
                    <textarea
                      {...register("tutoria_plan")}
                      placeholder="Escriba las actividades planificadas para tutoría o utilice el botón de IA seleccionando previamente las dimensiones..."
                      className="border border-slate-200 focus:border-violet-500 rounded-xl p-4 w-full h-[120px] resize-y text-slate-700 bg-white shadow-inner text-sm outline-none transition-all font-semibold"
                    />
                    
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-1">
                      💡 «Sugerir con IA» requiere al menos una dimensión marcada; el resto del bloque puede quedar vacío.
                    </span>
                  </div>

                </div>

              </div>
            </div>

            {/* BOTONES NAVEGACIÓN */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-black uppercase text-slate-655 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-all cursor-pointer"
              >
                <ArrowLeft size={14} />
                Atrás
              </button>

              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-black uppercase text-white bg-indigo-650 hover:bg-indigo-700 rounded-xl transition-all shadow-md cursor-pointer"
              >
                Siguiente
                <ArrowRight size={14} />
              </button>
            </div>
          </form>
        )}

        {/* PASO 6 */}
        {currentStep === 6 && (
          <form onSubmit={handleSubmit(handleNext)} className="space-y-8 animate-in fade-in duration-200">
            <div>
              <h3 className="text-xs font-black uppercase text-indigo-600 tracking-wider mb-2">
                Paso 6: Identificación de Materiales y Recursos
              </h3>
              <p className="text-[10px] text-slate-400 font-bold mb-6 uppercase tracking-wider">
                Seleccione los recursos y materiales con los que cuenta la institución educativa, el aula o el docente. Recomendaciones según la guía curricular.
              </p>

              <div className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/20 shadow-3xs">
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-150">
                  
                  {/* Columna 1: Recursos y medios tecnológicos */}
                  <div className="p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-150 pb-2.5">
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">
                        Recursos y medios tecnológicos
                      </h4>
                      <label className="flex items-center gap-2 text-[10px] font-black uppercase text-indigo-755 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isAllRecursosChecked}
                          onChange={(e) => handleToggleAllRecursos(e.target.checked)}
                          className="w-4 h-4 text-indigo-650 border-slate-200 focus:ring-indigo-500 rounded"
                        />
                        Todos
                      </label>
                    </div>

                    <div className="space-y-3">
                      {RECURSOS_TECNOLOGICOS.map((option) => {
                        const isChecked = recursosTecnologicos.includes(option);
                        return (
                          <label
                            key={option}
                            className={`flex items-start gap-3 p-3 border rounded-xl transition-all cursor-pointer ${
                              isChecked ? "border-indigo-300 bg-indigo-50/10" : "border-slate-150 bg-white hover:bg-slate-50"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => handleToggleRecurso(option, e.target.checked)}
                              className="w-4 h-4 text-violet-600 accent-violet-600 border-slate-600 bg-[#070A13] focus:ring-violet-500/50 rounded mt-0.5"
                            />
                            <span className="text-xs font-bold text-slate-700 leading-normal">{option}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Columna 2: Materiales educativos */}
                  <div className="p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-150 pb-2.5">
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">
                        Materiales educativos
                      </h4>
                      <label className="flex items-center gap-2 text-[10px] font-black uppercase text-indigo-755 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isAllMaterialesChecked}
                          onChange={(e) => handleToggleAllMateriales(e.target.checked)}
                          className="w-4 h-4 text-indigo-650 border-slate-200 focus:ring-indigo-500 rounded"
                        />
                        Todos
                      </label>
                    </div>

                    <div className="space-y-3">
                      {MATERIALES_EDUCATIVOS.map((option) => {
                        const isChecked = materialesEducativos.includes(option);
                        return (
                          <label
                            key={option}
                            className={`flex items-start gap-3 p-3 border rounded-xl transition-all cursor-pointer ${
                              isChecked ? "border-indigo-300 bg-indigo-50/10" : "border-slate-150 bg-white hover:bg-slate-50"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => handleToggleMaterial(option, e.target.checked)}
                              className="w-4 h-4 text-violet-600 accent-violet-600 border-slate-600 bg-[#070A13] focus:ring-violet-500/50 rounded mt-0.5"
                            />
                            <span className="text-xs font-bold text-slate-700 leading-normal">{option}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </div>

            </div>

            {/* BOTONES NAVEGACIÓN */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-black uppercase text-slate-655 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-all cursor-pointer"
              >
                <ArrowLeft size={14} />
                Atrás
              </button>

              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-black uppercase text-white bg-indigo-650 hover:bg-indigo-700 rounded-xl transition-all shadow-md cursor-pointer"
              >
                Siguiente
                <ArrowRight size={14} />
              </button>
            </div>
          </form>
        )}

        {/* PASO 7 */}
        {currentStep === 7 && (
          <form onSubmit={handleSubmit(handleNext)} className="space-y-8 animate-in fade-in duration-200">
            <div>
              <h3 className="text-xs font-black uppercase text-indigo-600 tracking-wider mb-2">
                Paso 7: Referencias Bibliográficas y Evaluación
              </h3>
              <p className="text-[10px] text-slate-400 font-bold mb-6 uppercase tracking-wider">
                Defina las referencias bibliográficas oficiales y estructure las acciones de evaluación formativa del docente y estudiantes
              </p>

              <div className="space-y-8">
                
                {/* A. Sección 8.0 - Referencias Bibliográficas */}
                <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50/20 space-y-4">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">
                    8.0 Referencias bibliográficas para el docente y el estudiante
                  </h4>

                  {/* 📚 Textos de Consulta y Trabajo (Dynamic Selector) */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h5 className="text-xs font-black text-slate-800 uppercase tracking-wide">
                          📚 Textos de Consulta y Trabajo
                        </h5>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                          Selecciona los libros oficiales de MINEDU o ingresa tus textos de uso común
                        </p>
                      </div>
                      <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                        <button
                          type="button"
                          onClick={() => setBookTab("minedu")}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                            bookTab === "minedu" ? "bg-white text-indigo-650 shadow-sm" : "text-slate-550 hover:text-slate-700"
                          }`}
                        >
                          Textos MINEDU
                        </button>
                        <button
                          type="button"
                          onClick={() => setBookTab("propios")}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                            bookTab === "propios" ? "bg-white text-indigo-655 shadow-sm" : "text-slate-550 hover:text-slate-700"
                          }`}
                        >
                          Mis Libros
                        </button>
                      </div>
                    </div>

                    {bookTab === "minedu" ? (
                      <div className="space-y-3">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">
                          Textos oficiales detectados para {areas.join(", ") || "Matemática"} ({gradoCiclo || "Grado"}):
                        </p>
                        <div className="grid grid-cols-1 gap-2.5">
                          {areas.flatMap(area => getMineduBooks(area, gradoCiclo)).map((libro) => {
                            const isChecked = librosMineduSeleccionados.includes(libro.title);
                            return (
                              <label
                                key={libro.id}
                                className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none text-xs font-semibold ${
                                  isChecked
                                    ? "bg-indigo-50/40 border-indigo-200 text-indigo-950"
                                    : "bg-slate-50/30 border-slate-200/70 hover:bg-slate-50 text-slate-700"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  className="mt-0.5 accent-indigo-600 cursor-pointer"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    const nextMinedu = e.target.checked
                                      ? [...librosMineduSeleccionados, libro.title]
                                      : librosMineduSeleccionados.filter((t: string) => t !== libro.title);
                                    setValue("libros_minedu_seleccionados", nextMinedu, { shouldDirty: true, shouldValidate: true });

                                    if (libro.type === "docente") {
                                      const currentDoc = watch("bibliografia_docente") || [];
                                      const nextDoc = e.target.checked
                                        ? [...currentDoc, libro.title]
                                        : currentDoc.filter((t: string) => t !== libro.title);
                                      setValue("bibliografia_docente", nextDoc, { shouldDirty: true, shouldValidate: true });
                                    } else {
                                      const currentEst = watch("bibliografia_estudiante") || [];
                                      const nextEst = e.target.checked
                                        ? [...currentEst, libro.title]
                                        : currentEst.filter((t: string) => t !== libro.title);
                                      setValue("bibliografia_estudiante", nextEst, { shouldDirty: true, shouldValidate: true });
                                    }
                                  }}
                                />
                                <div className="flex flex-col gap-0.5">
                                  <span>{libro.title}</span>
                                  <span className="text-[9px] uppercase tracking-wider font-bold text-slate-450">
                                    Recomendado para: {libro.type === "estudiante" ? "Estudiantes (Cuaderno/Texto)" : "Docente (Manual/Guía)"}
                                  </span>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">
                            Libros propios registrados ({librosPropiosFields.length}):
                          </p>
                          <button
                            type="button"
                            onClick={() => appendLibroPropio({ titulo: "", autor_editorial: "", anio: "" })}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-black uppercase bg-slate-100 hover:bg-slate-200/80 text-slate-650 border border-slate-200 rounded-xl transition-all cursor-pointer"
                          >
                            <Plus size={10} />
                            Agregar mi libro de uso
                          </button>
                        </div>

                        {librosPropiosFields.length === 0 ? (
                          <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/20 text-xs font-semibold text-slate-400">
                            No ha agregado libros propios aún. Use el botón superior para añadir textos personalizados.
                          </div>
                        ) : (
                          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                            {librosPropiosFields.map((field, idx) => (
                              <div key={field.id} className="flex flex-col md:flex-row items-end gap-3 p-3.5 bg-slate-50/30 border border-slate-200/70 rounded-2xl">
                                <div className="flex-1 w-full flex flex-col gap-1.5">
                                  <label className="text-[9px] font-bold text-slate-455 uppercase tracking-wide">Título del Libro</label>
                                  <input
                                    type="text"
                                    required
                                    placeholder="Ej: Álgebra Lineal y sus Aplicaciones"
                                    {...register(`libros_docente_propios.${idx}.titulo` as const)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-violet-500 text-xs text-slate-755 bg-white"
                                  />
                                </div>
                                <div className="flex-1 w-full flex flex-col gap-1.5">
                                  <label className="text-[9px] font-bold text-slate-455 uppercase tracking-wide">Autor / Editorial</label>
                                  <input
                                    type="text"
                                    required
                                    placeholder="Ej: David C. Lay / Pearson"
                                    {...register(`libros_docente_propios.${idx}.autor_editorial` as const)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-violet-500 text-xs text-slate-755 bg-white"
                                  />
                                </div>
                                <div className="w-[100px] flex flex-col gap-1.5">
                                  <label className="text-[9px] font-bold text-slate-455 uppercase tracking-wide">Año (Opc.)</label>
                                  <input
                                    type="text"
                                    placeholder="Ej: 2018"
                                    {...register(`libros_docente_propios.${idx}.anio` as const)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-violet-500 text-xs text-slate-755 bg-white text-center"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeLibroPropio(idx)}
                                  className="p-2.5 rounded-xl border border-red-100 hover:border-red-200 bg-red-50 text-red-600 hover:text-red-700 transition-colors cursor-pointer"
                                  title="Eliminar libro"
                                >
                                  <Trash size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Referencias Docente */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700">Para el Docente (5 recomendaciones)</label>
                        <AISuggestButton
                          isLoading={suggestingField["docente"]}
                          onClick={() => handleAiButtonClick("docente")}
                          label={watchDocente && watchDocente.trim().length > 0 ? "PULIR CON IA" : "SUGERIR CON IA"}
                        />
                      </div>
                      <textarea
                        {...register("referencias_docente")}
                        placeholder="Una recomendación por línea...&#10;Ej: MINEDU (2016). Currículo Nacional de la Educación Básica."
                        className="border border-slate-200 focus:border-violet-500 rounded-xl p-4 w-full h-[150px] resize-y text-slate-700 bg-white shadow-inner text-xs outline-none transition-all font-semibold"
                      />
                    </div>

                    {/* Referencias Estudiante */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700">Para el Estudiante (5 recomendaciones)</label>
                        <AISuggestButton
                          isLoading={suggestingField["estudiante"]}
                          onClick={() => handleAiButtonClick("estudiante")}
                          label={watchEstudiante && watchEstudiante.trim().length > 0 ? "PULIR CON IA" : "SUGERIR CON IA"}
                        />
                      </div>
                      <textarea
                        {...register("referencias_estudiante")}
                        placeholder="Una recomendación por línea...&#10;Ej: MINEDU (2020). Cuaderno de trabajo de Comunicación."
                        className="border border-slate-200 focus:border-violet-500 rounded-xl p-4 w-full h-[150px] resize-y text-slate-700 bg-white shadow-inner text-xs outline-none transition-all font-semibold"
                      />
                    </div>
                  </div>
                </div>

                {/* B. Sección 8.2 - Acciones de Evaluación */}
                <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50/20 space-y-4">
                  <div>
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">
                      8.2 Acciones de evaluación
                    </h4>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
                      Seleccione las acciones recomendadas (guía)
                    </span>
                  </div>

                  <div className="border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-3xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-150">
                      
                      {/* Columna 1: Acciones del Docente */}
                      <div className="p-5 space-y-4 bg-slate-50/5">
                        <div className="flex items-center justify-between border-b border-slate-150 pb-2.5">
                          <h5 className="text-[11px] font-black text-slate-800 uppercase tracking-wider">
                            Acciones del Docente
                          </h5>
                          <label className="flex items-center gap-2 text-[9px] font-black uppercase text-indigo-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isAllDocenteChecked}
                              onChange={(e) => handleToggleAllDocente(e.target.checked)}
                              className="w-4 h-4 text-violet-600 accent-violet-600 border-slate-600 bg-[#070A13] focus:ring-violet-500/50 rounded"
                            />
                            Marcar todos
                          </label>
                        </div>

                        <div className="space-y-3">
                          {ACCIONES_DOCENTE.map((option) => {
                            const isChecked = accionesDocente.includes(option);
                            return (
                              <label
                                key={option}
                                className={`flex items-start gap-3 p-3 border rounded-xl transition-all cursor-pointer ${
                                  isChecked ? "border-indigo-350 bg-indigo-50/10" : "border-slate-150 bg-white hover:bg-slate-50"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => handleToggleDocenteAction(option, e.target.checked)}
                                  className="w-4 h-4 text-violet-600 accent-violet-600 border-slate-600 bg-[#070A13] focus:ring-violet-500/50 rounded mt-0.5"
                                />
                                <span className="text-xs font-bold text-slate-700 leading-normal">{option}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      {/* Columna 2: Acciones con estudiantes y familias */}
                      <div className="p-5 space-y-4 bg-slate-50/5">
                        <div className="flex items-center justify-between border-b border-slate-150 pb-2.5">
                          <h5 className="text-[11px] font-black text-slate-800 uppercase tracking-wider">
                            Acciones con estudiantes y familias
                          </h5>
                          <label className="flex items-center gap-2 text-[9px] font-black uppercase text-indigo-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isAllFamiliasChecked}
                              onChange={(e) => handleToggleAllFamilias(e.target.checked)}
                              className="w-4 h-4 text-violet-600 accent-violet-600 border-slate-600 bg-[#070A13] focus:ring-violet-500/50 rounded"
                            />
                            Marcar todos
                          </label>
                        </div>

                        <div className="space-y-3">
                          {ACCIONES_FAMILIAS.map((option) => {
                            const isChecked = accionesFamilias.includes(option);
                            return (
                              <label
                                key={option}
                                className={`flex items-start gap-3 p-3 border rounded-xl transition-all cursor-pointer ${
                                  isChecked ? "border-indigo-350 bg-indigo-50/10" : "border-slate-150 bg-white hover:bg-slate-50"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => handleToggleFamiliasAction(option, e.target.checked)}
                                  className="w-4 h-4 text-violet-600 accent-violet-600 border-slate-600 bg-[#070A13] focus:ring-violet-500/50 rounded mt-0.5"
                                />
                                <span className="text-xs font-bold text-slate-700 leading-normal">{option}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* BOTONES NAVEGACIÓN */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-black uppercase text-slate-655 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-all cursor-pointer"
              >
                <ArrowLeft size={14} />
                Atrás
              </button>

              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-black uppercase text-white bg-indigo-650 hover:bg-indigo-700 rounded-xl transition-all shadow-md cursor-pointer"
              >
                Siguiente
                <ArrowRight size={14} />
              </button>
            </div>
          </form>
        )}

        {/* PASO 8 */}
        {currentStep === 8 && (
          <form onSubmit={handleSubmit(handleNext)} className="space-y-8 animate-in fade-in duration-200">
            <div>
              <h3 className="text-xs font-black uppercase text-indigo-600 tracking-wider mb-2">
                Paso 8: Bibliografía y Vista Previa del Documento
              </h3>
              <p className="text-[10px] text-slate-400 font-bold mb-6 uppercase tracking-wider">
                Verifique los estándares mínimos de referencias bibliográficas para la UGEL y genere la vista previa virtual del documento curricular
              </p>

              <div className="space-y-6">
                
                {/* 1. Validation Banner */}
                {totalReferencias < 6 ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-amber-800 text-xs font-semibold flex items-start gap-3">
                    <span className="text-base select-none">⚠️</span>
                    <p className="leading-relaxed">
                      Le recomendamos contar con al menos 6 referencias bibliográficas combinadas para cumplir con los estándares de la UGEL (actualmente tiene {totalReferencias}). Puede regresar al Paso 7 para autogenerar más con la IA.
                    </p>
                  </div>
                ) : (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-emerald-800 text-xs font-semibold flex items-start gap-3">
                    <span className="text-base select-none">✅</span>
                    <p className="leading-relaxed">
                      ¡Excelente! Cumple con el estándar mínimo de bibliografía (tiene {totalReferencias} referencias registradas).
                    </p>
                  </div>
                )}

                {/* 2. Previsualization Box */}
                {!showPreview ? (
                  <div className="bg-blue-50/30 border border-blue-100 rounded-2xl p-10 flex flex-col items-center justify-center gap-4 text-center">
                    <span className="text-3xl">📄</span>
                    <div className="space-y-1">
                      <p className="text-xs font-black text-slate-700 uppercase tracking-wide">
                        Genere la vista previa del documento para revisar y descargar.
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        Consolida los Pasos 1 al 7 en una maqueta virtual A4
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setShowPreview(true);
                        setHasGeneratedPreview(true);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase px-6 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Sparkles size={14} />
                      Generar documento para previsualizar
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="w-full max-w-4xl mx-auto bg-white border border-slate-200 shadow-lg p-12 min-h-[1120px] rounded-2xl text-slate-900 font-sans overflow-y-auto space-y-8 select-text">
                      
                      {/* Header inside A4 preview */}
                      <div className="flex justify-between items-center border-b border-slate-200 pb-4 select-none">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">VISTA PREVIA DEL DOCUMENTO CURRICULAR (A4)</span>
                        <button
                          type="button"
                          onClick={() => setShowPreview(false)}
                          className="px-3 py-1.5 text-[9px] font-black uppercase bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer"
                        >
                          Cerrar Vista Previa
                        </button>
                      </div>

                      {/* TÍTULO GENERAL */}
                      <div className="text-center space-y-1 pt-4">
                        <h2 className="text-base font-black uppercase tracking-tight text-slate-900">PLANIFICACIÓN CURRICULAR ANUAL - AÑO LECTIVO {anioLectivo || "2026"}</h2>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Educación Básica Regular - Nivel {nivel || "Secundaria"}</p>
                      </div>

                      {/* CUADRO I: INFORMACIÓN GENERAL */}
                      <div className="space-y-2">
                        <h3 className="text-xs font-black uppercase text-indigo-700 tracking-wide">I. INFORMACIÓN GENERAL</h3>
                        <table className="w-full border-collapse border border-slate-300 text-[10px] text-slate-900 text-left">
                          <tbody>
                            <tr>
                              <td className="bg-slate-100 font-bold text-slate-700 w-1/3 border border-slate-300 px-2 py-1.5">Dirección Regional de Educación (DRE)</td>
                              <td className="border border-slate-300 px-2 py-1.5 text-slate-800">{dre || "-"}</td>
                            </tr>
                            <tr>
                              <td className="bg-slate-100 font-bold text-slate-700 border border-slate-300 px-2 py-1.5">Unidad de Gestión Educativa Local (UGEL)</td>
                              <td className="border border-slate-300 px-2 py-1.5 text-slate-800">{ugel || "-"}</td>
                            </tr>
                            <tr>
                              <td className="bg-slate-100 font-bold text-slate-700 border border-slate-300 px-2 py-1.5">Institución Educativa</td>
                              <td className="border border-slate-300 px-2 py-1.5 text-slate-800">{ie || "-"}</td>
                            </tr>
                            <tr>
                              <td className="bg-slate-100 font-bold text-slate-700 border border-slate-300 px-2 py-1.5">Director(a)</td>
                              <td className="border border-slate-300 px-2 py-1.5 text-slate-800">{director || "-"}</td>
                            </tr>
                            <tr>
                              <td className="bg-slate-100 font-bold text-slate-700 border border-slate-300 px-2 py-1.5">Subdirector(a)</td>
                              <td className="border border-slate-300 px-2 py-1.5 text-slate-800">{subdirector || "-"}</td>
                            </tr>
                            <tr>
                              <td className="bg-slate-100 font-bold text-slate-700 border border-slate-300 px-2 py-1.5">Modelo de Servicio / Modalidad</td>
                              <td className="border border-slate-300 px-2 py-1.5 text-slate-800">{mse} ({modalidad})</td>
                            </tr>
                            <tr>
                              <td className="bg-slate-100 font-bold text-slate-700 border border-slate-300 px-2 py-1.5">Nivel Educativo</td>
                              <td className="border border-slate-300 px-2 py-1.5 text-slate-800">{nivel}</td>
                            </tr>
                            <tr>
                              <td className="bg-slate-100 font-bold text-slate-700 border border-slate-300 px-2 py-1.5">Áreas Curriculares</td>
                              <td className="border border-slate-300 px-2 py-1.5 text-slate-800 font-bold">{areas.join(", ") || "-"}</td>
                            </tr>
                            <tr>
                              <td className="bg-slate-100 font-bold text-slate-700 border border-slate-300 px-2 py-1.5">Grado y Sección</td>
                              <td className="border border-slate-300 px-2 py-1.5 text-slate-800">Grado: {gradoCiclo || "-"} | Sección(es): {secciones || "-"}</td>
                            </tr>
                            <tr>
                              <td className="bg-slate-100 font-bold text-slate-700 border border-slate-300 px-2 py-1.5">Docente Responsable</td>
                              <td className="border border-slate-300 px-2 py-1.5 text-slate-800">{docenteResponsable || "-"}</td>
                            </tr>
                            <tr>
                              <td className="bg-slate-100 font-bold text-slate-700 border border-slate-300 px-2 py-1.5">Año Lectivo</td>
                              <td className="border border-slate-300 px-2 py-1.5 text-slate-800">{anioLectivo}</td>
                            </tr>
                            <tr>
                              <td className="bg-slate-100 font-bold text-slate-700 border border-slate-300 px-2 py-1.5">Tiempo de Ejecución</td>
                              <td className="border border-slate-300 px-2 py-1.5 text-slate-800">{tiempo || "-"}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* CUADRO II: EVALUACIÓN DIAGNÓSTICA */}
                      <div className="space-y-2">
                        <h3 className="text-xs font-black uppercase text-indigo-700 tracking-wide">II. RESULTADOS DE LA EVALUACIÓN DIAGNÓSTICA</h3>
                        <table className="w-full border-collapse border border-slate-300 text-[10px] text-slate-900 text-left">
                          <thead>
                            <tr className="bg-sky-100 font-bold text-slate-800">
                              <th className="border border-slate-300 px-2 py-1.5 text-center">Grado</th>
                              <th className="border border-slate-300 px-2 py-1.5">Área</th>
                              <th className="border border-slate-300 px-2 py-1.5">Competencias Evaluadas</th>
                              <th className="border border-slate-300 px-2 py-1.5 text-center">Inicio (N° / %)</th>
                              <th className="border border-slate-300 px-2 py-1.5 text-center">Proceso (N° / %)</th>
                              <th className="border border-slate-300 px-2 py-1.5 text-center">Logrado Esperado</th>
                              <th className="border border-slate-300 px-2 py-1.5 text-center">Logrado Destacado</th>
                              <th className="border border-slate-300 px-2 py-1.5 text-center">N° Estudiantes</th>
                            </tr>
                          </thead>
                          <tbody>
                            {areas.length === 0 ? (
                              <tr>
                                <td colSpan={8} className="border border-slate-300 p-2 text-center text-slate-400 italic">No hay áreas seleccionadas.</td>
                              </tr>
                            ) : (
                              areas.map((area, idx) => (
                                <tr key={idx}>
                                  <td className="border border-slate-300 px-2 py-1.5 text-center">{gradoCiclo || "Grado"}</td>
                                  <td className="border border-slate-300 px-2 py-1.5 font-semibold">{area}</td>
                                  <td className="border border-slate-300 px-2 py-1.5">Competencias curriculares asociadas al CNEB</td>
                                  <td className="border border-slate-300 px-2 py-1.5 text-center">5 (15%)</td>
                                  <td className="border border-slate-300 px-2 py-1.5 text-center">12 (35%)</td>
                                  <td className="border border-slate-300 px-2 py-1.5 text-center">15 (45%)</td>
                                  <td className="border border-slate-300 px-2 py-1.5 text-center">2 (5%)</td>
                                  <td className="border border-slate-300 px-2 py-1.5 text-center">34</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* CUADRO III: ESTÁNDARES DE APRENDIZAJE */}
                      <div className="space-y-2">
                        <h3 className="text-xs font-black uppercase text-indigo-700 tracking-wide">III. ESTÁNDARES DE APRENDIZAJE ESPERADOS PARA EL CICLO</h3>
                        <table className="w-full border-collapse border border-slate-300 text-[10px] text-slate-900 text-left">
                          <thead>
                            <tr className="bg-sky-100 font-bold text-slate-800">
                              <th className="border border-slate-300 px-2 py-1.5 w-1/5">Área</th>
                              <th className="border border-slate-300 px-2 py-1.5 w-1/4">Competencia</th>
                              <th className="border border-slate-300 px-2 py-1.5 w-11/20">Estándar de Aprendizaje Esperado</th>
                            </tr>
                          </thead>
                          <tbody>
                            {areas.length === 0 ? (
                              <tr>
                                <td colSpan={3} className="border border-slate-300 p-2 text-center text-slate-400 italic">No hay áreas de aprendizaje seleccionadas.</td>
                              </tr>
                            ) : (
                              areas.flatMap(area => {
                                const clean = area.trim().toLowerCase();
                                let items = [
                                  {
                                    comp: `Competencias de ${area}`,
                                    estandar: "Evidencia el desarrollo de capacidades y desempeños para articular el aprendizaje en situaciones retadoras."
                                  }
                                ];
                                if (clean.includes("matem")) {
                                  items = [
                                    { comp: "Resuelve problemas de cantidad", estandar: "Resuelve problemas sobre relaciones de cantidad traduciéndolas a expresiones enteras, racionales e irracionales." },
                                    { comp: "Resuelve problemas de regularidad, equivalencia y cambio", estandar: "Traduce variaciones y regularidades a funciones lineales, cuadráticas, ecuaciones e inecuaciones." },
                                    { comp: "Resuelve problemas de forma, movimiento y localización", estandar: "Modela características geométricas y espaciales bidimensionales y tridimensionales." },
                                    { comp: "Resuelve problemas de gestión de datos e incertidumbre", estandar: "Recolecciona, representa y analiza probabilísticamente datos de estudio." }
                                  ];
                                } else if (clean.includes("comunic")) {
                                  items = [
                                    { comp: "Se comunica oralmente en su lengua materna", estandar: "Infiere y sintetiza de forma crítica el propósito, tema e ideas a partir de discursos orales." },
                                    { comp: "Lee diversos tipos de textos escritos", estandar: "Integra información de textos complejos estructurando el análisis del contenido y vocabulario." },
                                    { comp: "Escribe diversos tipos de textos", estandar: "Escribe de forma reflexiva adecuando su texto al propósito y el registro a partir de su experiencia." }
                                  ];
                                } else if (clean.includes("cienc")) {
                                  items = [
                                    { comp: "Indaga mediante métodos científicos", estandar: "Diseña planes de indagación y formula hipótesis basándose en observaciones y teoría científica." },
                                    { comp: "Explica el mundo físico", estandar: "Explica relaciones cualitativas y cuantitativas sobre seres vivos, materia, energía y universo." },
                                    { comp: "Diseña y construye soluciones tecnológicas", estandar: "Diseña y construye prototipos funcionales justificando costos, medidas y recursos del entorno." }
                                  ];
                                } else if (clean.includes("person") || clean.includes("social") || clean.includes("desarrollo")) {
                                  items = [
                                    { comp: "Construye su identidad", estandar: "Valora sus dimensiones individuales, morales y culturales para la toma autónoma de decisiones." },
                                    { comp: "Convive y participa democráticamente", estandar: "Se relaciona respetando los derechos humanos, promoviendo la justicia y la interculturalidad." }
                                  ];
                                }
                                return items.map((it, idx) => ({ area, ...it, isFirst: idx === 0, spanCount: items.length }));
                              }).map((item, idx) => (
                                <tr key={idx}>
                                  {item.isFirst && (
                                    <td className="border border-slate-300 px-2 py-1.5 font-black text-slate-800 bg-slate-50/50 align-top" rowSpan={item.spanCount}>
                                      {item.area}
                                    </td>
                                  )}
                                  <td className="border border-slate-300 px-2 py-1.5 font-bold text-slate-700">{item.comp}</td>
                                  <td className="border border-slate-300 px-2 py-1.5 text-justify">{item.estandar}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* CUADRO IV: DEMANDAS Y PRIORIDADES */}
                      <div className="space-y-2">
                        <h3 className="text-xs font-black uppercase text-indigo-700 tracking-wide">IV. MATRIZ DE PROBLEMAS, PRIORIDADES Y DEMANDAS (DIAGNÓSTICO)</h3>
                        <table className="w-full border-collapse border border-slate-300 text-[10px] text-slate-900 text-left leading-tight">
                          <thead>
                            <tr className="bg-sky-100 font-bold text-slate-800">
                              <th className="border border-slate-300 px-2 py-1.5 w-[30px] text-center">N°</th>
                              <th className="border border-slate-300 px-2 py-1.5 w-1/4">Problema Priorizado</th>
                              <th className="border border-slate-300 px-2 py-1.5 w-1/4">Causa Raíz</th>
                              <th className="border border-slate-300 px-2 py-1.5 w-1/4">Alternativa de Solución</th>
                              <th className="border border-slate-300 px-2 py-1.5 w-1/4">Demanda Educativa</th>
                            </tr>
                          </thead>
                          <tbody>
                            {problemasMatriz.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="border border-slate-300 p-4 text-center text-slate-400 italic">No hay problemas priorizados en la matriz.</td>
                              </tr>
                            ) : (
                              problemasMatriz.map((p, idx) => (
                                <tr key={idx}>
                                  <td className="border border-slate-300 px-2 py-1.5 text-center font-bold">{idx + 1}</td>
                                  <td className="border border-slate-300 px-2 py-1.5 text-justify">{p.problema}</td>
                                  <td className="border border-slate-300 px-2 py-1.5 text-justify">{p.causa}</td>
                                  <td className="border border-slate-300 px-2 py-1.5 text-justify">{p.alternativa}</td>
                                  <td className="border border-slate-300 px-2 py-1.5 text-justify">{p.demanda}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* CUADRO V: BIENESTAR Y EDUCACIÓN INCLUSIVA */}
                      <div className="space-y-2">
                        <h3 className="text-xs font-black uppercase text-indigo-700 tracking-wide">V. ACCIONES DE BIENESTAR Y ATENCIÓN A LA DIVERSIDAD</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Columna Bienestar */}
                          <div className="border border-slate-300 rounded-xl overflow-hidden bg-white text-[10px]">
                            <div className="bg-sky-100 px-3 py-1.5 font-bold text-slate-800 uppercase tracking-wider border-b border-slate-300">
                              Promoción del bienestar socioemocional
                            </div>
                            <div className="p-3">
                              <ul className="list-disc pl-4 space-y-1 text-slate-700 font-semibold">
                                {bienestarSocioemocional.map((item, idx) => (
                                  <li key={idx}>{item}</li>
                                ))}
                                {bienestarSocioemocional.length === 0 && <li className="text-slate-400 italic list-none">Ninguna acción seleccionada.</li>}
                              </ul>
                            </div>
                          </div>

                          {/* Columna Inclusión */}
                          <div className="border border-slate-300 rounded-xl overflow-hidden bg-white text-[10px]">
                            <div className="bg-sky-100 px-3 py-1.5 font-bold text-slate-800 uppercase tracking-wider border-b border-slate-300">
                              Educación inclusiva, intercultural y equitativa
                            </div>
                            <div className="p-3">
                              <ul className="list-disc pl-4 space-y-1 text-slate-700 font-semibold">
                                {educacionInclusiva.map((item, idx) => (
                                  <li key={idx}>{item}</li>
                                ))}
                                {educacionInclusiva.length === 0 && <li className="text-slate-400 italic list-none">Ninguna acción seleccionada.</li>}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* CUADRO VI: COMPETENCIAS TRANSVERSALES */}
                      <div className="space-y-2">
                        <h3 className="text-xs font-black uppercase text-indigo-700 tracking-wide">VI. COMPETENCIAS TRANSVERSALES OBLIGATORIAS (MINEDU)</h3>
                        <table className="w-full border-collapse border border-slate-300 text-[10px] text-slate-900 text-left">
                          <thead>
                            <tr className="bg-sky-100 font-bold text-slate-800">
                              <th className="border border-slate-300 px-2 py-1.5 w-[30px] text-center">N°</th>
                              <th className="border border-slate-300 px-2 py-1.5 w-1/3">Competencia Transversal</th>
                              <th className="border border-slate-300 px-2 py-1.5 w-1/4">Capacidades</th>
                              <th className="border border-slate-300 px-2 py-1.5 w-5/12">Desempeños Curriculares</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="border border-slate-300 px-2 py-1.5 text-center font-bold">1</td>
                              <td className="border border-slate-300 px-2 py-1.5 font-bold">Gestiona su aprendizaje de manera autónoma</td>
                              <td className="border border-slate-300 px-2 py-1.5">
                                • Define metas de aprendizaje<br/>
                                • Organiza acciones estratégicas<br/>
                                • Monitorea y ajusta su desempeño
                              </td>
                              <td className="border border-slate-300 px-2 py-1.5 text-justify">
                                Establece metas de aprendizaje viables en base a sus necesidades, limitaciones y potencialidades cognitivas para estructurar estrategias autónomas de autoaprendizaje.
                              </td>
                            </tr>
                            <tr>
                              <td className="border border-slate-300 px-2 py-1.5 text-center font-bold">2</td>
                              <td className="border border-slate-300 px-2 py-1.5 font-bold">Se desenvuelve en entornos virtuales generados por las TIC</td>
                              <td className="border border-slate-300 px-2 py-1.5">
                                • Personaliza entornos virtuales<br/>
                                • Gestiona información del entorno<br/>
                                • Interactúa en entornos virtuales<br/>
                                • Crea objetos virtuales
                              </td>
                              <td className="border border-slate-300 px-2 py-1.5 text-justify">
                                Organiza y gestiona recursos digitales, plataformas y contenidos interactivos según las actividades académicas requeridas de manera ética, colaborativa y constructiva.
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* CUADRO VII: ENFOQUES TRANSVERSALES */}
                      <div className="space-y-2">
                        <h3 className="text-xs font-black uppercase text-indigo-700 tracking-wide">VII. ENFOQUES TRANSVERSALES PRIORIZADOS EN EL AÑO</h3>
                        <table className="w-full border-collapse border border-slate-300 text-[10px] text-slate-900 text-left">
                          <thead>
                            <tr className="bg-sky-100 font-bold text-slate-800">
                              <th className="border border-slate-300 px-2 py-1.5 w-1/3">Enfoque Transversal</th>
                              <th className="border border-slate-300 px-2 py-1.5 w-2/3">Valores y Descripciones Metodológicas</th>
                            </tr>
                          </thead>
                          <tbody>
                            {enfoquesTransversales.length === 0 ? (
                              <tr>
                                <td colSpan={2} className="border border-slate-300 p-2 text-center text-slate-400 italic">No hay enfoques transversales seleccionados.</td>
                              </tr>
                            ) : (
                              enfoquesTransversales.map((key) => {
                                const item = ENFOQUES_INFO.find((e) => e.key === key) || { key, valores: "Valores comunes", desc: "Enfoque transversal." };
                                return (
                                  <tr key={key}>
                                    <td className="border border-slate-300 px-2 py-1.5 font-bold text-slate-800">{item.key}</td>
                                    <td className="border border-slate-300 px-2 py-1.5 text-justify">
                                      <strong className="block text-slate-700 text-[9px] mb-0.5 uppercase">Valores: {item.valores}</strong>
                                      {item.desc}
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* CUADRO VIII: TUTORÍA Y ORIENTACIÓN */}
                      <div className="space-y-2">
                        <h3 className="text-xs font-black uppercase text-indigo-700 tracking-wide">VIII. PLAN DE TUTORÍA Y ACOMPAÑAMIENTO ORIENTATIVO</h3>
                        
                        <strong className="block text-[10px] text-slate-800 uppercase">Tabla 1 — Dimensiones de la Tutoría:</strong>
                        <table className="w-full border-collapse border border-slate-300 text-[10px] text-slate-900 text-left mb-3">
                          <thead>
                            <tr className="bg-sky-100 font-bold text-slate-800">
                              <th className="border border-slate-300 px-2 py-1.5 w-1/4">Dimensión</th>
                              <th className="border border-slate-300 px-2 py-1.5 w-3/4">Aspectos a Trabajar en el Aula</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="border border-slate-300 px-2 py-1.5 font-bold bg-slate-50/50">Personal</td>
                              <td className="border border-slate-300 px-2 py-1.5 text-justify">Desarrollo de la autonomía, identidad, proyecto de vida y habilidades socioemocionales para el bienestar integral.</td>
                            </tr>
                            <tr>
                              <td className="border border-slate-300 px-2 py-1.5 font-bold bg-slate-50/50">Social</td>
                              <td className="border border-slate-300 px-2 py-1.5 text-justify">Convivencia democrática, prevención de violencia escolar (bullying), equidad de género y diálogo intercultural solidario.</td>
                            </tr>
                            <tr>
                              <td className="border border-slate-300 px-2 py-1.5 font-bold bg-slate-50/50">De los Aprendizajes</td>
                              <td className="border border-slate-300 px-2 py-1.5 text-justify">Metacognición, gestión autónoma de las tareas de estudio, organización del tiempo y técnicas eficientes de aprendizaje.</td>
                            </tr>
                          </tbody>
                        </table>

                        <strong className="block text-[10px] text-slate-800 uppercase">Tabla 2 — Estrategias / Actividades TOE:</strong>
                        <table className="w-full border-collapse border border-slate-300 text-[10px] text-slate-900 text-left">
                          <thead>
                            <tr className="bg-sky-100 font-bold text-slate-800">
                              <th className="border border-slate-300 px-2 py-1.5 w-[30px] text-center">N°</th>
                              <th className="border border-slate-300 px-2 py-1.5 w-1/3">Estrategia / Actividad</th>
                              <th className="border border-slate-300 px-2 py-1.5 w-3/5">Descripción y Alcance Metodológico</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="border border-slate-300 px-2 py-1.5 text-center font-bold">1</td>
                              <td className="border border-slate-300 px-2 py-1.5 font-bold">Tutoría Grupal / Diálogo en el Aula</td>
                              <td className="border border-slate-300 px-2 py-1.5 text-justify">Asambleas de aula programadas y talleres formativos reflexivos para abordar situaciones de interés colectivo o problemáticas detectadas.</td>
                            </tr>
                            <tr>
                              <td className="border border-slate-300 px-2 py-1.5 text-center font-bold">2</td>
                              <td className="border border-slate-300 px-2 py-1.5 font-bold">Tutoría Individual y Escucha Activa</td>
                              <td className="border border-slate-300 px-2 py-1.5 text-justify">Sesiones privadas de orientación para acompañar problemas académicos, socioemocionales o de conducta individuales.</td>
                            </tr>
                          </tbody>
                        </table>

                        {tutoriaPlan && (
                          <div className="border border-slate-200 p-3 rounded-xl bg-slate-50/20 text-[10px] text-slate-700 leading-relaxed pt-2">
                            <strong className="block text-slate-800 uppercase text-[9px] mb-1">Propuesta de Plan TOE Generada:</strong>
                            <p className="text-justify font-semibold">{tutoriaPlan}</p>
                          </div>
                        )}
                      </div>

                      {/* CUADRO IX: EVALUACIÓN */}
                      <div className="space-y-2">
                        <h3 className="text-xs font-black uppercase text-indigo-700 tracking-wide">IX. SISTEMA DE EVALUACIÓN Y ORIENTACIONES METODOLÓGICAS</h3>
                        
                        <strong className="block text-[10px] text-slate-800 uppercase">Tabla 1 — Tipos de Evaluación:</strong>
                        <table className="w-full border-collapse border border-slate-300 text-[10px] text-slate-900 text-left mb-3">
                          <thead>
                            <tr className="bg-sky-100 font-bold text-slate-800">
                              <th className="border border-slate-300 px-2 py-1.5 w-1/6">Tipo</th>
                              <th className="border border-slate-300 px-2 py-1.5 w-1/5">Momento</th>
                              <th className="border border-slate-300 px-2 py-1.5 w-1/3">Propósito Pedagógico</th>
                              <th className="border border-slate-300 px-2 py-1.5 w-3/10">Instrumentos y Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="border border-slate-300 px-2 py-1.5 font-bold bg-slate-50/50">Diagnóstica</td>
                              <td className="border border-slate-300 px-2 py-1.5">Inicio del año lectivo</td>
                              <td className="border border-slate-300 px-2 py-1.5 text-justify">Identificar el nivel real de desarrollo de las competencias para reajustar y diseñar la planificación curricular.</td>
                              <td className="border border-slate-300 px-2 py-1.5">Portafolios, entrevistas directas, pruebas de entrada institucionales.</td>
                            </tr>
                            <tr>
                              <td className="border border-slate-300 px-2 py-1.5 font-bold bg-slate-50/50">Formativa</td>
                              <td className="border border-slate-300 px-2 py-1.5">Durante todo el proceso</td>
                              <td className="border border-slate-300 px-2 py-1.5 text-justify">Brindar retroalimentación continua para que el estudiante mejore su aprendizaje y reajustar las estrategias didácticas del docente.</td>
                              <td className="border border-slate-300 px-2 py-1.5">Rúbricas de evaluación, listas de cotejo, fichas de coevaluación y autoevaluación.</td>
                            </tr>
                            <tr>
                              <td className="border border-slate-300 px-2 py-1.5 font-bold bg-slate-50/50">Sumativa</td>
                              <td className="border border-slate-300 px-2 py-1.5">Término de cada periodo</td>
                              <td className="border border-slate-300 px-2 py-1.5 text-justify">Certificar formalmente el nivel final alcanzado por el estudiante respecto a las competencias deseadas en el ciclo.</td>
                              <td className="border border-slate-300 px-2 py-1.5">Proyectos integradores, carpetas de trabajo final, exámenes sumativos de área.</td>
                            </tr>
                          </tbody>
                        </table>

                        <strong className="block text-[10px] text-slate-800 uppercase">Tabla 2 — Acciones de Acompañamiento Evaluativo:</strong>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[10px]">
                          {/* Columna Acciones Docente */}
                          <div className="border border-slate-300 rounded-xl overflow-hidden bg-white">
                            <div className="bg-slate-100 px-3 py-1.5 font-bold text-slate-700 uppercase tracking-wider border-b border-slate-300">
                              Acciones Metodológicas del Docente
                            </div>
                            <div className="p-3">
                              <ul className="list-disc pl-4 space-y-1 text-slate-600 font-semibold">
                                {accionesDocente.map((item, idx) => (
                                  <li key={idx}>{item}</li>
                                ))}
                                {accionesDocente.length === 0 && <li className="text-slate-400 italic list-none">Ninguna acción registrada.</li>}
                              </ul>
                            </div>
                          </div>

                          {/* Columna Acciones Estudiantes/Familias */}
                          <div className="border border-slate-300 rounded-xl overflow-hidden bg-white">
                            <div className="bg-slate-100 px-3 py-1.5 font-bold text-slate-700 uppercase tracking-wider border-b border-slate-300">
                              Acciones con Estudiantes y Familias
                            </div>
                            <div className="p-3">
                              <ul className="list-disc pl-4 space-y-1 text-slate-600 font-semibold">
                                {accionesFamilias.map((item, idx) => (
                                  <li key={idx}>{item}</li>
                                ))}
                                {accionesFamilias.length === 0 && <li className="text-slate-400 italic list-none">Ninguna acción registrada.</li>}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* CUADRO X: ESCALA DE CALIFICACIÓN */}
                      <div className="space-y-2">
                        <h3 className="text-xs font-black uppercase text-indigo-700 tracking-wide">X. ESCALA DE CALIFICACIÓN Y LOGROS OFICIAL (MINEDU)</h3>
                        <table className="w-full border-collapse border border-slate-300 text-[10px] text-slate-900 text-left">
                          <thead>
                            <tr className="bg-sky-100 font-bold text-slate-800">
                              <th className="border border-slate-300 px-2 py-1.5 w-[50px] text-center">Escala</th>
                              <th className="border border-slate-300 px-2 py-1.5 w-[130px]">Denominación</th>
                              <th className="border border-slate-300 px-2 py-1.5">Descripción Pedagógica del Logro</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="border border-slate-300 px-2 py-1.5 text-center font-bold text-indigo-700 bg-slate-50/50">AD</td>
                              <td className="border border-slate-300 px-2 py-1.5 font-bold">Logro Destacado</td>
                              <td className="border border-slate-300 px-2 py-1.5 text-justify">Cuando el estudiante evidencia un nivel superior a lo esperado respecto a la competencia, demostrando aprendizajes complejos autónomos más allá del grado escolar.</td>
                            </tr>
                            <tr>
                              <td className="border border-slate-300 px-2 py-1.5 text-center font-bold text-emerald-700 bg-slate-50/50">A</td>
                              <td className="border border-slate-300 px-2 py-1.5 font-bold">Logro Esperado</td>
                              <td className="border border-slate-300 px-2 py-1.5 text-justify">Cuando el estudiante evidencia el nivel esperado respecto a la competencia de área, demostrando un desempeño satisfactorio en las actividades.</td>
                            </tr>
                            <tr>
                              <td className="border border-slate-300 px-2 py-1.5 text-center font-bold text-amber-700 bg-slate-50/50">B</td>
                              <td className="border border-slate-300 px-2 py-1.5 font-bold">En Proceso</td>
                              <td className="border border-slate-300 px-2 py-1.5 text-justify">Cuando el estudiante se encuentra en camino de lograr el nivel esperado respecto a la competencia, requiriendo acompañamiento sistemático breve para lograrlo.</td>
                            </tr>
                            <tr>
                              <td className="border border-slate-300 px-2 py-1.5 text-center font-bold text-red-700 bg-slate-50/50">C</td>
                              <td className="border border-slate-300 px-2 py-1.5 font-bold">En Inicio</td>
                              <td className="border border-slate-300 px-2 py-1.5 text-justify">Cuando el estudiante muestra dificultades persistentes y un progreso mínimo en la competencia. Requiere mayor tiempo, adaptación de materiales y tutoría directa.</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Bloque de Firmas */}
                      <div className="grid grid-cols-2 gap-12 pt-16 pb-8 text-center text-[10px] font-semibold text-slate-800 select-none">
                        <div className="flex flex-col items-center">
                          <span className="text-slate-400">--------------------------------------------------</span>
                          <span className="mt-2 block uppercase text-slate-900 font-bold">Docente Responsable</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-slate-400">--------------------------------------------------</span>
                          <span className="mt-2 block uppercase text-slate-900 font-bold">Director(a)</span>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* BOTONES NAVEGACIÓN */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-black uppercase text-slate-655 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-all cursor-pointer"
              >
                <ArrowLeft size={14} />
                Atrás
              </button>

              <button
                type="submit"
                disabled={!hasGeneratedPreview}
                className={`flex items-center gap-2 px-5 py-2.5 text-xs font-black uppercase text-white rounded-xl transition-all shadow-md cursor-pointer ${
                  !hasGeneratedPreview
                    ? "bg-slate-300 cursor-not-allowed shadow-none"
                    : "bg-indigo-650 hover:bg-indigo-700"
                }`}
              >
                Siguiente
                <ArrowRight size={14} />
              </button>
            </div>
          </form>
        )}

        {/* PASO 9 */}
        {currentStep === 9 && (
          <div className="py-12 text-center space-y-6 max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-350">
            <div className="w-20 h-20 bg-violet-100 rounded-full flex items-center justify-center text-violet-600 mx-auto animate-bounce shadow-md">
              <Check size={40} strokeWidth={3.5} />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-black font-headings text-slate-900 uppercase tracking-tight">
                ¡Tu Planificación Anual está lista!
              </h2>
              <p className="text-sm text-slate-550 leading-relaxed font-semibold">
                Se ha consolidado y estructurado de forma exitosa toda la información de acuerdo con los estándares y directrices de la UGEL y el CNEB.
              </p>
            </div>

            <div className="pt-4">
              <button
                type="button"
                disabled={exporting}
                onClick={handleExportWord}
                className="bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white text-base font-black uppercase py-4 px-8 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 mx-auto cursor-pointer"
              >
                {exporting ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Generando Archivo...
                  </>
                ) : (
                  <>
                    <span>📥</span>
                    Descargar en Formato Word (.docx)
                  </>
                )}
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 border-t border-slate-100 text-xs font-black uppercase tracking-wider">
              <button
                type="button"
                onClick={() => {
                  setCurrentStep(1);
                  reset(DEFAULT_VALUES);
                }}
                className="text-indigo-600 hover:text-indigo-755 hover:underline cursor-pointer"
              >
                ➕ Crear nueva Planificación
              </button>
              <span className="hidden sm:inline text-slate-300">|</span>
              <a
                href="/dashboard/documentos"
                className="text-slate-500 hover:text-slate-750 hover:underline cursor-pointer"
              >
                📂 Volver al Historial de Documentos
              </a>
            </div>
          </div>
        )}

      </div>

      {isContextModalOpen && isMounted && typeof window !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            {/* Header — dynamic title per field */}
            <div className="px-6 pt-6 pb-4 flex flex-col items-center gap-3 text-center border-b border-slate-100">
              <div className="w-12 h-12 rounded-full bg-violet-50 flex items-center justify-center text-violet-600">
                <Sparkles size={24} />
              </div>
              <h3 className="font-headings font-bold text-xl text-slate-900 tracking-tight">
                🎯 Personalicemos tu{" "}
                {{
                  justificacion: "Justificación",
                  perfil_egreso: "Perfil de Egreso",
                  estudiantes: "Caracterización de Estudiantes",
                  contexto: "Contexto Institucional",
                  tutoria: "Plan de Tutoría",
                  matriz_diagnostico: "Matriz de Diagnóstico",
                  docente: "Bibliografía Docente",
                  estudiante: "Bibliografía Estudiantil",
                }[activeField || ""] ?? "Sugerencia"}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm mt-1">
                Para ayudarte a redactar una sección perfecta, cuéntame en una sola línea:
              </p>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-5">

              {/* Paso 2 — Preguntas rápidas dinámicas por campo */}
              {(() => {
                const p = PREGUNTAS_POR_CAMPO[activeField || ""] || PREGUNTAS_POR_CAMPO.justificacion;
                return (
                  <div className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
                        {p.q1_label}
                      </label>
                      <input
                        data-modal-reto
                        type="text"
                        value={retoPrincipal}
                        onChange={(e) => { setRetoPrincipal(e.target.value); setModalValidationError(""); }}
                        placeholder={p.q1_placeholder}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 bg-slate-50 outline-none focus:border-violet-500 focus:bg-white transition-colors"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
                        {p.q2_label}
                      </label>
                      <input
                        type="text"
                        value={enfoqueInput}
                        onChange={(e) => { setEnfoqueInput(e.target.value); setModalValidationError(""); }}
                        placeholder={p.q2_placeholder}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 bg-slate-50 outline-none focus:border-violet-500 focus:bg-white transition-colors"
                      />
                    </div>
                    {modalValidationError && (
                      <p className="text-xs text-red-500 font-medium">{modalValidationError}</p>
                    )}
                  </div>
                );
              })()}

              {/* Paso 3 — Chips dinámicos de un solo clic */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  💡 Sugerencias de un solo clic (Para ir rápido):
                </span>
                <div className="flex flex-wrap gap-2">
                  {(CHIPS_POR_CAMPO[activeField || ""] || CHIPS_POR_CAMPO.justificacion).map((chip, idx) => {
                    // First 3 chips autocomplete reto; rest autocomplete enfoque
                    const targetsReto = idx < 3;
                    const currentVal = targetsReto ? retoPrincipal : enfoqueInput;
                    const isSelected = currentVal.includes(chip);
                    return (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => {
                          setModalValidationError("");
                          if (targetsReto) {
                            setRetoPrincipal(isSelected ? "" : chip);
                          } else {
                            setEnfoqueInput(isSelected ? "" : chip);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer border transition-all ${
                          isSelected
                            ? "bg-violet-600 text-white border-violet-600 shadow-sm"
                            : "bg-slate-100 text-slate-700 border-transparent hover:bg-violet-50 hover:text-violet-700 hover:border-violet-200"
                        }`}
                      >
                        {chip}
                      </button>
                    );
                  })}
                  {/* Special chip: Otro problema / Detalle personalizado */}
                  <button
                    type="button"
                    onClick={() => {
                      setRetoPrincipal("");
                      setEnfoqueInput("");
                      setModalValidationError("");
                      // Focus the reto input after a tick so the user writes freely
                      setTimeout(() => {
                        const inp = document.querySelector<HTMLInputElement>('[data-modal-reto]');
                        inp?.focus();
                      }, 50);
                    }}
                    className="px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer border border-dashed border-violet-400 text-violet-600 bg-violet-50 hover:bg-violet-100 transition-all"
                  >
                    ➕ Otro / Detalle personalizado
                  </button>
                </div>
              </div>

            </div>

            {/* Footer Buttons */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 rounded-b-3xl">
              <button
                type="button"
                onClick={() => {
                  setIsContextModalOpen(false);
                  setActiveField(null);
                  setContextInput("");
                  setRetoPrincipal("");
                  setEnfoqueInput("");
                  setModalValidationError("");
                }}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isGenerating}
                onClick={async () => {
                  if (!activeField) return;

                  // Validate: at least one field must be filled
                  if (!retoPrincipal.trim() && !enfoqueInput.trim()) {
                    setModalValidationError("Por favor, escribe una breve idea o selecciona un chip para que la IA pueda ayudarte.");
                    return;
                  }

                  // Build smart concatenated context
                  const partes: string[] = [];
                  if (retoPrincipal.trim()) partes.push(`Reto principal de los alumnos: ${retoPrincipal.trim()}`);
                  if (enfoqueInput.trim()) partes.push(`Enfoque prioritario: ${enfoqueInput.trim()}`);
                  const contextoFinal = partes.join(". ") + ".";

                  setIsGenerating(true);
                  setIsContextModalOpen(false);

                  const backendFieldKey = activeField;
                  const formFieldName = getFormFieldName(activeField);
                  setSuggestingField((prev) => ({ ...prev, [backendFieldKey]: true }));

                  try {
                    const payload: any = {
                      field: backendFieldKey,
                      draftId,
                      context: contextoFinal,
                    };
                    if (backendFieldKey === "tutoria") {
                      payload.dimensiones = tutoriaDimensiones;
                    }
                    const res = await fetch("/api/planificacion-anual/sugerir", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(payload),
                    });
                    if (res.ok) {
                      const result = await res.json();
                      
                      const suggestionText = result.suggestion || result.text;
                      if (activeField === "matriz_diagnostico" && result.problems) {
                        // Si es la matriz de problemas, inyectamos el array completo usando replace de useFieldArray
                        replaceProblemas(result.problems.map((p: any) => ({
                          problema: p.problema || "",
                          causa: p.causa || "",
                          alternativa: p.alternativa || "",
                          demanda: p.demanda || ""
                        })));
                      } else if (suggestionText) {
                        // Comportamiento por defecto para campos de texto planos
                        setValue(formFieldName as any, suggestionText, { shouldDirty: true, shouldValidate: true });
                      } else {
                        throw new Error("El servidor devolvió una estructura de respuesta inesperada.");
                      }
                    } else {
                      const errorData = await res.json().catch(() => ({}));
                      throw new Error(errorData.error || `Error en el servidor: código ${res.status}`);
                    }
                  } catch (err: any) {
                    console.error("Error al sugerir con contexto:", err);
                  } finally {
                    setSuggestingField((prev) => ({ ...prev, [backendFieldKey]: false }));
                    setIsGenerating(false);
                    setActiveField(null);
                    setContextInput("");
                    setRetoPrincipal("");
                    setEnfoqueInput("");
                    setModalValidationError("");
                  }
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-900/30 border border-purple-300/30 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-purple-200" />
                    <span>GENERANDO Y ADAPTANDO...</span>
                  </>
                ) : (
                  <>
                    <span className="text-base select-none">🤖</span>
                    <span>GENERAR CON IA</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
}




