const promptInput = document.getElementById("promptInput");
const roleSelect = document.getElementById("roleSelect");
const codingBlock = document.getElementById("codingBlock");
const codingLangSelect = document.getElementById("codingLangSelect");
const marketingBlock = document.getElementById("marketingBlock");
const marketSelect = document.getElementById("marketSelect");

const optimizeBtn = document.getElementById("optimizeBtn");
const statusText = document.getElementById("statusText");
const langToggle = document.getElementById("langToggle");

const scoreTitle = document.getElementById("scoreTitle");
const scoreValue = document.getElementById("scoreValue");
const scoreFill = document.getElementById("scoreFill");

const analysisTitle = document.getElementById("analysisTitle");
const analysisText = document.getElementById("analysisText");
const tipsTitle = document.getElementById("tipsTitle");
const tipsText = document.getElementById("tipsText");

const resultTitle = document.getElementById("resultTitle");
const resultText = document.getElementById("resultText");

const copyBtn = document.getElementById("copyBtn");
const openGPTBtn = document.getElementById("openGPTBtn");
const openGeminiBtn = document.getElementById("openGeminiBtn");
const explainBtn = document.getElementById("explainBtn");
const explainBox = document.getElementById("explainBox");

const historyTitle = document.getElementById("historyTitle");
const historyList = document.getElementById("historyList");
const heroSubtitle = document.getElementById("heroSubtitle");
const roleLabel = document.getElementById("roleLabel");
const codingLabel = document.getElementById("codingLabel");
const marketLabel = document.getElementById("marketLabel");

const toast = document.getElementById("toast");

const HISTORY_KEY = "prompt_factory_v2_final_history";
let uiLang = "en";
let lastAnalysis = null;

const ui = {
  en: {
    heroSubtitle: "Algorithm-based prompt optimizer (no AI / no LLM)",
    placeholder: "Write your prompt...",
    optimize: "Optimize",
    ready: "Ready",
    analyzing: "Analyzing and optimizing...",
    done: "Optimization complete",
    scoreTitle: "Prompt Score",
    analysisTitle: "Prompt Analysis",
    tipsTitle: "Prompt Improvement Tips",
    resultTitle: "Result",
    historyTitle: "Prompt History",
    copy: "Copy",
    explain: "Explain Improvements",
    openChatGPT: "Open ChatGPT",
    openGemini: "Open Gemini",
    defaultResult: "Your optimized prompt will appear here...",
    addPrompt: "Add a prompt to get suggestions.",
    noHistory: "No history yet.",
    nothingToCopy: "Nothing to copy",
    copied: "Copied",
    loaded: "Loaded",
    writePromptFirst: "Write a prompt first",
    roleLabel: "Role",
    codingLabel: "Programming language",
    marketLabel: "Target market",
    labels: {
      language: "Language",
      intent: "Intent",
      topic: "Topic",
      audience: "Audience",
      time: "Time",
      useCase: "Use case"
    },
    roleOptions: {
      universal: "Universal",
      learn: "Learning",
      explain: "Explain",
      create: "Create",
      "marketing-pro": "Marketing Pro",
      "coding-pro": "Coding Pro"
    },
    tipStrong: "Prompt looks strong. The optimizer found enough detail to build a solid rewrite."
  },
  ru: {
    heroSubtitle: "Алгоритмический оптимайзер промтов (без AI и LLM)",
    placeholder: "Введите ваш промт...",
    optimize: "Оптимизировать",
    ready: "Готово",
    analyzing: "Анализ и оптимизация...",
    done: "Оптимизация завершена",
    scoreTitle: "Оценка промта",
    analysisTitle: "Анализ промта",
    tipsTitle: "Советы по улучшению",
    resultTitle: "Результат",
    historyTitle: "История промтов",
    copy: "Копировать",
    explain: "Что улучшено",
    openChatGPT: "Открыть ChatGPT",
    openGemini: "Открыть Gemini",
    defaultResult: "Ваш улучшенный промт появится здесь...",
    addPrompt: "Добавьте промт, чтобы получить подсказки.",
    noHistory: "История пока пуста.",
    nothingToCopy: "Нечего копировать",
    copied: "Скопировано",
    loaded: "Загружено",
    writePromptFirst: "Сначала введите промт",
    roleLabel: "Роль",
    codingLabel: "Язык программирования",
    marketLabel: "Рынок",
    labels: {
      language: "Язык",
      intent: "Намерение",
      topic: "Тема",
      audience: "Аудитория",
      time: "Срок",
      useCase: "Цель"
    },
    roleOptions: {
      universal: "Universal",
      learn: "Learning",
      explain: "Explain",
      create: "Create",
      "marketing-pro": "Marketing Pro",
      "coding-pro": "Coding Pro"
    },
    tipStrong: "Промт выглядит сильным. Оптимайзер нашёл достаточно деталей для качественного переписывания."
  }
};

optimizeBtn.addEventListener("click", () => {
  const raw = normalizeSpaces(promptInput.value);

  if (!raw) {
    setStatus(t("writePromptFirst"));
    return;
  }

  setStatus(t("analyzing"));

  const analysis = analyzePrompt(raw, roleSelect.value);
  const optimized = buildOptimizedPrompt(analysis);

  lastAnalysis = analysis;
  resultText.textContent = optimized;

  renderAnalysis(analysis);
  renderTips(analysis);
  renderScore(analysis.score);
  renderExplanation(analysis);
  saveHistory(raw, optimized, analysis);

  setStatus(t("done"));
});

promptInput.addEventListener("input", () => {
  const raw = normalizeSpaces(promptInput.value);

  if (!raw) {
    renderEmptyState();
    return;
  }

  const analysis = analyzePrompt(raw, roleSelect.value);
  renderAnalysis(analysis);
  renderTips(analysis);
  renderScore(analysis.score);
});

roleSelect.addEventListener("change", () => {
  syncModeBlocks();

  const raw = normalizeSpaces(promptInput.value);
  if (!raw) return;

  const analysis = analyzePrompt(raw, roleSelect.value);
  renderAnalysis(analysis);
  renderTips(analysis);
  renderScore(analysis.score);
});

langToggle.addEventListener("click", () => {
  uiLang = uiLang === "en" ? "ru" : "en";
  langToggle.textContent = uiLang === "en" ? "RU" : "EN";
  applyInterfaceLanguage();
  renderHistory();

  const raw = normalizeSpaces(promptInput.value);
  if (!raw) {
    renderEmptyState();
  } else {
    const analysis = analyzePrompt(raw, roleSelect.value);
    renderAnalysis(analysis);
    renderTips(analysis);
    renderScore(analysis.score);
    if (lastAnalysis) renderExplanation(lastAnalysis);
  }
});

