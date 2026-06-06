const LessonEngine = {
  _lessons: [],
  _current: null,
  _stepIndex: 0,

  async load() {
    const res = await fetch('data/lessons.json');
    this._lessons = await res.json();
  },

  start(lessonId) {
    const lesson = this._lessons.find(l => l.id === lessonId);
    if (!lesson) return;

    if (lesson.type === 'boss') {
      console.warn(`Boss battle "${lessonId}" not yet implemented`);
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

  getForWorld(worldId) {
    return this._lessons.filter(l => l.worldId === worldId);
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
    }

    this._current = null;
    this._stepIndex = 0;
    document.dispatchEvent(new CustomEvent('lesson:completed', { detail: { lesson } }));
  },
};
