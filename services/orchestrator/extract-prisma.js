const fs = require("fs");

const responsePath = "C:\\traceslr-mvp\\services\\orchestrator\\response.json";
const outputPath = "C:\\traceslr-mvp\\services\\orchestrator\\prisma.mmd";

const raw = fs.readFileSync(responsePath, "utf8");
const data = JSON.parse(raw);

const mermaid = data.pipeline.A6_PRISMA.prisma_diagram_mermaid;

fs.writeFileSync(outputPath, mermaid, "utf8");

console.log("Mermaid saved to:", outputPath);
console.log(mermaid);