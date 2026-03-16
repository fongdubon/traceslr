function buildPrismaMermaid(prismaSummary) {
  const identified = prismaSummary.records_identified ?? 0;
  const screened = prismaSummary.records_screened ?? 0;
  const excluded = prismaSummary.records_excluded ?? 0;
  const fullText = prismaSummary.full_text_assessed ?? 0;
  const included = prismaSummary.studies_included ?? 0;

  return `
flowchart TD
    A["Records identified<br/>n = ${identified}"]
    B["Records screened<br/>n = ${screened}"]
    C["Records excluded<br/>n = ${excluded}"]
    D["Full-text assessed for eligibility<br/>n = ${fullText}"]
    E["Studies included in review<br/>n = ${included}"]

    A --> B
    B --> C
    B --> D
    D --> E
`.trim();
}

module.exports = {
  buildPrismaMermaid
};