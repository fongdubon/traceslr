const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

async function generateProtocolWithGemini({
  problem_statement,
  constraints,
  preferences
}) {

  const years = constraints?.years || { from: 2020, to: 2026 };
  const languages = constraints?.language || ["en"];
  const maxRqs = preferences?.max_research_questions || 5;
  const sources = preferences?.sources_priority || ["scopus","acm"];

  const prompt = `
You are an expert research assistant specialized in PRISMA-based Systematic Literature Reviews (SLR).

Generate a structured SLR protocol in JSON.

Research problem:
${problem_statement}

Constraints:
Years: ${years.from}-${years.to}
Languages: ${languages.join(",")}
Sources: ${sources.join(",")}

Return ONLY valid JSON with this structure:

{
 "problem_statement": "",
 "objectives": [],
 "picoc": {
   "population": "",
   "intervention": "",
   "comparison": "",
   "outcomes": "",
   "context": ""
 },
 "research_questions": [],
 "keywords": [
   {
     "term": "",
     "synonyms": []
   }
 ],
 "sources": [
   {
     "id": "",
     "reason": ""
   }
 ],
 "query_strings": {
   "scopus": "",
   "acm": ""
 },
 "inclusion_criteria": [],
 "exclusion_criteria": []
}
`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt
  });

  const text = response.text;

  const jsonStart = text.indexOf("{");
  const jsonEnd = text.lastIndexOf("}");

  const jsonString = text.substring(jsonStart, jsonEnd + 1);

  return JSON.parse(jsonString);
}

module.exports = {
  generateProtocolWithGemini
};