copyBtn.addEventListener("click", async () => {
  const text = resultText.textContent.trim();

  if (!text || text === ui.en.defaultResult || text === ui.ru.defaultResult) {
    setStatus(t("nothingToCopy"));
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    showToast(t("copied"));
  } catch {
    fallbackCopy(text);
    showToast(t("copied"));
  }
});

openGPTBtn.addEventListener("click", () => {
  const text = resultText.textContent.trim();
  if (!text || text === ui.en.defaultResult || text === ui.ru.defaultResult) {
    setStatus(t("writePromptFirst"));
    return;
  }

  const url = `https://chat.openai.com/?q=${encodeURIComponent(text)}`;
  window.open(url, "_blank", "noopener,noreferrer");
});

openGeminiBtn.addEventListener("click", () => {
  const text = resultText.textContent.trim();
  if (!text || text === ui.en.defaultResult || text === ui.ru.defaultResult) {
    setStatus(t("writePromptFirst"));
    return;
  }

  try {
    navigator.clipboard.writeText(text);
    showToast(uiLang === "ru" ? "Промт скопирован. Вставь в Gemini." : "Prompt copied. Paste it into Gemini.");
  } catch {
    fallbackCopy(text);
    showToast(uiLang === "ru" ? "Промт скопирован. Вставь в Gemini." : "Prompt copied. Paste it into Gemini.");
  }

  window.open("https://gemini.google.com/app", "_blank", "noopener,noreferrer");
});

explainBtn.addEventListener("click", () => {
  if (!lastAnalysis) {
    setStatus(t("writePromptFirst"));
    return;
  }

  explainBox.classList.toggle("hidden");
});

function analyzePrompt(raw, selectedRole) {
  const lang = detectLanguage(raw);
  const detectedIntent = detectIntent(raw, lang);
  const roleMode = selectedRole;
  const finalIntent = resolveIntent(detectedIntent, roleMode);

  const topic = extractTopic(raw, lang, finalIntent, roleMode);
  const audience = detectAudience(raw, lang, finalIntent, roleMode);
  const time = detectTime(raw);
  const useCase = detectUseCase(raw, roleMode);
  const format = inferFormat(raw, finalIntent, roleMode, useCase);
  const tone = inferTone(raw, finalIntent, audience, roleMode, useCase);
  const constraints = detectConstraints(raw);
  const topicWeak = isWeakTopic(topic, raw, finalIntent, roleMode);

  const codingLanguage = roleMode === "coding-pro" ? codingLangSelect.value : "";
  const market = roleMode === "marketing-pro" ? marketSelect.value : "";
  const extractedRequirements = extractRequirements(raw, roleMode, codingLanguage, useCase, market);

  const score = calculateScore({
    raw,
    detectedIntent,
    finalIntent,
    audience,
    time,
    useCase,
    format,
    tone,
    constraints,
    topicWeak,
    extractedRequirements
  });

  return {
    raw,
    lang,
    roleMode,
    detectedIntent,
    finalIntent,
    topic,
    audience,
    time,
    useCase,
    format,
    tone,
    constraints,
    topicWeak,
    score,
    codingLanguage,
    market,
    extractedRequirements
  };
}

function buildOptimizedPrompt(a) {
  const variant = pickVariant(a.raw + a.roleMode, 3);

  if (a.topicWeak) {
    return buildFallbackPrompt(a, variant);
  }

  switch (a.roleMode) {
    case "coding-pro":
      return buildCodingProPrompt(a, variant);
    case "marketing-pro":
      return buildMarketingProPrompt(a, variant);
    case "learn":
      return buildLearnPrompt(a, variant);
    case "explain":
      return buildExplainPrompt(a, variant);
    case "create":
      return buildCreatePrompt(a, variant);
    case "universal":
    default:
      return buildUniversalPrompt(a, variant);
  }
}

function buildLearnPrompt(a, v) {
  const role = variantText(v, [
    "Act as a beginner-friendly teacher focused on practical progress.",
    "Act as a clear and structured tutor helping someone learn from scratch.",
    "Act as a practical learning mentor who explains topics step by step."
  ]);

  const lines = [
    role,
    "",
    learningGoalLine(a, v),
    `Target audience: ${a.audience.english}.`,
    `Output format: ${a.format.english}.`,
    `Tone: ${a.tone.english}.`,
    "Include:",
    "• the most important concepts to learn first",
    "• a logical order of topics",
    "• simple practical exercises or tasks",
    "• a realistic end goal"
  ];

  if (a.time.value) {
    lines.push(`Time constraint: ${a.time.valueEnglish}.`);
  }

  if (a.useCase.value) {
    lines.push(`Purpose: ${a.useCase.english}.`);
  }

  lines.push("Avoid filler and keep the plan practical, clear, and realistic.");

  return lines.join("\n");
}

function buildExplainPrompt(a, v) {
  const role = variantText(v, [
    "Act as a knowledgeable expert who explains topics clearly.",
    "Act as a tutor who simplifies complex ideas without losing accuracy.",
    "Act as an educational guide focused on clarity and structure."
  ]);

  const lines = [
    role,
    "",
    `Explain ${a.topic.english} clearly and accurately.`,
    `Target audience: ${a.audience.english}.`,
    `Output format: ${a.format.english}.`,
    `Tone: ${a.tone.english}.`,
    "Include:",
    "• the main idea",
    "• the most important facts or concepts",
    "• useful context",
    "• a clear structure with sections or bullets when helpful"
  ];

  if (a.useCase.value) {
    lines.push(`Purpose: ${a.useCase.english}.`);
  }

  if (a.time.value) {
    lines.push(`Scope or time target: ${a.time.valueEnglish}.`);
  }

  lines.push("Avoid vague wording and irrelevant details.");

  return lines.join("\n");
}

function buildCreatePrompt(a, v) {
  const role = variantText(v, [
    "Act as a creative assistant who turns rough ideas into usable outputs.",
    "Act as a practical creator focused on clarity and structure.",
    "Act as an idea-to-output assistant who writes clearly and efficiently."
  ]);

  const lines = [
    role,
    "",
    `Create a useful result about ${a.topic.english}.`,
    `Target audience: ${a.audience.english}.`,
    `Output format: ${a.format.english}.`,
    `Tone: ${a.tone.english}.`
  ];

  if (a.useCase.value) {
    lines.push(`Purpose: ${a.useCase.english}.`);
  }

  if (a.time.value) {
    lines.push(`Time or scope target: ${a.time.valueEnglish}.`);
  }

  lines.push("Make the output clear, specific, and ready to use.");
  lines.push("Avoid filler and keep the structure logical.");

  return lines.join("\n");
}

