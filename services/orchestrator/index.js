require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const { saveProtocol, savePipelineRun } = require("./utils/firestore");
const { downloadFileBuffer } = require("./utils/storage");
const { saveProtocolFiles } = require("./utils/storage");
const { generateProtocolWithGemini } = require("./utils/gemini");
const { runSLRPipeline } = require("./orchestrator");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    service: "TraceSLR Orchestrator API",
    status: "ok"
  });
});

app.post("/api/protocol/generate", async (req, res) => {
  try {
    const { user_id, project_name, problem_statement, constraints, preferences } = req.body;

    if (!user_id || !project_name || !problem_statement) {
      return res.status(400).json({
        request_id: uuidv4(),
        error: {
          code: "invalid_argument",
          message: "user_id, project_name, and problem_statement are required"
        }
      });
    }

    const protocolId = `prot_${uuidv4()}`;
    const requestId = `req_${uuidv4()}`;
//Reemplazar el protocolo estático
/*    const years = constraints?.years || { from: 2020, to: 2026 };
    const languages = constraints?.language || ["en"];
    const maxRqs = preferences?.max_research_questions || 5;
    const sourcePriority = preferences?.sources_priority || ["scopus", "acm", "ieee"];

    const protocol = {
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
        "What opportunities exist for integrated PRISMA-based evidence synthesis workflows?"
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
      
    };*/
    const protocol = await generateProtocolWithGemini({
  problem_statement,
  constraints,
  preferences
});
await saveProtocol(
  protocolId,
  1,
  user_id,
  project_name,
  protocol
);

const artifacts = await saveProtocolFiles(
  protocolId,
   1, 
   protocol
  );
    return res.status(200).json({
      request_id: requestId,
      protocol_id: protocolId,
      version: 1,
      protocol,
      artifacts
    });
  } catch (error) {
    console.error("Error generating protocol:", error);
    return res.status(500).json({
      request_id: uuidv4(),
      error: {
        code: "internal_error",
        message: error.message
      }
    });
  }
});
app.post("/api/slr/run", async (req, res) => {
  try {
    const { user_id, project_name, problem_statement, constraints, preferences } = req.body;

    if (!user_id || !project_name || !problem_statement) {
      return res.status(400).json({
        request_id: uuidv4(),
        error: {
          code: "invalid_argument",
          message: "user_id, project_name, and problem_statement are required"
        }
      });
    }
const requestId = `req_${uuidv4()}`;

const pipelineResult = await runSLRPipeline({
  user_id,
  project_name,
  problem_statement,
  constraints,
  preferences
});

const protocolId = pipelineResult.pipeline?.A1_PROTOCOL?.protocol_id;

if (protocolId) {
  await savePipelineRun({
    protocolId,
    runId: requestId,
    projectName: project_name,
    pipeline: pipelineResult.pipeline
  });
}

return res.status(200).json({
  request_id: requestId,
  ...pipelineResult
});
  } catch (error) {
    console.error("Error running SLR pipeline:", error);
    return res.status(500).json({
      request_id: uuidv4(),
      error: {
        code: "internal_error",
        message: error.message
      }
    });
  }
});

app.get("/api/prisma-image/:protocolId", async (req, res) => {
  try {
    const { protocolId } = req.params;
    const storagePath = `protocols/${protocolId}/prisma/prisma.png`;

    const buffer = await downloadFileBuffer(storagePath);

    res.setHeader("Content-Type", "image/png");
    return res.send(buffer);
  } catch (error) {
    console.error("Error serving PRISMA image:", error);
    return res.status(404).json({
      error: "PRISMA image not found"
    });
  }
});

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`Orchestrator API running on port ${port}`);
});