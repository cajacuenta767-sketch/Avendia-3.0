const path = require('path');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    defaultViewport: { width: 1400, height: 1100 },
  });

  const page = await browser.newPage();
  const screenDir = 'C:\\Users\\PC\\.gemini\\antigravity\\brain\\a9be914d-ead5-4d1e-bf50-3ed5e5b0ccd8\\audit-screens';

  console.log('Navigating to login...');
  await page.goto('http://127.0.0.1:5173/login', { waitUntil: 'networkidle0' });

  await page.type('input[name="email"]', 'admin@avendia.edu.pe');
  await page.type('input[name="password"]', 'Admin123456!');
  await page.click('button.login-submit');
  await page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {});
  console.log('Logged in.');

  // Test 1: Tarjetas de estudio with real activity items
  console.log('Testing Tarjetas de Estudio...');
  await page.goto('http://127.0.0.1:5173/dashboard/recursos/tarjetas-estudio', { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    const user = JSON.parse(sessionStorage.getItem("avendia.user") || "{}");
    const scope = String(user.id || user.email || "anonymous").replace(/[^a-zA-Z0-9@._-]/g, "-");
    const buttons = document.querySelectorAll('.workflow-stepper button');
    const lastIndex = Math.max(0, buttons.length - 1);

    const artifact = {
      document_title: "Tarjetas de Estudio sobre Hábitos Saludables",
      executive_summary: "Conjunto de 10 tarjetas de estudio diseñadas para fortalecer el autocuidado en 1° de Primaria.",
      sections: [
        {
          title: "Orientaciones de uso pedagógico",
          narrative: "Recurso manipulable para afianzar hábitos de higiene y nutrición.",
          key_points: ["Leer en voz alta", "Reforzar con ejemplos cotidianos"],
        },
      ],
      teacher_recommendations: ["Repasar al día siguiente y reforzar en 3 días."],
      activity: {
        mode: "flashcards",
        title: "Tarjetas Interactivas: Cuidamos Nuestra Salud",
        instructions: "Lee el concepto del frente y gira la tarjeta para comprobar tu respuesta.",
        items: [
          { id: "c1", prompt: "Aseo personal", answer: "Mantener limpio nuestro cuerpo bañándonos con agua y jabón.", hint: "Agua y jabón.", options: [] },
          { id: "c2", prompt: "Lavado de manos", answer: "Frotar con agua y jabón durante 20 segundos.", hint: "Antes de comer.", options: [] },
          { id: "c3", prompt: "Cepillado de dientes", answer: "Limpiar los dientes después de cada comida.", hint: "Cepillo y pasta dental.", options: [] },
          { id: "c4", prompt: "Alimentación saludable", answer: "Comer frutas y verduras para crecer fuertes.", hint: "Colores variados en el plato.", options: [] },
          { id: "c5", prompt: "Actividad física", answer: "Mover el cuerpo jugando y saltando.", hint: "Jugar en el recreo.", options: [] },
          { id: "c6", prompt: "Descanso nocturno", answer: "Dormir de 9 a 10 horas cada noche.", hint: "Ir a la cama temprano.", options: [] },
          { id: "c7", prompt: "Consumo de agua pura", answer: "Tomar agua segura para hidratar el cuerpo.", hint: "Tomatodo con agua.", options: [] },
          { id: "c8", prompt: "Postura correcta", answer: "Sentarse con la espalda recta apoyada en la silla.", hint: "No encorvarse.", options: [] },
          { id: "c9", prompt: "Higiene de los alimentos", answer: "Lavar bien las frutas antes de comerlas.", hint: "Agua limpia.", options: [] },
          { id: "c10", prompt: "Espacios limpios", answer: "Mantener ordenada el aula y botar basura al tacho.", hint: "Tacho de basura.", options: [] },
        ],
        word_bank: [],
      },
      model: "gemini-3.6-flash",
    };

    const storagePayload = {
      toolId: "tarjetas-estudio",
      currentStep: lastIndex,
      values: {
        dre: "SAN MARTÍN",
        ugel: "LAMAS",
        institution: "MARTÍN DE LA RIVA Y HERRERA",
        level: "Primaria",
        grade: "1° de Primaria",
        section: "A",
        curricular_area: "Personal Social",
        teacher_name: "Prof. María Gómez",
        student_name: "Mateo Pérez",
        school_year: "2026",
      },
      artifact,
      version: 2,
      updatedAt: new Date().toISOString(),
    };

    const key = `avendia.draft.workflow.recursos/tarjetas-estudio.v2.${scope}`;
    localStorage.setItem(key, JSON.stringify(storagePayload));
  });

  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(screenDir, '60-tarjetas-fixed-preview.png') });
  console.log('Captured: 60-tarjetas-fixed-preview.png');

  await browser.close();
  console.log('Finished visual audit.');
}

run().catch(console.error);
