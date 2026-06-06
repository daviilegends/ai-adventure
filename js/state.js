const STORAGE_KEY = 'ai_adventure_player';

const DEFAULT_STATE = {
  name: 'Apprentice',
  level: 1,
  xp: 0,
  coins: 0,
  streak: 0,
  completedLessons: [],
  unlockedWorlds: [1],
  createdAt: null,
  lastActiveAt: null,
};

const State = {
  _data: null,

  init() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      // Merge saved data over defaults so new fields are always present
      this._data = { ...DEFAULT_STATE, ...JSON.parse(saved) };
    } else {
      this._data = { ...DEFAULT_STATE, createdAt: Date.now(), lastActiveAt: Date.now() };
      this._save();
    }
  },

  get() {
    return { ...this._data };
  },

  set(updates) {
    this._data = { ...this._data, ...updates, lastActiveAt: Date.now() };
    this._save();
  },

  reset() {
    this._data = { ...DEFAULT_STATE, createdAt: Date.now(), lastActiveAt: Date.now() };
    this._save();
  },

  _save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._data));
    } catch {
      // Storage unavailable — state remains in memory only
    }
  },
};
