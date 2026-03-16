const { runAgentA1Protocol } = require("./agents/agentA1_protocol");
const { runAgentA2Search } = require("./agents/agentA2_search");
const { runAgentA3TitleScreening } = require("./agents/agentA3_title_screening");
const { runAgentA4AbstractScreening } = require("./agents/agentA4_abstract_screening");
const { runAgentA5FullText } = require("./agents/agentA5_fulltext");
const { runAgentA6Prisma } = require("./agents/agentA6_prisma");

async function runSLRPipeline({
  user_id,
  project_name,
  problem_statement,
  constraints,
  preferences
}) {
  const a1Result = await runAgentA1Protocol({
    user_id,
    project_name,
    problem_statement,
    constraints,
    preferences
  });

  const a2Result = await runAgentA2Search({
    protocolResult: a1Result
  });

  const a3Result = await runAgentA3TitleScreening({
    searchResult: a2Result
  });

  const a4Result = await runAgentA4AbstractScreening({
    titleScreeningResult: a3Result
  });

  const a5Result = await runAgentA5FullText({
    abstractScreeningResult: a4Result
  });

const a6Result = await runAgentA6Prisma({
  searchResult: a2Result,
  titleScreeningResult: a3Result,
  abstractScreeningResult: a4Result,
  fullTextResult: a5Result
});

  return {
    status: "completed",
    pipeline: {
      A1_PROTOCOL: a1Result,
      A2_SEARCH: a2Result,
      A3_TITLE_SCREENING: a3Result,
      A4_ABSTRACT_SCREENING: a4Result,
      A5_FULLTEXT: a5Result,
      A6_PRISMA: a6Result
    }
  };
}

module.exports = {
  runSLRPipeline
};