function buildUniversalPrompt(a, v) {
  const role = variantText(v, [
    "Act as a helpful and intelligent assistant.",
    "Act as a clear and structured expert assistant.",
    "Act as a practical assistant focused on useful results."
  ]);

  const lines = [
    role,
    "",
    `Write a clear, specific, and useful response about ${a.topic.english}.`,
    `Target audience: ${a.audience.english}.`,
    `Output format: ${a.format.english}.`,
    `Tone: ${a.tone.english}.`
  ];

  if (a.useCase.value) {
    lines.push(`Purpose: ${a.useCase.english}.`);
  }

  if (a.time.value) {
    lines.push(`Time or scope target: ${a.time.valueEnglish}.`);
  }

  if (a.extractedRequirements.length) {
    lines.push("Requirements:");
    a.extractedRequirements.forEach((item) => lines.push(`• ${item}`));
  }

  lines.push("Make the result logically structured and easy to use.");
  lines.push("Avoid unnecessary filler.");

  return lines.join("\n");
}

function buildCodingProPrompt(a, v) {
  const role = variantText(v, [
    "Act as a senior software engineer and practical coding expert.",
    "Act as an experienced developer focused on clean and production-ready solutions.",
    "Act as a strong coding mentor who solves technical tasks clearly and efficiently."
  ]);

  const lines = [
    role,
    "",
    getCodingLanguageLine(a.codingLanguage, a.useCase, v),
    codingGoalLine(a, v),
    `Target audience: ${a.audience.english}.`,
    getCodingProductAudienceLine(a),
    `Output format: ${a.format.english}.`,
    `Tone: ${a.tone.english}.`
  ];

  if (a.extractedRequirements.length) {
    lines.push("Requirements:");
    a.extractedRequirements.forEach((item) => lines.push(`• ${item}`));
  } else {
    lines.push("Include:");
    lines.push("• clean and correct code");
    lines.push("• explanation of the logic");
    lines.push("• edge cases if relevant");
    lines.push("• short best-practice notes");
    lines.push("• a result that is practical for real use");
  }

  if (a.time.value) {
    lines.push(`Time or scope target: ${a.time.valueEnglish}.`);
  }

  if (a.useCase.value) {
    lines.push(`Purpose: ${a.useCase.english}.`);
  }

  lines.push("Avoid filler. Keep the result technical, clean, and directly useful.");

  return lines.join("\n");
}

function buildMarketingProPrompt(a, v) {
  const role = variantText(v, [
    "Act as a senior marketing strategist and conversion-focused copywriter.",
    "Act as a performance marketer who creates persuasive and audience-specific content.",
    "Act as a strong marketing expert who writes clear, strategic, and high-converting copy."
  ]);

  const lines = [
    role,
    "",
    marketingGoalLine(a, v),
    getMarketLine(a.market),
    getMarketingRealAudienceLine(a),
    `Output format: ${a.format.english}.`,
    `Tone: ${a.tone.english}.`
  ];

  if (a.extractedRequirements.length) {
    lines.push("Requirements:");
    a.extractedRequirements.forEach((item) => lines.push(`• ${item}`));
  } else {
    lines.push("Include:");
    lines.push("• a clear value proposition");
    lines.push("• audience pain points or motivations");
    lines.push("• persuasive structure");
    lines.push("• a strong call to action");
    lines.push("• wording that fits the selected market");
  }

  if (a.useCase.value) {
    lines.push(`Purpose: ${a.useCase.english}.`);
  }

  if (a.time.value) {
    lines.push(`Time or scope target: ${a.time.valueEnglish}.`);
  }

  lines.push("Avoid generic filler. Make the copy specific, realistic, and conversion-oriented.");

  return lines.join("\n");
}

function buildFallbackPrompt(a, v) {
  const role = variantText(v, [
    "Act as a helpful assistant.",
    "Act as a clear and structured assistant.",
    "Act as an intelligent assistant focused on useful output."
  ]);

  return [
    role,
    "",
    `The user's topic is unclear: "${a.raw}".`,
    "Rewrite the request into a clearer prompt by first identifying the likely goal and topic.",
    `Target audience: ${a.audience.english}.`,
    "If the topic is still ambiguous, ask for one short clarification question only.",
    "Otherwise, provide the most reasonable structured version of the prompt."
  ].join("\n");
}

function learningGoalLine(a, v) {
  const topic = a.topic.english;

  const variants = [
    a.time.value
      ? `Create a ${formatDurationForSentence(a.time.valueEnglish)} learning plan for learning ${topic} from scratch.`
      : `Create a clear learning plan for learning ${topic} from scratch.`,
    a.time.value
      ? `Build a realistic ${formatDurationForSentence(a.time.valueEnglish)} roadmap to learn the basics of ${topic}.`
      : `Build a realistic roadmap to learn the basics of ${topic}.`,
    a.time.value
      ? `Design a beginner-friendly ${formatDurationForSentence(a.time.valueEnglish)} study plan for ${topic}.`
      : `Design a beginner-friendly study plan for ${topic}.`
  ];

  return variants[v % variants.length];
}

function codingGoalLine(a, v) {
  const topic = a.topic.english;

  const websiteLike = a.useCase.value === "website" || /\b(website|site|landing|сайт)\b/i.test(a.raw);
  const language = a.codingLanguage || "the requested language";

  if (websiteLike && a.codingLanguage === "Web") {
    const variants = [
      `Build a responsive website for ${topic}.`,
      `Create a practical front-end website for ${topic}.`,
      `Develop a clean and mobile-friendly website for ${topic}.`
    ];
    return variants[v % variants.length];
  }

  const variants = [
    `Solve or explain the coding task related to ${topic} using ${language}.`,
    `Provide a clean and production-ready solution for ${topic} in ${language}.`,
    `Help with the technical task about ${topic}, using ${language} where relevant.`
  ];

  return variants[v % variants.length];
}

function marketingGoalLine(a, v) {
  const topic = a.topic.english;
  const useCase = a.useCase.value;

  if (useCase === "classified") {
    const variants = [
      `Create strong ad ideas for classified platforms about ${topic}.`,
      `Write effective listing-style marketing content for ${topic}.`,
      `Generate short, trust-building ad ideas for platforms like OLX or Avito about ${topic}.`
    ];
    return variants[v % variants.length];
  }

  if (useCase === "social") {
    const variants = [
      `Create strong social media marketing content about ${topic}.`,
      `Write audience-focused content for social platforms about ${topic}.`,
      `Generate engaging social media copy about ${topic}.`
    ];
    return variants[v % variants.length];
  }

  if (useCase === "seo") {
    const variants = [
      `Create SEO-oriented marketing content about ${topic}.`,
      `Write search-friendly marketing copy about ${topic}.`,
      `Generate structured SEO content ideas about ${topic}.`
    ];
    return variants[v % variants.length];
  }

  if (useCase === "email") {
    const variants = [
      `Create strong email marketing content about ${topic}.`,
      `Write persuasive email copy about ${topic}.`,
      `Generate audience-focused email marketing text about ${topic}.`
    ];
    return variants[v % variants.length];
  }

  if (useCase === "landing") {
    const variants = [
      `Create high-converting landing page copy about ${topic}.`,
      `Write website marketing content about ${topic}.`,
      `Generate strong conversion-focused copy for a landing page about ${topic}.`
    ];
    return variants[v % variants.length];
  }

  const variants = [
    `Create strong marketing content about ${topic}.`,
    `Write high-converting marketing copy about ${topic}.`,
    `Generate persuasive audience-focused marketing content about ${topic}.`
  ];

  return variants[v % variants.length];
}

