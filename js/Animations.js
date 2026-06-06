const Animations = {
  init() {
    document.addEventListener('xp:gained', (e) => this.xpFloat(e.detail.amount));
    document.addEventListener('level:up', (e) => this.levelUp(e.detail.level));
    document.addEventListener('lesson:completed', (e) => {
      if (e.detail.lesson && e.detail.lesson.type !== 'boss') this.completionFlash(false);
    });
    document.addEventListener('boss:completed', () => this.completionFlash(true));
    document.addEventListener('world:unlocked', (e) => {
      this.toast({
        icon: '↑',
        iconClass: 'toast__icon--world',
        title: `${e.detail.world.title} Unlocked`,
        sub: 'New world available on the map',
      });
    });
    document.addEventListener(AchievementEvents.UNLOCKED, (e) => {
      this.achievementBanner(e.detail.achievement);
    });
  },

  completionFlash(isBoss = false) {
    const el = document.createElement('div');
    el.className = `completion-flash${isBoss ? ' completion-flash--boss' : ''}`;
    document.getElementById('app').appendChild(el);
    setTimeout(() => el.remove(), 700);
  },

  levelUp(level) {
    this.toast({
      icon: level,
      iconClass: 'toast__icon--level',
      title: 'Level Up!',
      sub: `You reached level ${level}`,
    });
  },

  xpFloat(amount) {
    const bar = document.querySelector('.xp-bar');
    if (!bar) return;

    const rect = bar.getBoundingClientRect();
    const el = document.createElement('span');
    el.className = 'xp-float';
    el.textContent = `+${amount} XP`;
    el.style.left = `${rect.left + rect.width / 2}px`;
    el.style.top = `${rect.top}px`;

    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1400);
  },

  toast({ icon, iconClass = '', title, sub = '' }) {
    const existing = document.querySelector('.toast');
    if (existing) {
      existing.classList.add('toast--exiting');
      setTimeout(() => existing.remove(), 240);
    }

    const delay = existing ? 260 : 0;
    setTimeout(() => {
      const el = document.createElement('div');
      el.className = 'toast';
      el.innerHTML = `
        <div class="toast__icon ${iconClass}">${icon}</div>
        <div class="toast__body">
          <div class="toast__title">${title}</div>
          ${sub ? `<div class="toast__sub">${sub}</div>` : ''}
        </div>
      `;
      document.getElementById('app').appendChild(el);

      setTimeout(() => {
        el.classList.add('toast--exiting');
        setTimeout(() => el.remove(), 260);
      }, 3000);
    }, delay);
  },

  achievementBanner(achievement) {
    const existing = document.querySelector('.achievement-banner');
    if (existing) existing.remove();

    const el = document.createElement('div');
    el.className = 'achievement-banner';
    el.innerHTML = `
      <div class="achievement-banner__icon">${achievement.icon}</div>
      <div class="achievement-banner__body">
        <div class="achievement-banner__label">Achievement Unlocked</div>
        <div class="achievement-banner__title">${achievement.title}</div>
        ${achievement.xpReward ? `<div class="achievement-banner__xp">+${achievement.xpReward} XP</div>` : ''}
      </div>
    `;
    document.getElementById('app').appendChild(el);

    setTimeout(() => {
      el.classList.add('achievement-banner--exiting');
      setTimeout(() => el.remove(), 300);
    }, 3500);
  },

  screenEnter(el) {
    el.classList.remove('screen-entering');
    void el.offsetWidth;
    el.classList.add('screen-entering');
    el.addEventListener('animationend', () => el.classList.remove('screen-entering'), { once: true });
  },
};
