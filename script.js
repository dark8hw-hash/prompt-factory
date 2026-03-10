const promptInput = document.getElementById("promptInput");
const modeSelect = document.getElementById("modeSelect");
const exampleBtn = document.getElementById("exampleBtn");
const optimizeBtn = document.getElementById("optimizeBtn");
const resultText = document.getElementById("resultText");
const copyBtn = document.getElementById("copyBtn");
const statusText = document.getElementById("statusText");
const toast = document.getElementById("toast");

const examples = [
  "write about anime Frieren, I love this anime and I want more information about it",
  "help me study history faster for university exams",
  "make a telegram post about gaming news with a bit of humor",
  "explain loops in C# in a simple way for a beginner",
  "give me ideas for my planner app landing page"
];

exampleBtn.addEventListener("click", () => {
  const randomExample = examples[Math.floor(Math.random() * examples.length)];
  promptInput.value = randomExample;
  statusText.textContent = "Example loaded";
});

optimizeBtn.addEventListener("click", () => {
  const rawPrompt = promptInput.value.trim();
  const mode = modeSelect.value;

  if (!rawPrompt) {
    statusText.textContent = "Write a prompt first";
    resultText.textContent = "Your optimized prompt will appear here...";
    return;
  }

  statusText.textContent = "Optimizing...";

  setTimeout(() => {
    resultText.textContent = buildOptimizedPrompt(rawPrompt, mode);
    statusText.textContent = "Optimization complete";
  }, 350);
});

copyBtn.addEventListener("click", async () => {
  const text = resultText.textContent.trim();

  if (!text || text === "Your optimized prompt will appear here...") {
    statusText.textContent = "Nothing to copy";
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    showToast("Copied");
    statusText.textContent = "Copied";
  } catch (error) {
    const tempArea = document.createElement("textarea");
    tempArea.value = text;
    document.body.appendChild(tempArea);
    tempArea.select();
    document.execCommand("copy");
    document.body.removeChild(tempArea);
    showToast("Copied");
    statusText.textContent = "Copied";
  }
});

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 1400);
}

function buildOptimizedPrompt(rawPrompt, mode) {
  const modes = {
    professional: {
      role: "You are an expert professional assistant.",
      tone: "Use a clear, structured, and polished tone.",
      extra: "Focus on clarity, usefulness, and practical value."
    },
    creative: {
      role: "You are a highly creative assistant.",
      tone: "Use an engaging, imaginative, and expressive tone.",
      extra: "Make the result original, vivid, and memorable."
    },
    academic: {
      role: "You are an academic tutor and subject expert.",
      tone: "Use a precise, educational, and step-by-step tone.",
      extra: "Explain clearly, define important ideas, and include examples if useful."
    },
    business: {
      role: "You are a business-focused AI consultant.",
      tone: "Use a concise, strategic, and professional tone.",
      extra: "Focus on efficiency, audience value, and actionable output."
    }
  };

  const selected = modes[mode] || modes.professional;

  return `${selected.role}

Task:
Respond to this request in an improved and fully optimized way:
"${rawPrompt}"

Instructions:
- Understand the real goal behind the request.
- Make the wording clearer and more specific.
- Remove ambiguity.
- Provide a useful, direct, and well-structured result.
- Avoid unnecessary filler.

Tone:
${selected.tone}

Additional guidance:
${selected.extra}

Final output:
Deliver the best possible answer to the request.`;
}