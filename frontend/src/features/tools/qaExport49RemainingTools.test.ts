import { describe, expect, it } from "vitest";
import { Packer } from "docx";
import * as fs from "node:fs";
import * as path from "node:path";

import { buildSourceDocumentDocx } from "../evaluations/source-documents/exportSourceDocumentDocx";
import { buildDocumentDocx, type StructuredArtifact } from "./exportWorkflowDocx";

const targetDir = "c:\\Users\\PC\\Documents\\ChatGPT\\Avend Escala 3.0\\exports-qa-word";

function artifact(title: string): StructuredArtifact {
  return {
    document_title: title,
    executive_summary: "Documento pedagógico contextualizado, revisable y listo para su aplicación con estudiantes y familias.",
    sections: [
      { title: "Propósito y contexto", narrative: "La propuesta responde a la necesidad declarada y organiza acciones observables con seguimiento.", key_points: ["Usar evidencia real del grupo.", "Revisar los acuerdos antes de aplicar."] },
      { title: "Aplicación", narrative: "El docente acompaña la actividad, registra evidencias y ajusta el siguiente paso según el avance observado.", key_points: ["Inicio claro.", "Desarrollo acompañado.", "Cierre con evidencia."] },
    ],
    tables: [{
      title: "Matriz específica de aplicación",
      columns: ["Momento", "Acción", "Evidencia", "Seguimiento"],
      rows: [
        ["Inicio", "Recoger la situación inicial.", "Registro descriptivo.", "Definir apoyo."],
        ["Desarrollo", "Aplicar la estrategia acordada.", "Producción o participación.", "Retroalimentar."],
        ["Cierre", "Comparar el avance.", "Nueva evidencia.", "Acordar el próximo paso."],
      ],
      note: "Los textos son editables y deben contrastarse con la evidencia del aula.",
    }],
    teacher_recommendations: ["Mantener lenguaje descriptivo.", "No incluir datos sensibles innecesarios."],
    activity: null,
    model: "gemini-3.6-flash",
  };
}

describe("QA Generator: remaining specialized tools", () => {
  it("generates the learning sheet and the eight remaining long-form documents", async () => {
    fs.mkdirSync(targetDir, { recursive: true });
    const outputs: Array<[string, import("docx").Document]> = [];
    outputs.push([
      "49-evaluamos-ficha-aprendizaje.docx",
      await buildSourceDocumentDocx(
        artifact("Ficha de aprendizaje: cuidamos el agua"),
        "El agua circula en la naturaleza y sostiene la vida de la comunidad.",
        "medium",
        "medium",
      ),
    ]);

    const remaining = [
      ["50-evaluamos-carpetas-recuperacion.docx", "evaluamos/carpetas-recuperacion", "Carpeta de recuperación"],
      ["51-tutoria-sesiones-tutoria.docx", "tutoria/sesiones-tutoria", "Sesión de tutoría"],
      ["52-tutoria-informe-tutoria.docx", "tutoria/informe-tutoria", "Informe de tutoría"],
      ["53-tutoria-informe-padres.docx", "tutoria/informe-padres", "Informe para familias"],
      ["54-tutoria-fichas-acompanamiento.docx", "tutoria/fichas-acompanamiento", "Ficha de acompañamiento"],
      ["55-tutoria-alertas-casos.docx", "tutoria/alertas-casos", "Registro seguro de alerta"],
      ["56-tutoria-recursos-tutoria.docx", "tutoria/recursos-tutoria", "Recurso de tutoría"],
      ["57-tutoria-orientacion-vocacional.docx", "tutoria/orientacion-vocacional", "Ruta de orientación vocacional"],
    ];
    for (const [filename, workflowKey, title] of remaining) {
      outputs.push([filename, buildDocumentDocx(artifact(title), {
        workflowKey,
        values: { institution: "I.E. de demostración", teacher_name: "Docente responsable", modality: "EBR", level: "Secundaria", grade: "3°", curricular_area: "Tutoría" },
      })]);
    }

    for (const [filename, document] of outputs) {
      const buffer = await Packer.toBuffer(document);
      const target = path.join(targetDir, filename);
      fs.writeFileSync(target, buffer);
      expect(buffer.subarray(0, 2).toString()).toBe("PK");
      expect(buffer.length, filename).toBeGreaterThan(7000);
    }
    expect(outputs).toHaveLength(9);
  });
});
