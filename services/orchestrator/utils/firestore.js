const { Firestore } = require("@google-cloud/firestore");

const firestore = new Firestore({
  projectId: process.env.GCP_PROJECT_ID
});

async function saveProtocol(protocolId, version, userId, projectName, protocol) {
  const protocolRef = firestore.collection("protocols").doc(protocolId);

  const versionRef = protocolRef
    .collection("versions")
    .doc(String(version));

  await protocolRef.set(
    {
      protocol_id: protocolId,
      user_id: userId,
      project_name: projectName,
      latest_version: version,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    { merge: true }
  );

  await versionRef.set({
    version,
    protocol,
    created_at: new Date().toISOString()
  });
}
async function savePipelineRun({
  protocolId,
  runId,
  projectName,
  pipeline
}) {
  const runRef = firestore
    .collection("protocols")
    .doc(protocolId)
    .collection("runs")
    .doc(runId);

  await runRef.set({
    run_id: runId,
    project_name: projectName,
    pipeline,
    created_at: new Date().toISOString()
  });
}
module.exports = {
  saveProtocol,
  savePipelineRun
};