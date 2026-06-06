const Home = {
  init() {
    this.render();
    this._wireNodes();
    document.addEventListener('xp:gained', () => this.render());
  },

  _wireNodes() {
    document.querySelectorAll('.node-btn[data-lesson-id]').forEach(btn => {
      btn.addEventListener('click', () => LessonEngine.start(btn.dataset.lessonId));
    });
  },

  render() {
    const player = State.get();
    const { level, xp, threshold, percent } = XP.calculate(player.xp);

    const nameEl = document.querySelector('.player-name');
    const titleEl = document.querySelector('.player-title');
    const fillEl = document.querySelector('.xp-bar__fill');
    const labelEl = document.querySelector('.xp-bar__label');

    if (nameEl) nameEl.textContent = player.name;
    if (titleEl) titleEl.textContent = `AI Learner · Level ${level}`;
    if (fillEl) fillEl.style.width = `${Math.round(percent * 100)}%`;
    if (labelEl) labelEl.textContent = `${xp} / ${threshold} XP`;
  },
};
