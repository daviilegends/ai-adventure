async function initApp() {
  State.init();
  await LessonEngine.load();
  Home.init();
  LessonScreen.init();
  QuizScreen.init();
}

initApp();
