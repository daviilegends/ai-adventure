const AchievementService = {
  _achievements: [],

  async load() {
    this._achievements = await fetch('data/achievements.json').then(r => r.json());
    this._restoreUnlocked();
    this._listenToEvents();
  },

  isUnlocked(id) {
    return AchievementStorage.isUnlocked(id);
  },

  getAll() {
    const unlocked = AchievementStorage.getUnlocked();
    return this._achievements.map(a => ({
      ...a,
      unlocked: !!unlocked[a.id],
      unlockedAt: unlocked[a.id]?.unlockedAt || null,
    }));
  },

  getUnlocked() {
    return this.getAll().filter(a => a.unlocked);
  },

  // Manually unlock by id (for debugging or special events)
  unlock(id) {
    const achievement = this._achievements.find(a => a.id === id);
    if (achievement && !this.isUnlocked(id)) {
      this._unlock(achievement);
    }
  },

  _buildContext() {
    const player = State.get();
    const { level } = XP.calculate(player.xp);

    const nodeTypeCounts = { lesson: 0, challenge: 0, puzzle: 0, miniboss: 0, boss: 0 };
    player.completedLessons.forEach(nodeId => {
      const type = LessonEngine.getNodeType(nodeId);
      if (type && nodeTypeCounts[type] !== undefined) nodeTypeCounts[type]++;
    });

    const worlds = LessonEngine.getWorlds();
    const completedWorldIds = worlds
      .filter(w => {
        const allNodes = LessonEngine.getForWorld(w.id);
        return allNodes.length > 0 && allNodes.every(n => player.completedLessons.includes(n.id));
      })
      .map(w => w.id);

    return { player, level, nodeTypeCounts, completedWorldIds };
  },

  _checkAll(silent = false) {
    const context = this._buildContext();
    const unlocked = AchievementStorage.getUnlocked();

    this._achievements.forEach(achievement => {
      if (unlocked[achievement.id]) return;
      if (AchievementConditions.check(achievement.unlockCondition, context)) {
        this._unlock(achievement, silent);
      }
    });
  },

  _unlock(achievement, silent = false) {
    AchievementStorage.unlock(achievement.id);
    if (achievement.xpReward && !silent) {
      XP.gainXp(achievement.xpReward);
    }
    if (!silent) {
      document.dispatchEvent(new CustomEvent(AchievementEvents.UNLOCKED, {
        detail: { achievement },
      }));
    }
  },

  // Silent check on startup: unlock without notifications for pre-existing progress
  _restoreUnlocked() {
    this._checkAll(true);
  },

  _listenToEvents() {
    const check = () => this._checkAll();
    document.addEventListener('lesson:completed', check);
    document.addEventListener('boss:completed', check);
    document.addEventListener('world:unlocked', check);
    document.addEventListener('level:up', check);
    document.addEventListener('xp:gained', check);
  },
};
