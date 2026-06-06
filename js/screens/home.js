const Home = {
  init() {
    this.render();
    document.addEventListener('xp:gained', () => this.render());
    document.addEventListener('lesson:completed', () => this.render());
  },

  render() {
    const player = State.get();
    const { level, xp, threshold, percent } = XP.calculate(player.xp);

    const nameEl = document.querySelector('.player-name');
    const titleEl = document.querySelector('.player-title');
    const fillEl = document.querySelector('.xp-bar__fill');
    const labelEl = document.querySelector('.xp-bar__label');
    const badgeEl = document.querySelector('.player-level-badge');

    if (nameEl) nameEl.textContent = player.name;
    if (titleEl) titleEl.textContent = `AI Learner · Level ${level}`;
    if (fillEl) fillEl.style.width = `${Math.round(percent * 100)}%`;
    if (labelEl) labelEl.textContent = `${xp} / ${threshold} XP`;
    if (badgeEl) badgeEl.textContent = level;

    const statVals = document.querySelectorAll('.player-stat .player-stat__val');
    if (statVals[0]) statVals[0].textContent = player.completedLessons.length;
    if (statVals[1]) statVals[1].textContent = player.streak;
    if (statVals[2]) statVals[2].textContent = player.xp;

    const mapEl = document.querySelector('.world-map');
    if (mapEl) {
      mapEl.innerHTML = this._renderMap(player);
      this._wireNodes();
    }
  },

  _renderMap(player) {
    const worlds = LessonEngine.getWorlds();
    return worlds.map(world => this._renderWorld(world, player, worlds)).join('');
  },

  _renderWorld(world, player, worlds) {
    const isUnlocked = player.unlockedWorlds.includes(world.id);
    const num = String(world.id).padStart(2, '0');
    const accentRgb = world.accentRgb || '79,142,240';
    const lessons = LessonEngine.getForWorld(world.id);
    const completedCount = lessons.filter(l => player.completedLessons.includes(l.id)).length;
    const worldClass = `world world--w${world.id}${isUnlocked ? '' : ' world--locked'}`;
    const inlineStyle = `style="--world-accent-rgb: ${accentRgb}"`;

    if (!isUnlocked) {
      const req = world.unlockRequirement;
      const prevWorld = req ? worlds.find(w => w.id === req.worldId) : null;
      const lockMsg = prevWorld ? `Complete ${prevWorld.title} to unlock` : 'Locked';

      return `
        <section class="${worldClass}" ${inlineStyle}>
          <div class="world-header" data-world="${num}">
            <div class="world-header__row">
              <span class="world-badge">World ${world.id}</span>
            </div>
            <h2 class="world-title">${world.title}</h2>
            <p class="world-desc">${world.description}</p>
            <p class="world-locked-msg">
              ${this._svgLock()}
              ${lockMsg}
            </p>
          </div>
        </section>`;
    }

    const stages = LessonEngine.getStagesForWorld(world.id);
    const stagesHtml = stages.map(stage => this._renderStage(world, stage, stages, player)).join('');

    return `
      <section class="${worldClass}" ${inlineStyle}>
        <div class="world-header" data-world="${num}">
          <div class="world-header__row">
            <span class="world-badge">World ${world.id}</span>
            <span class="world-progress">${completedCount} / ${lessons.length}</span>
          </div>
          <h2 class="world-title">${world.title}</h2>
          <p class="world-desc">${world.description}</p>
        </div>
        <div class="world-path">
          ${stagesHtml}
        </div>
      </section>`;
  },

  _renderStage(world, stage, allStages, player) {
    const isAvailable = this._isStageAvailable(world.id, stage, allStages, player);
    const showHeader = allStages.length > 1;

    if (!isAvailable) {
      const prevStage = allStages.find(s => s.id === stage.id - 1);
      const lockMsg = prevStage
        ? `Complete Stage ${prevStage.id}: ${prevStage.title} to unlock`
        : 'Locked';

      return `
        <div class="world-stage world-stage--locked">
          <div class="stage-header">Stage ${stage.id}: ${stage.title}</div>
          <p class="stage-locked-msg">
            ${this._svgLock()}
            ${lockMsg}
          </p>
        </div>`;
    }

    const lessons = LessonEngine.getForStage(world.id, stage.id);
    return `
      <div class="world-stage">
        ${showHeader ? `<div class="stage-header">Stage ${stage.id}: ${stage.title}</div>` : ''}
        <div class="stage-nodes">
          ${this._renderNodes(lessons, player.completedLessons)}
        </div>
      </div>`;
  },

  _isStageAvailable(worldId, stage, allStages, player) {
    if (stage.id === 1) return true;
    const priorStages = allStages.filter(s => s.id < stage.id);
    return priorStages.every(ps => {
      const psLessons = LessonEngine.getForStage(worldId, ps.id);
      return psLessons.every(l => player.completedLessons.includes(l.id));
    });
  },

  _renderNodes(lessons, completedLessons) {
    const sorted = [...lessons].sort((a, b) => a.order - b.order);
    let foundActive = false;

    return sorted.map(lesson => {
      let state;
      if (completedLessons.includes(lesson.id)) {
        state = 'completed';
      } else if (!foundActive) {
        foundActive = true;
        state = 'active';
      } else {
        state = 'locked';
      }

      const isBoss = lesson.type === 'boss';
      const nodeClass = `path-node node--${state}${isBoss ? ' node--boss' : ''}`;
      const disabled = state === 'locked' ? 'disabled' : '';
      const labelClass = isBoss ? 'node-label node-label--boss' : 'node-label';

      return `
        <div class="${nodeClass}">
          <button class="node-btn" data-lesson-id="${lesson.id}" ${disabled}>
            ${this._nodeIcon(state, isBoss)}
          </button>
          <span class="${labelClass}">${lesson.title}</span>
        </div>`;
    }).join('');
  },

  _nodeIcon(state, isBoss) {
    if (state === 'completed') {
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`;
    }
    if (isBoss && state !== 'locked') {
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 4l5 7.5 5-5.5 5 5.5 5-7.5v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4z"/></svg>`;
    }
    if (state === 'active') {
      return `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="6 3 20 12 6 21 6 3"/></svg>`;
    }
    return this._svgLock();
  },

  _svgLock() {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;
  },

  _wireNodes() {
    document.querySelectorAll('.node-btn[data-lesson-id]').forEach(btn => {
      btn.addEventListener('click', () => LessonEngine.start(btn.dataset.lessonId));
    });
  },
};
