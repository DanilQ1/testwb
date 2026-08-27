const telegram = window.Telegram?.WebApp;
const appState = window.WBState;

telegram?.ready();
telegram?.expand();
if (telegram?.setHeaderColor) telegram.setHeaderColor('#f5f6fa');
if (telegram?.setBackgroundColor) telegram.setBackgroundColor('#f5f6fa');
window.scrollTo(0, 0);

appState?.resumeIfNeeded('index2');
const surveyCount = document.querySelector('#survey-count');
const surveyQuestion = document.querySelector('#survey-question');
const surveyOptions = document.querySelector('#survey-options');
const finalModal = document.querySelector('#final-modal');
const participateButton = document.querySelector('#participate-button');
const surveyClickSound = new Audio('sounds/click.mp3');
surveyClickSound.preload = 'auto';
const savedSurvey = appState?.get()?.survey || {};
const surveyQuestions = [
  {
    question: 'Как часто вы совершаете покупки на Wildberries?',
    options: ['Ежедневно', 'Раз в неделю', 'Редко'],
  },
  {
    question: 'Что для вас важнее при выборе товара у продавца?',
    options: ['Рейтинг', 'Отзывы', 'Цена'],
  },
  {
    question: 'Как вы оцениваете качество товаров в каталоге?',
    options: ['Отлично', 'Нормально', 'Плохо'],
  },
  {
    question: 'Для покупок вы используете сайт или приложение?',
    options: ['Только приложение', 'Только сайт', 'Оба варианта'],
  },
  {
    question: 'Порекомендуете Wildberries своим друзьям?',
    options: ['Точно да', 'Возможно', 'Нет'],
  },
];

let currentQuestion = Math.min(
  surveyQuestions.length,
  Math.max(1, Number(savedSurvey.question) || (Array.isArray(savedSurvey.answers) ? savedSurvey.answers.length + 1 : 1)),
);
let answers = Array.isArray(savedSurvey.answers) ? [...savedSurvey.answers] : [];
let answerPending = false;

function playSurveyClickSound() {
  surveyClickSound.currentTime = 0;
  const playback = surveyClickSound.play();
  playback?.catch(() => {});
}

function renderQuestion() {
  const current = surveyQuestions[currentQuestion - 1];
  if (!current || !surveyQuestion || !surveyOptions || !surveyCount) return;

  surveyCount.textContent = currentQuestion + '/5';
  surveyQuestion.textContent = current.question;
  surveyOptions.innerHTML = current.options.map((option) =>
    '<button class="survey-option" type="button"><span>' + option + '</span><i aria-hidden="true">✓</i></button>'
  ).join('');
}

function showFinalModal() {
  if (!finalModal) return;
  finalModal.hidden = false;
  document.body.classList.add('modal-open');
}

renderQuestion();
if (savedSurvey.completed || answers.length >= surveyQuestions.length) {
  currentQuestion = surveyQuestions.length;
  showFinalModal();
}

surveyOptions?.addEventListener('click', (event) => {
  const option = event.target.closest('.survey-option');
  if (!option || answerPending) return;

  answerPending = true;
  option.classList.add('selected');
  playSurveyClickSound();
  surveyOptions.querySelectorAll('.survey-option').forEach((button) => {
    button.disabled = true;
  });

  const answer = option.querySelector('span').textContent.trim();
  answers[currentQuestion - 1] = answer;
  const isLastQuestion = currentQuestion === surveyQuestions.length;
  const nextQuestion = isLastQuestion ? surveyQuestions.length : currentQuestion + 1;
  appState?.setSurvey({
    answers: [...answers],
    question: nextQuestion,
    completed: isLastQuestion,
  });
  appState?.setRoute('index2', isLastQuestion ? 'survey-complete' : 'survey');
  appState?.recordAction('survey_answer', { question: currentQuestion, answer });
  telegram?.HapticFeedback?.selectionChanged();

  window.setTimeout(() => {
    answerPending = false;
    if (isLastQuestion) {
      showFinalModal();
      telegram?.HapticFeedback?.notificationOccurred('success');
      return;
    }

    currentQuestion = nextQuestion;
    renderQuestion();
  }, 220);
});

participateButton?.addEventListener('click', () => {
  telegram?.HapticFeedback?.impactOccurred('medium');
  appState?.setRoute('index3', 'wheel');
  appState?.recordAction('participation_started');
  window.location.href = 'index3.html';
});
