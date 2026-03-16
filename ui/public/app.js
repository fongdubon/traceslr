const runBtn = document.getElementById("runBtn");
const problemInput = document.getElementById("problemStatement");
const status = document.getElementById("status");
const results = document.getElementById("results");

const voiceBtn = document.getElementById("voiceBtn");
const stopVoiceBtn = document.getElementById("stopVoiceBtn");
const voiceStatus = document.getElementById("voiceStatus");

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

let recognition = null;

if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = true;
  recognition.continuous = true;

  recognition.onstart = () => {
    voiceStatus.textContent = "Voice input started...";
  };

  recognition.onresult = (event) => {
    let transcript = "";

    for (let i = 0; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript + " ";
    }

    problemInput.value = transcript.trim();
  };

  recognition.onerror = (event) => {
    voiceStatus.textContent = `Voice error: ${event.error}`;
  };

  recognition.onend = () => {
    voiceStatus.textContent = "Voice input stopped.";
  };

  voiceBtn.addEventListener("click", () => {
    recognition.start();
  });

  stopVoiceBtn.addEventListener("click", () => {
    recognition.stop();
  });
} else {
  voiceStatus.textContent = "Speech recognition is not supported in this browser.";
  voiceBtn.disabled = true;
  stopVoiceBtn.disabled = true;
}

runBtn.addEventListener("click", async () => {
  const problem = problemInput.value.trim();

  if (!problem) {
    alert("Please enter a research problem.");
    return;
  }

  status.textContent = "Running SLR pipeline...";
  results.classList.add("hidden");

  const body = {
    user_id: "eduardo",
    project_name: "TraceSLR UI Demo",
    problem_statement: problem,
    constraints: {
      years: {
        from: 2020,
        to: 2026
      },
      language: ["en"]
    },
    preferences: {
      max_research_questions: 5,
      sources_priority: ["scopus", "acm"]
    }
  };

  try {
    const response = await fetch("https://traceslr-orchestrator-660003382722.us-central1.run.app/api/slr/run", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    const protocol = data.pipeline.A1_PROTOCOL.protocol;
    const search = data.pipeline.A2_SEARCH;
    const prisma = data.pipeline.A6_PRISMA;

    document.getElementById("protocolId").textContent =
      data.pipeline.A1_PROTOCOL.protocol_id;

    document.getElementById("generationMode").textContent =
      data.pipeline.A1_PROTOCOL.generation_mode;

    const objectivesList = document.getElementById("objectivesList");
    objectivesList.innerHTML = "";
    protocol.objectives.forEach(o => {
      const li = document.createElement("li");
      li.textContent = o;
      objectivesList.appendChild(li);
    });

    const rqList = document.getElementById("rqList");
    rqList.innerHTML = "";
    protocol.research_questions.forEach(q => {
      const li = document.createElement("li");
      li.textContent = q;
      rqList.appendChild(li);
    });

    document.getElementById("papersFound").textContent =
      search.papers_found;

    const papersList = document.getElementById("papersList");
    papersList.innerHTML = "";

    search.search_results.forEach(p => {
      const paperDiv = document.createElement("div");
      paperDiv.className = "paper-item";

      const titleDiv = document.createElement("div");
      titleDiv.className = "paper-title";
      titleDiv.textContent = p.title || "Untitled";

      const metaDiv = document.createElement("div");
      metaDiv.className = "paper-meta";

      const year = p.publication_year || "N/A";
      const source = p.source || "Unknown source";
      const authors = Array.isArray(p.authors) && p.authors.length
        ? p.authors.join(", ")
        : "Unknown authors";

      metaDiv.textContent = `Year: ${year} | Source: ${source} | Authors: ${authors}`;

      paperDiv.appendChild(titleDiv);
      paperDiv.appendChild(metaDiv);

      const linkUrl = p.doi || p.landing_page;
      if (linkUrl) {
        const linkDiv = document.createElement("div");
        linkDiv.className = "paper-link";

        const link = document.createElement("a");
        link.href = linkUrl;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = "Open paper";

        linkDiv.appendChild(link);
        paperDiv.appendChild(linkDiv);
      }

      papersList.appendChild(paperDiv);
    });

    document.getElementById("prismaSummary").textContent =
      JSON.stringify(prisma.prisma_summary, null, 2);

    document.getElementById("prismaPng").textContent =
      prisma.prisma_diagram_png;

    const prismaImage = document.getElementById("prismaImage");
    const prismaImageContainer = document.getElementById("prismaImageContainer");

    const prismaImageUrl = prisma.prisma_diagram_png_url;

    if (prismaImageUrl.startsWith("http")) {
      prismaImage.src = prismaImageUrl;
    } else {
      prismaImage.src = `https://traceslr-orchestrator-660003382722.us-central1.run.app${prismaImageUrl}`;
    }
    prismaImageContainer.classList.remove("hidden");

    status.textContent = "SLR completed.";
    results.classList.remove("hidden");

  } catch (error) {
    console.error(error);
    status.textContent = "Error running pipeline.";
  }
});