function getCodingLanguageLine(language, useCase, v) {
  const selected = language || "the requested language";

  if (selected === "Web") {
    const variants = [
      "Use HTML, CSS, and JavaScript.",
      "Build the solution with plain HTML, CSS, and JavaScript.",
      "Use front-end web technologies: HTML, CSS, and JavaScript."
    ];
    return variants[v % variants.length];
  }

  const variants = [
    `Programming language: ${selected}.`,
    `Use ${selected} as the main implementation language.`,
    `Write the solution in ${selected}.`
  ];

  return variants[v % variants.length];
}

function getCodingProductAudienceLine(a) {
  if (a.useCase.value === "website") {
    return "Website audience: potential customers or clients who will use the final website.";
  }
  if (a.useCase.value === "orders") {
    return "Product audience: customers who need a clear and simple ordering flow.";
  }
  return `Target audience: ${a.audience.english}.`;
}

function getMarketLine(market) {
  const map = {
    EN: "Target market: English-speaking audience.",
    RU: "Target market: Russian-speaking audience.",
    UZ: "Target market: Uzbek audience.",
    CIS: "Target market: CIS audience."
  };

  return map[market] || "Target market: General audience.";
}

function getMarketingRealAudienceLine(a) {
  const useCase = a.useCase.value;
  const raw = a.raw.toLowerCase();

  if (useCase === "classified") {
    if (a.market === "UZ") {
      return "Target audience: people in Uzbekistan looking for useful local services or offers on OLX.UZ-style classified platforms.";
    }
    if (a.market === "RU") {
      return "Target audience: Russian-speaking people searching for practical local offers on classified platforms.";
    }
    if (a.market === "CIS") {
      return "Target audience: people in CIS countries searching for practical local offers on classified platforms.";
    }
    return "Target audience: people looking for practical offers on classified platforms.";
  }

  if (useCase === "social") {
    return "Target audience: social media users likely to engage with short, persuasive, scroll-stopping content.";
  }

  if (useCase === "seo") {
    return "Target audience: people searching online for relevant products, services, or solutions.";
  }

  if (useCase === "landing") {
    return "Target audience: potential customers visiting a landing page or business website.";
  }

  if (/bri?gade|brigada|бригада|repair|cleaning|moving|handyman|услуг/i.test(raw)) {
    if (a.market === "UZ") {
      return "Target audience: people in Uzbekistan looking for reliable local household, repair, moving, or handyman services.";
    }
    return "Target audience: people looking for reliable household, repair, moving, or handyman services.";
  }

  return "Target audience: potential customers likely to buy or respond to the offer.";
}

function renderAnalysis(a) {
  const labels = ui[uiLang].labels;

  analysisText.innerHTML = `
    <div><span>${labels.language}:</span> ${a.lang.label}</div>
    <div><span>${labels.intent}:</span> ${getIntentLabelForUI(a)}</div>
    <div><span>${labels.topic}:</span> ${escapeHtml(a.topic.display)}</div>
    <div><span>${labels.audience}:</span> ${a.audience.label}</div>
    <div><span>${labels.time}:</span> ${a.time.label}</div>
    <div><span>${labels.useCase}:</span> ${a.useCase.label}</div>
  `;
}

function renderTips(a) {
  const tips = [];

  if (a.topicWeak) {
    tips.push(uiLang === "ru" ? "Уточни тему более конкретно." : "Clarify the topic more specifically.");
  }

  if (a.audience.value === "general") {
    tips.push(uiLang === "ru" ? "Укажи целевую аудиторию." : "Define the target audience.");
  }

  if (!a.time.value) {
    tips.push(uiLang === "ru" ? "Добавь срок или ограничение по объёму, если это важно." : "Add a time limit or scope if relevant.");
  }

  if (a.format.isInferred) {
    tips.push(uiLang === "ru" ? "Укажи желаемый формат ответа." : "Specify the desired output format.");
  }

  if (a.tone.isInferred) {
    tips.push(uiLang === "ru" ? "Укажи тон, если стиль важен." : "Specify the tone if style matters.");
  }

  if (!a.useCase.value) {
    tips.push(uiLang === "ru" ? "Добавь цель промта, если она есть." : "Add the purpose of the prompt if you have one.");
  }

  if (a.roleMode === "marketing-pro" && !a.market) {
    tips.push(uiLang === "ru" ? "Выбери сегмент рынка для более точного маркетингового промта." : "Choose a market segment for more precise marketing prompts.");
  }

  if (a.roleMode === "coding-pro" && !a.codingLanguage) {
    tips.push(uiLang === "ru" ? "Укажи язык программирования." : "Specify the programming language.");
  }

  if (!tips.length) {
    tipsText.innerHTML = `<div class="tip-item">${escapeHtml(ui[uiLang].tipStrong)}</div>`;
    return;
  }

  tipsText.innerHTML = tips
    .map((tip) => `<div class="tip-item">• ${escapeHtml(tip)}</div>`)
    .join("");
}

