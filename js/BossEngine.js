const BossEngine = {
  _bosses: [],
  _minibosses: [],
  _current: null,
  _challengeIndex: 0,
  _answers: [],

  async load() {
    const [bosses, minibosses] = await Promise.all([
      fetch('data/bosses.json').then(r => r.json()),
      fetch('data/minibosses.json').then(r => r.json()),
    ]);
    this._bosses = bosses;
    this._minibosses = minibosses;
  },

  getById(id) {
    return this._bosses.find(b => b.id === id) || this._minibosses.find(b => b.id === id) || null;
  },

  start(bossId) {
    const boss = this.getById(bossId);
    if (!boss) return;
    this._current = boss;
    this._challengeIndex = -1;
    this._answers = [];
    document.dispatchEvent(new CustomEvent('boss:started', { detail: { boss } }));
  },

  answer(isCorrect) {
    this._answers.push({ index: this._challengeIndex, correct: isCorrect });
  },

  next() {
    if (!this._current) return;
    this._challengeIndex++;

    if (this._challengeIndex >= this._current.challenges.length) {
      this._evaluate();
    } else {
      this._dispatchChallenge();
    }
  },

  _dispatchChallenge() {
    document.dispatchEvent(new CustomEvent('boss:challenge', {
      detail: {
        challenge: this._current.challenges[this._challengeIndex],
        progress: {
          current: this._challengeIndex + 1,
          total: this._current.challenges.length,
        },
      },
    }));
  },

  _evaluate() {
    const boss = this._current;
    const correct = this._answers.filter(a => a.correct).length;
    const total = boss.challenges.length;
    const pct = correct / total;
    const passed = pct >= boss.passThreshold;
    const stars = pct === 1 ? 3 : pct >= 0.8 ? 2 : passed ? 1 : 0;

    const result = { boss, correct, total, passed, stars };

    this._current = null;
    this._challengeIndex = 0;
    this._answers = [];

    if (passed) {
      this._grantRewards(boss, result);
      document.dispatchEvent(new CustomEvent('boss:completed', { detail: result }));
    } else {
      document.dispatchEvent(new CustomEvent('boss:failed', { detail: result }));
    }
  },

  _grantRewards(boss, result) {
    XP.gainXp(boss.xpReward);

    const player = State.get();
    const updates = {};

    if (boss.coinsReward) {
      updates.coins = player.coins + boss.coinsReward;
    }

    const prev = player.completedBosses[boss.id];
    updates.completedBosses = {
      ...player.completedBosses,
      [boss.id]: {
        completedAt: Date.now(),
        score: result.correct,
        total: result.total,
        stars: result.stars,
        attempts: prev ? prev.attempts + 1 : 1,
      },
    };

    State.set(updates);
  },
};
