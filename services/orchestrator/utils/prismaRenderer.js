const fs = require("fs");
const path = require("path");
const { execa } = require("execa");

async function renderPrismaPng({ protocolId, mermaidText }) {
  const tempDir = path.join(process.cwd(), "tmp");
  const runDir = path.join(tempDir, protocolId);

  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }

  if (!fs.existsSync(runDir)) {
    fs.mkdirSync(runDir);
  }

  const inputPath = path.join(runDir, "prisma.mmd");
  const outputPath = path.join(runDir, "prisma.png");

  fs.writeFileSync(inputPath, mermaidText, "utf8");

  const mmdcPath = process.platform === "win32"
    ? path.join(process.cwd(), "node_modules", ".bin", "mmdc.cmd")
    : path.join(process.cwd(), "node_modules", ".bin", "mmdc");

  await execa(mmdcPath, ["-i", inputPath, "-o", outputPath], {
    windowsHide: true
  });

  return {
    inputPath,
    outputPath
  };
}

module.exports = {
  renderPrismaPng
};