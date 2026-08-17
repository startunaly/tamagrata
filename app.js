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
      // Только благодарность, тепло и любовь. Вопросы, зовущие рассказать
      // о плохом, тянут в пережёвывание — и уводят приложение не туда.
      prompts: [
        "За что ты сегодня благодарен?",
        "Что сегодня заставило тебя улыбнуться?",
        "Был ли кто-то добр к тебе на этой неделе?",
        "Какая мелочь порадовала тебя сегодня?",
        "За какую часть сегодняшнего дня ты благодарен?",
        "Что в твоей жизни прямо сейчас кажется надёжным?",
        "Какой момент тишины или покоя у тебя был недавно?",
        "Кому ты хотел бы сказать спасибо?",
        "Какое маленькое удовольствие у тебя было сегодня?",
        "Сделало ли твоё тело сегодня что-то для тебя — пусть самое обычное?",
        "Какое место дарит тебе спокойствие?",
        "Какую свою черту характера ты сегодня ценишь?",
        "Кого тебе было приятно увидеть на этой неделе?",
        "О ком ты сегодня подумал с теплом?",
        "Что в твоём доме тебе нравится больше всего?",
        "Какие слова, сказанные тебе, ты до сих пор помнишь?",
        "За что ты благодарен себе?",
        "Что тебя недавно рассмешило?",
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

      // Питомцу есть что рассказать: значок над головой, тап — карточка.
      taleNext: "дальше",
      taleDone: "спасибо",
      taleBadge: "У питомца есть что рассказать",

      // Яйцо ещё не вылупилось: мир только на слух и на ощупь.
      eggTales: [
        "Интересно... Как же выглядит мир снаружи? Мне он кажется очень большим. И ярко-жёлтого цвета!",
        "Как любопытно... Что-то всё время шуршит. Это я у тебя в кармане?",
        "Я иногда чувствую от тебя тепло. Благодарность. Это чувство меня делает сильнее.",
      ],

      // По стадиям вылупившегося питомца (0–4): чем старше, тем взрослее речь.
      // Внутри стадии истории идут вперемешку, без повторов подряд.
      awayTales: [
        [
          "Представляешь... Пока я ждал тебя тут на поляне, пошёл сильный дождь. Я весь промок и не знал куда спрятаться. Но затем дождь постепенно закончился... И там за тучами выглянуло солнышко! И потом радуга! Такая большая и красивая радуга! Это стоило того, чтобы промокнуть под дождём.",
          "Иногда я тут сплю, пока я тебя жду, и мне снятся сны. Вчера снилась клубничная ракета. Сегодня апельсиновая машинка. А однажды мне приснился ягодный самолёт! Интересно, такое бывает?",
          "Пока я тебя ждал, я сочинил стих. Кхм, кхм! Милые клубнички под солнцем, мягкие булочки в печке, а я сижу на травинке! Ну как? Хорошо? У меня получилось?",
        ],
        [
          "Я нашёл тут тропинку! Пошёл по ней и... она привела меня обратно сюда же. Оказывается, наша полянка круглая! Я проверил дважды, чтобы точно.",
          "Я считал облака. Одно было похоже на булочку, другое на кота, а третье вообще ни на что не похоже — но оно было самое красивое. Как думаешь, облакам обидно, когда их ни с чем не сравнивают?",
          "Я решил научиться свистеть. Пока получается только «пфффф». Но я тренируюсь каждый день! Скоро я тебе просвищу целую песню, вот увидишь.",
        ],
        [
          "Я подружился с жуком! Его зовут... ну, я зову его Жук, он не возражает. Он живёт под тем камнем и всё время куда-то спешит. Я спросил куда — он не сказал. Наверное, это секрет.",
          "Ночью тут загораются звёзды. Много-много! Я пробовал сосчитать, дошёл до двадцати и сбился. Начал заново — опять сбился. Кажется, их правда очень много.",
          "Я построил домик из веточек! Он маленький и немножко кривой, и в него никто не помещается, даже я. Но зато он мой. И вообще, он для жука.",
        ],
        [
          "Я обошёл всю полянку по краю. Она больше, чем кажется! И знаешь, что я заметил? Вон те цветы у пруда — их раньше не было. Они выросли, пока мы с тобой тут были.",
          "Утром вода в пруду розовая, днём голубая, а вечером совсем золотая. Я специально проверял в разное время. Одна и та же вода — а каждый раз другая. Как так?",
          "Я смотрел на наши вещи и вспоминал, откуда каждая. Вот это появилось, когда ты написал про маму. А это — когда про дождь. Получается, полянка помнит всё, что ты рассказывал.",
        ],
        [
          "Я сидел на самом высоком месте и смотрел вдаль. Там, за деревьями, тоже что-то есть — другие полянки, наверное, и другие деревья. Но мне нравится наша. Я бы не поменял.",
          "Знаешь, я заметил интересное. Когда ты пишешь про хорошее, оно как будто становится немножко больше. Не само по себе — а в тебе. Я это чувствую отсюда.",
          "Иногда я думаю: я ведь вырос из того яйца, которое ничего не знало о мире. А теперь у меня есть полянка, пруд, жук и ты. Это всё случилось просто потому, что ты приходил. Спасибо тебе.",
        ],
      ],

      // Вступление к находкам, когда человека не было долго.
      awayLong: "Меня долго не было слышно, а тут кое-что произошло.",

      memoryLines: [
        "А помнишь?",
        "Я тут кое-что вспомнил.",
        "Смотри, что ты когда-то написал.",
        "Это до сих пор где-то здесь.",
      ],
      memoryAgo: "написано",
      decoMemoryEmpty: "Эта запись убрана из дневника, но вещь осталась.",
      decoFrom: "появилась вместе с этой записью",

      exportTitle: "Твои записи — сохранить",
      exportHint: "Записи хранятся только в этом браузере. Если почистить его данные, они пропадут. Сохрани копию.",
      exportJson: "Файл для восстановления",
      exportTxt: "Просто почитать",
      exportCopy: "Скопировать",
      importBtn: "Восстановить из файла",
      copied: "Скопировано",
      importOk: "Записи восстановлены",
      importFail: "Не получилось прочитать файл",
      importConfirm: "Заменить всё, что сейчас есть, содержимым файла?",
    },

    en: {
      tabScene: "Meadow",
      tabJournal: "Entries",
      journalTitle: "Your entries",
      emptyState: "Your entries will appear here. Start with one — any one.",
      placeholder: "One line is enough, or write more — however you like...",
      otherQuestion: "Another question",
      thank: "Give thanks",
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
        "What part of today are you grateful for?",
        "What feels steady in your life right now?",
        "What quiet or peaceful moment have you had recently?",
        "Who would you like to thank?",
        "What small pleasure did you have today?",
        "Did your body do something for you today — even the most ordinary thing?",
        "What place gives you calm?",
        "Which of your own traits do you appreciate today?",
        "Who were you glad to see this week?",
        "Who did you think of warmly today?",
        "What do you like most about your home?",
        "Which words said to you do you still remember?",
        "What are you grateful to yourself for?",
        "What made you laugh recently?",
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

      taleNext: "next",
      taleDone: "thank you",
      taleBadge: "Your companion has something to tell you",

      eggTales: [
        "I wonder... What does the world outside look like? It feels very big to me. And bright yellow!",
        "How curious... Something keeps rustling. Am I in your pocket?",
        "Sometimes I feel warmth coming from you. Gratitude. That feeling makes me stronger.",
      ],

      awayTales: [
        [
          "Guess what... While I was waiting for you here in the meadow, it started pouring. I got soaked through and didn't know where to hide. But then the rain slowly stopped... And the sun came out from behind the clouds! And then a rainbow! Such a big, beautiful rainbow! It was worth getting soaked for.",
          "Sometimes I sleep here while I wait for you, and I have dreams. Yesterday I dreamt of a strawberry rocket. Today, an orange car. And once I dreamt of a berry aeroplane! Do you think that happens?",
          "While I was waiting, I made up a poem. Ahem, ahem! Sweet little strawberries under the sun, soft little buns in the oven, and me on a blade of grass! Well? Was it good? Did I do it right?",
        ],
        [
          "I found a path! I followed it and... it led me right back here. It turns out our meadow is round! I checked twice, just to be sure.",
          "I counted the clouds. One looked like a bun, another like a cat, and the third didn't look like anything at all — but it was the prettiest one. Do you think clouds mind when nobody compares them to something?",
          "I've decided to learn to whistle. So far all I manage is «pfffff». But I practise every day! Soon I'll whistle you a whole song, you'll see.",
        ],
        [
          "I made friends with a beetle! His name is... well, I call him Beetle, he doesn't mind. He lives under that stone and is always hurrying somewhere. I asked where — he wouldn't say. It must be a secret.",
          "At night the stars come out here. So many! I tried to count them, got to twenty and lost my place. Started again — lost it again. I think there really are a lot of them.",
          "I built a little house out of twigs! It's small and a bit crooked, and nobody fits inside, not even me. But it's mine. And anyway, it's for the beetle.",
        ],
        [
          "I walked the whole edge of the meadow. It's bigger than it looks! And do you know what I noticed? Those flowers by the pond — they weren't there before. They grew while you and I were here.",
          "In the morning the pond is pink, at noon it's blue, and in the evening it turns all golden. I checked at different times on purpose. The same water — different every time. How does it do that?",
          "I was looking at our things and remembering where each one came from. This one appeared when you wrote about your mum. And this one — when you wrote about the rain. So the meadow remembers everything you've told it.",
        ],
        [
          "I sat on the highest spot and looked far off. There's something out there beyond the trees too — other meadows, probably, and other trees. But I like ours. I wouldn't trade it.",
          "You know, I noticed something interesting. When you write about good things, they seem to grow a little bigger. Not on their own — inside you. I can feel it from here.",
          "Sometimes I think: I grew out of that egg that knew nothing about the world. And now I have a meadow, a pond, a beetle, and you. All of it happened simply because you kept coming. Thank you.",
        ],
      ],

      awayLong: "You hadn't been around for a while, and a few things happened.",

      memoryLines: [
        "Remember this?",
        "I just remembered something.",
        "Look what you wrote once.",
        "It's still here somewhere.",
      ],
      memoryAgo: "written",
      decoMemoryEmpty: "That entry was removed from the journal, but the thing stayed.",
      decoFrom: "arrived together with this entry",

      exportTitle: "Your entries — save a copy",
      exportHint: "Entries live only in this browser. Clearing its data removes them. Keep a copy.",
      exportJson: "File for restoring",
      exportTxt: "Just to read",
      exportCopy: "Copy",
      importBtn: "Restore from file",
      copied: "Copied",
      importOk: "Entries restored",
      importFail: "Couldn't read that file",
      importConfirm: "Replace everything you have now with the contents of the file?",
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
  const petBadgeEl = $("pet-badge");
  const taleOverlayEl = $("tale-overlay");
  const taleIntroEl = $("tale-intro");
  const taleTextEl = $("tale-text");
  const taleEntryEl = $("tale-entry");
  const taleEntryDateEl = $("tale-entry-date");
  const taleEntryPromptEl = $("tale-entry-prompt");
  const taleEntryTextEl = $("tale-entry-text");
  const taleNoteEl = $("tale-note");
  const taleNextBtn = $("tale-next");
  const importFileEl = $("import-file");

  let entries = loadEntries();
  let stats = loadStats();
  let settings = loadSettings();
  let currentPrompt = null;
  let messageTimer = null;
  let reactionRevertTimer = null;
  let messageOverrideUntil = 0;
  let onboardingStep = 0;
  const bags = { prompts: [] };

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
      lastVisit: null,
      // id ачивки -> id записи, написанной в момент её появления
      decoEntries: {},
      lastMemoryAt: null,
      // последние показанные воспоминания, чтобы не крутить одно и то же
      shownMemories: [],
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
    if (bags.prompts.length === 0) refillBag("prompts", currentPrompt);
    return bags.prompts.pop();
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

  // --- рассказы питомца -------------------------------------------------
  //
  // Две вещи приходят одним каналом: находки за время отсутствия и
  // воспоминания из дневника. Значок над головой один, очередь общая —
  // иначе на питомце висело бы два конкурирующих индикатора.
  //
  // Важное свойство: объём растёт вместе с длиной отсутствия. Вернуться
  // после месяца выгоднее, чем после трёх дней. Ничего не сгорает и не
  // истекает — не тапнули сегодня, дождётся завтра.

  const AWAY_MIN_GAP_DAYS = 2;
  const MEMORY_MIN_AGE_DAYS = 14;   // моложе — это ещё не воспоминание
  const MEMORY_COOLDOWN_DAYS = 3;   // чаще — перестаёт быть событием
  const MEMORY_HISTORY = 20;

  let taleQueue = [];
  let taleBag = [];
  let taleBagStage = -1;

  function stageIndex() {
    let idx = 0;
    STAGES.forEach((s, i) => { if (stats.lifetimeEntries >= s.min) idx = i; });
    return idx;
  }

  function awayTaleCount(gap) {
    if (gap >= 21) return 3;
    if (gap >= 7) return 2;
    return 1;
  }

  // idx === -1 — яйцо: у него свой набор, мир пока только на слух.
  function nextAwayTale(idx) {
    if (taleBagStage !== idx || taleBag.length === 0) {
      taleBagStage = idx;
      const all = t("awayTales");
      const list = idx < 0 ? t("eggTales") : all[idx] || all[0] || [];
      taleBag = [...list];
      for (let i = taleBag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [taleBag[i], taleBag[j]] = [taleBag[j], taleBag[i]];
      }
    }
    return taleBag.pop();
  }

  // Ветки тяжёлого дня в приложении больше нет, но у тех, кто успел ей
  // воспользоваться, такие записи лежат в дневнике с пометкой soft.
  // Вытаскивать их в «а помнишь?» нельзя — это ковыряние в ране без спроса.
  function eligibleMemories() {
    const old = entries.filter(
      (e) => !e.soft && daysSince(e.createdAt) >= MEMORY_MIN_AGE_DAYS
    );
    const shown = new Set(stats.shownMemories || []);
    const fresh = old.filter((e) => !shown.has(e.id));
    return fresh.length ? fresh : old;
  }

  function buildTaleQueue(gapDays) {
    taleQueue = [];
    if (!settings.started) return updateTaleBadge();

    if (gapDays >= AWAY_MIN_GAP_DAYS) {
      const idx = stats.hatched ? stageIndex() : -1;
      const count = awayTaleCount(gapDays);
      for (let i = 0; i < count; i++) {
        const text = nextAwayTale(idx);
        if (!text) break;
        taleQueue.push({
          text,
          intro: i === 0 && gapDays >= 7 ? t("awayLong") : null,
        });
      }
    }

    const cooled =
      !stats.lastMemoryAt || daysSince(stats.lastMemoryAt) >= MEMORY_COOLDOWN_DAYS;
    if (cooled) {
      const pool = eligibleMemories();
      if (pool.length) {
        taleQueue.push({ text: pick(t("memoryLines")), entry: pick(pool), isMemory: true });
      }
    }

    updateTaleBadge();
  }

  function updateTaleBadge() {
    const has = taleQueue.length > 0;
    petBadgeEl.hidden = !has;
    petBadgeEl.title = has ? t("taleBadge") : "";
  }

  function openNextTale() {
    if (!taleQueue.length) return;
    const tale = taleQueue.shift();

    if (tale.isMemory && tale.entry) {
      stats.lastMemoryAt = new Date().toISOString();
      stats.shownMemories = [...(stats.shownMemories || []), tale.entry.id].slice(-MEMORY_HISTORY);
      saveStats();
    }

    showTale(tale);
    updateTaleBadge();
  }

  function showTale(tale) {
    taleIntroEl.textContent = tale.intro || "";
    taleIntroEl.hidden = !tale.intro;

    taleTextEl.textContent = tale.text;

    if (tale.entry) {
      taleEntryDateEl.textContent = t("memoryAgo") + " " + formatDate(tale.entry.createdAt);
      taleEntryPromptEl.textContent = tale.entry.prompt || "";
      taleEntryTextEl.textContent = tale.entry.text;
      taleEntryEl.hidden = false;
    } else {
      taleEntryEl.hidden = true;
    }

    taleNoteEl.textContent = tale.note || "";
    taleNoteEl.hidden = !tale.note;

    taleNextBtn.textContent = taleQueue.length ? t("taleNext") : t("taleDone");
    taleOverlayEl.classList.add("open");

    // Воспоминание — тихий момент, салют тут не к месту.
    petReact(false, false, !!tale.isMemory || !!tale.entry);
  }

  function closeTale() {
    taleOverlayEl.classList.remove("open");
  }

  // Тап по предмету на полянке достаёт запись, вместе с которой он появился.
  function showDecoMemory(ach) {
    const entryId = (stats.decoEntries || {})[ach.id];
    const entry =
      entryId != null ? entries.find((e) => String(e.id) === String(entryId)) : null;
    showTale({
      text: ach.icon + "  " + t("achievements")[ach.id],
      entry,
      note: entry ? t("decoFrom") : t("decoMemoryEmpty"),
    });
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
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "deco";
      btn.style.top = ach.pos.top + "%";
      btn.style.left = ach.pos.left + "%";
      btn.style.setProperty("--deco-scale", depthScale(ach.pos.top).toFixed(3));
      btn.title = t("achievements")[ach.id];
      btn.textContent = ach.icon;
      btn.addEventListener("click", () => showDecoMemory(ach));
      roomDecosEl.appendChild(btn);
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
      sayFor(pick(t("drinkMessages")), 6000);
      petReact(skipBounce, true);
      showToast(t("cocktailReady"));
    }, 750);

    setTimeout(() => {
      cocktailEl.classList.remove("glass-serving");
    }, 1500);
  }

  const REACTION_EMOJIS = ["✨", "💫", "⭐"];
  const CELEBRATION_EMOJIS = ["✨", "💖", "⭐", "🌟", "💫"];

  // calm — тихая реакция без салюта: воспоминание не повод для фейерверка.
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

  // --- сохранение записей ----------------------------------------------
  //
  // Записи живут только в localStorage. Человек ведёт дневник полгода,
  // чистит данные браузера — и всё исчезает. Поэтому копия обязательна.
  // JSON нужен, чтобы вернуть всё обратно; txt — чтобы просто перечитать.

  function buildTxt() {
    if (!entries.length) return "";
    return entries
      .map((e) => {
        const head = formatDate(e.createdAt);
        const q = e.prompt ? e.prompt + "\n" : "";
        return head + "\n" + q + e.text + "\n";
      })
      .join("\n" + "—".repeat(24) + "\n\n");
  }

  function buildJson() {
    return JSON.stringify(
      { app: "teplo", format: 1, exportedAt: new Date().toISOString(), entries, stats, settings },
      null,
      2
    );
  }

  function saveFile(text, name, mime) {
    const blob = new Blob([text], { type: mime + ";charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  function stamp() {
    return new Date().toISOString().slice(0, 10);
  }

  function copyEntries() {
    const text = buildTxt();
    if (!text) return;
    // На айфоне скачивание файла работает коряво — там выручает буфер.
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        () => showToast(t("copied")),
        () => fallbackCopy(text)
      );
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); showToast(t("copied")); } catch (e) {}
    ta.remove();
  }

  function importFromFile(file) {
    const reader = new FileReader();
    reader.onload = () => {
      let data;
      try {
        data = JSON.parse(reader.result);
      } catch (e) {
        return showToast(t("importFail"));
      }
      if (!data || !Array.isArray(data.entries)) return showToast(t("importFail"));
      if (!confirm(t("importConfirm"))) return;

      entries = data.entries;
      if (data.stats) stats = Object.assign(defaultStats(), data.stats);
      if (data.settings) settings = Object.assign(defaultSettings(), data.settings);
      saveEntries();
      saveStats();
      saveSettings();
      showToast(t("importOk"));
      setTimeout(() => location.reload(), 700);
    };
    reader.onerror = () => showToast(t("importFail"));
    reader.readAsText(file);
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
    saveBtn.textContent = t("thank");
    $("inventory-title").textContent = t("inventoryTitle");
    $("inventory-hint").textContent = t("inventoryHint");
    $("inventory-close").textContent = t("close");
    inventoryBtn.title = t("inventoryTitle");
    $("export-title").textContent = t("exportTitle");
    $("export-hint").textContent = t("exportHint");
    $("export-json").textContent = t("exportJson");
    $("export-txt").textContent = t("exportTxt");
    $("export-copy").textContent = t("exportCopy");
    $("import-btn").textContent = t("importBtn");
    document.querySelectorAll("#lang-mini button").forEach((b) => {
      b.classList.toggle("active", b.dataset.lang === settings.lang);
    });
    updateTaleBadge();
  }

  function setLanguage(lang) {
    settings.lang = lang;
    saveSettings();
    bags.prompts = [];
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
    if (settings.onboarded && !settings.started) return hatchStart();
    // Тап по питомцу — причина открыть приложение в день, когда писать не хочется.
    if (taleQueue.length) openNextTale();
  });

  petBadgeEl.addEventListener("click", (e) => {
    e.stopPropagation();
    openNextTale();
  });

  taleNextBtn.addEventListener("click", () => {
    closeTale();
    if (taleQueue.length) setTimeout(openNextTale, 260);
  });

  taleOverlayEl.addEventListener("click", (e) => {
    if (e.target === taleOverlayEl) closeTale();
  });

  $("export-json").addEventListener("click", () => saveFile(buildJson(), `teplo-${stamp()}.json`, "application/json"));
  $("export-txt").addEventListener("click", () => saveFile(buildTxt(), `teplo-${stamp()}.txt`, "text/plain"));
  $("export-copy").addEventListener("click", copyEntries);
  $("import-btn").addEventListener("click", () => importFileEl.click());
  importFileEl.addEventListener("change", () => {
    const file = importFileEl.files && importFileEl.files[0];
    if (file) importFromFile(file);
    importFileEl.value = "";
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
      setPrompt(nextPrompt());
      langScreenEl.classList.add("hidden");
      startOnboarding();
    });
  });

  newPromptBtn.addEventListener("click", () => setPrompt(nextPrompt()));

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

    const entry = { id: Date.now(), text, prompt: currentPrompt, createdAt: now, ingredient: ingredient.emoji };
    entries.push(entry);
    saveEntries();

    stats.lifetimeEntries += 1;
    const words = countWords(text);
    if (words > stats.maxWordsInEntry) stats.maxWordsInEntry = words;
    if (!stats.promptsAnswered.includes(currentPrompt)) stats.promptsAnswered.push(currentPrompt);
    if (previous && diffDaysBetween(previous.createdAt, now) >= 7) stats.hadComeback = true;

    stats.glass = [...(stats.glass || []), { emoji: ingredient.emoji, color: ingredient.color }].slice(-GLASS_SIZE);

    const justHatched = updateHatchStatus() || (!wasHatched && stats.hatched);
    const newlyUnlocked = computeNewlyUnlocked();
    // Предмет запоминает запись, вместе с которой появился: тап по нему
    // на полянке потом достанет её обратно.
    if (!stats.decoEntries) stats.decoEntries = {};
    for (const ach of newlyUnlocked) stats.decoEntries[ach.id] = entry.id;
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

  // Разрыв считаем до того, как отметиться о заходе.
  const gapDays = stats.lastVisit ? daysSince(stats.lastVisit) : 0;
  stats.lastVisit = new Date().toISOString();

  const justHatchedOnLoad = updateHatchStatus();
  saveStats();

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

  buildTaleQueue(gapDays);
})();
