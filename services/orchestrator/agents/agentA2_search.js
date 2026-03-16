const fetch = require("node-fetch");

async function runAgentA2Search({ protocolResult }) {
  const protocolId = protocolResult.protocol_id;
  const protocol = protocolResult.protocol;

  const searchQuery =
    protocol?.keywords?.map((k) => k.term).slice(0, 3).join(" ") ||
    "business intelligence internship higher education";

  const url = `https://api.openalex.org/works?search=${encodeURIComponent(searchQuery)}&per-page=10`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`OpenAlex request failed with status ${response.status}`);
  }

  const data = await response.json();

  const searchResults = (data.results || []).map((item) => ({
    id: item.id || null,
    title: item.display_name || "Untitled",
    publication_year: item.publication_year || null,
    doi: item.doi || null,
    type: item.type || null,
    cited_by_count: item.cited_by_count || 0,
    source: item.primary_location?.source?.display_name || null,
    authors: (item.authorships || []).map((a) => a.author?.display_name).filter(Boolean),
    abstract_inverted_index: item.abstract_inverted_index || null
  }));

  return {
    agent: "A2_SEARCH",
    status: "completed",
    message: "Search agent executed successfully with OpenAlex.",
    input_protocol_id: protocolId,
    search_query: searchQuery,
    papers_found: searchResults.length,
    search_results: searchResults
  };
}

module.exports = {
  runAgentA2Search
};