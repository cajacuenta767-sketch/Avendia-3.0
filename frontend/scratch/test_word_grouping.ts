import { exportWordGroupingDocx } from "../src/features/tools/exportWordGroupingDocx";
import { exportSequenceOrderingDocx } from "../src/features/tools/exportSequenceOrderingDocx";
import * as fs from "fs";
import * as path from "path";

async function testOutputs() {
  const form = {
    teacherName: "Administrador Avendia",
    institution: "Avendia",
    modality: "EBR",
    level: "Primaria",
    grade: "1° de Primaria",
    curricularArea: "Personal Social",
    topic: "Hábitos saludables",
  };

  const groupingResult = {
    activity_title: "Descubrimos nuestros hábitos saludables",
    instructions: "Observa o lee las acciones con ayuda de tu profesora y clasifícalas en la categoría adecuada para cuidar tu cuerpo.",
    words: [
      { id: "w1", word: "Bañarse a diario", correct_category_id: "c1" },
      { id: "w2", word: "Lavarse las manos", correct_category_id: "c1" },
      { id: "w3", word: "Cepillarse los dientes", correct_category_id: "c1" },
      { id: "w4", word: "Comer frutas", correct_category_id: "c2" },
      { id: "w5", word: "Comer verduras", correct_category_id: "c2" },
      { id: "w6", word: "Tomar agua pura", correct_category_id: "c2" },
      { id: "w7", word: "Hacer ejercicio", correct_category_id: "c3" },
      { id: "w8", word: "Jugar al aire libre", correct_category_id: "c3" },
      { id: "w9", word: "Dormir temprano", correct_category_id: "c3" },
    ],
    categories: [
      { id: "c1", name: "Higiene personal", explanation: "Prácticas de limpieza del cuerpo para prevenir enfermedades." },
      { id: "c2", name: "Alimentación saludable", explanation: "Consumo de alimentos nutritivos que brindan energía." },
      { id: "c3", name: "Actividad física y descanso", explanation: "Movimiento y sueño oportuno para recuperar fuerzas." },
    ],
  };

  console.log("Generating Word Grouping DOCX...");
  const groupingBlob = await exportWordGroupingDocx(form, groupingResult);
  const groupingBuffer = Buffer.from(await groupingBlob.arrayBuffer());
  fs.writeFileSync(path.join(process.cwd(), "scratch", "test_grouping_fixed.docx"), groupingBuffer);
  console.log("Saved test_grouping_fixed.docx, size:", groupingBuffer.length);

  const orderingResult = {
    activity_title: "Ciclo de Vida de una Planta",
    instructions: "Ordena los pasos desde la siembra de la semilla hasta la floración.",
    blocks: [
      { id: "b1", text: "Regar la semilla con agua y colocarla al sol.", correct_order: 2, hint: "Necesita agua." },
      { id: "b2", text: "Plantar la semilla en tierra fértil.", correct_order: 1, hint: "Primer paso." },
      { id: "b3", text: "Aparecen las primeras hojas y el tallo crece.", correct_order: 3, hint: "Brote verde." },
      { id: "b4", text: "La planta florece y da nuevos frutos.", correct_order: 4, hint: "Paso final." },
    ],
    pedagogical_rationale: "Fomenta la comprensión de secuencias temporales en seres vivos.",
  };

  console.log("Generating Sequence Ordering DOCX...");
  const orderingBlob = await exportSequenceOrderingDocx({ ...form, sequenceType: "cronológica" }, orderingResult);
  const orderingBuffer = Buffer.from(await orderingBlob.arrayBuffer());
  fs.writeFileSync(path.join(process.cwd(), "scratch", "test_ordering_fixed.docx"), orderingBuffer);
  console.log("Saved test_ordering_fixed.docx, size:", orderingBuffer.length);
}

testOutputs().catch(console.error);
