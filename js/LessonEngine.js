const LessonEngine = {
  _lessons: [],
  _worlds: [],
  _quizzes: [],
  _current: null,
  _stepIndex: 0,

  async load() {
    const [lessons, worlds, quizzes] = await Promise.all([
      fetch('data/lessons.json').then(r => r.json()),
      fetch('data/worlds.json').then(r => r.json()),
      fetch('data/quizzes.json').then(r => r.json()),
    ]);
    this._lessons = lessons;
    this._worlds = worlds;
    this._quizzes = quizzes;
    this._syncWorldUnlocks();
  },

  start(lessonId) {
    const lesson = this._lessons.find(l => l.id === lessonId);
    if (!lesson) return;

    if (lesson.type === 'boss') {
      this._startBoss(lesson);
      return;
    }

    this._current = lesson;
    this._stepIndex = 0;
    document.dispatchEvent(new CustomEvent('lesson:started', { detail: { lesson } }));
    this._dispatchStep();
  },

  next() {
    if (!this._current) return;
    this._stepIndex++;

    if (this._stepIndex >= this._current.steps.length) {
      this._complete();
    } else {
      this._dispatchStep();
    }
  },

  isCompleted(lessonId) {
    return State.get().completedLessons.includes(lessonId);
  },

  getWorlds() {
    return this._worlds;
  },

  getForWorld(worldId) {
    return this._lessons.filter(l => l.worldId === worldId);
  },

  getStagesForWorld(worldId) {
    const world = this._worlds.find(w => w.id === worldId);
    return world ? (world.stages || []) : [];
  },

  getForStage(worldId, stageId) {
    return this._lessons.filter(l => l.worldId === worldId && l.stageId === stageId);
  },

  _startBoss(lesson) {
    const quiz = this._quizzes.find(q => q.id === lesson.quizId);
    if (!quiz) return;

    document.addEventListener('quiz:completed', () => {
      const player = State.get();
      if (!player.completedLessons.includes(lesson.id)) {
        State.set({ completedLessons: [...player.completedLessons, lesson.id] });
        this._checkStageComplete(lesson.worldId, lesson.stageId);
        this._checkWorldUnlock(lesson.worldId);
      }
      document.dispatchEvent(new CustomEvent('lesson:completed', { detail: { lesson } }));
    }, { once: true });

    QuizEngine.start(quiz);
  },

  _dispatchStep() {
    document.dispatchEvent(new CustomEvent('lesson:step', {
      detail: {
        step: this._current.steps[this._stepIndex],
        progress: { current: this._stepIndex + 1, total: this._current.steps.length },
      },
    }));
  },

  _complete() {
    const lesson = this._current;
    const player = State.get();

    if (!player.completedLessons.includes(lesson.id)) {
      XP.gainXp(lesson.xpReward);
      State.set({ completedLessons: [...player.completedLessons, lesson.id] });
      this._checkStageComplete(lesson.worldId, lesson.stageId);
      this._checkWorldUnlock(lesson.worldId);
    }

    this._current = null;
    this._stepIndex = 0;
    document.dispatchEvent(new CustomEvent('lesson:completed', { detail: { lesson } }));
  },

  _checkStageComplete(worldId, stageId) {
    const player = State.get();
    const stageLessons = this._lessons.filter(l => l.worldId === worldId && l.stageId === stageId);
    const allDone = stageLessons.length > 0 && stageLessons.every(l => player.completedLessons.includes(l.id));
    if (!allDone) return;
    document.dispatchEvent(new CustomEvent('stage:completed', { detail: { worldId, stageId } }));
  },

  _checkWorldUnlock(worldId) {
    const player = State.get();
    const worldLessons = this._lessons.filter(l => l.worldId === worldId);
    const allDone = worldLessons.length > 0 && worldLessons.every(l => player.completedLessons.includes(l.id));
    if (!allDone) return;

    const nextWorld = this._worlds.find(w => w.unlockRequirement && w.unlockRequirement.worldId === worldId);
    if (!nextWorld || player.unlockedWorlds.includes(nextWorld.id)) return;

    State.set({ unlockedWorlds: [...player.unlockedWorlds, nextWorld.id] });
  },

  // Fixes unlockedWorlds for saves that predate the unlock system.
  _syncWorldUnlocks() {
    const player = State.get();
    const toUnlock = [];

    this._worlds.forEach(world => {
      if (!world.unlockRequirement) return;
      if (player.unlockedWorlds.includes(world.id)) return;

      const req = world.unlockRequirement;
      const srcLessons = this._lessons.filter(l => l.worldId === req.worldId);
      const allDone = srcLessons.length > 0 && srcLessons.every(l => player.completedLessons.includes(l.id));
      if (allDone) toUnlock.push(world.id);
    });

    if (toUnlock.length > 0) {
      State.set({ unlockedWorlds: [...player.unlockedWorlds, ...toUnlock] });
    }
  },
};