function renderExplanation(a) {
  const items = [];

  if (uiLang === "ru") {
    items.push("Язык был определён автоматически.");
    items.push(`Основное намерение определено как "${getIntentLabelForUI(a).toLowerCase()}".`);

    if (!a.topicWeak) {
      items.push(`Тема была очищена и выделена как "${a.topic.display}".`);
    } else {
      items.push("Тема оказалась слишком слабой или неясной, поэтому был использован fallback-шаблон.");
    }

    if (a.audience.value !== "general") {
      items.push(`Аудитория была определена как "${a.audience.label.toLowerCase()}".`);
    } else {
      items.push("Явная аудитория не была найдена, поэтому использована общая аудитория.");
    }

    if (a.time.value) {
      items.push(`Был найден срок или ограничение: "${a.time.label.toLowerCase()}".`);
    }

    if (a.useCase.value) {
      items.push(`Цель была определена как "${a.useCase.label.toLowerCase()}".`);
    }

    if (a.roleMode === "coding-pro") {
      items.push(`Использован специализированный режим Coding Pro с языком "${a.codingLanguage}".`);
    }

    if (a.roleMode === "marketing-pro") {
      items.push(`Использован специализированный режим Marketing Pro с рынком "${a.market}".`);
    }

    if (a.extractedRequirements.length) {
      items.push("Дополнительные требования были извлечены из запроса и встроены в финальный промт.");
    }

    items.push("Финальный промт был переписан гибридным движком: сначала анализ, потом шаблон.");
  } else {
    items.push("The language was detected automatically.");
    items.push(`The main intent was identified as "${getIntentLabelForUI(a).toLowerCase()}".`);

    if (!a.topicWeak) {
      items.push(`The topic was cleaned and extracted as "${a.topic.display}".`);
    } else {
      items.push("The topic was too weak or unclear, so a fallback template was used.");
    }

    if (a.audience.value !== "general") {
      items.push(`The audience was detected as "${a.audience.label.toLowerCase()}".`);
    } else {
      items.push("No clear audience was found, so a general audience was used.");
    }

    if (a.time.value) {
      items.push(`A time or scope constraint was detected: "${a.time.label.toLowerCase()}".`);
    }

    if (a.useCase.value) {
      items.push(`The use case was detected as "${a.useCase.label.toLowerCase()}".`);
    }

    if (a.roleMode === "coding-pro") {
      items.push(`The specialized Coding Pro mode was used with "${a.codingLanguage}".`);
    }

    if (a.roleMode === "marketing-pro") {
      items.push(`The specialized Marketing Pro mode was used with "${a.market}".`);
    }

    if (a.extractedRequirements.length) {
      items.push("Additional requirements were extracted from the prompt and injected into the final rewrite.");
    }

    items.push("The final prompt was rewritten using a hybrid engine: analysis first, templates second.");
  }

  explainBox.innerHTML = items.map((x) => `• ${escapeHtml(x)}`).join("<br>");
  explainBox.classList.add("hidden");
}

function renderScore(score) {
  scoreValue.textContent = `${score} / 10`;
  scoreFill.style.width = `${score * 10}%`;
}

function setStatus(text) {
  statusText.textContent = text;
}

function renderEmptyState() {
  const labels = ui[uiLang].labels;

  analysisText.innerHTML = `
    <div><span>${labels.language}:</span> —</div>
    <div><span>${labels.intent}:</span> —</div>
    <div><span>${labels.topic}:</span> —</div>
    <div><span>${labels.audience}:</span> —</div>
    <div><span>${labels.time}:</span> —</div>
    <div><span>${labels.useCase}:</span> —</div>
  `;
  tipsText.textContent = t("addPrompt");
  scoreValue.textContent = "0 / 10";
  scoreFill.style.width = "0%";
  setStatus(t("ready"));
}

function detectLanguage(raw) {
  const ru = (raw.match(/[а-яё]/gi) || []).length;
  const en = (raw.match(/[a-z]/gi) || []).length;
  const value = ru >= en ? "ru" : "en";

  return {
    value,
    label: value === "ru" ? "RU" : "EN"
  };
}

