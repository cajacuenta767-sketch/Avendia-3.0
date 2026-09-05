import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { TemplateLibrary } from "./TemplateLibrary";
import { UtilityHero } from "../utilities/UtilityHero";
import { useUtilitySummary } from "../utilities/useUtilitySummary";

export function UtilityPage() {
  const key = useLocation().pathname.split("/").pop() ?? "";
  const [message, setMessage] = useState("");
  const formats = key === "sube-tu-formato";
  const summary = useUtilitySummary();
  return <main className="content-page">
    {formats ? <UtilityHero eyebrow="BIBLIOTECA INSTITUCIONAL" title="Sube tu formato" description="Conserva, organiza y usa tus formatos institucionales sin modificar el archivo original." metrics={[
      { label: "formatos guardados", value: summary.data?.templates?.total ?? "—" },
      { label: "privacidad", value: "Personal", detail: "solo tu cuenta" },
    ]}><p className="utility-hero__hint">Carga DOCX, PDF, XLSX o PPTX. Luego podrás descargarlo o elegirlo como referencia en herramientas compatibles.</p></UtilityHero> : <header className="simple-heading"><h1>Configuración</h1><p>Personaliza tu espacio de trabajo.</p></header>}
    {formats ? <TemplateLibrary /> : <section className="utility-panel"><label>Zona horaria de este dispositivo<select defaultValue={localStorage.getItem("avendia.timezone") ?? "America/Lima"} onChange={event => { localStorage.setItem("avendia.timezone", event.target.value); setMessage("Preferencia guardada en este dispositivo"); }}><option value="America/Lima">Lima (UTC-5)</option><option value="America/La_Paz">La Paz (UTC-4)</option></select></label></section>}
    {message ? <div className="toast" role="status"><CheckCircle2 />{message}</div> : null}
  </main>;
}
