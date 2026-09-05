import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ReactNode } from "react";

import type { ActivityPoint, RankedUsage, Segment } from "./adminTypes";

const COLORS = ["#075be8", "#7b61d1", "#069a9c", "#f59e0b", "#e85d75", "#64748b"];
const number = new Intl.NumberFormat("es-PE");
const shortDate = new Intl.DateTimeFormat("es-PE", { day: "2-digit", month: "short" });

function ChartEmpty({ children }: { children: ReactNode }) {
  return <div className="admin-chart-empty">{children}</div>;
}

export function ActivityChart({ data }: { data: ActivityPoint[] }) {
  if (!data.some((item) => item.registrations + item.documents + item.calendar_events + item.ai_generations > 0)) return <ChartEmpty>Aún no hay actividad registrada en este periodo.</ChartEmpty>;
  const formatted = data.map((item) => ({ ...item, label: shortDate.format(new Date(`${item.date}T12:00:00`)) }));
  return <div className="admin-chart" role="img" aria-label="Evolución de registros, documentos, calendario y generaciones con IA">
    <ResponsiveContainer width="100%" height="100%"><AreaChart data={formatted} margin={{ top: 12, right: 8, bottom: 0, left: -18 }}>
      <defs><linearGradient id="activityBlue" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#075be8" stopOpacity={0.28}/><stop offset="100%" stopColor="#075be8" stopOpacity={0.02}/></linearGradient></defs>
      <CartesianGrid stroke="var(--admin-chart-grid)" vertical={false}/><XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={28}/><YAxis allowDecimals={false} tickLine={false} axisLine={false}/>
      <Tooltip contentStyle={{ borderRadius: 12, borderColor: "var(--line)", background: "var(--admin-panel)", color: "var(--navy)" }}/><Legend iconType="circle"/>
      <Area type="monotone" dataKey="documents" name="Documentos" stroke="#075be8" fill="url(#activityBlue)" strokeWidth={2.4}/>
      <Area type="monotone" dataKey="ai_generations" name="Generaciones IA" stroke="#7b61d1" fillOpacity={0} strokeWidth={2.2}/>
      <Area type="monotone" dataKey="calendar_events" name="Eventos" stroke="#069a9c" fillOpacity={0} strokeWidth={2.2}/>
      <Area type="monotone" dataKey="registrations" name="Registros" stroke="#f59e0b" fillOpacity={0} strokeWidth={2.2}/>
    </AreaChart></ResponsiveContainer>
  </div>;
}

export function SegmentDonut({ data, label }: { data: Segment[]; label: string }) {
  if (!data.some((item) => item.value > 0)) return <ChartEmpty>Sin datos de {label.toLowerCase()}.</ChartEmpty>;
  return <div className="admin-donut-wrap"><div className="admin-donut" role="img" aria-label={`Distribución por ${label}`}><ResponsiveContainer width="100%" height="100%"><PieChart>
    <Pie data={data} dataKey="value" nameKey="label" innerRadius="57%" outerRadius="82%" paddingAngle={3}>{data.map((item, index) => <Cell key={item.key} fill={COLORS[index % COLORS.length]}/>)}</Pie>
    <Tooltip formatter={(value) => number.format(Number(value))} contentStyle={{ borderRadius: 12, borderColor: "var(--line)", background: "var(--admin-panel)" }}/>
  </PieChart></ResponsiveContainer></div><ul className="admin-chart-legend">{data.map((item, index) => <li key={item.key}><i style={{ background: COLORS[index % COLORS.length] }}/><span>{item.label}</span><strong>{number.format(item.value)}</strong></li>)}</ul></div>;
}

export function RankingChart({ data }: { data: RankedUsage[] }) {
  if (!data.length) return <ChartEmpty>El seguimiento detallado empezará con la próxima generación de IA.</ChartEmpty>;
  return <div className="admin-ranking-chart" role="img" aria-label="Herramientas de IA con mayor consumo"><ResponsiveContainer width="100%" height="100%"><BarChart data={data.slice(0, 7)} layout="vertical" margin={{ top: 5, right: 22, bottom: 5, left: 15 }}>
    <CartesianGrid stroke="var(--admin-chart-grid)" horizontal={false}/><XAxis type="number" tickLine={false} axisLine={false}/><YAxis type="category" dataKey="label" width={112} tickLine={false} axisLine={false}/>
    <Tooltip formatter={(value) => `${number.format(Number(value))} créditos`} contentStyle={{ borderRadius: 12, borderColor: "var(--line)", background: "var(--admin-panel)" }}/><Bar dataKey="credits" name="Créditos" fill="#7b61d1" radius={[0, 7, 7, 0]}/>
  </BarChart></ResponsiveContainer></div>;
}