function detectIntent(raw, lang) {
  const t = raw.toLowerCase();

  const codeRegex = /\b(c#|javascript|python|java|html|css|sql|код|ошибка|функция|debug|программа|program|bug|function|code|website|site|landing|frontend|backend|api|web app)\b/i;
  const learningRegex = /\b(научи|обучи|изучи|как научиться|как выучить|план обучения|выучи|teach|learn|study|learning plan|how can i learn|how do i learn)\b/i;

  if (learningRegex.test(t) && codeRegex.test(t)) {
    return { value: "learn", label: "Learning" };
  }

  const rules = [
    { key: "learn", label: "Learning", regex: learningRegex },
    { key: "explain", label: "Explain", regex: /\b(объясни|расскажи|что такое|опиши|поясни|explain|describe|tell me about|what is)\b/i },
    { key: "marketing-pro", label: "Marketing Pro", regex: /\b(маркетинг|реклама|seo|продажи|копирайтинг|лендинг|бренд|marketing|advert|sales|copywriting|landing page|brand|olx|avito|classified|listing|social media|instagram|telegram ads|email campaign)\b/i },
    { key: "create", label: "Create", regex: /\b(создай|сделай|сгенерируй|напиши|create|generate|make|write)\b/i }
  ];

  if (codeRegex.test(t) && !learningRegex.test(t)) {
    return { value: "coding-pro", label: "Coding Pro" };
  }

  for (const rule of rules) {
    if (rule.regex.test(t)) {
      return { value: rule.key, label: rule.label };
    }
  }

  return { value: "universal", label: "Universal" };
}

function resolveIntent(detectedIntent, selectedRole) {
  if (selectedRole === "coding-pro" || selectedRole === "marketing-pro") {
    return selectedRole;
  }

  if (selectedRole !== "universal" && selectedRole !== "auto" && selectedRole !== "") {
    return selectedRole;
  }

  if (detectedIntent.value) return detectedIntent.value;

  return "universal";
}

function extractTopic(raw, lang, intent, roleMode) {
  let text = raw;

  const prefixes = [
    /^(можешь\s+)?(пожалуйста\s+)?/i,
    /^(please\s+)?(can you\s+)?/i,
    /^(объясни( мне)?|расскажи( мне)?|научи( меня)?|сделай|создай|напиши|сгенерируй|помоги( мне)?|дай|покажи)\s+/i,
    /^(explain( to me)?|tell me about|teach me|help me learn|write about|create|generate|make|show me)\s+/i
  ];

  const endings = [
    /\b(для школы|для школьной презентации|для презентации|для проекта|для университета|для фанатов|для новичков)\b.*$/i,
    /\b(for school|for a school presentation|for presentation|for project|for university|for fans|for beginners)\b.*$/i,
    /\bя хочу\b.*$/i,
    /\bмне нужно\b.*$/i,
    /\bi want\b.*$/i,
    /\bi need\b.*$/i
  ];

  for (const p of prefixes) text = text.replace(p, "");
  for (const e of endings) text = text.replace(e, "");

  text = text
    .replace(/[?!]+$/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  if (intent === "learn") {
    text = normalizeLearningTopic(text);
  }

  if (roleMode === "coding-pro") {
    text = normalizeCodingTopic(text);
  }

  if (roleMode === "marketing-pro") {
    text = normalizeMarketingTopic(text);
  }

  if (!text) text = raw.trim();

  return {
    display: text,
    english: text
  };
}

function normalizeLearningTopic(text) {
  let result = text.trim();
  const lower = result.toLowerCase();

  result = result
    .replace(/^как\s+мне\s+научиться\s+/i, "")
    .replace(/^как\s+научиться\s+/i, "")
    .replace(/^научиться\s+/i, "")
    .replace(/^learn\s+/i, "")
    .replace(/^how i can learn\s+/i, "")
    .replace(/^how can i learn\s+/i, "")
    .replace(/^how do i learn\s+/i, "")
    .replace(/^study\s+/i, "")
    .replace(/^the basics of\s+/i, "")
    .trim();

  if (/python/i.test(lower)) return "Python basics";
  if (/c#/i.test(lower)) return "C# basics";
  if (/javascript/i.test(lower)) return "JavaScript basics";
  if (/java/i.test(lower)) return "Java basics";
  if (/html/i.test(lower)) return "HTML basics";
  if (/css/i.test(lower)) return "CSS basics";
  if (/sql/i.test(lower)) return "SQL basics";
  if (/excel/i.test(lower)) return "Excel basics";

  if (result) return `${capitalizeFirst(result)} basics`;

  return text.trim();
}

function normalizeCodingTopic(text) {
  let result = text.trim();
  const lower = result.toLowerCase();

  if (/\b(site|website|landing|сайт)\b/i.test(lower) && /\b(order|заказ)\b/i.test(lower)) {
    return "responsive order website for a service business";
  }

  if (/\b(site|website|landing|сайт)\b/i.test(lower)) {
    return "responsive business website";
  }

  result = result
    .replace(/^fix\s+/i, "")
    .replace(/^solve\s+/i, "")
    .replace(/^help me with\s+/i, "")
    .replace(/^помоги с\s+/i, "")
    .replace(/^исправь\s+/i, "")
    .trim();

  return result || text.trim();
}

function normalizeMarketingTopic(text) {
  let result = text.trim();
  const lower = result.toLowerCase();

  if (/\b(olx|avito|classified|listing|объявлен)\b/i.test(lower)) {
    return "ads for classified platforms";
  }

  if (/\b(instagram|telegram|facebook|tiktok|social|соцсети)\b/i.test(lower)) {
    return "social media promotion";
  }

  if (/\b(seo|search engine|ключев|keywords)\b/i.test(lower)) {
    return "seo-focused marketing content";
  }

  if (/\b(site|website|landing|сайт)\b/i.test(lower)) {
    return "landing page marketing copy";
  }

  result = result
    .replace(/^write\s+/i, "")
    .replace(/^create\s+/i, "")
    .replace(/^сделай\s+/i, "")
    .replace(/^создай\s+/i, "")
    .trim();

  return result || text.trim();
}

function detectAudience(raw, lang, intent, roleMode) {
  const t = raw.toLowerCase();

  const checks = [
    { match: /\b(для школы|школьн|school)\b/i, value: "school", label: "School students", english: "school students" },
    { match: /\b(для университета|для студентов|university|students|academy project)\b/i, value: "students", label: "Students", english: "students" },
    { match: /\b(для новичков|beginners|beginner)\b/i, value: "beginners", label: "Beginners", english: "beginners" },
    { match: /\b(для фанатов|fans|fanfic)\b/i, value: "fans", label: "Fans", english: "fans" },
    { match: /\b(для разработчиков|developers)\b/i, value: "developers", label: "Developers", english: "developers" },
    { match: /\b(для маркетологов|marketers)\b/i, value: "marketers", label: "Marketers", english: "marketers" }
  ];

  for (const item of checks) {
    if (item.match.test(t)) return item;
  }

  if (intent === "learn") {
    return { value: "beginners", label: "Beginners", english: "beginners" };
  }

  if (roleMode === "coding-pro") {
    if (/\b(site|website|landing|сайт|customer|client|клиент|заказ|order)\b/i.test(t)) {
      return { value: "clients", label: "Business clients", english: "business clients and end users" };
    }
    return { value: "developers", label: "Developers", english: "developers" };
  }

  if (roleMode === "marketing-pro") {
    if (/\b(olx|avito|classified|listing|объявлен)\b/i.test(t)) {
      return { value: "classified-users", label: "Classified platform users", english: "people searching for offers on classified platforms" };
    }
    if (/\b(instagram|telegram|facebook|tiktok|social|соцсети)\b/i.test(t)) {
      return { value: "social-users", label: "Social media users", english: "social media users" };
    }
    if (/\b(seo|search engine|ключев|keywords)\b/i.test(t)) {
      return { value: "search-users", label: "Search users", english: "people searching online for relevant solutions" };
    }
    if (/\b(сайт|landing|website|site)\b/i.test(t)) {
      return { value: "landing-users", label: "Website visitors", english: "potential customers visiting a landing page or website" };
    }
    if (/\b(бригада|услуги|repair|moving|cleaning|handyman)\b/i.test(t)) {
      return { value: "service-buyers", label: "Service buyers", english: "people looking for local household, repair, or handyman services" };
    }
    return { value: "buyers", label: "Potential customers", english: "potential customers" };
  }

  return {
    value: "general",
    label: "General audience",
    english: "a general audience"
  };
}

function detectTime(raw) {
  const t = raw.toLowerCase();

  const map = [
    { regex: /\b(за неделю|week|one week|7 days)\b/i, value: "7days", label: "7 days", valueEnglish: "7 days" },
    { regex: /\b(за 2 недели|2 weeks|14 days)\b/i, value: "2weeks", label: "2 weeks", valueEnglish: "2 weeks" },
    { regex: /\b(за месяц|month|30 days|one month)\b/i, value: "1month", label: "1 month", valueEnglish: "1 month" },
    { regex: /\b(за день|1 day|today)\b/i, value: "1day", label: "1 day", valueEnglish: "1 day" }
  ];

  for (const item of map) {
    if (item.regex.test(t)) return item;
  }

  return {
    value: "",
    label: uiLang === "ru" ? "Не указано" : "Not specified",
    valueEnglish: ""
  };
}

function detectUseCase(raw, roleMode) {
  const t = raw.toLowerCase();

  const map = [
    { regex: /\b(презентац|presentation|slides)\b/i, value: "presentation", label: "Presentation", english: "presentation use" },
    { regex: /\b(фанфик|fanfic|fanfiction)\b/i, value: "fanfic", label: "Fanfiction", english: "fanfiction writing" },
    { regex: /\b(проект|project)\b/i, value: "project", label: "Project", english: "project work" },
    { regex: /\b(экзамен|exam|test)\b/i, value: "exam", label: "Exam", english: "exam preparation" },
    { regex: /\b(лендинг|landing page)\b/i, value: "landing", label: "Landing page", english: "landing page copy" },
    { regex: /\b(olx|avito|classified|listing|объявлен)\b/i, value: "classified", label: "Classified ads", english: "classified ad writing" },
    { regex: /\b(instagram|telegram|facebook|tiktok|social|соцсети)\b/i, value: "social", label: "Social media", english: "social media marketing" },
    { regex: /\b(seo|search engine|ключев|keywords)\b/i, value: "seo", label: "SEO", english: "seo content" },
    { regex: /\b(website|site|сайт)\b/i, value: "website", label: "Website", english: "website creation" },
    { regex: /\b(email|newsletter|mailing|рассылка)\b/i, value: "email", label: "Email marketing", english: "email campaign" },
    { regex: /\b(order|заказ|orders|booking|заявк)\b/i, value: "orders", label: "Order flow", english: "order handling" }
  ];

  for (const item of map) {
    if (item.regex.test(t)) return item;
  }

  if (roleMode === "coding-pro") {
    return { value: "technical", label: "Technical task", english: "technical implementation" };
  }

  if (roleMode === "marketing-pro") {
    return { value: "marketing", label: "Marketing task", english: "marketing content" };
  }

  return {
    value: "",
    label: uiLang === "ru" ? "Не указано" : "Not specified",
    english: ""
  };
}

function inferFormat(raw, intent, roleMode, useCase) {
  const t = raw.toLowerCase();

  if (/\b(table|таблица)\b/i.test(t)) {
    return { value: "table", label: "Table", english: "table", isInferred: false };
  }

  if (/\b(list|список|bullet)\b/i.test(t)) {
    return { value: "list", label: "List", english: "bullet list", isInferred: false };
  }

  if (roleMode === "coding-pro") {
    return { value: "code", label: "Code with explanation", english: "code with explanation", isInferred: true };
  }

  if (roleMode === "marketing-pro") {
    if (useCase.value === "classified") {
      return { value: "classified", label: "Ad ideas", english: "short ad ideas for listings", isInferred: true };
    }
    if (useCase.value === "social") {
      return { value: "social", label: "Social media copy", english: "social media copy", isInferred: true };
    }
    if (useCase.value === "seo") {
      return { value: "seo", label: "SEO-oriented copy", english: "seo-oriented content", isInferred: true };
    }
    return { value: "marketing", label: "Marketing copy", english: "marketing copy", isInferred: true };
  }

  if (useCase.value === "presentation") {
    return { value: "presentation", label: "Presentation-ready structure", english: "presentation-ready structure", isInferred: true };
  }

  if (intent === "learn") {
    return { value: "plan", label: "Step-by-step plan", english: "step-by-step learning plan", isInferred: true };
  }

  if (intent === "explain") {
    return { value: "structured", label: "Structured response", english: "structured response", isInferred: true };
  }

  return { value: "structured", label: "Structured response", english: "structured response", isInferred: true };
}

function inferTone(raw, intent, audience, roleMode, useCase) {
  const t = raw.toLowerCase();

  if (/\b(formal|official|официальн)\b/i.test(t)) {
    return { value: "formal", label: "Formal", english: "formal", isInferred: false };
  }

  if (/\b(friendly|дружелюбн)\b/i.test(t)) {
    return { value: "friendly", label: "Friendly", english: "friendly", isInferred: false };
  }

  if (/\b(creative|креативн)\b/i.test(t)) {
    return { value: "creative", label: "Creative", english: "creative", isInferred: false };
  }

  if (roleMode === "marketing-pro") {
    if (useCase.value === "classified") {
      return { value: "classified-tone", label: "Persuasive and practical", english: "persuasive, practical, and local-market friendly", isInferred: true };
    }
    return { value: "persuasive", label: "Persuasive", english: "persuasive", isInferred: true };
  }

  if (roleMode === "coding-pro") {
    return { value: "technical", label: "Clear and technical", english: "clear and technical", isInferred: true };
  }

  if (useCase.value === "presentation" || audience.value === "school") {
    return { value: "clear", label: "Clear and presentation-ready", english: "clear and presentation-ready", isInferred: true };
  }

  return { value: "clear", label: "Clear and appropriate", english: "clear and appropriate", isInferred: true };
}

function detectConstraints(raw) {
  const t = raw.toLowerCase();
  const list = [];

  if (/\b(без спойлеров|no spoilers|without spoilers)\b/i.test(t)) list.push("avoid spoilers");
  if (/\b(с примерами|with examples)\b/i.test(t)) list.push("include examples");
  if (/\b(только|only)\b/i.test(t)) list.push("focus only on the core topic");

  return list;
}

function hasAction(raw, lang) {
  const ru = /\b(объясни|расскажи|научи|сделай|создай|напиши|сгенерируй|помоги|сравни|покажи)\b/i;
  const en = /\b(explain|tell|teach|make|create|write|generate|help|compare|show)\b/i;
  return lang.value === "ru" ? ru.test(raw) : en.test(raw);
}

function hasContext(raw, useCase, time) {
  const words = normalizeSpaces(raw).split(" ").filter(Boolean).length;
  return words >= 6 || Boolean(useCase.value) || Boolean(time.value);
}

function isWeakTopic(topic, raw, intent, roleMode) {
  const t = topic.display.trim();
  if (!t) return true;
  if (t.length <= 2) return true;
  if (roleMode === "coding-pro" || roleMode === "marketing-pro") return false;
  if (intent !== "learn" && t.split(" ").length === 1 && t.length <= 4) return true;
  return false;
}

function calculateScore(data) {
  let score = 0;

  if (!data.topicWeak) score += 2;
  if (data.detectedIntent.value && data.detectedIntent.value !== "universal") score += 2;
  if (data.audience.value !== "general") score += 1;
  if (data.time.value) score += 1;
  if (data.useCase.value) score += 1;
  if (!data.format.isInferred) score += 1;
  if (!data.tone.isInferred) score += 1;
  if (data.constraints.length) score += 1;
  if (data.extractedRequirements.length >= 2) score += 1;

  const words = normalizeSpaces(data.raw).split(" ").filter(Boolean).length;
  if (words >= 8) score += 1;
  if (score > 10) score = 10;

  return score;
}

function extractRequirements(raw, roleMode, codingLanguage, useCase, market) {
  const items = [];
  const t = raw.toLowerCase();

  if (roleMode === "marketing-pro") {
    if (useCase.value === "classified") {
      items.push("use short and clear wording suitable for classified platforms");
      items.push("make the ad ideas trust-building and practical");
      items.push("include a strong call to action");
      if (market === "UZ") {
        items.push("adapt the wording for OLX.UZ-style local marketplace context");
      }
    }

    if (useCase.value === "social") {
      items.push("make the copy suitable for social media posts or captions");
      items.push("start with a strong hook");
      items.push("keep the message concise and scroll-stopping");
    }

    if (useCase.value === "seo") {
      items.push("use search-friendly wording");
      items.push("focus on user intent and relevant benefits");
      items.push("structure the content so it is SEO-friendly");
    }

    if (useCase.value === "landing") {
      items.push("make the copy suitable for a landing page");
      items.push("highlight benefits clearly");
      items.push("use conversion-focused CTA wording");
    }

    if (useCase.value === "email") {
      items.push("make the copy suitable for email marketing");
      items.push("keep the message concise and value-driven");
      items.push("include a clear CTA");
    }

    if (/\b(олх|olx|avito|объявлен)\b/i.test(t) && /\b(бригада|услуги|repair|moving|cleaning|handyman)\b/i.test(t)) {
      items.push("focus on reliability, speed, and practical local service value");
    }

    if (!items.length) {
      items.push("show a clear value proposition");
      items.push("use audience pain points or motivations");
      items.push("make the message persuasive and conversion-focused");
      items.push("include a strong CTA");
    }
  }

  if (roleMode === "coding-pro") {
    if (codingLanguage === "Web") {
      if (/\b(site|website|landing|сайт)\b/i.test(t)) {
        items.push("build a responsive mobile-friendly website");
      }
      if (/\b(order|заказ|orders|booking|заявк)\b/i.test(t)) {
        items.push("add a clear order button or order form");
      }
      if (/\b(contact|контакт|contacts|phone|номер|telegram|телеграм)\b/i.test(t)) {
        items.push("add a contacts section");
      }
      const phoneMatch = raw.match(/\+?\d[\d\s()-]{6,}/);
      if (phoneMatch) {
        items.push(`include this phone number: ${normalizeSpaces(phoneMatch[0])}`);
      }
      const tgMatch = raw.match(/@[A-Za-z0-9_]+/);
      if (tgMatch) {
        items.push(`include this Telegram contact: ${tgMatch[0]}`);
      }
      if (/\b(google forms|google form|гугл формы|гугл форма)\b/i.test(t)) {
        items.push("make applications go to Google Forms");
      }
      items.push("use clear CTA buttons");
    } else {
      if (/\b(api)\b/i.test(t)) items.push("include API integration or API handling if relevant");
      if (/\b(auth|login|signup|register|авторизац)\b/i.test(t)) items.push("include authentication logic if relevant");
      if (/\b(crud|database|db|база)\b/i.test(t)) items.push("include basic CRUD or data flow logic if relevant");
      if (/\b(bug|ошибка|fix|исправ)\b/i.test(t)) items.push("focus on fixing the bug clearly and safely");
      if (/\b(refactor|рефактор)\b/i.test(t)) items.push("improve code quality and structure");
      if (/\b(dashboard|admin)\b/i.test(t)) items.push("build a simple dashboard or admin-oriented structure if relevant");
      items.push("keep the code practical and production-oriented");
    }
  }

  return unique(items);
}

function pickVariant(seed, count) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % count;
}

function variantText(index, list) {
  return list[index % list.length];
}

function formatDurationForSentence(text) {
  return text.replace(" ", "-");
}

function saveHistory(raw, optimized, analysis) {
  const items = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");

  items.unshift({
    raw,
    optimized,
    intent: getIntentLabelForUI(analysis)
  });

  localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, 5)));
  renderHistory();
}

