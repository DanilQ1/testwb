(function initializeGiveawayState() {
  const telegram = window.Telegram?.WebApp;
  const telegramUser = telegram?.initDataUnsafe?.user;
  const telegramId = telegramUser?.id ?? null;
  const storageKey = 'wbGiveawayState:' + (telegramId ?? 'guest');
  const legacyProfileKey = 'wbGiveawayProfile';
  const legacyWinningsKey = 'wbGiveawayWinnings:' + (telegramId ?? 'guest');
  const now = () => new Date().toISOString();

  // Local testing helper: opening any page with ?reset=1 starts a clean demo.
  // It is intentionally limited to the app's own storage keys.
  const resetRequested = new URLSearchParams(window.location.search).get('reset') === '1';
  if (resetRequested) {
    Object.keys(localStorage)
      .filter((key) => key.startsWith('wbGiveaway'))
      .forEach((key) => localStorage.removeItem(key));

    // A direct reset link may point to index3.html (the last saved screen).
    // Redirect before page-specific scripts can write index3 back as the route.
    const currentPage = window.location.pathname.split('/').pop().toLowerCase();
    if (currentPage !== 'index.html') {
      window.location.replace('index.html');
      return;
    }
  }

  function readJson(key) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.warn('Состояние не удалось прочитать:', error);
      return null;
    }
  }

  function writeJson(value) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn('Состояние не удалось сохранить:', error);
      return false;
    }
  }

  function createDefaultState() {
    return {
      version: 1,
      createdAt: now(),
      updatedAt: now(),
      profile: {
        telegramId,
        name: [telegramUser?.first_name, telegramUser?.last_name].filter(Boolean).join(' '),
        username: telegramUser?.username ?? null,
      },
      route: {
        page: 'index',
        screen: 'welcome',
      },
      survey: {
        answers: [],
        question: 1,
        completed: false,
      },
      wheel: {
        currentSpin: 0,
        bonusRound: false,
        bonusNoneSpin: null,
        currentTrackIndex: 2,
        roundPrizeIds: [],
        bonusRoundWinnings: [],
        lastResult: null,
        lastPrize: null,
      },
      winnings: [],
      payout: {
        personalNumber: null,
      },
      money: {
        queuePosition: 5,
        ready: false,
      },
      warehouse: {
        status: 'idle',
        checkIndex: 0,
      },
      chat: {
        messageIndex: 0,
        consent: false,
        completed: false,
        publicMessages: [],
        publicChatScrollTop: 0,
        publicOnlineCount: null,
      },
      transferQueue: {
        participants: [],
        completed: false,
        countdownStartedAt: null,
      },
      actions: [],
    };
  }

  function migrateLegacyState() {
    const nextState = createDefaultState();
    const legacyProfile = readJson(legacyProfileKey);
    const legacyWinnings = readJson(legacyWinningsKey);

    if (legacyProfile && typeof legacyProfile === 'object') {
      nextState.profile = {
        ...nextState.profile,
        ...legacyProfile,
        telegramId,
      };
      nextState.route = { page: 'index3', screen: 'wheel' };
    }

    if (Array.isArray(legacyWinnings?.items)) {
      nextState.winnings = legacyWinnings.items;
      nextState.route = { page: 'index3', screen: 'wheel' };
    }

    return nextState;
  }

  function normalizeState(value) {
    const defaults = createDefaultState();
    if (!value || typeof value !== 'object') return defaults;

    return {
      ...defaults,
      ...value,
      profile: { ...defaults.profile, ...(value.profile || {}) },
      route: { ...defaults.route, ...(value.route || {}) },
      survey: { ...defaults.survey, ...(value.survey || {}) },
      wheel: { ...defaults.wheel, ...(value.wheel || {}) },
      payout: { ...defaults.payout, ...(value.payout || {}) },
      money: { ...defaults.money, ...(value.money || {}) },
      warehouse: { ...defaults.warehouse, ...(value.warehouse || {}) },
      chat: { ...defaults.chat, ...(value.chat || {}) },
      transferQueue: { ...defaults.transferQueue, ...(value.transferQueue || {}) },
      winnings: Array.isArray(value.winnings) ? value.winnings : [],
      actions: Array.isArray(value.actions) ? value.actions : [],
    };
  }

  let state = normalizeState(resetRequested ? null : (readJson(storageKey) || migrateLegacyState()));
  writeJson(state);

  function save() {
    state.updatedAt = now();
    writeJson(state);
    return state;
  }

  function update(patch) {
    if (typeof patch === 'function') {
      patch(state);
    } else if (patch && typeof patch === 'object') {
      state = normalizeState({ ...state, ...patch });
    }
    return save();
  }

  function recordAction(type, data = {}) {
    state.actions.push({ type, data, at: now() });
    if (state.actions.length > 100) state.actions = state.actions.slice(-100);
    return save();
  }

  window.WBState = {
    get: () => state,
    getStorageKey: () => storageKey,
    getTelegramUser: () => telegramUser,
    save,
    update,
    recordAction,
    setProfile(profile) {
      state.profile = { ...state.profile, ...profile, telegramId };
      return save();
    },
    setRoute(page, screen) {
      state.route = { page, screen };
      return save();
    },
    setSurvey(patch) {
      state.survey = { ...state.survey, ...patch };
      return save();
    },
    setWheel(patch) {
      state.wheel = { ...state.wheel, ...patch };
      return save();
    },
    setPayout(patch) {
      state.payout = { ...state.payout, ...patch };
      return save();
    },
    resumeIfNeeded(currentPage) {
      const page = state.route?.page;
      if (!page || page === currentPage) return false;
      const pageUrls = {
        index: 'index.html',
        index2: 'index2.html',
        index3: 'index3.html',
      };
      if (!pageUrls[page]) return false;
      window.location.replace(pageUrls[page]);
      return true;
    },
  };
})();
