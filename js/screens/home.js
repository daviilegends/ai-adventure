const Home = {
  _view: 'home',

  init() {
    this.render();
    document.addEventListener('xp:gained', () => this.render());
    document.addEventListener('lesson:completed', () => this.render());
    document.addEventListener(AchievementEvents.UNLOCKED, () => {
      if (this._view === 'home') this.render();
    });
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

    const nameEl   = document.querySelector('.player-name');
    const titleEl  = document.querySelector('.player-title');
    const fillEl   = document.querySelector('.xp-bar__fill');
    const labelEl  = document.querySelector('.xp-bar__label');
    const badgeEl  = document.querySelector('.player-level-badge');

    if (nameEl)  nameEl.textContent  = player.name;
    if (titleEl) titleEl.textContent = `AI Learner · Level ${level}`;
    if (fillEl)  fillEl.style.width  = `${Math.round(percent * 100)}%`;
    if (labelEl) labelEl.textContent = `${xp} / ${threshold} XP`;
    if (badgeEl) badgeEl.textContent = level;

    const statVals = document.querySelectorAll('.player-stat .player-stat__val');
    if (statVals[0]) statVals[0].textContent = player.completedLessons.length;
    if (statVals[1]) statVals[1].textContent = player.streak;
    if (statVals[2]) statVals[2].textContent = player.xp;

    const mapEl = document.querySelector('.world-map');
    if (!mapEl) return;

    mapEl.classList.toggle('world-map--home', this._view === 'home');
    mapEl.classList.toggle('world-map--map',  this._view === 'map');

    if (this._view === 'map') {
      mapEl.innerHTML = this._renderMap(player);
      this._wireMapCards();
      this._scrollToCurrentWorld();
    } else {
      mapEl.innerHTML = this._renderHomeView(player);
      this._wireHomeActions(player);
    }
  },

  // ================================================================
  // HOME DASHBOARD
  // ================================================================

  _renderHomeView(player) {
    const worlds     = LessonEngine.getWorlds();
    const nextItem   = this._findNextNode(player, worlds);
    const curWorld   = this._findCurrentWorld(player, worlds);
    const recentAchs = this._getRecentAchievements(3);

    return `
      ${this._renderContinueSection(nextItem)}
      ${curWorld ? this._renderWorldProgressSection(curWorld, player) : ''}
      ${recentAchs.length ? this._renderRecentAchievementsSection(recentAchs) : ''}
    `;
  },

  _findNextNode(player, worlds) {
    for (const world of worlds) {
      if (!player.unlockedWorlds.includes(world.id)) continue;
      const stages = LessonEngine.getStagesForWorld(world.id);
      for (const stage of stages) {
        if (!this._isStageAvailable(world.id, stage, stages, player)) continue;
        const nodes = LessonEngine.getNodesForStage(world.id, stage.order);
        for (const node of nodes) {
          if (!player.completedLessons.includes(node.id)) return { node, world, stage };
        }
      }
    }
    return null;
  },

  _findCurrentWorld(player, worlds) {
    const unlocked = worlds.filter(w => player.unlockedWorlds.includes(w.id));
    for (const world of unlocked) {
      const nodes = LessonEngine.getForWorld(world.id);
      if (nodes.some(n => !player.completedLessons.includes(n.id))) return world;
    }
    return unlocked[unlocked.length - 1] || null;
  },

  _renderContinueSection(nextItem) {
    if (!nextItem) {
      return `
        <div class="home-section">
          <div class="home-section__label">Continue Learning</div>
          <div class="home-all-done">
            <div class="home-all-done__icon">🎉</div>
            <div class="home-all-done__title">You're all caught up!</div>
            <div class="home-all-done__sub">Head to the Map to see your journey</div>
          </div>
        </div>`;
    }

    const { node, world, stage } = nextItem;
    const typeIcons  = { lesson:'🎓', challenge:'⚡', puzzle:'🧩', miniboss:'🥈', boss:'👑' };
    const typeLabels = { lesson:'Lesson', challenge:'Challenge', puzzle:'Puzzle', miniboss:'Checkpoint', boss:'Boss Battle' };

    return `
      <div class="home-section">
        <div class="home-section__label">Continue Learning</div>
        <button class="home-continue-card" data-node-id="${node.id}">
          <div class="home-continue-card__context">
            World ${world.id} · Stage ${stage.order}: ${stage.title}
          </div>
          <div class="home-continue-card__main">
            <div class="home-continue-card__icon">${typeIcons[node.type] || '🎓'}</div>
            <div class="home-continue-card__info">
              <div class="home-continue-card__title">${node.title}</div>
              <div class="home-continue-card__meta">${typeLabels[node.type] || 'Lesson'}</div>
            </div>
            <svg class="home-continue-card__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        </button>
      </div>`;
  },

  _renderWorldProgressSection(world, player) {
    const allNodes = LessonEngine.getForWorld(world.id);
    const doneCount = allNodes.filter(n => player.completedLessons.includes(n.id)).length;
    const pct = allNodes.length > 0 ? Math.round((doneCount / allNodes.length) * 100) : 0;

    const stages = LessonEngine.getStagesForWorld(world.id);
    let curStageLabel = '';
    for (const stage of stages) {
      if (!this._isStageAvailable(world.id, stage, stages, player)) break;
      const nodes = LessonEngine.getNodesForStage(world.id, stage.order);
      if (nodes.some(n => !player.completedLessons.includes(n.id))) {
        curStageLabel = `Stage ${stage.order}: ${stage.title}`;
        break;
      }
    }

    const icon      = this._worldIcon(world.id);
    const accentRgb = world.accentRgb || '79,142,240';

    return `
      <div class="home-section">
        <div class="home-section__label">Current World</div>
        <div class="home-world-card" style="--world-accent-rgb: ${accentRgb}">
          <div class="home-world-card__top">
            <div class="home-world-card__icon">${icon}</div>
            <div class="home-world-card__info">
              <div class="home-world-card__name">World ${world.id}: ${world.title}</div>
              ${curStageLabel ? `<div class="home-world-card__stage">${curStageLabel}</div>` : ''}
            </div>
            <div class="home-world-card__frac">${doneCount}/${allNodes.length}</div>
          </div>
          <div class="home-world-card__bar">
            <div class="home-world-card__fill" style="width:${pct}%"></div>
          </div>
        </div>
      </div>`;
  },

  _renderRecentAchievementsSection(achs) {
    const items = achs.map(a => `
      <div class="home-ach-item">
        <span class="home-ach-item__icon">${a.icon}</span>
        <div class="home-ach-item__body">
          <div class="home-ach-item__title">${a.title}</div>
          <div class="home-ach-item__date">${this._fmtDate(a.unlockedAt)}</div>
        </div>
      </div>`).join('');

    return `
      <div class="home-section">
        <div class="home-section__head">
          <div class="home-section__label">Recent Achievements</div>
          <button class="home-section__link" data-nav-link="achievements">View All →</button>
        </div>
        <div class="home-ach-list">${items}</div>
      </div>`;
  },

  _getRecentAchievements(count) {
    if (typeof AchievementService === 'undefined') return [];
    const all      = AchievementService._achievements || [];
    const stored   = AchievementStorage.getUnlocked();
    return all
      .filter(a => stored[a.id])
      .map(a => ({ ...a, unlockedAt: stored[a.id].unlockedAt }))
      .sort((a, b) => b.unlockedAt - a.unlockedAt)
      .slice(0, count);
  },

  _fmtDate(ts) {
    return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  },

  _wireHomeActions(player) {
    const continueCard = document.querySelector('.home-continue-card[data-node-id]');
    if (continueCard) {
      continueCard.addEventListener('click', () => LessonEngine.start(continueCard.dataset.nodeId));
    }
    const achLink = document.querySelector('[data-nav-link="achievements"]');
    if (achLink) {
      achLink.addEventListener('click', () => {
        const achBtn = document.querySelector('.nav-btn[data-nav="achievements"]');
        if (achBtn) achBtn.click();
      });
    }
  },

  // ================================================================
  // VISUAL MAP  (isometric island layout)
  // ================================================================

  // Pixel positions [left, top] for each world island on a 360px wide canvas
  _MAP_POS: {
    1:  [15,   20],
    2:  [195,  100],
    3:  [195,  265],
    4:  [15,   330],
    5:  [15,   490],
    6:  [195,  450],
    7:  [15,   625],
    8:  [113,  645],
    9:  [203,  625],
    10: [15,   800],
    11: [195,  800],
    12: [113,  960],
  },

  // Island card is 140px wide, art is 90px tall, card is 65px → center at (+70, +82)
  _MAP_CENTER(id) {
    const pos = this._MAP_POS[id];
    return pos ? [pos[0] + 70, pos[1] + 82] : [0, 0];
  },

  _renderMap(player) {
    const worlds     = LessonEngine.getWorlds();
    const curWorld   = this._findCurrentWorld(player, worlds);
    const curWorldId = curWorld ? curWorld.id : -1;

    const pathsSvg = this._renderWorldPaths(worlds, player, curWorldId);
    const islands  = worlds.map(w => this._renderIsland(w, player, curWorldId)).join('');

    return `
      <div class="map-island-view">
        ${pathsSvg}
        ${islands}
      </div>`;
  },

  _renderWorldPaths(worlds, player, curWorldId) {
    // Precompute status for coloring
    const statusOf = {};
    worlds.forEach(w => { statusOf[w.id] = this._worldStatus(w, player, curWorldId); });

    // Bezier segment data: [from, to, cp1, cp2]
    const segments = [
      [1,  2,  [185, 100], [265, 135]],
      [2,  3,  [285, 220], [285, 285]],
      [3,  4,  [265, 410], [85,  330]],
      [4,  5,  [55,  455], [55,  525]],
      [5,  6,  [185, 490], [195, 460]],
      [6,  7,  [265, 625], [85,  625]],
      [7,  8,  [125, 680], [148, 700]],
      [8,  9,  [218, 700], [250, 700]],
      [9,  10, [275, 810], [85,  810]],
      [10, 11, [175, 850], [175, 860]],
      [11, 12, [265, 970], [183, 970]],
    ];

    const paths = segments.map(([fromId, toId, cp1, cp2]) => {
      const [fx, fy] = this._MAP_CENTER(fromId);
      const [tx, ty] = this._MAP_CENTER(toId);
      const done     = statusOf[fromId] === 'completed';
      const color    = done ? '#7E8C54' : '#2A343E';
      const opacity  = done ? '1' : '0.6';
      return `<path d="M${fx},${fy} C${cp1[0]},${cp1[1]} ${cp2[0]},${cp2[1]} ${tx},${ty}"
                stroke="${color}" stroke-width="3" stroke-dasharray="10 7"
                stroke-linecap="round" fill="none" opacity="${opacity}"/>`;
    }).join('\n');

    return `
      <svg class="map-paths-svg" viewBox="0 0 360 1130" width="360" height="1130"
           xmlns="http://www.w3.org/2000/svg">
        ${paths}
      </svg>`;
  },

  _renderIsland(world, player, curWorldId) {
    const pos       = this._MAP_POS[world.id];
    if (!pos)       return '';
    const [left, top] = pos;
    const status    = this._worldStatus(world, player, curWorldId);
    const accentRgb = world.accentRgb || '79,142,240';
    const icon      = this._worldIcon(world.id);
    const num       = String(world.id).padStart(2, '0');
    const isLocked  = status === 'locked';
    const isDone    = status === 'completed';
    const isCur     = status === 'current';

    const allNodes  = LessonEngine.getForWorld(world.id);
    const doneCount = allNodes.filter(n => player.completedLessons.includes(n.id)).length;
    const pct = !isLocked && allNodes.length > 0
      ? Math.round((doneCount / allNodes.length) * 100) : 0;

    // Avatar label above the island (current world only)
    const avatarHtml = isCur ? `
      <div class="island-you">
        <div class="island-you__dot"></div>
        <span>You are here</span>
        <div class="island-you__avatar">🤖</div>
      </div>` : '';

    // Lock overlay
    const lockHtml = isLocked
      ? `<div class="island-lock">${this._svgLock()}</div>` : '';

    // Progress (current world shows bar + %, others just %)
    const progressHtml = !isLocked ? `
      <div class="island-card__footer">
        ${isCur ? `
          <div class="island-pct-bar">
            <div class="island-pct-bar__fill" style="width:${pct}%"></div>
          </div>` : ''}
        <span class="island-pct-label">${pct}%</span>
      </div>` : '';

    // Status icon on card
    const svgCheck = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" width="12" height="12"><polyline points="20 6 9 17 4 12"/></svg>`;
    const statusIcon = isDone
      ? `<span class="island-card__check">${svgCheck}</span>`
      : isLocked
      ? `<span class="island-card__lock-icon">${this._svgLock()}</span>`
      : '';

    const clickAttr = !isLocked ? `data-world-id="${world.id}"` : '';

    return `
      <div class="map-island map-island--${status} map-island--w${world.id}"
           style="left:${left}px; top:${top}px; --world-accent-rgb:${accentRgb}"
           ${clickAttr}>
        ${avatarHtml}
        <div class="island-art">
          <div class="island-art__inner">${icon}</div>
          ${lockHtml}
        </div>
        <div class="island-card">
          <div class="island-card__row">
            <span class="island-card__num">WORLD ${num}</span>
            ${statusIcon}
          </div>
          <div class="island-card__name">${world.title}</div>
          ${progressHtml}
        </div>
      </div>`;
  },

  _worldStatus(world, player, curWorldId) {
    if (!player.unlockedWorlds.includes(world.id)) return 'locked';
    if (world.id === curWorldId) return 'current';
    const all = LessonEngine.getForWorld(world.id);
    if (all.length > 0 && all.every(n => player.completedLessons.includes(n.id))) return 'completed';
    return 'current';
  },

  _worldIcon(worldId) {
    const icons = {

      // AI Foundations — neural network nodes
      1: `<svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="22" cy="11" r="4.5" fill="currentColor"/>
        <circle cx="11" cy="33" r="4.5" fill="currentColor"/>
        <circle cx="33" cy="33" r="4.5" fill="currentColor"/>
        <circle cx="22" cy="23.5" r="3" fill="currentColor" opacity="0.4"/>
        <line x1="22" y1="15.5" x2="14" y2="29.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.45"/>
        <line x1="22" y1="15.5" x2="30" y2="29.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.45"/>
        <line x1="15.5" y1="33" x2="28.5" y2="33" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.35"/>
      </svg>`,

      // Prompt Engineering — wand + star
      2: `<svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 35L28 16" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
        <path d="M31 8l1.7 5.2H38l-4.4 3.2 1.7 5.2L31 18.6l-4.3 3 1.7-5.2L24 13.2h5.3z" fill="currentColor"/>
        <circle cx="13" cy="25" r="2" fill="currentColor" opacity="0.45"/>
        <circle cx="8.5" cy="17" r="1.5" fill="currentColor" opacity="0.32"/>
        <circle cx="18" cy="12" r="1.5" fill="currentColor" opacity="0.28"/>
      </svg>`,

      // Automation Basics — gear
      3: `<svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="19" y="6"  width="6" height="7" rx="2" fill="currentColor"/>
        <rect x="19" y="31" width="6" height="7" rx="2" fill="currentColor"/>
        <rect x="6"  y="19" width="7" height="6" rx="2" fill="currentColor"/>
        <rect x="31" y="19" width="7" height="6" rx="2" fill="currentColor"/>
        <circle cx="22" cy="22" r="10" stroke="currentColor" stroke-width="2" fill="currentColor" opacity="0.12"/>
        <circle cx="22" cy="22" r="4.5" fill="currentColor"/>
      </svg>`,

      // Playwright Fundamentals — browser window + play
      4: `<svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="5" y="9" width="34" height="26" rx="4" stroke="currentColor" stroke-width="2" fill="currentColor" opacity="0.1"/>
        <line x1="5" y1="17" x2="39" y2="17" stroke="currentColor" stroke-width="2" opacity="0.5"/>
        <circle cx="11" cy="13" r="2" fill="currentColor" opacity="0.55"/>
        <circle cx="17" cy="13" r="2" fill="currentColor" opacity="0.55"/>
        <path d="M18 22l11 5.5L18 33z" fill="currentColor"/>
      </svg>`,

      // JavaScript Essentials — code brackets
      5: `<svg viewBox="0 0 44 44" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 11L7 22L15 33"/>
        <path d="M29 11L37 22L29 33"/>
        <path d="M27 9L17 35"/>
      </svg>`,

      // Advanced Playwright — city skyline
      6: `<svg viewBox="0 0 44 44" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <rect x="5"  y="25" width="8"  height="15" rx="1" opacity="0.5"/>
        <rect x="14" y="16" width="9"  height="24" rx="1" opacity="0.9"/>
        <rect x="24" y="21" width="8"  height="19" rx="1" opacity="0.7"/>
        <rect x="33" y="28" width="7"  height="12" rx="1" opacity="0.45"/>
        <rect x="16" y="20" width="2"  height="2"  rx="0.3" opacity="0.3"/>
        <rect x="20" y="20" width="2"  height="2"  rx="0.3" opacity="0.3"/>
        <rect x="16" y="24" width="2"  height="2"  rx="0.3" opacity="0.3"/>
        <rect x="20" y="24" width="2"  height="2"  rx="0.3" opacity="0.3"/>
      </svg>`,

      // API Testing — two endpoints + arrows
      7: `<svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="10" cy="22" r="6" fill="currentColor" opacity="0.8"/>
        <circle cx="34" cy="22" r="6" fill="currentColor" opacity="0.8"/>
        <path d="M16 18.5h12" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.6"/>
        <path d="M28 25.5H16" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.6"/>
        <path d="M26 16.5l2 2-2 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M18 23.5l-2 2 2 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`,

      // AI Agents — robot head
      8: `<svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="9" y="13" width="26" height="20" rx="5" stroke="currentColor" stroke-width="2" fill="currentColor" opacity="0.14"/>
        <circle cx="17" cy="22" r="3.5" fill="currentColor"/>
        <circle cx="27" cy="22" r="3.5" fill="currentColor"/>
        <path d="M16 29.5h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.4"/>
        <line x1="22" y1="13" x2="22" y2="9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <circle cx="22" cy="7.5" r="2.5" fill="currentColor"/>
        <path d="M9 22H5M35 22h4" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.4"/>
      </svg>`,

      // MCP Mastery — chain nodes
      9: `<svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="11" cy="22" r="6.5" fill="currentColor" opacity="0.65"/>
        <circle cx="22" cy="22" r="6.5" fill="currentColor"/>
        <circle cx="33" cy="22" r="6.5" fill="currentColor" opacity="0.65"/>
        <path d="M17.5 22h1M25.5 22h1" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" opacity="0.5"/>
        <circle cx="11" cy="22" r="2.5" fill="currentColor" opacity="0.4" style="mix-blend-mode:overlay"/>
        <circle cx="22" cy="22" r="2.5" fill="currentColor" opacity="0.3" style="mix-blend-mode:overlay"/>
        <circle cx="33" cy="22" r="2.5" fill="currentColor" opacity="0.4" style="mix-blend-mode:overlay"/>
      </svg>`,

      // Software Architecture — blueprint grid + core
      10: `<svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="8" width="28" height="28" rx="3" stroke="currentColor" stroke-width="2" fill="currentColor" opacity="0.08"/>
        <line x1="8"  y1="17.5" x2="36" y2="17.5" stroke="currentColor" stroke-width="1" opacity="0.38"/>
        <line x1="8"  y1="26.5" x2="36" y2="26.5" stroke="currentColor" stroke-width="1" opacity="0.38"/>
        <line x1="17.5" y1="8" x2="17.5" y2="36" stroke="currentColor" stroke-width="1" opacity="0.38"/>
        <line x1="26.5" y1="8" x2="26.5" y2="36" stroke="currentColor" stroke-width="1" opacity="0.38"/>
        <rect x="14" y="14" width="16" height="16" rx="2" fill="currentColor" opacity="0.22"/>
        <circle cx="22" cy="22" r="4.5" fill="currentColor"/>
      </svg>`,

      // AI Productivity — rocket
      11: `<svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22 6C22 6 32 13 32 25L22 31 12 25C12 13 22 6 22 6Z" fill="currentColor" opacity="0.18" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
        <path d="M22 6C22 6 27.5 11 27.5 19L22 22 16.5 19C16.5 11 22 6 22 6Z" fill="currentColor"/>
        <circle cx="22" cy="23.5" r="3" stroke="currentColor" stroke-width="2" fill="currentColor" opacity="0.18"/>
        <path d="M15 29C12 31 11 36 13 38C15 36 15.5 33.5 18 35C19 32 18 30 19.5 28.5" fill="currentColor" opacity="0.5"/>
        <path d="M29 29C32 31 33 36 31 38C29 36 28.5 33.5 26 35C25 32 26 30 24.5 28.5" fill="currentColor" opacity="0.5"/>
      </svg>`,

      // AI Adventure Master Path — crown
      12: `<svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 34V25L15 15L22 22L29 15L37 25V34Z" fill="currentColor" opacity="0.18" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
        <rect x="7" y="32" width="30" height="5" rx="1.5" fill="currentColor"/>
        <circle cx="22" cy="20.5" r="3.5" fill="currentColor"/>
        <circle cx="15" cy="16"   r="2.5" fill="currentColor" opacity="0.75"/>
        <circle cx="29" cy="16"   r="2.5" fill="currentColor" opacity="0.75"/>
      </svg>`,
    };

    return `<span class="island-icon-wrap">${icons[worldId] || icons[1]}</span>`;
  },

  _wireMapCards() {
    document.querySelectorAll('.map-island[data-world-id]').forEach(el => {
      el.addEventListener('click', () => {
        const worldId = parseInt(el.dataset.worldId, 10);
        this._openWorldDrawer(worldId, State.get());
      });
    });
  },

  _scrollToCurrentWorld() {
    requestAnimationFrame(() => {
      const cur = document.querySelector('.map-island--current');
      if (cur) cur.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  },

  // ================================================================
  // WORLD DETAIL DRAWER
  // ================================================================

  _openWorldDrawer(worldId, player) {
    this._closeWorldDrawer();

    const world = LessonEngine.getWorlds().find(w => w.id === worldId);
    if (!world) return;

    const drawer = document.createElement('div');
    drawer.id        = 'world-drawer';
    drawer.className = 'world-drawer';
    drawer.innerHTML = `
      <div class="world-drawer__overlay" id="drawer-overlay"></div>
      <div class="world-drawer__panel" id="drawer-panel">
        <div class="world-drawer__handle"></div>
        <div class="world-drawer__header" style="--world-accent-rgb: ${world.accentRgb || '79,142,240'}">
          <div class="world-drawer__title-row">
            <span class="world-drawer__icon">${this._worldIcon(world.id)}</span>
            <div>
              <div class="world-drawer__num">World ${String(world.id).padStart(2,'0')}</div>
              <div class="world-drawer__name">${world.title}</div>
            </div>
          </div>
          <button class="world-drawer__close" id="drawer-close" aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="world-drawer__content">
          ${this._renderDrawerStages(world, player)}
        </div>
      </div>`;

    document.getElementById('app').appendChild(drawer);

    document.getElementById('drawer-overlay').addEventListener('click', () => this._closeWorldDrawer());
    document.getElementById('drawer-close').addEventListener('click',   () => this._closeWorldDrawer());

    drawer.querySelectorAll('.lesson-row__btn[data-node-id]:not(:disabled)').forEach(btn => {
      btn.addEventListener('click', () => {
        this._closeWorldDrawer();
        LessonEngine.start(btn.dataset.nodeId);
      });
    });
  },

  _closeWorldDrawer() {
    const drawer = document.getElementById('world-drawer');
    if (!drawer) return;
    const panel   = document.getElementById('drawer-panel');
    const overlay = document.getElementById('drawer-overlay');
    if (panel)   panel.classList.add('world-drawer__panel--exit');
    if (overlay) overlay.classList.add('world-drawer__overlay--exit');
    setTimeout(() => { if (drawer.parentNode) drawer.remove(); }, 280);
  },

  _renderDrawerStages(world, player) {
    const stages = LessonEngine.getStagesForWorld(world.id);
    if (stages.length === 0) {
      return '<p class="drawer-empty">Content coming soon.</p>';
    }
    return stages.map(s => this._renderStage(world, s, stages, player)).join('');
  },

  // ================================================================
  // SHARED STAGE / NODE RENDERING  (used by drawer)
  // ================================================================

  _renderStage(world, stage, allStages, player) {
    const isAvailable = this._isStageAvailable(world.id, stage, allStages, player);
    const showHeader  = allStages.length > 1;

    if (!isAvailable) {
      const prev = allStages.find(s => s.order === stage.order - 1);
      return `
        <div class="world-stage world-stage--locked">
          <div class="stage-header">Stage ${stage.order}: ${stage.title}</div>
          <p class="stage-locked-msg">
            ${this._svgLock()}
            ${prev ? `Complete Stage ${prev.order}: ${prev.title} to unlock` : 'Locked'}
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
    return allStages
      .filter(s => s.order < stage.order)
      .every(ps => {
        const nodes = LessonEngine.getNodesForStage(worldId, ps.order);
        return nodes.every(n => player.completedLessons.includes(n.id));
      });
  },

  _renderNodes(nodes, completedLessons) {
    let foundActive = false;

    const badgeLabels = {
      lesson:   { active:'learn',      completed:'done',    locked:'locked' },
      challenge:{ active:'try',        completed:'done',    locked:'locked' },
      puzzle:   { active:'solve',      completed:'done',    locked:'locked' },
      miniboss: { active:'checkpoint', completed:'cleared', locked:'locked' },
      boss:     { active:'battle',     completed:'cleared', locked:'locked' },
    };

    return nodes.map(node => {
      let state;
      if (completedLessons.includes(node.id))   state = 'completed';
      else if (!foundActive) { foundActive = true; state = 'active'; }
      else                                       state = 'locked';

      const type   = node.type || 'lesson';
      const labels = badgeLabels[type] || badgeLabels.lesson;
      const dot    = state === 'completed'
        ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`
        : '';

      return `
        <div class="lesson-row lesson-row--${state} lesson-row--${type}">
          <div class="lesson-row__dot">${dot}</div>
          <button class="lesson-row__btn" data-node-id="${node.id}" ${state === 'locked' ? 'disabled' : ''}>
            <span class="lesson-row__title">${node.title}</span>
            <span class="lesson-row__badge">${labels[state]}</span>
          </button>
        </div>`;
    }).join('');
  },

  _svgLock() {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;
  },
};
