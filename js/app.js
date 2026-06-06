async function initApp() {
  State.init();
  await Promise.all([LessonEngine.load(), BossEngine.load()]);
  Home.init();
  LessonScreen.init();
  QuizScreen.init();
  BossScreen.init();
}

initApp();
