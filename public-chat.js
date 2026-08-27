(function initializePublicChat() {
  const appState = window.WBState;
  const telegram = window.Telegram?.WebApp;
  const chatInstances = [...document.querySelectorAll('.public-chat')];

  if (!chatInstances.length) return;

  const publicChatUsers = [
    { name: 'Антон', color: '#7a55d8' },
    { name: 'Викуся', color: '#dd6c93' },
    { name: 'Марина', color: '#41b98d' },
    { name: 'Дмитрий', color: '#4c9ed9' },
    { name: 'Алёна', color: '#db8a40' },
    { name: 'Сергей', color: '#9670d8' },
    { name: 'Олеся', color: '#d26d8e' },
    { name: 'Кирилл', color: '#3fae9a' },
    { name: 'Настя', color: '#e18b58' },
    { name: 'Андрей', color: '#5f91d9' },
    { name: 'Юля', color: '#b46fc9' },
    { name: 'Максим', color: '#55a984' },
    { name: 'Татьяна', color: '#d07b68' },
    { name: 'Иван', color: '#6b7fd0' },
    { name: 'Ольга', color: '#c38b48' },
    { name: 'Артём', color: '#4aa1b7' },
    { name: 'Лиза', color: '#d66aa9' },
    { name: 'Николай', color: '#7e9e62' },
    { name: 'Кристина', color: '#a36bd0' },
    { name: 'Павел', color: '#d28b61' },
    { name: 'Вика', color: '#5798c8' },
    { name: 'Роман', color: '#5cae83' },
    { name: 'Вы', color: '#6749c5' },
  ];

  const publicChatMessagePool = [
    { author: 'Антон', text: 'Привет всем. Я выиграл большой выигрыш!' },
    { author: 'Викуся', text: 'Вааау. Я тоже выиграла! Айфон!!!' },
    { author: 'Марина', text: 'Девочки, мне только что 15 000 на карту пришли! Я в шоке 😱' },
    { author: 'Дмитрий', text: 'А мне 8500 капнуло. Спасибо, реально работает!' },
    { author: 'Алёна', text: 'Первый раз кручу — и сразу выигрыш. Это вообще законно? 🤣' },
    { author: 'Сергей', text: 'Менеджер Виктория ответила за 2 минуты, реквизиты приняла, жду перевод' },
    { author: 'Олеся', text: 'УРА!!! 25 000 рублей! Мужу пока не говорю 🙈' },
    { author: 'Кирилл', text: 'Ребят, тут реально без обмана? Уже бабушке рассказал' },
    { author: 'Настя', text: 'Всем удачи! 🍀' },
    { author: 'Андрей', text: 'Всем привет, как успехи?' },
    { author: 'Юля', text: 'Получила свои деньги на Сбер за 12 минут. Подтверждаю 💸' },
    { author: 'Максим', text: 'Поймал множитель х3, теперь думаю на что потратить 🔥' },
    { author: 'Татьяна', text: 'Девочки, кто ещё не крутил — крутите! Я в декрете, любая копейка в радость' },
    { author: 'Иван', text: 'Сначала думал развод, потом решил попробовать. Пришло 6700 ₽ на Тинькофф ✅' },
    { author: 'Ольга', text: 'Айфон не выиграла, но 12 тысяч получила. Тоже неплохо)' },
    { author: 'Артём', text: 'Парни, кто-нибудь по СБП получал? Быстро доходит?' },
    { author: 'Лиза', text: 'Только что подтвердила реквизиты. Менеджер очень вежливый ❤️' },
    { author: 'Николай', text: 'Третья попытка — третий выигрыш. Везёт же 😎' },
    { author: 'Кристина', text: 'Мама не верила, пока скрин с банка не показала 😅' },
    { author: 'Павел', text: 'Спасибо организаторам, реально выручили перед зарплатой' },
    { author: 'Вика', text: 'Аааа, попался джекпот!!! Не могу поверить 🎉🎉🎉' },
    { author: 'Роман', text: 'Снял уже на ВТБ. Всё чётко, без комиссии' },
    { author: 'Антон', text: 'ТОП!!!' },
    { author: 'Викуся', text: 'Второй раз участвую, опять в плюсе. Пока работает — пользуюсь 👍' },
    { author: 'Марина', text: 'Спасибо, очень быстрая обработка заявки?' },
    { author: 'Дмитрий', text: 'Приятный менеджер))' },
    { author: 'Алёна', text: 'Вывела на карту, все прошло успешно!' },
    { author: 'Олеся', text: 'Спасибо вам большое, выручили!' },
    { author: 'Кирилл', text: 'На третий раз — третий выигрыш. Везёт!' },
    { author: 'Настя', text: 'Желаю всем успеха 🌿' },
    { author: 'Андрей', text: 'Спасибо организаторам.' },
    { author: 'Юля', text: 'Благодарю, пойду обрадую маму.' },
  ];

  const savedChat = appState?.get()?.chat || {};
  const currentPublicChatTime = () => new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date());

  const normalizeMessage = (message) => {
    if (!message || typeof message !== 'object') return null;
    const author = String(message.author || '').trim();
    const text = String(message.text || '').trim();
    if (!author || !text) return null;
    return {
      author,
      text,
      time: String(message.time || currentPublicChatTime()),
      isUser: Boolean(message.isUser),
    };
  };

  const savedMessages = Array.isArray(savedChat.publicMessages)
    ? savedChat.publicMessages.map(normalizeMessage).filter(Boolean).slice(-50)
    : [];
  const publicChatVisibleMessages = savedMessages.length
    ? savedMessages
    : publicChatMessagePool.slice(0, 1).map((message) => ({
      ...message,
      time: currentPublicChatTime(),
      isUser: false,
    }));
  let publicChatDemoQueue = publicChatMessagePool.filter((message) =>
    !publicChatVisibleMessages.some((visibleMessage) =>
      visibleMessage.author === message.author && visibleMessage.text === message.text,
    ),
  );
  let scrollSaveTimer = null;
  let messageTimer = null;

  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  })[character]);

  const findUser = (name) => publicChatUsers.find((user) => user.name === name) || publicChatUsers[0];

  const getActiveMessagesElement = () => {
    const visibleInstance = chatInstances.find((instance) => instance.getClientRects().length);
    return visibleInstance?.querySelector('.public-chat-messages') || chatInstances[0].querySelector('.public-chat-messages');
  };

  const savePublicChatState = () => {
    if (!appState) return;
    const activeMessages = getActiveMessagesElement();
    appState.update((state) => {
      state.chat = {
        ...state.chat,
        publicMessages: publicChatVisibleMessages.slice(-50),
        publicChatScrollTop: activeMessages?.scrollTop || 0,
      };
    });
  };

  const renderPublicChat = ({ restoreScroll = false } = {}) => {
    const messageMarkup = publicChatVisibleMessages.map((message) => {
      const user = findUser(message.author);
      const author = escapeHtml(user.name);
      const initial = escapeHtml(user.name.charAt(0).toUpperCase());
      const text = escapeHtml(message.text);
      const time = escapeHtml(message.time || currentPublicChatTime());
      const avatar = '<span class="public-chat-message-avatar" style="--avatar-color: ' + user.color + '" aria-hidden="true">' + initial + '</span>';
      const bubble = '<div class="public-chat-bubble"><strong>' + author + '</strong><p>' + text + '</p><time>' + time + '</time></div>';
      return '<article class="public-chat-message' + (message.isUser ? ' public-chat-message-user' : '') + '">' +
        (message.isUser ? bubble + avatar : avatar + bubble) +
      '</article>';
    }).join('');

    const savedScrollValue = Number(appState?.get()?.chat?.publicChatScrollTop);
    const hasSavedScroll = Number.isFinite(savedScrollValue);
    chatInstances.forEach((instance) => {
      const mode = instance.querySelector('.public-chat-mode');
      const onlineCount = appState?.get()?.chat?.publicOnlineCount || 1125;
      if (mode) mode.textContent = 'тестовая аудитория · ' + onlineCount;
      const messages = instance.querySelector('.public-chat-messages');
      if (messages) messages.innerHTML = messageMarkup;
      window.requestAnimationFrame(() => {
        if (!messages) return;
        messages.scrollTop = restoreScroll && hasSavedScroll
          ? Math.max(0, savedScrollValue)
          : messages.scrollHeight;
      });
    });
  };

  const restorePublicChatScroll = () => {
    const savedScrollValue = Number(appState?.get()?.chat?.publicChatScrollTop);
    if (!Number.isFinite(savedScrollValue)) return;
    window.requestAnimationFrame(() => {
      const activeMessages = getActiveMessagesElement();
      if (activeMessages) activeMessages.scrollTop = Math.max(0, savedScrollValue);
    });
  };

  const addPublicChatMessage = (author, text, isUser = false) => {
    const cleanText = String(text || '').trim();
    if (!cleanText) return;
    publicChatVisibleMessages.push({ author, text: cleanText, time: currentPublicChatTime(), isUser });
    if (publicChatVisibleMessages.length > 50) publicChatVisibleMessages.shift();
    renderPublicChat();
    savePublicChatState();
  };

  const schedulePublicChatMessage = () => {
    window.clearTimeout(messageTimer);
    const delay = 4500 + Math.floor(Math.random() * 3001);
    messageTimer = window.setTimeout(() => {
      if (!publicChatDemoQueue.length) publicChatDemoQueue = [...publicChatMessagePool];
      const messageIndex = Math.floor(Math.random() * publicChatDemoQueue.length);
      const [message] = publicChatDemoQueue.splice(messageIndex, 1);
      if (message) addPublicChatMessage(message.author, message.text);
      schedulePublicChatMessage();
    }, delay);
  };

  if (appState && !Number.isInteger(savedChat.publicOnlineCount)) {
    appState.update((state) => {
      state.chat = {
        ...state.chat,
        publicOnlineCount: 1000 + Math.floor(Math.random() * 501),
      };
    });
  }

  renderPublicChat({ restoreScroll: true });

  chatInstances.forEach((instance) => {
    const composer = instance.querySelector('.public-chat-composer');
    const input = instance.querySelector('.public-chat-input');
    const messages = instance.querySelector('.public-chat-messages');

    composer?.addEventListener('submit', (event) => {
      event.preventDefault();
      const text = input?.value.trim();
      if (!text) return;
      addPublicChatMessage('Вы', text, true);
      if (input) input.value = '';
      input?.focus();
      telegram?.HapticFeedback?.impactOccurred('light');
    });

    messages?.addEventListener('scroll', () => {
      window.clearTimeout(scrollSaveTimer);
      scrollSaveTimer = window.setTimeout(savePublicChatState, 150);
    });
  });

  window.addEventListener('pagehide', savePublicChatState);
  const screenObserver = new MutationObserver(restorePublicChatScroll);
  screenObserver.observe(document.body, { attributes: true, attributeFilter: ['hidden', 'class'], subtree: true });
  schedulePublicChatMessage();
})();