function renderHistory() {
  const items = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");

  if (!items.length) {
    historyList.innerHTML = `<div class="tip-item">${escapeHtml(t("noHistory"))}</div>`;
    return;
  }

  historyList.innerHTML = items.map((item, index) => `
    <div class="history-item">
      <div class="history-top">
        <div>
          <strong>${escapeHtml(item.intent)}</strong>
          <div class="history-raw">${escapeHtml(shorten(item.raw, 120))}</div>
        </div>
        <div class="history-actions">
          <button class="small-btn" data-action="load" data-index="${index}">${uiLang === "ru" ? "Загрузить" : "Load"}</button>
          <button class="small-btn" data-action="copy" data-index="${index}">${t("copy")}</button>
        </div>
      </div>
    </div>
  `).join("");

  historyList.querySelectorAll(".small-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = Number(btn.dataset.index);
      const action = btn.dataset.action;
      const current = items[index];

      if (action === "load") {
        promptInput.value = current.raw;
        showToast(t("loaded"));
      } else if (action === "copy") {
        try {
          navigator.clipboard.writeText(current.optimized);
        } catch {
          fallbackCopy(current.optimized);
        }
        showToast(t("copied"));
      }
    });
  });
}

function showToast(text) {
  toast.textContent = text;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1400);
}

