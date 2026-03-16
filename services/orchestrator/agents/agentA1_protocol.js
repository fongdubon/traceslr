const { v4: uuidv4 } = require("uuid");
const { generateProtocolWithGemini } = require("../utils/gemini");
const { saveProtocol } = require("../utils/firestore");
const { saveProtocolFiles } = require("../utils/storage");

function buildFallbackProtocol({ problem_statement, constraints, preferences }) {
  const years = constraints?.years || { from: 2020, to: 2026 };
  const languages = constraints?.language || ["en"];
  const maxRqs = preferences?.max_research_questions || 5;
  const sourcePriority = preferences?.sources_priority || ["scopus", "acm"];

  return {
    problem_statement,
    objectives: [
      "Identify research on the use of business intelligence and analytics in university internship management.",
      "Analyze how data-driven methods support decision-making in internship allocation and monitoring."
    ],
    picoc: {
      population: "University students involved in internship or professional practice processes",
      intervention: "Business intelligence, analytics, decision-support systems, or information systems",
      comparison: "Traditional or non-data-driven internship management approaches",
      outcomes: "Improved allocation, monitoring, transparency, or decision-making",
      context: "Higher education institutions"
    },
    research_questions: [
      "What approaches use business intelligence or analytics in internship management?",
      "What data sources and variables are considered in these systems?",
      "What outcomes are reported for decision-making and allocation?",
      "What challenges and limitations are identified in the literature?",
      "What opportunities exist for integrated evidence synthesis workflows?"
    ].slice(0, maxRqs),
    keywords: [
      {
        term: "business intelligence",
        synonyms: ["BI", "analytics", "decision support", "data-driven"]
      },
      {
        term: "internship",
        synonyms: ["professional practice", "work-integrated learning", "placement"]
      },
      {
        term: "higher education",
        synonyms: ["university", "college", "tertiary education"]
      }
    ],
    sources: sourcePriority.map((sourceId) => ({
      id: sourceId,
      reason: "Selected as a priority source for the review"
    })),
    query_strings: {
      scopus:
        '("business intelligence" OR analytics OR "decision support") AND (internship OR "professional practice" OR placement) AND ("higher education" OR university)',
      acm:
        '("business intelligence" OR analytics OR "decision support") AND (internship OR "professional practice" OR placement) AND ("higher education" OR university)'
    },
    inclusion_criteria: [
      `Studies published between ${years.from} and ${years.to}`,
      `Studies written in ${languages.join(", ")}`,
      "Studies focused on higher education internship or professional practice processes",
      "Studies involving analytics, BI, DSS, or information systems"
    ],
    exclusion_criteria: [
      "Non-academic reports or opinion pieces",
      "Studies unrelated to internships or higher education",
      "Studies without sufficient methodological detail"
    ]
  };
}

async function runAgentA1Protocol({
  user_id,
  project_name,
  problem_statement,
  constraints,
  preferences
}) {
  const protocolId = `prot_${uuidv4()}`;
  const version = 1;

  let protocol;
  let generation_mode = "gemini";

  try {
    protocol = await generateProtocolWithGemini({
      problem_statement,
      constraints,
      preferences
    });
  } catch (error) {
    console.warn("Gemini failed, using fallback protocol:", error.message);
    protocol = buildFallbackProtocol({
      problem_statement,
      constraints,
      preferences
    });
    generation_mode = "fallback";
  }

  await saveProtocol(protocolId, version, user_id, project_name, protocol);

  const artifacts = await saveProtocolFiles(protocolId, version, protocol);

  return {
    agent: "A1_PROTOCOL",
    status: "completed",
    generation_mode,
    protocol_id: protocolId,
    version,
    protocol,
    artifacts
  };
}

module.exports = {
  runAgentA1Protocol
};