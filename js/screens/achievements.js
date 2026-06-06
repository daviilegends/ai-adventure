const AchievementsScreen = {
  _el: null,
  _activeCategory: 'all',

  init() {
    this._el = document.getElementById('achievements-screen');
    document.querySelector('.nav-btn[data-nav="achievements"]')
      ?.addEventListener('click', () => this._show());
    document.addEventListener(AchievementEvents.UNLOCKED, () => {
      if (!this._el.classList.contains('hidden')) this._renderList();
    });
  },

  _show() {
    document.getElementById('home-screen').classList.add('hidden');
    this._el.classList.remove('hidden');
    this._activeCategory = 'all';
    this._render();
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('nav-btn--active'));
    document.querySelector('.nav-btn[data-nav="achievements"]').classList.add('nav-btn--active');
  },

  _hide() {
    this._el.classList.add('hidden');
    document.getElementById('home-screen').classList.remove('hidden');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('nav-btn--active'));
    document.querySelector('.nav-btn[data-nav="home"]').classList.add('nav-btn--active');
    Home.render();
  },

  _render() {
    const all = AchievementService.getAll();
    const unlockedCount = all.filter(a => a.unlocked).length;
    const total = all.length;
    const pct = total > 0 ? Math.round((unlockedCount / total) * 100) : 0;

    this._el.innerHTML = `
      <div class="ach-header">
        <button class="lesson-back" id="ach-back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <h1 class="ach-title">Achievements</h1>
        <span class="ach-count">${unlockedCount} / ${total}</span>
      </div>

      <div class="ach-body" id="ach-body">
        <div class="ach-progress">
          <div class="ach-progress__labels">
            <span>Overall Progress</span>
            <span class="ach-progress__pct">${pct}%</span>
          </div>
          <div class="ach-progress__bar">
            <div class="ach-progress__fill" style="width: ${pct}%"></div>
          </div>
        </div>

        <div class="ach-filters" id="ach-filters">
          ${this._renderFilters(all)}
        </div>

        <div class="ach-list" id="ach-list">
          ${this._renderCards(all)}
        </div>
      </div>
    `;

    document.getElementById('ach-back').addEventListener('click', () => this._hide());
    this._wireFilters();
  },

  _renderFilters(all) {
    const categories = ['all', ...new Set(all.map(a => a.category))];
    return categories.map(cat => {
      const active = cat === this._activeCategory ? ' ach-filter--active' : '';
      const label = cat === 'all' ? 'All' : cat;
      return `<button class="ach-filter${active}" data-cat="${cat}">${label}</button>`;
    }).join('');
  },

  _renderCards(all) {
    const filtered = this._activeCategory === 'all'
      ? all
      : all.filter(a => a.category === this._activeCategory);

    if (filtered.length === 0) {
      return '<p class="ach-empty">No achievements in this category yet.</p>';
    }

    return filtered.map(a => this._renderCard(a)).join('');
  },

  _renderCard(a) {
    if (a.isHidden && !a.unlocked) {
      return `
        <div class="ach-card ach-card--locked ach-card--hidden">
          <div class="ach-card__icon">🔒</div>
          <div class="ach-card__body">
            <div class="ach-card__title">???</div>
            <div class="ach-card__desc">This achievement is hidden. Keep playing to discover it.</div>
          </div>
        </div>`;
    }

    const stateClass = a.unlocked ? 'ach-card--unlocked' : 'ach-card--locked';
    const xpBadge = a.xpReward ? `<span class="ach-card__xp">+${a.xpReward} XP</span>` : '';
    const dateBadge = a.unlocked && a.unlockedAt
      ? `<span class="ach-card__date">${this._formatDate(a.unlockedAt)}</span>`
      : '';
    const checkmark = a.unlocked
      ? `<div class="ach-card__checkmark">✓</div>`
      : '';

    return `
      <div class="ach-card ${stateClass}">
        <div class="ach-card__icon">${a.icon}</div>
        <div class="ach-card__body">
          <div class="ach-card__title">${a.title}</div>
          <div class="ach-card__desc">${a.description}</div>
          <div class="ach-card__meta">
            ${xpBadge}
            ${dateBadge}
          </div>
        </div>
        ${checkmark}
      </div>`;
  },

  _formatDate(ts) {
    return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  },

  _wireFilters() {
    document.querySelectorAll('.ach-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        this._activeCategory = btn.dataset.cat;
        document.querySelectorAll('.ach-filter').forEach(b => b.classList.remove('ach-filter--active'));
        btn.classList.add('ach-filter--active');
        this._renderList();
      });
    });
  },

  _renderList() {
    const all = AchievementService.getAll();
    const listEl = document.getElementById('ach-list');
    if (listEl) listEl.innerHTML = this._renderCards(all);
  },
};
