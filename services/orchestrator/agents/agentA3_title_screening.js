async function runAgentA3TitleScreening({ searchResult }) {
  const inputProtocolId = searchResult.input_protocol_id;

  const papers = searchResult.search_results || [];
  const includedTitles = papers.slice(0, Math.min(7, papers.length));
  const excludedTitles = papers.slice(Math.min(7, papers.length));

  return {
    agent: "A3_TITLE_SCREENING",
    status: "completed",
    message: "Title screening agent placeholder executed successfully.",
    input_protocol_id: inputProtocolId,
    included_titles: includedTitles,
    excluded_titles: excludedTitles
  };
}

module.exports = {
  runAgentA3TitleScreening
};