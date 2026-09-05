import { Bot, Check, Copy, LoaderCircle, Send, Sparkles, WandSparkles, X, Zap } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

import { getToolByPath } from "../config/tools";
import { apiRequest } from "../lib/api";

type AssistantField = { id: string; label: string; type: string };
type AssistantContext = {
  toolTitle: string;
  module: string;
  values: Record<string, string | string[]>;
  fields: AssistantField[];
};
type Message = { id: string; role: "user" | "assistant"; text: string };
type CopilotResponse = { reply: string; model: string };

const QUICK_ACTIONS: Record<string, string[]> = {
  planificamos: ["Alinear al CNEB", "Mejorar el reto", "Ordenar la secuencia"],
  evaluamos: ["Precisar criterios", "Crear retroalimentación", "Revisar dificultad"],
  incluimos: ["Identificar barreras", "Proponer apoyos DUA", "Mejorar seguimiento"],
  reforzamos: ["Diferenciar actividades", "Definir micro-metas", "Analizar avances"],
  acompanamos: ["Mejorar el tono", "Sintetizar evidencias", "Proponer acuerdos"],
  tutoria: ["Cuidar el lenguaje", "Proponer dinámica", "Ordenar seguimiento"],
  recursos: ["Adaptar a la edad", "Crear consignas", "Añadir desafío"],
};

export function GeminiAssistant() {
  const { pathname } = useLocation();
  const tool = getToolByPath(pathname);
  const [open, setOpen] = useState(false);
  const [context, setContext] = useState<AssistantContext>({ toolTitle: tool?.title ?? "Avendia", module: tool?.module ?? "general", values: {}, fields: [] });
  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", role: "assistant", text: "Hola, soy el copiloto pedagógico de Avendia. Puedo revisar tu formulario, proponer mejoras y aplicar una respuesta directamente en un campo." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState("");
  const [targets, setTargets] = useState<Record<string, string>>({});
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const receiveContext = (event: Event) => setContext((event as CustomEvent<AssistantContext>).detail);
    window.addEventListener("avendia-ai-context", receiveContext);
    return () => window.removeEventListener("avendia-ai-context", receiveContext);
  }, []);

  useEffect(() => {
    if (tool) setContext((current) => ({ ...current, toolTitle: tool.title, module: tool.module }));
  }, [tool]);

  useEffect(() => {
    if (open) window.dispatchEvent(new Event("avendia-ai-context-request"));
  }, [open, pathname]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const quickActions = useMemo(() => QUICK_ACTIONS[context.module] ?? ["Mejorar redacción", "Revisar coherencia", "Proponer siguiente paso"], [context.module]);
  const insertableFields = context.fields.filter((field) => field.type === "textarea" || field.type === "text");

  async function send(text = input.trim()) {
    if (!text || loading) return;
    const userMessage: Message = { id: `user-${Date.now()}`, role: "user", text };
    setMessages((current) => [...current, userMessage]);
    setInput("");
    setLoading(true);
    try {
      const token = sessionStorage.getItem("avendia.accessToken");
      const response = await apiRequest<CopilotResponse>("/ai/tools/copilot", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: JSON.stringify({
          message: text,
          tool_title: context.toolTitle,
          module: context.module,
          form_values: Object.fromEntries(Object.entries(context.values).map(([key, value]) => [key, Array.isArray(value) ? value.join(", ") : value])),
        }),
      });
      setMessages((current) => [...current, { id: `assistant-${Date.now()}`, role: "assistant", text: response.reply }]);
    } catch (error) {
      setMessages((current) => [...current, { id: `assistant-${Date.now()}`, role: "assistant", text: error instanceof Error ? error.message : "No se pudo conectar con Gemini." }]);
    } finally {
      setLoading(false);
    }
  }

  function copyMessage(message: Message) {
    navigator.clipboard.writeText(message.text);
    setCopied(message.id);
    window.setTimeout(() => setCopied(""), 1600);
  }

  function applyMessage(message: Message) {
    const fieldId = targets[message.id] || insertableFields[0]?.id;
    if (!fieldId) return;
    window.dispatchEvent(new CustomEvent("avendia-ai-insert", { detail: { fieldId, text: message.text } }));
  }

  return (
    <>
      <button className="gemini-trigger" onClick={() => setOpen((value) => !value)} aria-label="Abrir copiloto de Gemini" title="Copiloto pedagógico Gemini"><WandSparkles /></button>
      <div className={`gemini-drawer ${open ? "is-open" : ""}`} aria-hidden={!open}>
        <header>
          <span><Sparkles /><span><strong>Copiloto Gemini</strong><small>Asistente pedagógico en línea</small></span></span>
          <button className="icon-button" onClick={() => setOpen(false)} aria-label="Cerrar copiloto"><X /></button>
        </header>
        <section className="gemini-context"><small>Contexto actual</small><strong>{context.toolTitle}</strong></section>
        <div className="gemini-quick-actions">
          {quickActions.map((action) => <button key={action} disabled={loading} onClick={() => send(`${action}. Revisa los datos actuales de la herramienta y dame una propuesta lista para usar.`)}>{action}</button>)}
        </div>
        <div className="gemini-messages">
          {messages.map((message) => (
            <article className={`gemini-message gemini-message--${message.role}`} key={message.id}>
              <span className="gemini-message__avatar">{message.role === "assistant" ? <Bot /> : "Tú"}</span>
              <div><p>{message.text}</p>{message.role === "assistant" && message.id !== "welcome" ? <footer>
                <button onClick={() => copyMessage(message)}>{copied === message.id ? <Check /> : <Copy />}{copied === message.id ? "Copiado" : "Copiar"}</button>
                {insertableFields.length ? <><select value={targets[message.id] ?? insertableFields[0]?.id} onChange={(event) => setTargets((current) => ({ ...current, [message.id]: event.target.value }))}>{insertableFields.map((field) => <option value={field.id} key={field.id}>{field.label}</option>)}</select><button className="gemini-insert" onClick={() => applyMessage(message)}><Zap />Aplicar</button></> : null}
              </footer> : null}</div>
            </article>
          ))}
          {loading ? <article className="gemini-message gemini-message--assistant"><span className="gemini-message__avatar"><Bot /></span><div><p className="gemini-thinking"><LoaderCircle />Analizando el contexto con Gemini…</p></div></article> : null}
          <div ref={endRef} />
        </div>
        <form className="gemini-composer" onSubmit={(event) => { event.preventDefault(); send(); }}>
          <textarea rows={2} value={input} onChange={(event) => setInput(event.target.value)} placeholder="Pide una mejora, explicación o propuesta…" />
          <button disabled={!input.trim() || loading} aria-label="Enviar mensaje"><Send /></button>
        </form>
      </div>
    </>
  );
}
