const { buildPrismaMermaid } = require("../utils/prismaDiagram");

function buildMermaidInkUrl(mermaidText) {
  const encoded = Buffer.from(mermaidText, "utf8").toString("base64");
  return `https://mermaid.ink/img/${encoded}`;
}

async function runAgentA6Prisma({
  searchResult,
  titleScreeningResult,
  abstractScreeningResult,
  fullTextResult
}) {
  const inputProtocolId = fullTextResult.input_protocol_id;

  const identified = searchResult.search_results?.length ?? 0;
  const screened = titleScreeningResult.included_titles?.length ?? 0;
  const excludedAtTitle = titleScreeningResult.excluded_titles?.length ?? 0;
  const fullTextAssessed = abstractScreeningResult.included_abstracts?.length ?? 0;
  const includedStudies = fullTextResult.included_fulltext?.length ?? 0;

  const prismaSummary = {
    records_identified: identified,
    records_screened: screened,
    records_excluded: excludedAtTitle,
    full_text_assessed: fullTextAssessed,
    studies_included: includedStudies
  };

  const prismaDiagram = buildPrismaMermaid(prismaSummary);
  const prismaPngUrl = buildMermaidInkUrl(prismaDiagram);

  return {
    agent: "A6_PRISMA",
    status: "completed",
    message: "PRISMA agent executed successfully.",
    input_protocol_id: inputProtocolId,
    prisma_summary: prismaSummary,
    prisma_diagram_mermaid: prismaDiagram,
    prisma_diagram_png: prismaPngUrl,
    prisma_diagram_png_url: prismaPngUrl
  };
}

module.exports = {
  runAgentA6Prisma
};