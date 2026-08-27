const telegram = window.Telegram?.WebApp;
const nameInput = document.querySelector('#display-name');
const acceptButton = document.querySelector('#accept-button');

telegram?.ready();
telegram?.expand();
if (telegram?.setHeaderColor) telegram.setHeaderColor('#f5f6fa');
if (telegram?.setBackgroundColor) telegram.setBackgroundColor('#f5f6fa');

const telegramUser = telegram?.initDataUnsafe?.user;
const fallbackName = 'Участник';
const telegramName = [telegramUser?.first_name, telegramUser?.last_name].filter(Boolean).join(' ');
const appState = window.WBState;
const savedProfile = appState?.get()?.profile || {};
appState?.resumeIfNeeded('index');
nameInput.value = savedProfile.name || telegramName || telegramUser?.username || fallbackName;

acceptButton.addEventListener('click', () => {
  const name = nameInput.value.trim();
  if (!name) {
    nameInput.focus();
    return;
  }
  nameInput.value = name;
  const profile = {
    telegramId: telegramUser?.id ?? null,
    name,
    username: telegramUser?.username ?? null,
  };
  appState?.setProfile(profile);
  appState?.setRoute('index2', 'survey');
  appState?.recordAction('profile_saved', { name });
  try {
    localStorage.setItem('wbGiveawayProfile', JSON.stringify(profile));
  } catch (error) {
    console.warn('Профиль не удалось сохранить локально:', error);
  }
  telegram?.HapticFeedback?.notificationOccurred('success');
  window.location.href = 'index2.html';
});
