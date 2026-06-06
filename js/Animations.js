const Animations = {
  init() {
    document.addEventListener('xp:gained', (e) => this.xpFloat(e.detail.amount));
    document.addEventListener('level:up', (e) => this.levelUp(e.detail.level));
    document.addEventListener('lesson:completed', (e) => {
      if (e.detail.lesson && e.detail.lesson.type !== 'boss') this.confetti(false);
    });
    document.addEventListener('boss:completed', () => this.confetti(true));
    document.addEventListener('world:unlocked', (e) => {
      this.toast({
        icon: '🌍',
        iconClass: 'toast__icon--world',
        title: `${e.detail.world.title} Unlocked!`,
        sub: 'New world available on the map',
      });
    });
  },

  confetti(intense = false) {
    const container = document.createElement('div');
    container.className = 'confetti-container';
    document.getElementById('app').appendChild(container);

    const count = intense ? 60 : 38;
    const colors = ['#4f8ef0', '#9b71f5', '#2dcf9e', '#f5c030', '#f06b6b', '#7aabf7', '#ffd060', '#67e8f9'];

    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'confetti-particle';

      const size = 5 + Math.random() * 7;
      const tall = Math.random() > 0.35;
      const circle = Math.random() > 0.55;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const duration = 1.5 + Math.random() * 1.3;
      const delay = Math.random() * 0.65;
      const drift = Math.round((Math.random() - 0.5) * 130);
      const spin = Math.round((Math.random() - 0.5) * 720);

      p.style.cssText = [
        `left:${4 + Math.random() * 92}%`,
        `width:${size}px`,
        `height:${tall ? size : size * 0.38}px`,
        `background:${color}`,
        `border-radius:${circle ? '50%' : '2px'}`,
        `--duration:${duration}s`,
        `--delay:${delay}s`,
        `--drift:${drift}px`,
        `--spin:${spin}deg`,
      ].join(';');

      container.appendChild(p);
    }

    setTimeout(() => container.remove(), intense ? 3200 : 2900);
  },

  levelUp(level) {
    const overlay = document.createElement('div');
    overlay.className = 'levelup-overlay';

    overlay.innerHTML = `
      <div class="levelup-scene">
        <div class="levelup-ring"></div>
        <div class="levelup-ring levelup-ring--2"></div>
        <div class="levelup-card">
          <span class="levelup-label">Level Up!</span>
          <div class="levelup-badge">${level}</div>
          <p class="levelup-title">New Rank Achieved</p>
          <p class="levelup-subtitle">Keep learning to advance further</p>
        </div>
      </div>
    `;

    document.getElementById('app').appendChild(overlay);
    setTimeout(() => overlay.remove(), 2900);
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
    setTimeout(() => el.remove(), 1550);
  },

  toast({ icon, iconClass = '', title, sub = '' }) {
    const existing = document.querySelector('.toast');
    if (existing) {
      existing.classList.add('toast--exiting');
      setTimeout(() => existing.remove(), 280);
    }

    const delay = existing ? 300 : 0;
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
        setTimeout(() => el.remove(), 300);
      }, 3300);
    }, delay);
  },

  screenEnter(el) {
    el.classList.remove('screen-entering');
    void el.offsetWidth; // force reflow so animation fires even on re-entry
    el.classList.add('screen-entering');
    el.addEventListener('animationend', () => el.classList.remove('screen-entering'), { once: true });
  },
};
