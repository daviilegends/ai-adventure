const ACHIEVEMENTS_KEY = 'ai_adventure_achievements';

const AchievementStorage = {
  getUnlocked() {
    try {
      return JSON.parse(localStorage.getItem(ACHIEVEMENTS_KEY) || '{}');
    } catch {
      return {};
    }
  },

  unlock(id) {
    const data = this.getUnlocked();
    if (!data[id]) {
      data[id] = { unlockedAt: Date.now() };
      localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(data));
    }
  },

  isUnlocked(id) {
    return !!this.getUnlocked()[id];
  },

  reset() {
    localStorage.removeItem(ACHIEVEMENTS_KEY);
  },
};
