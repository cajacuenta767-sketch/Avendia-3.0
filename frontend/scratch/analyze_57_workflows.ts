import { workflowDefinitions } from "../src/config/workflows";

const archetypes = {};
const list = workflowDefinitions.map((w) => {
  archetypes[w.artifactType] = (archetypes[w.artifactType] || 0) + 1;
  return {
    module: w.module,
    toolId: w.id,
    key: w.key,
    artifactType: w.artifactType,
    stepsCount: w.steps.length,
    outputSections: w.outputSections,
  };
});

console.log("Total workflows:", list.length);
console.log("Archetypes:", archetypes);

const byModule = {};
list.forEach((item) => {
  if (!byModule[item.module]) byModule[item.module] = [];
  byModule[item.module].push(item);
});

for (const [mod, tools] of Object.entries(byModule)) {
  console.log(`\n=== Módulo: ${mod} (${tools.length} herramientas) ===`);
  tools.forEach((t) => {
    console.log(` - [${t.artifactType}] ${t.key} (Sections: ${t.outputSections.length})`);
  });
}
