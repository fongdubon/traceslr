async function runAgentA5FullText({ abstractScreeningResult }) {
  const inputProtocolId = abstractScreeningResult.input_protocol_id;

  const candidates = abstractScreeningResult.included_abstracts || [];
  const includedFullText = candidates.slice(0, Math.min(3, candidates.length));
  const excludedFullText = candidates.slice(Math.min(3, candidates.length));

  return {
    agent: "A5_FULLTEXT",
    status: "completed",
    message: "Full-text agent placeholder executed successfully.",
    input_protocol_id: inputProtocolId,
    total_candidates: candidates.length,
    included_fulltext: includedFullText,
    excluded_fulltext: excludedFullText
  };
}

module.exports = {
  runAgentA5FullText
};