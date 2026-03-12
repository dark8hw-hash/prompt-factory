const promptInput = document.getElementById("promptInput");
const roleSelect = document.getElementById("roleSelect");
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
const explainBtn = document.getElementById("explainBtn");
const explainBox = document.getElementById("explainBox");

const historyTitle = document.getElementById("historyTitle");
const historyList = document.getElementById("historyList");
const heroTitle = document.getElementById("heroTitle");
const heroSubtitle = document.getElementById("heroSubtitle");

const toast = document.getElementById("toast");

const HISTORY_KEY = "prompt_factory_history_final_last";
let uiLang = "en";
let lastAnalysis = null;

const ui = {
  en: {
    heroSubtitle: "Algorithm-based prompt optimizer",
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
    defaultResult: "Your optimized prompt will appear here...",
    addPrompt: "Add a prompt to get suggestions.",
    noHistory: "No history yet.",
    nothingToCopy: "Nothing to copy",
    copied: "Copied",
    loaded: "Loaded",
    writePromptFirst: "Write a prompt first",
    labels: {
      language: "Language",
      intent: "Intent",
      topic: "Topic",
      audience: "Audience",
      time: "Time",
      useCase: "Use case"
    },
    roleOptions: {
      auto: "Auto",
      learn: "Learning",
      explain: "Explain",
      story: "Story",
      code: "Coding",
      marketing: "Marketing",
      compare: "Compare",
      create: "Create"
    },
    tipStrong: "Prompt looks strong. The optimizer found enough detail to build a solid rewrite."
  },
  ru: {
    heroSubtitle: "Алгоритмический оптимайзер промтов",
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
    defaultResult: "Ваш улучшенный промт появится здесь...",
    addPrompt: "Добавьте промт, чтобы получить подсказки.",
    noHistory: "История пока пуста.",
    nothingToCopy: "Нечего копировать",
    copied: "Скопировано",
    loaded: "Загружено",
    writePromptFirst: "Сначала введите промт",
    labels: {
      language: "Язык",
      intent: "Намерение",
      topic: "Тема",
      audience: "Аудитория",
      time: "Срок",
      useCase: "Цель"
    },
    roleOptions: {
      auto: "Авто",
      learn: "Обучение",
      explain: "Объяснение",
      story: "История",
      code: "Кодинг",
      marketing: "Маркетинг",
      compare: "Сравнение",
      create: "Создание"
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
  if (!normalizeSpaces(promptInput.value)) {
    renderEmptyState();
  } else {
    const analysis = analyzePrompt(normalizeSpaces(promptInput.value), roleSelect.value);
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
    const area = document.createElement("textarea");
    area.value = text;
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    document.body.removeChild(area);
    showToast(t("copied"));
  }
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
  const intent = resolveIntent(detectedIntent, selectedRole);
  const topic = extractTopic(raw, lang, intent);
  const audience = detectAudience(raw, lang, intent);
  const time = detectTime(raw, lang);
  const useCase = detectUseCase(raw, lang);
  const format = inferFormat(raw, lang, intent, useCase);
  const tone = inferTone(raw, lang, intent, audience, useCase);
  const constraints = detectConstraints(raw, lang);
  const topicWeak = isWeakTopic(topic, raw, intent);

  const weaknesses = [];
  if (!hasAction(raw, lang)) weaknesses.push("action");
  if (topicWeak) weaknesses.push("topic");
  if (!hasContext(raw, lang, useCase, time)) weaknesses.push("context");
  if (audience.value === "general") weaknesses.push("audience");
  if (format.isInferred) weaknesses.push("format");
  if (tone.isInferred) weaknesses.push("tone");
  if (!time.value) weaknesses.push("time");

  const score = calculateScore({
    raw,
    detectedIntent,
    audience,
    time,
    useCase,
    format,
    tone,
    constraints,
    topicWeak
  });

  return {
    raw,
    lang,
    selectedRole,
    detectedIntent,
    intent,
    topic,
    audience,
    time,
    useCase,
    format,
    tone,
    constraints,
    topicWeak,
    weaknesses,
    score
  };
}

function buildOptimizedPrompt(a) {
  const variant = pickVariant(a.raw, 3);

  if (a.topicWeak) {
    return buildFallbackPrompt(a, variant);
  }

  switch (a.intent) {
    case "learn":
      return buildLearnPrompt(a, variant);
    case "explain":
      return buildExplainPrompt(a, variant);
    case "story":
      return buildStoryPrompt(a, variant);
    case "code":
      return buildCodePrompt(a, variant);
    case "marketing":
      return buildMarketingPrompt(a, variant);
    case "compare":
      return buildComparePrompt(a, variant);
    case "create":
      return buildCreatePrompt(a, variant);
    default:
      return buildGeneralPrompt(a, variant);
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

function learningGoalLine(a, v) {
  const topic = a.topic.english;

  const variants = [
    a.time.value
      ? `Create a ${a.time.valueEnglish.replace(" ", "-")} learning plan for learning ${topic} from scratch.`
      : `Create a clear learning plan for learning ${topic} from scratch.`,
    a.time.value
      ? `Build a realistic ${a.time.valueEnglish.replace(" ", "-")} roadmap to learn the basics of ${topic}.`
      : `Build a realistic roadmap to learn the basics of ${topic}.`,
    a.time.value
      ? `Design a beginner-friendly ${a.time.valueEnglish.replace(" ", "-")} study plan for ${topic}.`
      : `Design a beginner-friendly study plan for ${topic}.`
  ];

  return variants[v % variants.length];
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

function buildStoryPrompt(a, v) {
  const role = variantText(v, [
    "Act as a creative storyteller familiar with narrative structure.",
    "Act as a story-focused writer who can summarize fictional worlds clearly.",
    "Act as a narrative guide who highlights plot, characters, and themes."
  ]);

  const lines = [
    role,
    "",
    `Provide a structured summary of ${a.topic.english}.`,
    `Target audience: ${a.audience.english}.`,
    `Output format: ${a.format.english}.`,
    `Tone: ${a.tone.english}.`,
    "Include:",
    "• the main plot",
    "• the key characters",
    "• important events",
    "• the central themes or emotional tone"
  ];

  if (a.useCase.value) {
    lines.push(`Purpose: ${a.useCase.english}.`);
  }

  lines.push("Focus on the details that are most useful for understanding the story world.");
  lines.push("Avoid unnecessary filler and keep the structure clear.");

  return lines.join("\n");
}

function buildCodePrompt(a, v) {
  const role = variantText(v, [
    "Act as a practical coding assistant focused on clean logic.",
    "Act as an experienced software engineer and coding mentor.",
    "Act as a technical assistant who explains code clearly and efficiently."
  ]);

  const lines = [
    role,
    "",
    codeGoalLine(a, v),
    `Target audience: ${a.audience.english}.`,
    `Output format: ${a.format.english}.`,
    `Tone: ${a.tone.english}.`,
    "Include:",
    "• the core explanation of the problem or concept",
    "• a clean and practical solution",
    "• short reasoning for why the solution works",
    "• useful tips or common mistakes if relevant"
  ];

  if (a.time.value) {
    lines.push(`Time or scope target: ${a.time.valueEnglish}.`);
  }

  lines.push("Keep the answer concrete, technical, and easy to follow.");

  return lines.join("\n");
}

function codeGoalLine(a, v) {
  const topic = a.topic.english;

  const variants = [
    `Help with the programming task related to ${topic}.`,
    `Explain and solve the programming task connected to ${topic}.`,
    `Provide coding help related to ${topic}.`
  ];

  return variants[v % variants.length];
}

function buildMarketingPrompt(a, v) {
  const role = variantText(v, [
    "Act as a marketing strategist and persuasive copywriter.",
    "Act as a conversion-focused marketing expert.",
    "Act as a creative marketer who writes clear and effective copy."
  ]);

  const lines = [
    role,
    "",
    `Create marketing content about ${a.topic.english}.`,
    `Target audience: ${a.audience.english}.`,
    `Output format: ${a.format.english}.`,
    `Tone: ${a.tone.english}.`,
    "Include:",
    "• a clear value proposition",
    "• audience-focused wording",
    "• concise and persuasive structure",
    "• a strong and relevant message"
  ];

  if (a.useCase.value) {
    lines.push(`Purpose: ${a.useCase.english}.`);
  }

  lines.push("Avoid generic filler. Make the output specific and convincing.");

  return lines.join("\n");
}

function buildComparePrompt(a, v) {
  const role = variantText(v, [
    "Act as an objective analyst.",
    "Act as a clear comparison-focused assistant.",
    "Act as a structured expert who highlights differences and similarities."
  ]);

  const lines = [
    role,
    "",
    `Compare ${a.topic.english} clearly and logically.`,
    `Target audience: ${a.audience.english}.`,
    `Output format: ${a.format.english}.`,
    `Tone: ${a.tone.english}.`,
    "Include:",
    "• key similarities",
    "• key differences",
    "• strengths and weaknesses",
    "• a final concise takeaway"
  ];

  lines.push("Keep the comparison balanced, structured, and easy to scan.");

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

  lines.push("Make the output clear, specific, and ready to use.");
  lines.push("Avoid filler and keep the structure logical.");

  return lines.join("\n");
}

function buildGeneralPrompt(a, v) {
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

  lines.push("Make the result logically structured and easy to use.");
  lines.push("Avoid unnecessary filler.");

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

function renderAnalysis(a) {
  const labels = ui[uiLang].labels;

  analysisText.innerHTML = `
    <div><span>${labels.language}:</span> ${a.lang.label}</div>
    <div><span>${labels.intent}:</span> ${a.detectedIntent.label}</div>
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
    items.push(`Основное намерение определено как "${a.detectedIntent.label.toLowerCase()}".`);

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

    items.push("Финальный промт был переписан гибридным движком: сначала анализ, потом шаблон.");
  } else {
    items.push("The language was detected automatically.");
    items.push(`The main intent was identified as "${a.detectedIntent.label.toLowerCase()}".`);

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
  tipsText.textContent = ui[uiLang].addPrompt;
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

  const rules = [
    { key: "learn", label: "Learning", regex: /\b(научи|обучи|изучи|как научиться|как выучить|план обучения|выучи|teach|learn|study|learning plan|how can i learn|how do i learn)\b/i },
    { key: "explain", label: "Explain", regex: /\b(объясни|расскажи|что такое|опиши|поясни|explain|describe|tell me about|what is)\b/i },
    { key: "story", label: "Story", regex: /\b(сюжет|лор|история аниме|история манги|фанфик|персонажи|plot|lore|story|fanfic|characters)\b/i },
    { key: "marketing", label: "Marketing", regex: /\b(маркетинг|реклама|seo|продажи|копирайтинг|лендинг|бренд|marketing|advert|sales|copywriting|landing page|brand)\b/i },
    { key: "compare", label: "Compare", regex: /\b(сравни|разница|vs|versus|compare|difference)\b/i },
    { key: "create", label: "Create", regex: /\b(создай|сделай|сгенерируй|напиши|create|generate|make|write)\b/i }
  ];

  const codeRegex = /\b(c#|javascript|python|java|html|css|sql|код|ошибка|функция|debug|программа|program|bug|function|code)\b/i;
  const learningRegex = /\b(научи|как научиться|как выучить|teach|learn|study|how can i learn)\b/i;

  if (learningRegex.test(t) && codeRegex.test(t)) {
    return { value: "learn", label: "Learning" };
  }

  if (codeRegex.test(t) && !learningRegex.test(t)) {
    return { value: "code", label: "Coding" };
  }

  for (const rule of rules) {
    if (rule.regex.test(t)) {
      return { value: rule.key, label: rule.label };
    }
  }

  return { value: "general", label: "General" };
}

function resolveIntent(detectedIntent, selectedRole) {
  if (detectedIntent.value !== "general") return detectedIntent.value;
  if (selectedRole !== "auto") return selectedRole;
  return "general";
}

function extractTopic(raw, lang, intent) {
  let text = raw;

  const commonPrefixes = [
    /^(можешь\s+)?(пожалуйста\s+)?/i,
    /^(please\s+)?(can you\s+)?/i
  ];

  const intentPrefixes = [
    /^(объясни( мне)?|расскажи( мне)?|научи( меня)?|сделай|создай|напиши|сгенерируй|помоги( мне)?|дай|покажи|сравни)\s+/i,
    /^(explain( to me)?|tell me about|teach me|help me learn|write about|create|generate|make|show me|compare)\s+/i
  ];

  const endings = [
    /\b(для школы|для школьной презентации|для презентации|для проекта|для университета|для фанатов|для новичков)\b.*$/i,
    /\b(for school|for a school presentation|for presentation|for project|for university|for fans|for beginners)\b.*$/i,
    /\bя хочу\b.*$/i,
    /\bмне нужно\b.*$/i,
    /\bi want\b.*$/i,
    /\bi need\b.*$/i
  ];

  for (const p of commonPrefixes) text = text.replace(p, "");
  for (const p of intentPrefixes) text = text.replace(p, "");
  for (const e of endings) text = text.replace(e, "");

  text = text
    .replace(/[?!]+$/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  text = normalizeLearningTopic(text, lang, intent);

  if (!text) text = raw.trim();

  return {
    display: text,
    english: toEnglishTopicStyle(text, lang),
    russian: text
  };
}

function normalizeLearningTopic(text, lang, intent) {
  let result = text.trim();
  const lower = result.toLowerCase();

  if (intent === "learn") {
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

    if (result) return `${capitalizeFirst(result)} basics`;
  }

  return result;
}

function toEnglishTopicStyle(text, lang) {
  return text.trim();
}

function detectAudience(raw, lang, intent) {
  const t = raw.toLowerCase();

  const checks = [
    { match: /\b(для школы|школьн|school)\b/i, value: "school", label: "School students", english: "school students" },
    { match: /\b(для университета|для студентов|university|students|academy project)\b/i, value: "students", label: "Students", english: "students" },
    { match: /\b(для новичков|beginners|beginner)\b/i, value: "beginners", label: "Beginners", english: "beginners" },
    { match: /\b(для фанатов|fans|fanfic)\b/i, value: "fans", label: "Fans", english: "fans" },
    { match: /\b(для разработчиков|developers)\b/i, value: "developers", label: "Developers", english: "developers" }
  ];

  for (const item of checks) {
    if (item.match.test(t)) {
      return item;
    }
  }

  if (intent === "learn") {
    return { value: "beginners", label: "Beginners", english: "beginners" };
  }

  return {
    value: "general",
    label: "General audience",
    english: "a general audience"
  };
}

function detectTime(raw, lang) {
  const t = raw.toLowerCase();

  const map = [
    { regex: /\b(за неделю|week|one week|7 days)\b/i, value: "7days", label: "7 days", english: "7 days", valueEnglish: "7 days" },
    { regex: /\b(за 2 недели|2 weeks|14 days)\b/i, value: "2weeks", label: "2 weeks", english: "2 weeks", valueEnglish: "2 weeks" },
    { regex: /\b(за месяц|month|30 days|one month)\b/i, value: "1month", label: "1 month", english: "1 month", valueEnglish: "1 month" },
    { regex: /\b(за день|1 day|today)\b/i, value: "1day", label: "1 day", english: "1 day", valueEnglish: "1 day" }
  ];

  for (const item of map) {
    if (item.regex.test(t)) return item;
  }

  return {
    value: "",
    label: uiLang === "ru" ? "Не указано" : "Not specified",
    english: "",
    valueEnglish: ""
  };
}

function detectUseCase(raw, lang) {
  const t = raw.toLowerCase();

  const map = [
    { regex: /\b(презентац|presentation|slides)\b/i, value: "presentation", label: "Presentation", english: "presentation use" },
    { regex: /\b(фанфик|fanfic|fanfiction)\b/i, value: "fanfic", label: "Fanfiction", english: "fanfiction writing" },
    { regex: /\b(проект|project)\b/i, value: "project", label: "Project", english: "project work" },
    { regex: /\b(экзамен|exam|test)\b/i, value: "exam", label: "Exam", english: "exam preparation" },
    { regex: /\b(лендинг|landing page)\b/i, value: "landing", label: "Landing page", english: "landing page copy" }
  ];

  for (const item of map) {
    if (item.regex.test(t)) return item;
  }

  return {
    value: "",
    label: uiLang === "ru" ? "Не указано" : "Not specified",
    english: ""
  };
}

function inferFormat(raw, lang, intent, useCase) {
  const t = raw.toLowerCase();

  if (/\b(table|таблица)\b/i.test(t)) {
    return { value: "table", label: "Table", english: "table", isInferred: false };
  }

  if (/\b(list|список|bullet)\b/i.test(t)) {
    return { value: "list", label: "List", english: "bullet list", isInferred: false };
  }

  if (/\b(code|код)\b/i.test(t) && intent === "code") {
    return { value: "code", label: "Code with explanation", english: "code with explanation", isInferred: false };
  }

  if (useCase.value === "presentation") {
    return { value: "presentation", label: "Presentation-ready structure", english: "presentation-ready structure", isInferred: true };
  }

  if (intent === "learn") {
    return { value: "plan", label: "Step-by-step plan", english: "step-by-step learning plan", isInferred: true };
  }

  if (intent === "story") {
    return { value: "summary", label: "Structured summary", english: "structured summary", isInferred: true };
  }

  if (intent === "compare") {
    return { value: "compare", label: "Comparison structure", english: "comparison structure", isInferred: true };
  }

  return { value: "structured", label: "Structured response", english: "structured response", isInferred: true };
}

function inferTone(raw, lang, intent, audience, useCase) {
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

  if (intent === "marketing") {
    return { value: "persuasive", label: "Persuasive", english: "persuasive", isInferred: true };
  }

  if (useCase.value === "presentation" || audience.value === "school") {
    return { value: "clear", label: "Clear and presentation-ready", english: "clear and presentation-ready", isInferred: true };
  }

  if (intent === "code") {
    return { value: "technical", label: "Clear and technical", english: "clear and technical", isInferred: true };
  }

  return { value: "clear", label: "Clear and appropriate", english: "clear and appropriate", isInferred: true };
}

function detectConstraints(raw, lang) {
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

function hasContext(raw, lang, useCase, time) {
  const words = normalizeSpaces(raw).split(" ").filter(Boolean).length;
  return words >= 6 || Boolean(useCase.value) || Boolean(time.value);
}

function isWeakTopic(topic, raw, intent) {
  const t = topic.display.trim();
  if (!t) return true;
  if (t.length <= 2) return true;
  if (intent !== "learn" && t.split(" ").length === 1 && t.length <= 4) return true;
  return false;
}

function calculateScore(data) {
  let score = 0;

  if (!data.topicWeak) score += 2;
  if (data.detectedIntent.value !== "general") score += 2;
  if (data.audience.value !== "general") score += 1;
  if (data.time.value) score += 1;
  if (data.useCase.value) score += 1;
  if (!data.format.isInferred) score += 1;
  if (!data.tone.isInferred) score += 1;
  if (data.constraints.length) score += 1;

  const words = normalizeSpaces(data.raw).split(" ").filter(Boolean).length;
  if (words >= 8) score += 1;
  if (score > 10) score = 10;

  return score;
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

function saveHistory(raw, optimized, analysis) {
  const items = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");

  items.unshift({
    raw,
    optimized,
    intent: analysis.detectedIntent.label
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
        navigator.clipboard.writeText(current.optimized);
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

applyInterfaceLanguage();
renderEmptyState();
renderHistory();
resultText.textContent = t("defaultResult");