function fallbackCopy(text) {
  const area = document.createElement("textarea");
  area.value = text;
  document.body.appendChild(area);
  area.select();
  document.execCommand("copy");
  document.body.removeChild(area);
}

function normalizeSpaces(text) {
  return text.replace(/\s+/g, " ").trim();
}

function shorten(text, max) {
  return text.length > max ? text.slice(0, max) + "..." : text;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function capitalizeFirst(text) {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function t(key) {
  return ui[uiLang][key];
}

function unique(arr) {
  return [...new Set(arr)];
}

function getIntentLabelForUI(a) {
  const key = a.roleMode === "universal" ? a.detectedIntent.value || "universal" : a.roleMode;
  const map = {
    universal: "Universal",
    learn: "Learning",
    explain: "Explain",
    create: "Create",
    "marketing-pro": "Marketing Pro",
    "coding-pro": "Coding Pro"
  };

  return map[key] || map.universal;
}

function applyInterfaceLanguage() {
  heroSubtitle.textContent = t("heroSubtitle");
  promptInput.placeholder = t("placeholder");
  optimizeBtn.textContent = t("optimize");
  scoreTitle.textContent = t("scoreTitle");
  analysisTitle.textContent = t("analysisTitle");
  tipsTitle.textContent = t("tipsTitle");
  resultTitle.textContent = t("resultTitle");
  historyTitle.textContent = t("historyTitle");
  copyBtn.textContent = t("copy");
  explainBtn.textContent = t("explain");
  openGPTBtn.textContent = t("openChatGPT");
  openGeminiBtn.textContent = t("openGemini");
  roleLabel.textContent = t("roleLabel");
  codingLabel.textContent = t("codingLabel");
  marketLabel.textContent = t("marketLabel");

  const roleLabels = ui[uiLang].roleOptions;
  Array.from(roleSelect.options).forEach((option) => {
    option.textContent = roleLabels[option.value];
  });

  if (statusText.textContent === ui.en.ready || statusText.textContent === ui.ru.ready) {
    statusText.textContent = t("ready");
  }

  if (resultText.textContent === ui.en.defaultResult || resultText.textContent === ui.ru.defaultResult) {
    resultText.textContent = t("defaultResult");
  }
}

function renderEmptyState() {
  const labels = ui[uiLang].labels;

  analysisText.innerHTML = `
    <div><span>${labels.language}:</span> —</div>
    <div><span>${labels.intent}:</span> —</div>
    <div><span>${labels.topic}:</span> —</div>
    <div><span>${labels.audience}:</span> —</div>
    <div><span>${labels.time}:</span> —</div>
    <div><span>${labels.useCase}:</span> —</div>
  `;
  tipsText.textContent = t("addPrompt");
  scoreValue.textContent = "0 / 10";
  scoreFill.style.width = "0%";
  setStatus(t("ready"));
}

function syncModeBlocks() {
  const role = roleSelect.value;
  codingBlock.classList.toggle("hidden", role !== "coding-pro");
  marketingBlock.classList.toggle("hidden", role !== "marketing-pro");
}

applyInterfaceLanguage();
syncModeBlocks();
renderEmptyState();
renderHistory();
resultText.textContent = t("defaultResult");