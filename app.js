(function () {
  "use strict";

  const ENTRIES_KEY = "gratitude_entries_v1";
  const STATS_KEY = "gratitude_stats_v1";
  const SETTINGS_KEY = "gratitude_settings_v1";

  const HATCH_ENTRIES_THRESHOLD = 3;
  const HATCH_DAYS_THRESHOLD = 4;
  const GLASS_SIZE = 3;

  const EGG_IMAGES = [
    "assets/egg_1_intact.png",
    "assets/egg_2_crack1.png",
    "assets/egg_3_crack2.png",
  ];

  const STAGES = [
    { min: 0,  glow: "#d7f2ec", idle: "assets/stage1_idle.png", happy: "assets/stage1_happy.png" },
    { min: 3,  glow: "#cdeee6", idle: "assets/stage2_idle.png", happy: "assets/stage2_happy.png" },
    { min: 8,  glow: "#c2e9de", idle: "assets/stage3_idle.png", happy: "assets/stage3_happy.png" },
    { min: 16, glow: "#d3e6f7", idle: "assets/stage4_idle.png", happy: "assets/stage4_happy.png" },
    { min: 30, glow: "#eae0ff", idle: "assets/stage5_idle.png", happy: "assets/stage5_happy.png" },
  ];

  const INGREDIENTS = [
    { emoji: "🍓", color: "#ff7b93" },
    { emoji: "🫐", color: "#7b8cff" },
    { emoji: "🍋", color: "#ffd95e" },
    { emoji: "🍑", color: "#ffb07b" },
    { emoji: "🥝", color: "#9bd94f" },
    { emoji: "🍯", color: "#ffc94a" },
    { emoji: "🌿", color: "#7ddba0" },
    { emoji: "✨", color: "#cbb7ef" },
    { emoji: "🍇", color: "#b07bff" },
    { emoji: "🍊", color: "#ffa64a" },
  ];

  const ACHIEVEMENTS = [
    { id: "first-entry",        icon: "🪑", pos: { top: 72, left: 22 }, test: (s) => s.lifetimeEntries >= 1 },
    { id: "three-entries",      icon: "🖼️", pos: { top: 61, left: 11 }, test: (s) => s.lifetimeEntries >= 3 },
    { id: "seven-entries",      icon: "🌱", pos: { top: 70, left: 82 }, test: (s) => s.lifetimeEntries >= 7 },
    { id: "fifteen-entries",    icon: "💡", pos: { top: 64, left: 10 }, test: (s) => s.lifetimeEntries >= 15 },
    { id: "twentyfive-entries", icon: "🚪", pos: { top: 58, left: 84 }, test: (s) => s.lifetimeEntries >= 25 },
    { id: "forty-entries",      icon: "📚", pos: { top: 63, left: 90 }, test: (s) => s.lifetimeEntries >= 40 },
    { id: "long-entry",         icon: "🧶", pos: { top: 88, left: 74 }, test: (s) => (s.maxWordsInEntry || 0) >= 50 },
    { id: "all-prompts",        icon: "🏮", pos: { top: 82, left: 8 },  test: (s) => (s.promptsAnswered || []).length >= promptCount() },
    { id: "comeback",           icon: "🛋️", pos: { top: 90, left: 21 }, test: (s) => !!s.hadComeback },
  ];

  // --- i18n ------------------------------------------------------------

  const I18N = {
    ru: {
      tabScene: "Полянка",
      tabJournal: "Записи",
      journalTitle: "Твои записи",
      emptyState: "Здесь появятся твои записи. Начни с одной — любой.",
      placeholder: "Можно одну строчку, можно много — как захочется...",
      otherQuestion: "Другой вопрос",
      thank: "Поблагодарить",
      hardDay: "сегодня тяжёлый день",
      hardDayBack: "вернуться к обычным вопросам",
      saveSoft: "Записать",
      remove: "убрать",
      confirmRemove: "Убрать эту запись из дневника? Питомец и полянка не изменятся — они помнят всё, что ты уже написал.",
      eggName: "Яйцо",
      defaultPetName: "Искорка",
      hatchToast: "🐣 Кто-то только что вылупился!",
      newOnMeadow: "Новое на полянке",
      tapEgg: "Тапни по яйцу",
      inventoryTitle: "Твои вещи",
      inventoryHint: "Нажми на вещь, чтобы убрать её с полянки или вернуть обратно.",
      inventoryEmpty: "Пока пусто. Вещи появятся сами, пока ты пишешь.",
      close: "Готово",
      ingredientAdded: "добавлено в коктейль",
      cocktailReady: "🥤 Коктейль готов — питомец пьёт!",
      onbQuotes: [
        "Иногда кажется, что ты заблудился, как будто в лесу.",
        "Кажется, что ты сделал неправильный выбор.",
        "Бывает сложно. Но знай, что всё это не зря. Это лишь часть пути.",
        "Пусть тёплое чувство благодарности поможет тебе взрастить что-то новое.",
      ],
      onbForward: "Идти вперёд через лес",
      onbRight: "Повернуть направо",
      onbLeft: "Повернуть налево",
      onbFinish: "Выйти на полянку",
      achievements: {
        "first-entry": "Стул",
        "three-entries": "Картина",
        "seven-entries": "Растение",
        "fifteen-entries": "Тёплая лампа",
        "twentyfive-entries": "Волшебная дверь",
        "forty-entries": "Полка с книгами",
        "long-entry": "Плед",
        "all-prompts": "Фонарик",
        "comeback": "Уютное кресло",
      },
      prompts: [
        "За что ты сегодня благодарен?",
        "Что сегодня заставило тебя улыбнуться?",
        "Был ли кто-то добр к тебе на этой неделе?",
        "Какая мелочь порадовала тебя сегодня?",
        "За какую часть своего дня ты благодарен, даже если день был трудным?",
        "Что в твоей жизни прямо сейчас кажется надёжным?",
        "Какой момент тишины или покоя у тебя был недавно?",
        "Кому ты хотел бы сказать спасибо?",
        "Какое маленькое удовольствие у тебя было сегодня?",
        "Сделало ли твоё тело сегодня что-то для тебя — пусть самое обычное?",
        "Какое место дарит тебе спокойствие?",
        "Какую свою черту характера ты сегодня ценишь?",
      ],
      // Вопросы для тяжёлого дня. Не требуют найти хорошее и не подводят
      // к благодарности — только назвать то, что есть, и отнестись к себе мягче.
      softPrompts: [
        "Что сегодня было тяжёлым? Можно просто назвать это.",
        "Если бы рядом был друг, уставший так же, — что бы ты ему сказал?",
        "Что помогло тебе продержаться сегодня, даже совсем чуть-чуть?",
        "Что тебе сейчас нужно больше всего?",
        "Что ты сделал сегодня, хотя было трудно?",
        "Какая часть тебя сегодня устала сильнее всего?",
        "О чём ты сейчас не хочешь думать? Можно оставить это здесь.",
      ],
      eggMessages: [
        "Внутри становится теплее.",
        "Кто-то готовится появиться — спешить некуда.",
        "Пока тихо. Но что-то уже происходит.",
      ],
      hatchMessages: [
        "Ура — я вылупился! Привет.",
        "Я наконец здесь, рядом с тобой.",
        "Кто-то только что появился на свет — благодаря тебе.",
      ],
      emptyMessages: [
        "Привет. Я подожду, пока ты будешь готов.",
        "Здесь нет ничего срочного — просто когда захочешь.",
        "Можно начать с одной короткой мысли.",
        "Я просто рад побыть рядом.",
        "Не обязательно писать много.",
      ],
      recentMessages: [
        "Я чувствую твоё тепло.",
        "Спасибо, что поделился этим со мной.",
        "Мне нравится расти вместе с тобой.",
        "Ты делаешь мой день теплее.",
        "Это маленькое, но настоящее.",
        "Я запомню это.",
      ],
      whileAgoMessages: [
        "Рад видеть тебя снова.",
        "Я никуда не делся, ждал тебя.",
        "Хорошо, что ты здесь.",
        "Как хорошо, что ты заглянул.",
      ],
      longAgoMessages: [
        "Я скучал, но ты ничего мне не должен.",
        "Сколько бы времени ни прошло — я всё ещё рад тебе.",
        "Никакой спешки. Я просто рад, что ты вернулся.",
        "Ты вернулся — и это уже прекрасно.",
      ],
      sipMessages: [
        "Ммм, пахнет вкусно!",
        "Какой хороший ингредиент.",
        "Это отправится в коктейль.",
      ],
      drinkMessages: [
        "Самый вкусный коктейль на свете!",
        "Спасибо, я наелся тепла.",
        "Ух, как вкусно! Спасибо тебе.",
      ],
      softMessages: [
        "Спасибо, что рассказал. Тяжёлый день — это просто тяжёлый день.",
        "Я посижу рядом. Больше ничего не нужно.",
        "Ты пришёл, хотя было трудно. Этого достаточно.",
        "Мне не нужно, чтобы тебе было хорошо. Мне нужно, чтобы ты был.",
        "Пусть сегодня будет так, как есть.",
      ],
    },

    en: {
      tabScene: "Meadow",
      tabJournal: "Entries",
      journalTitle: "Your entries",
      emptyState: "Your entries will appear here. Start with one — any one.",
      placeholder: "One line is enough, or write more — however you like...",
      otherQuestion: "Another question",
      thank: "Give thanks",
      hardDay: "today is a hard day",
      hardDayBack: "back to the usual questions",
      saveSoft: "Write it down",
      remove: "remove",
      confirmRemove: "Remove this entry from the journal? Your companion and meadow won't change — they remember everything you've written.",
      eggName: "Egg",
      defaultPetName: "Spark",
      hatchToast: "🐣 Someone just hatched!",
      newOnMeadow: "New in the meadow",
      tapEgg: "Tap the egg",
      inventoryTitle: "Your things",
      inventoryHint: "Tap an item to take it off the meadow or bring it back.",
      inventoryEmpty: "Nothing yet. Things will appear on their own as you write.",
      close: "Done",
      ingredientAdded: "added to the drink",
      cocktailReady: "🥤 The drink is ready — your companion is sipping it!",
      onbQuotes: [
        "Sometimes it feels like you've lost your way, as if in a forest.",
        "It feels like you took the wrong turn.",
        "It can be hard. But know that none of it is wasted — it's only part of the path.",
        "May the warm feeling of gratitude help you grow something new.",
      ],
      onbForward: "Walk forward through the forest",
      onbRight: "Turn right",
      onbLeft: "Turn left",
      onbFinish: "Step into the meadow",
      achievements: {
        "first-entry": "Chair",
        "three-entries": "Painting",
        "seven-entries": "Little plant",
        "fifteen-entries": "Warm lamp",
        "twentyfive-entries": "Magic door",
        "forty-entries": "Bookshelf",
        "long-entry": "Blanket",
        "all-prompts": "Lantern",
        "comeback": "Cozy armchair",
      },
      prompts: [
        "What are you grateful for today?",
        "What made you smile today?",
        "Was anyone kind to you this week?",
        "What small thing brightened your day?",
        "What part of your day are you grateful for, even if the day was hard?",
        "What feels steady in your life right now?",
        "What quiet or peaceful moment have you had recently?",
        "Who would you like to thank?",
        "What small pleasure did you have today?",
        "Did your body do something for you today — even the most ordinary thing?",
        "What place gives you calm?",
        "Which of your own traits do you appreciate today?",
      ],
      // Вопросы для тяжёлого дня. Не требуют найти хорошее и не подводят
      // к благодарности — только назвать то, что есть, и отнестись к себе мягче.
      softPrompts: [
        "What was hard today? You can just name it.",
        "If a friend were here, as tired as you are — what would you say to them?",
        "What helped you get through today, even a little?",
        "What do you need most right now?",
        "What did you do today even though it was hard?",
        "Which part of you is most tired today?",
        "What don't you want to think about right now? You can leave it here.",
      ],
      eggMessages: [
        "It's getting warmer inside.",
        "Someone is getting ready to arrive — no rush.",
        "It's quiet for now. But something is already happening.",
      ],
      hatchMessages: [
        "Yay — I hatched! Hello.",
        "I'm finally here, right beside you.",
        "Someone just came into the world — thanks to you.",
      ],
      emptyMessages: [
        "Hi. I'll wait until you're ready.",
        "Nothing here is urgent — only when you feel like it.",
        "You could start with one short thought.",
        "I'm just glad to be near.",
        "You don't have to write much.",
      ],
      recentMessages: [
        "I can feel your warmth.",
        "Thank you for sharing that with me.",
        "I love growing alongside you.",
        "You made my day warmer.",
        "It's small, but it's real.",
        "I'll remember this.",
      ],
      whileAgoMessages: [
        "Good to see you again.",
        "I didn't go anywhere, I waited for you.",
        "I'm glad you're here.",
        "How nice that you dropped by.",
      ],
      longAgoMessages: [
        "I missed you, but you owe me nothing.",
        "However long it's been — I'm still glad to see you.",
        "No rush at all. I'm just happy you're back.",
        "You came back — and that alone is lovely.",
      ],
      sipMessages: [
        "Mmm, that smells good!",
        "What a lovely ingredient.",
        "This one goes into the drink.",
      ],
      drinkMessages: [
        "The tastiest drink in the world!",
        "Thank you, I'm full of warmth.",
        "Ooh, delicious! Thank you.",
      ],
      softMessages: [
        "Thank you for telling me. A hard day is just a hard day.",
        "I'll sit here with you. Nothing else is needed.",
        "You came, even though it was hard. That's enough.",
        "I don't need you to feel good. I just want you here.",
        "Let today be exactly as it is.",
      ],
    },
  };

  // --- elements --------------------------------------------------------

  const $ = (id) => document.getElementById(id);

  const avatarEl = $("avatar");
  const avatarWrapEl = $("avatar-wrap");
  const glowEl = $("glow");
  const nameInputEl = $("pet-name-input");
  const messageEl = $("companion-message");
  const petColumnEl = $("pet-column");
  const petSpeechEl = $("pet-speech");
  const promptLabel = $("prompt-label");
  const newPromptBtn = $("new-prompt-btn");
  const saveBtn = $("save-btn");
  const hardDayBtn = $("hard-day-btn");
  const entryInput = $("entry-input");
  const entriesListEl = $("entries-list");
  const emptyStateEl = $("empty-state");
  const roomDecosEl = $("room-decos");
  const toastStackEl = $("toast-stack");
  const starLayerEl = $("star-layer");
  const reactionBurstEl = $("reaction-burst");
  const tabSwitchEl = $("tab-switch");
  const viewRoomEl = $("view-room");
  const viewJournalEl = $("view-journal");
  const stageEl = $("room-stage");
  const forestEl = $("forest");
  const quoteCardEl = $("quote-card");
  const quoteTextEl = $("quote-text");
  const dockJournalEl = $("dock-journal");
  const dockChoicesEl = $("dock-choices");
  const eggHintEl = $("egg-hint");
  const cocktailEl = $("cocktail");
  const langScreenEl = $("lang-screen");
  const inventoryBtn = $("inventory-btn");
  const inventoryPanelEl = $("inventory-panel");
  const inventoryListEl = $("inventory-list");

  let entries = loadEntries();
  let stats = loadStats();
  let settings = loadSettings();
  let currentPrompt = null;
  let messageTimer = null;
  let reactionRevertTimer = null;
  let messageOverrideUntil = 0;
  let onboardingStep = 0;
  // Режим тяжёлого дня намеренно не сохраняется: завтра день может быть другим,
  // и приложение не должно решать это за человека заранее.
  let softMode = false;
  const bags = { prompts: [], softPrompts: [] };

  function t(key) {
    return I18N[settings.lang][key];
  }

  function promptCount() {
    return I18N[(settings && settings.lang) || "ru"].prompts.length;
  }

  // --- storage ---------------------------------------------------------

  function loadEntries() {
    try {
      const raw = localStorage.getItem(ENTRIES_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveEntries() {
    localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
  }

  function defaultSettings() {
    return { lang: "ru", onboarded: false, started: false };
  }

  function loadSettings() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) return Object.assign(defaultSettings(), JSON.parse(raw));
    } catch (e) {}
    return defaultSettings();
  }

  function saveSettings() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }

  function defaultStats() {
    return {
      firstOpenDate: new Date().toISOString(),
      lifetimeEntries: 0,
      hatched: false,
      maxWordsInEntry: 0,
      promptsAnswered: [],
      hadComeback: false,
      unlockedAchievements: [],
      hiddenDecos: [],
      glass: [],
      petName: null,
    };
  }

  function loadStats() {
    try {
      const raw = localStorage.getItem(STATS_KEY);
      if (raw) return Object.assign(defaultStats(), JSON.parse(raw));
    } catch (e) {}
    return defaultStats();
  }

  function saveStats() {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  }

  // --- helpers ---------------------------------------------------------

  function refillBag(key, avoidRepeat) {
    const bag = [...t(key)];
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [bag[i], bag[j]] = [bag[j], bag[i]];
    }
    if (avoidRepeat && bag[bag.length - 1] === avoidRepeat && bag.length > 1) {
      const k = bag.length - 2;
      [bag[bag.length - 1], bag[k]] = [bag[k], bag[bag.length - 1]];
    }
    bags[key] = bag;
  }

  function nextPrompt() {
    const key = softMode ? "softPrompts" : "prompts";
    if (bags[key].length === 0) refillBag(key, currentPrompt);
    return bags[key].pop();
  }

  function pick(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function countWords(text) {
    const trimmed = (text || "").trim();
    return trimmed ? trimmed.split(/\s+/).length : 0;
  }

  function daysSince(dateStr) {
    return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  }

  function diffDaysBetween(a, b) {
    return Math.floor(Math.abs(new Date(b).getTime() - new Date(a).getTime()) / 86400000);
  }

  function getStage(count) {
    let stage = STAGES[0];
    for (const s of STAGES) if (count >= s.min) stage = s;
    return stage;
  }

  function petName() {
    return stats.petName || t("defaultPetName");
  }

  function updateHatchStatus() {
    if (stats.hatched) return false;
    if (stats.lifetimeEntries >= HATCH_ENTRIES_THRESHOLD || daysSince(stats.firstOpenDate) >= HATCH_DAYS_THRESHOLD) {
      stats.hatched = true;
      return true;
    }
    return false;
  }

  function computeNewlyUnlocked() {
    const unlocked = new Set(stats.unlockedAchievements || []);
    const newly = [];
    for (const a of ACHIEVEMENTS) {
      if (!unlocked.has(a.id) && a.test(stats)) {
        unlocked.add(a.id);
        newly.push(a);
      }
    }
    stats.unlockedAchievements = [...unlocked];
    return newly;
  }

  // --- avatar images ---------------------------------------------------

  // Картинки — PNG с готовой прозрачностью, обрабатывать в рантайме нечего.
  // Реакция питомца переключает idle → happy мгновенно, поэтому happy-кадр
  // текущей стадии подгружаем заранее, иначе первый раз он моргает.
  const preloaded = new Set();

  function preload(src) {
    if (preloaded.has(src)) return;
    preloaded.add(src);
    const img = new Image();
    img.src = src;
  }

  function setAvatarImage(src) {
    avatarEl.src = src;
  }

  // --- avatar ----------------------------------------------------------

  function renderAvatar(justHatched, grew) {
    if (!stats.hatched) {
      nameInputEl.value = t("eggName");
      nameInputEl.readOnly = true;
      glowEl.style.setProperty("--glow-color", "#d7f2ec");
      const progress = clamp(
        Math.max(stats.lifetimeEntries / HATCH_ENTRIES_THRESHOLD, daysSince(stats.firstOpenDate) / HATCH_DAYS_THRESHOLD),
        0, 1
      );
      setAvatarImage(EGG_IMAGES[progress >= 0.66 ? 2 : progress >= 0.33 ? 1 : 0]);
      return;
    }

    const stage = getStage(stats.lifetimeEntries);
    nameInputEl.readOnly = false;
    nameInputEl.value = petName();
    glowEl.style.setProperty("--glow-color", stage.glow);
    setAvatarImage(stage.idle);
    preload(stage.happy);

    if (justHatched || grew) {
      avatarEl.classList.remove("hatch-pop", "pulse-grow");
      void avatarEl.offsetWidth;
      avatarEl.classList.add(justHatched ? "hatch-pop" : "pulse-grow");
    }
  }

  // --- messages --------------------------------------------------------

  function renderMessage(justHatched) {
    if (Date.now() < messageOverrideUntil) return;
    if (!stats.hatched) return void (messageEl.textContent = pick(t("eggMessages")));
    if (justHatched) return void (messageEl.textContent = pick(t("hatchMessages")));
    if (entries.length === 0) return void (messageEl.textContent = pick(t("emptyMessages")));

    const gap = daysSince(entries[entries.length - 1].createdAt);
    if (gap <= 1) messageEl.textContent = pick(t("recentMessages"));
    else if (gap <= 6) messageEl.textContent = pick(t("whileAgoMessages"));
    else messageEl.textContent = pick(t("longAgoMessages"));
  }

  function sayFor(text, ms) {
    messageEl.textContent = text;
    messageOverrideUntil = Date.now() + ms;
  }

  function restartMessageRotation() {
    if (messageTimer) clearInterval(messageTimer);
    messageTimer = setInterval(() => renderMessage(false), 9000);
  }

  // --- meadow decorations ----------------------------------------------

  function depthScale(top) {
    return clamp(0.55 + (top - 50) * 0.0144, 0.5, 1.25);
  }

  function visibleDecos() {
    if (!stats.hatched) return [];
    const hidden = new Set(stats.hiddenDecos || []);
    return (stats.unlockedAchievements || [])
      .filter((id) => !hidden.has(id))
      .map((id) => ACHIEVEMENTS.find((a) => a.id === id))
      .filter(Boolean);
  }

  function renderRoom() {
    roomDecosEl.innerHTML = "";
    for (const ach of visibleDecos()) {
      const div = document.createElement("div");
      div.className = "deco";
      div.style.top = ach.pos.top + "%";
      div.style.left = ach.pos.left + "%";
      div.style.setProperty("--deco-scale", depthScale(ach.pos.top).toFixed(3));
      div.title = t("achievements")[ach.id];
      div.textContent = ach.icon;
      roomDecosEl.appendChild(div);
    }
  }

  // --- cocktail --------------------------------------------------------

  function renderGlass() {
    const layers = stats.glass || [];
    if (!settings.started) {
      cocktailEl.innerHTML = "";
      cocktailEl.classList.remove("visible");
      return;
    }
    cocktailEl.classList.add("visible");

    const bandH = 34;
    const baseY = 132;
    let bands = "";
    layers.forEach((layer, i) => {
      const y = baseY - (i + 1) * bandH;
      bands += `<rect x="18" y="${y}" width="64" height="${bandH + 1}" fill="${layer.color}" opacity="0.92" />`;
    });

    const cherry = layers.length >= GLASS_SIZE
      ? `<circle cx="62" cy="20" r="7" fill="#ff6f8b" stroke="rgba(255,255,255,.8)" stroke-width="2" />`
      : "";

    cocktailEl.innerHTML = `
      <svg viewBox="0 0 100 150" width="100%" height="100%">
        <defs>
          <clipPath id="glassClip">
            <path d="M24 28 L31 118 Q33 132 50 132 Q67 132 69 118 L76 28 Z" />
          </clipPath>
        </defs>
        <g clip-path="url(#glassClip)">
          <rect x="18" y="0" width="64" height="150" fill="rgba(255,255,255,0.18)" />
          ${bands}
        </g>
        <path d="M24 28 L31 118 Q33 132 50 132 Q67 132 69 118 L76 28 Z"
              fill="rgba(255,255,255,0.14)" stroke="rgba(255,255,255,0.9)" stroke-width="3" />
        <ellipse cx="50" cy="28" rx="26" ry="6.5"
                 fill="rgba(255,255,255,0.3)" stroke="rgba(255,255,255,0.95)" stroke-width="2.5" />
        <path d="M64 6 L55 56" stroke="#ff8fb0" stroke-width="6" stroke-linecap="round" />
        <path d="M33 40 L38 106" stroke="rgba(255,255,255,0.75)" stroke-width="4" stroke-linecap="round" />
        ${cherry}
      </svg>
    `;
  }

  function serveDrink(ingredient, fromRect, skipBounce) {
    const glassRect = cocktailEl.getBoundingClientRect();
    const targetX = glassRect.left + glassRect.width / 2;
    const targetY = glassRect.top + glassRect.height * 0.45;

    const chip = document.createElement("div");
    chip.className = "flying-ingredient";
    chip.textContent = ingredient.emoji;
    const startX = fromRect.left + fromRect.width / 2;
    const startY = fromRect.top + fromRect.height / 2;
    chip.style.left = startX + "px";
    chip.style.top = startY + "px";
    chip.style.transform = "translate(0,0) scale(0.6)";
    starLayerEl.appendChild(chip);

    requestAnimationFrame(() => requestAnimationFrame(() => {
      chip.style.transform = `translate(${targetX - startX}px, ${targetY - startY}px) scale(1.05)`;
    }));

    setTimeout(() => { chip.style.opacity = "0"; }, 560);

    setTimeout(() => {
      chip.remove();
      renderGlass();
      cocktailEl.classList.remove("glass-splash");
      void cocktailEl.offsetWidth;
      cocktailEl.classList.add("glass-splash");

      const full = (stats.glass || []).length >= GLASS_SIZE;
      if (full) {
        drinkCocktail(skipBounce);
      } else if (softMode) {
        sayFor(pick(t("softMessages")), 6000);
        petReact(skipBounce, false, true);
      } else {
        sayFor(pick(t("sipMessages")), 4000);
        petReact(skipBounce, false);
      }
    }, 700);
  }

  function drinkCocktail(skipBounce) {
    const glassRect = cocktailEl.getBoundingClientRect();
    const petRect = avatarWrapEl.getBoundingClientRect();
    const dx = (petRect.left + petRect.width * 0.62) - (glassRect.left + glassRect.width / 2);
    const dy = (petRect.top + petRect.height * 0.55) - (glassRect.top + glassRect.height / 2);

    cocktailEl.style.setProperty("--dx", dx + "px");
    cocktailEl.style.setProperty("--dy", dy + "px");
    cocktailEl.classList.add("glass-serving");

    setTimeout(() => {
      stats.glass = [];
      saveStats();
      renderGlass();
      sayFor(pick(t(softMode ? "softMessages" : "drinkMessages")), 6000);
      petReact(skipBounce, true, softMode);
      // В тяжёлый день восклицательный тост звучал бы глухо к тому, что человек написал.
      if (!softMode) showToast(t("cocktailReady"));
    }, 750);

    setTimeout(() => {
      cocktailEl.classList.remove("glass-serving");
    }, 1500);
  }

  const REACTION_EMOJIS = ["✨", "💫", "⭐"];
  const CELEBRATION_EMOJIS = ["✨", "💖", "⭐", "🌟", "💫"];

  // calm — режим тяжёлого дня: питомец радуется тише, без салюта.
  function petReact(skipBounce, big, calm) {
    if (!skipBounce) {
      avatarEl.classList.remove("happy-bounce");
      requestAnimationFrame(() => avatarEl.classList.add("happy-bounce"));
    }
    if (stats.hatched) {
      const stage = getStage(stats.lifetimeEntries);
      setAvatarImage(stage.happy);
      clearTimeout(reactionRevertTimer);
      reactionRevertTimer = setTimeout(() => setAvatarImage(stage.idle), big ? 2000 : 1200);
    }
    if (!calm) spawnParticles(big ? 7 : 3, big ? CELEBRATION_EMOJIS : REACTION_EMOJIS);
  }

  function spawnParticles(count, palette) {
    for (let i = 0; i < count; i++) {
      const el = document.createElement("div");
      el.className = "reaction-particle";
      el.textContent = pick(palette);
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.7;
      const dist = 32 + Math.random() * 22;
      el.style.setProperty("--dx", Math.cos(angle) * dist + "px");
      el.style.setProperty("--dy", (Math.sin(angle) * dist - 22) + "px");
      el.style.animationDelay = i * 0.05 + "s";
      reactionBurstEl.appendChild(el);
      setTimeout(() => el.remove(), 1100 + i * 50);
    }
  }

  function showToast(text) {
    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = text;
    toastStackEl.appendChild(el);
    setTimeout(() => el.remove(), 3700);
  }

  // --- journal ---------------------------------------------------------

  function formatDate(iso) {
    const d = new Date(iso);
    const locale = settings.lang === "en" ? "en-GB" : "ru-RU";
    return d.toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" }) +
      ", " + d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  }

  function renderEntries() {
    entriesListEl.innerHTML = "";
    if (entries.length === 0) {
      emptyStateEl.style.display = "block";
      return;
    }
    emptyStateEl.style.display = "none";

    for (const entry of [...entries].reverse()) {
      const div = document.createElement("div");
      div.className = "entry";
      div.innerHTML = `
        <p class="entry-date"></p>
        <p class="entry-prompt"></p>
        <p class="entry-text"></p>
        <span class="entry-ingredient"></span>
        <button class="entry-delete" data-id="${entry.id}"></button>
      `;
      div.querySelector(".entry-date").textContent = formatDate(entry.createdAt);
      div.querySelector(".entry-prompt").textContent = entry.prompt || "";
      div.querySelector(".entry-text").textContent = entry.text;
      div.querySelector(".entry-ingredient").textContent = entry.ingredient || "";
      div.querySelector(".entry-delete").textContent = t("remove");
      entriesListEl.appendChild(div);
    }

    entriesListEl.querySelectorAll(".entry-delete").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!confirm(t("confirmRemove"))) return;
        const id = btn.getAttribute("data-id");
        entries = entries.filter((e) => String(e.id) !== String(id));
        saveEntries();
        renderEntries();
        renderMessage(false);
      });
    });
  }

  function setPrompt(text) {
    currentPrompt = text;
    promptLabel.textContent = text;
  }

  function setSoftMode(on) {
    softMode = on;
    dockJournalEl.classList.toggle("soft", on);
    hardDayBtn.textContent = on ? t("hardDayBack") : t("hardDay");
    saveBtn.textContent = on ? t("saveSoft") : t("thank");
    setPrompt(nextPrompt());
  }

  // --- inventory -------------------------------------------------------

  function renderInventory() {
    inventoryListEl.innerHTML = "";
    const unlocked = stats.unlockedAchievements || [];
    if (!stats.hatched || unlocked.length === 0) {
      const p = document.createElement("p");
      p.className = "inventory-empty";
      p.textContent = t("inventoryEmpty");
      inventoryListEl.appendChild(p);
      return;
    }
    const hidden = new Set(stats.hiddenDecos || []);
    for (const id of unlocked) {
      const ach = ACHIEVEMENTS.find((a) => a.id === id);
      if (!ach) continue;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "inv-item" + (hidden.has(id) ? " off" : "");
      btn.innerHTML = `<span class="inv-emoji">${ach.icon}</span><span class="inv-name"></span>`;
      btn.querySelector(".inv-name").textContent = t("achievements")[id];
      btn.addEventListener("click", () => {
        const set = new Set(stats.hiddenDecos || []);
        if (set.has(id)) set.delete(id); else set.add(id);
        stats.hiddenDecos = [...set];
        saveStats();
        renderInventory();
        renderRoom();
      });
      inventoryListEl.appendChild(btn);
    }
  }

  function openInventory() {
    renderInventory();
    inventoryPanelEl.classList.add("open");
  }

  function closeInventory() {
    inventoryPanelEl.classList.remove("open");
  }

  // --- forest / onboarding ---------------------------------------------

  function buildForest() {
    const rows = [
      { el: $("tree-far"), count: 22, min: 34, max: 62 },
      { el: $("tree-mid"), count: 15, min: 52, max: 84 },
      { el: $("tree-near"), count: 9, min: 74, max: 108 },
    ];
    for (const row of rows) {
      let markup = "";
      for (let i = 0; i < row.count; i++) {
        const x = (i + 0.5) * (400 / row.count) + (Math.random() - 0.5) * 10;
        const h = row.min + Math.random() * (row.max - row.min);
        // viewBox растягивается по вертикали, поэтому ёлки закладываем широкими
        const w = h * 0.62;
        markup += `<polygon points="${x},${100 - h} ${x - w},100 ${x + w},100" />`;
        markup += `<polygon points="${x},${100 - h * 0.72} ${x - w * 1.2},${100 - h * 0.12} ${x + w * 1.2},${100 - h * 0.12}" />`;
      }
      row.el.innerHTML = markup;
    }
  }

  function showQuote(text) {
    quoteCardEl.classList.remove("visible");
    void quoteCardEl.offsetWidth;
    quoteTextEl.textContent = text;
    quoteCardEl.classList.add("visible");
  }

  function renderChoices(choices) {
    dockChoicesEl.innerHTML = "";
    for (const choice of choices) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "choice-btn";
      btn.textContent = choice.label;
      btn.addEventListener("click", choice.onClick);
      dockChoicesEl.appendChild(btn);
    }
  }

  function setDockMode(mode) {
    dockJournalEl.classList.toggle("active", mode === "journal");
    dockChoicesEl.classList.toggle("active", mode === "choices");
    $("entry-dock").classList.toggle("hidden", mode === "none");
  }

  // Пока идёт переход, кнопки не должны срабатывать: во время анимации кажется,
  // что тап не прошёл, и люди дотапывают. Без этого флага каждый лишний тап
  // ставил свой таймер, onboardingStep перепрыгивал конец массива цитат,
  // и человек оставался в бесконечном лесу с пустой карточкой.
  let walking = false;

  function walkForward(next) {
    if (walking) return;
    walking = true;
    forestEl.classList.remove("walking");
    void forestEl.offsetWidth;
    forestEl.classList.add("walking");
    quoteCardEl.classList.remove("visible");
    setTimeout(() => {
      walking = false;
      next();
    }, 620);
  }

  function startOnboarding() {
    stageEl.classList.add("forest-mode");
    petColumnEl.classList.add("hidden");
    eggHintEl.classList.remove("visible");
    onboardingStep = 0;
    setDockMode("choices");
    renderOnboardingStep();
  }

  function renderOnboardingStep() {
    const quotes = t("onbQuotes");
    // Страховка: пустая карточка без выхода хуже лишнего шага.
    onboardingStep = clamp(onboardingStep, 0, quotes.length - 1);
    showQuote(quotes[onboardingStep]);

    if (onboardingStep === 1) {
      const go = () => walkForward(() => { onboardingStep = 2; renderOnboardingStep(); });
      renderChoices([
        { label: t("onbRight"), onClick: go },
        { label: t("onbLeft"), onClick: go },
      ]);
      return;
    }

    if (onboardingStep === 3) {
      renderChoices([{ label: t("onbFinish"), onClick: finishOnboarding }]);
      return;
    }

    renderChoices([{
      label: t("onbForward"),
      onClick: () => walkForward(() => { onboardingStep += 1; renderOnboardingStep(); }),
    }]);
  }

  function finishOnboarding() {
    if (settings.onboarded) return;
    settings.onboarded = true;
    saveSettings();
    quoteCardEl.classList.remove("visible");
    stageEl.classList.add("leaving-forest");

    setTimeout(() => {
      stageEl.classList.remove("forest-mode");
      petColumnEl.classList.remove("hidden");
      showEggWaiting();
    }, 700);

    setTimeout(() => stageEl.classList.remove("leaving-forest"), 1500);
  }

  function showEggWaiting() {
    setDockMode("none");
    stageEl.classList.add("egg-waiting");
    avatarWrapEl.classList.add("tappable");
    eggHintEl.textContent = t("tapEgg");
    eggHintEl.classList.add("visible");
    petSpeechEl.classList.add("hidden");
  }

  function hatchStart() {
    if (settings.started) return;
    settings.started = true;
    saveSettings();
    document.body.classList.remove("onboarding");
    stageEl.classList.remove("egg-waiting");
    avatarWrapEl.classList.remove("tappable");
    eggHintEl.classList.remove("visible");
    petSpeechEl.classList.remove("hidden");
    avatarEl.classList.remove("pulse-grow");
    void avatarEl.offsetWidth;
    avatarEl.classList.add("pulse-grow");
    spawnParticles(6, CELEBRATION_EMOJIS);
    setDockMode("journal");
    renderGlass();
    renderMessage(false);
  }

  // --- language --------------------------------------------------------

  function applyLanguage() {
    document.documentElement.lang = settings.lang;
    $("tab-scene").textContent = t("tabScene");
    $("tab-journal").textContent = t("tabJournal");
    $("journal-title").textContent = t("journalTitle");
    emptyStateEl.textContent = t("emptyState");
    entryInput.placeholder = t("placeholder");
    newPromptBtn.textContent = t("otherQuestion");
    saveBtn.textContent = softMode ? t("saveSoft") : t("thank");
    hardDayBtn.textContent = softMode ? t("hardDayBack") : t("hardDay");
    $("inventory-title").textContent = t("inventoryTitle");
    $("inventory-hint").textContent = t("inventoryHint");
    $("inventory-close").textContent = t("close");
    inventoryBtn.title = t("inventoryTitle");
    document.querySelectorAll("#lang-mini button").forEach((b) => {
      b.classList.toggle("active", b.dataset.lang === settings.lang);
    });
  }

  function setLanguage(lang) {
    settings.lang = lang;
    saveSettings();
    bags.prompts = [];
    bags.softPrompts = [];
    applyLanguage();
    setPrompt(nextPrompt());
    renderAvatar(false, false);
    renderRoom();
    renderEntries();
    renderInventory();
    renderMessage(false);
  }

  // --- events ----------------------------------------------------------

  tabSwitchEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".tab-btn");
    if (!btn) return;
    const tab = btn.dataset.tab;
    tabSwitchEl.querySelectorAll(".tab-btn").forEach((b) => b.classList.toggle("active", b === btn));
    viewRoomEl.classList.toggle("active", tab === "room");
    viewJournalEl.classList.toggle("active", tab === "journal");
    document.body.classList.toggle("journal-tab", tab === "journal");
  });

  nameInputEl.addEventListener("blur", () => {
    if (!stats.hatched) return;
    const value = nameInputEl.value.trim().slice(0, 24);
    stats.petName = value || stats.petName || t("defaultPetName");
    nameInputEl.value = petName();
    saveStats();
  });

  nameInputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); nameInputEl.blur(); }
  });

  avatarWrapEl.addEventListener("click", () => {
    if (settings.onboarded && !settings.started) hatchStart();
  });

  inventoryBtn.addEventListener("click", openInventory);
  $("inventory-close").addEventListener("click", closeInventory);
  inventoryPanelEl.addEventListener("click", (e) => {
    if (e.target === inventoryPanelEl) closeInventory();
  });

  document.querySelectorAll("#lang-mini button").forEach((btn) => {
    btn.addEventListener("click", () => setLanguage(btn.dataset.lang));
  });

  langScreenEl.querySelectorAll("[data-lang]").forEach((btn) => {
    btn.addEventListener("click", () => {
      settings.lang = btn.dataset.lang;
      saveSettings();
      applyLanguage();
      bags.prompts = [];
      bags.softPrompts = [];
      setPrompt(nextPrompt());
      langScreenEl.classList.add("hidden");
      startOnboarding();
    });
  });

  newPromptBtn.addEventListener("click", () => setPrompt(nextPrompt()));

  hardDayBtn.addEventListener("click", () => setSoftMode(!softMode));

  saveBtn.addEventListener("click", () => {
    const text = entryInput.value.trim();
    if (!text) {
      entryInput.classList.remove("shake");
      void entryInput.offsetWidth;
      entryInput.classList.add("shake");
      return;
    }

    const fromRect = saveBtn.getBoundingClientRect();
    const ingredient = pick(INGREDIENTS);
    const wasHatched = stats.hatched;
    const prevStage = getStage(stats.lifetimeEntries);
    const previous = entries.length ? entries[entries.length - 1] : null;
    const now = new Date().toISOString();

    entries.push({ id: Date.now(), text, prompt: currentPrompt, createdAt: now, ingredient: ingredient.emoji });
    saveEntries();

    stats.lifetimeEntries += 1;
    const words = countWords(text);
    if (words > stats.maxWordsInEntry) stats.maxWordsInEntry = words;
    // Вопросы тяжёлого дня не идут в зачёт ачивки «все вопросы» — она считается
    // от длины обычного списка, иначе разблокировалась бы раньше времени.
    if (!softMode && !stats.promptsAnswered.includes(currentPrompt)) stats.promptsAnswered.push(currentPrompt);
    if (previous && diffDaysBetween(previous.createdAt, now) >= 7) stats.hadComeback = true;

    stats.glass = [...(stats.glass || []), { emoji: ingredient.emoji, color: ingredient.color }].slice(-GLASS_SIZE);

    const justHatched = updateHatchStatus() || (!wasHatched && stats.hatched);
    const newlyUnlocked = computeNewlyUnlocked();
    saveStats();

    const grew = stats.hatched && getStage(stats.lifetimeEntries).min !== prevStage.min;

    entryInput.value = "";
    setPrompt(nextPrompt());
    renderEntries();
    renderAvatar(justHatched, grew);
    if (justHatched) renderMessage(true);
    renderRoom();
    renderGlass();

    serveDrink(ingredient, fromRect, justHatched || grew);

    if (justHatched) showToast(t("hatchToast"));
    for (const ach of newlyUnlocked) {
      showToast(`${ach.icon} ${t("newOnMeadow")}: ${t("achievements")[ach.id]}`);
    }
  });

  // --- init ------------------------------------------------------------

  buildForest();
  applyLanguage();

  const justHatchedOnLoad = updateHatchStatus();
  if (justHatchedOnLoad) saveStats();

  renderAvatar(justHatchedOnLoad, false);
  renderRoom();
  renderEntries();
  renderGlass();
  setPrompt(nextPrompt());
  restartMessageRotation();

  if (!settings.onboarded) {
    document.body.classList.add("onboarding");
    langScreenEl.classList.remove("hidden");
    setDockMode("none");
    petColumnEl.classList.add("hidden");
  } else if (!settings.started) {
    document.body.classList.add("onboarding");
    showEggWaiting();
  } else {
    setDockMode("journal");
    renderMessage(justHatchedOnLoad);
    if (justHatchedOnLoad) showToast(t("hatchToast"));
  }
})();
