const Home = {
  _view: 'home',

  init() {
    this.render();
    document.addEventListener('xp:gained', () => this.render());
    document.addEventListener('lesson:completed', () => this.render());
    this._wireNav();
  },

  _wireNav() {
    document.querySelectorAll('.nav-btn[data-nav]').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.nav;
        if (target !== 'home' && target !== 'map') return;
        this._view = target;
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('nav-btn--active'));
        btn.classList.add('nav-btn--active');
        this.render();
      });
    });
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
      mapEl.classList.toggle('world-map--home', this._view === 'home');
      mapEl.innerHTML = this._view === 'map'
        ? this._renderMap(player)
        : this._renderHomeView(player);
      this._wireNodes();
    }
  },

  _renderHomeView(player) {
    const worlds = LessonEngine.getWorlds();
    const current = this._findCurrentWorld(player, worlds);
    if (!current) return '';
    return this._renderWorld(current, player, worlds);
  },

  _findCurrentWorld(player, worlds) {
    const unlocked = worlds.filter(w => player.unlockedWorlds.includes(w.id));
    for (const world of unlocked) {
      const nodes = LessonEngine.getForWorld(world.id);
      if (nodes.some(n => !player.completedLessons.includes(n.id))) return world;
    }
    return unlocked[unlocked.length - 1] || null;
  },

  _renderMap(player) {
    const worlds = LessonEngine.getWorlds();
    return worlds.map(world => this._renderWorld(world, player, worlds)).join('');
  },

  _renderWorld(world, player, worlds) {
    const isUnlocked = player.unlockedWorlds.includes(world.id);
    const num = String(world.id).padStart(2, '0');
    const accentRgb = world.accentRgb || '79,142,240';
    const allNodes = LessonEngine.getForWorld(world.id);
    const completedCount = allNodes.filter(n => player.completedLessons.includes(n.id)).length;
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
            <span class="world-progress">${completedCount} / ${allNodes.length}</span>
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
      const prevStage = allStages.find(s => s.order === stage.order - 1);
      const lockMsg = prevStage
        ? `Complete Stage ${prevStage.order}: ${prevStage.title} to unlock`
        : 'Locked';

      return `
        <div class="world-stage world-stage--locked">
          <div class="stage-header">Stage ${stage.order}: ${stage.title}</div>
          <p class="stage-locked-msg">
            ${this._svgLock()}
            ${lockMsg}
          </p>
        </div>`;
    }

    const nodes = LessonEngine.getNodesForStage(world.id, stage.order);
    return `
      <div class="world-stage">
        ${showHeader ? `<div class="stage-header">Stage ${stage.order}: ${stage.title}</div>` : ''}
        <div class="stage-nodes">
          ${this._renderNodes(nodes, player.completedLessons)}
        </div>
      </div>`;
  },

  _isStageAvailable(worldId, stage, allStages, player) {
    if (stage.order === 1) return true;
    const priorStages = allStages.filter(s => s.order < stage.order);
    return priorStages.every(ps => {
      const psNodes = LessonEngine.getNodesForStage(worldId, ps.order);
      return psNodes.every(n => player.completedLessons.includes(n.id));
    });
  },

  _renderNodes(nodes, completedLessons) {
    let foundActive = false;

    const badgeLabels = {
      lesson:    { active: 'learn',      completed: 'done',    locked: 'locked' },
      challenge: { active: 'try',        completed: 'done',    locked: 'locked' },
      puzzle:    { active: 'solve',      completed: 'done',    locked: 'locked' },
      miniboss:  { active: 'checkpoint', completed: 'cleared', locked: 'locked' },
      boss:      { active: 'battle',     completed: 'cleared', locked: 'locked' },
    };

    return nodes.map(node => {
      let state;
      if (completedLessons.includes(node.id)) {
        state = 'completed';
      } else if (!foundActive) {
        foundActive = true;
        state = 'active';
      } else {
        state = 'locked';
      }

      const type = node.type || 'lesson';
      const labels = badgeLabels[type] || badgeLabels.lesson;
      const rowClass = `lesson-row lesson-row--${state} lesson-row--${type}`;
      const disabled = state === 'locked' ? 'disabled' : '';
      const badge = labels[state];

      const dot = state === 'completed'
        ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`
        : '';

      return `
        <div class="${rowClass}">
          <div class="lesson-row__dot">${dot}</div>
          <button class="lesson-row__btn" data-node-id="${node.id}" ${disabled}>
            <span class="lesson-row__title">${node.title}</span>
            <span class="lesson-row__badge">${badge}</span>
          </button>
        </div>`;
    }).join('');
  },

  _svgLock() {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;
  },

  _wireNodes() {
    document.querySelectorAll('.lesson-row__btn[data-node-id]').forEach(btn => {
      btn.addEventListener('click', () => LessonEngine.start(btn.dataset.nodeId));
    });
    this._scrollToActive();
  },

  _scrollToActive() {
    const active = document.querySelector('.lesson-row--active');
    if (active) active.scrollIntoView({ behavior: 'smooth', block: 'center' });
  },
};
