const CACHE_NAME = 'ai-adventure-v1';

const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './css/main.css',
  './js/state.js',
  './js/xp.js',
  './js/LessonEngine.js',
  './js/QuizEngine.js',
  './js/BossEngine.js',
  './js/Animations.js',
  './js/app.js',
  './js/achievements/AchievementStorage.js',
  './js/achievements/AchievementEvents.js',
  './js/achievements/AchievementConditions.js',
  './js/achievements/AchievementService.js',
  './js/screens/home.js',
  './js/screens/lesson.js',
  './js/screens/quiz.js',
  './js/screens/boss.js',
  './js/screens/profile.js',
  './js/screens/achievements.js',
  './data/worlds.json',
  './data/stages.json',
  './data/lessons.json',
  './data/challenges.json',
  './data/quizzes.json',
  './data/puzzles.json',
  './data/minibosses.json',
  './data/bosses.json',
  './data/achievements.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request).then((response) => {
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        }
        return response;
      }).catch(() => cached);
    })
  );
});
