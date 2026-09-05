const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 950 });

  // 1. PCA Step 1
  await page.goto("http://127.0.0.1:5173/dashboard/planificamos/plan-curricular-anual", { waitUntil: "networkidle2" });
  await page.waitForSelector(".workflow-card");
  await page.screenshot({ path: "audit/pca-step1-homologado-light.png" });

  // 2. Click Step 3: Calendarización
  const step3Btn = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll(".workflow-stepper button"));
    return buttons.find(b => b.textContent.includes("Calendarización") || b.textContent.includes("3"));
  });
  if (step3Btn) {
    await step3Btn.click();
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: "audit/pca-step3-dropzone-light.png" });
  }

  // 3. Dark mode Step 3
  await page.evaluate(() => {
    document.documentElement.setAttribute("data-theme", "dark");
  });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: "audit/pca-step3-dropzone-dark.png" });

  // 4. Dark mode Step 1
  const step1Btn = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll(".workflow-stepper button"));
    return buttons.find(b => b.textContent.includes("Datos") || b.textContent.includes("1"));
  });
  if (step1Btn) {
    await step1Btn.click();
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: "audit/pca-step1-homologado-dark.png" });
  }

  await browser.close();
  console.log("Screenshots captured successfully!");
})();
