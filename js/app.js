async function initApp() {
  State.init();
  await Promise.all([LessonEngine.load(), BossEngine.load()]);
  await AchievementService.load();
  Home.init();
  LessonScreen.init();
  QuizScreen.init();
  BossScreen.init();
  AchievementsScreen.init();
  Animations.init();
}

initApp();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js');
  });
}
