async function runAgentA4AbstractScreening({ titleScreeningResult }) {
  const inputProtocolId = titleScreeningResult.input_protocol_id;

  const candidates = titleScreeningResult.included_titles || [];
  const includedAbstracts = candidates.slice(0, Math.min(5, candidates.length));
  const excludedAbstracts = titleScreeningResult.excluded_titles || [];

  return {
    agent: "A4_ABSTRACT_SCREENING",
    status: "completed",
    message: "Abstract screening agent placeholder executed successfully.",
    input_protocol_id: inputProtocolId,
    included_abstracts: includedAbstracts,
    excluded_abstracts: excludedAbstracts
  };
}

module.exports = {
  runAgentA4AbstractScreening
};