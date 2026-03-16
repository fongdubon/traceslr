const { Storage } = require("@google-cloud/storage");

const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID
});

const bucket = storage.bucket(process.env.GCS_BUCKET);

async function saveProtocolFiles(protocolId, version, protocol) {
  const basePath = `protocols/${protocolId}/v${version}`;

  const jsonPath = `${basePath}/protocol.json`;
  const mdPath = `${basePath}/protocol.md`;

  const jsonFile = bucket.file(jsonPath);
  const mdFile = bucket.file(mdPath);

  const protocolJson = JSON.stringify(protocol, null, 2);

  const protocolMarkdown = `
# TraceSLR Protocol

## Problem Statement
${protocol.problem_statement}

## Objectives
${protocol.objectives.map(o => `- ${o}`).join("\n")}

## Research Questions
${protocol.research_questions.map(q => `- ${q}`).join("\n")}

## Inclusion Criteria
${protocol.inclusion_criteria.map(c => `- ${c}`).join("\n")}

## Exclusion Criteria
${protocol.exclusion_criteria.map(c => `- ${c}`).join("\n")}
`;

  await jsonFile.save(protocolJson);
  await mdFile.save(protocolMarkdown);

  return {
    json: `gs://${process.env.GCS_BUCKET}/${jsonPath}`,
    md: `gs://${process.env.GCS_BUCKET}/${mdPath}`
  };
}

async function uploadFileToStorage(localPath, destinationPath, contentType) {
  await bucket.upload(localPath, {
    destination: destinationPath,
    metadata: {
      contentType
    }
  });

  return `gs://${process.env.GCS_BUCKET}/${destinationPath}`;
}
async function generateSignedReadUrl(storagePath) {
  const file = bucket.file(storagePath);

  const [url] = await file.getSignedUrl({
    version: "v4",
    action: "read",
    expires: Date.now() + 1000 * 60 * 60
  });

  return url;
}
async function downloadFileBuffer(storagePath) {
  const file = bucket.file(storagePath);
  const [buffer] = await file.download();
  return buffer;
}
module.exports = {
  saveProtocolFiles,
  uploadFileToStorage,
  generateSignedReadUrl,
  downloadFileBuffer
};