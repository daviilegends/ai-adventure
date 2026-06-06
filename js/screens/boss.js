const BossScreen = {
  _el: null,

  init() {
    this._el = document.getElementById('boss-screen');
    document.addEventListener('boss:started', (e) => this._renderIntro(e.detail.boss));
    document.addEventListener('boss:challenge', (e) => this._renderChallenge(e.detail));
    document.addEventListener('boss:completed', (e) => this._renderVictory(e.detail));
    document.addEventListener('boss:failed', (e) => this._renderFailure(e.detail));
  },

  _show() {
    document.getElementById('home-screen').classList.add('hidden');
    document.getElementById('lesson-screen').classList.add('hidden');
    document.getElementById('quiz-screen').classList.add('hidden');
    this._el.classList.remove('hidden');
    Animations.screenEnter(this._el);
  },

  _hide() {
    this._el.classList.add('hidden');
    document.getElementById('home-screen').classList.remove('hidden');
    Home.render();
  },

  _renderIntro(boss) {
    this._show();
    const isMiniboss = boss.type === 'miniboss';
    const badgeText = boss.subtitle || (isMiniboss ? 'Stage Checkpoint' : 'Final Boss');

    this._el.innerHTML = `
      <div class="boss-intro">
        <div class="boss-intro__header">
          <button class="lesson-back" id="boss-close">${this._svgChevron()}</button>
        </div>
        <div class="boss-intro__body">
          <div class="boss-intro__emblem">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 4l5 7.5 5-5.5 5 5.5 5-7.5v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4z"/></svg>
          </div>
          <span class="boss-intro__badge">${badgeText}</span>
          <h1 class="boss-intro__title">${boss.title}</h1>
          <p class="boss-intro__desc">${boss.description}</p>
          <div class="boss-objective">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
            ${boss.objective}
          </div>
          <button class="btn btn--boss" id="boss-begin">${isMiniboss ? 'Begin Checkpoint' : 'Begin Battle'}</button>
        </div>
      </div>
    `;

    document.getElementById('boss-close').addEventListener('click', () => this._hide());
    document.getElementById('boss-begin').addEventListener('click', () => BossEngine.next());
  },

  _renderChallenge({ challenge, progress }) {
    const pct = Math.round((progress.current / progress.total) * 100);

    this._el.innerHTML = `
      <div class="lesson-header">
        <button class="lesson-back" id="boss-back">${this._svgChevron()}</button>
        <div class="lesson-progress">
          <div class="lesson-progress__bar">
            <div class="lesson-progress__fill" style="width: ${pct}%"></div>
          </div>
        </div>
        <span class="quiz-counter">${progress.current}/${progress.total}</span>
      </div>
      <div class="lesson-content" id="boss-content"></div>
    `;

    document.getElementById('boss-back').addEventListener('click', () => this._hide());

    if (challenge.type === 'multiple-choice') this._renderMultipleChoice(challenge);
    else if (challenge.type === 'true-false') this._renderTrueFalse(challenge);
  },

  _renderMultipleChoice(challenge) {
    const letters = ['A', 'B', 'C', 'D'];
    const options = challenge.options
      .map((opt, i) => `
        <button class="quiz-option" data-index="${i}">
          <span class="quiz-option-letter">${letters[i]}</span>${opt}
        </button>
      `)
      .join('');

    document.getElementById('boss-content').innerHTML = `
      <h2 class="lesson-heading">${challenge.question}</h2>
      <div class="quiz-options">${options}</div>
      <div class="quiz-feedback hidden" id="boss-feedback"></div>
      <button class="btn btn--primary hidden" id="boss-next">Continue &rarr;</button>
    `;

    document.querySelectorAll('#boss-content .quiz-option').forEach(btn => {
      btn.addEventListener('click', (e) => this._checkMultipleChoice(e, challenge));
    });
  },

  _renderTrueFalse(challenge) {
    document.getElementById('boss-content').innerHTML = `
      <h2 class="lesson-heading">${challenge.question}</h2>
      <div class="true-false-options">
        <button class="true-false-btn" data-value="true">
          <span class="true-false-btn__icon">✓</span> True
        </button>
        <button class="true-false-btn" data-value="false">
          <span class="true-false-btn__icon">✗</span> False
        </button>
      </div>
      <div class="quiz-feedback hidden" id="boss-feedback"></div>
      <button class="btn btn--primary hidden" id="boss-next">Continue &rarr;</button>
    `;

    document.querySelectorAll('#boss-content .true-false-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this._checkTrueFalse(e, challenge));
    });
  },

  _checkMultipleChoice(e, challenge) {
    const picked = parseInt(e.currentTarget.dataset.index, 10);
    const correct = picked === challenge.correct;

    document.querySelectorAll('#boss-content .quiz-option').forEach((btn, i) => {
      btn.disabled = true;
      if (i === challenge.correct) btn.classList.add('quiz-option--correct');
      else if (i === picked) btn.classList.add('quiz-option--wrong');
    });

    this._showFeedback(correct, challenge.options[challenge.correct]);
    BossEngine.answer(correct);
  },

  _checkTrueFalse(e, challenge) {
    const picked = e.currentTarget.dataset.value === 'true';
    const correct = picked === challenge.correct;

    document.querySelectorAll('#boss-content .true-false-btn').forEach(btn => {
      btn.disabled = true;
      const val = btn.dataset.value === 'true';
      if (val === challenge.correct) btn.classList.add('quiz-option--correct');
      else if (val === picked) btn.classList.add('quiz-option--wrong');
    });

    this._showFeedback(correct, challenge.correct ? 'True' : 'False');
    BossEngine.answer(correct);
  },

  _showFeedback(correct, correctLabel) {
    const feedback = document.getElementById('boss-feedback');
    feedback.textContent = correct
      ? '✓ Correct!'
      : `✗ The correct answer is: "${correctLabel}"`;
    feedback.className = `quiz-feedback quiz-feedback--${correct ? 'correct' : 'wrong'}`;

    const next = document.getElementById('boss-next');
    next.classList.remove('hidden');
    next.addEventListener('click', () => BossEngine.next());
  },

  _renderVictory({ boss, correct, total, stars }) {
    const isMiniboss = boss.type === 'miniboss';
    const headline = isMiniboss ? 'Checkpoint Cleared!' : 'Boss Defeated!';
    const starsHtml = [1, 2, 3]
      .map(n => `<span class="score-star${n <= stars ? ' score-star--lit' : ''}">★</span>`)
      .join('');

    this._el.innerHTML = `
      <div class="boss-results boss-results--victory">
        <div class="boss-results__icon">${isMiniboss ? '🥈' : '🏆'}</div>
        <h2>${headline}</h2>
        <p class="boss-results__name">${boss.title}</p>
        <div class="score-stars">${starsHtml}</div>
        <p class="quiz-score">${correct} / ${total}</p>
        <div class="boss-rewards">
          <div class="boss-reward boss-reward--xp">⚡ +${boss.xpReward} XP</div>
          ${boss.coinsReward ? `<div class="boss-reward boss-reward--coins">🪙 +${boss.coinsReward} Coins</div>` : ''}
        </div>
        <button class="btn btn--primary" id="boss-done">Back to Map &rarr;</button>
      </div>
    `;

    document.getElementById('boss-done').addEventListener('click', () => this._hide());
  },

  _renderFailure({ boss, correct, total }) {
    const isMiniboss = boss.type === 'miniboss';
    const needed = Math.ceil(total * boss.passThreshold);

    this._el.innerHTML = `
      <div class="boss-results boss-results--failure">
        <div class="boss-results__icon">💀</div>
        <h2>${isMiniboss ? 'Checkpoint Failed' : 'Not Enough!'}</h2>
        <p class="boss-results__name">${boss.title}</p>
        <p class="quiz-score">${correct} / ${total}</p>
        <p class="boss-results__hint">You need at least ${needed} correct answers to pass.</p>
        <button class="btn btn--boss" id="boss-retry">Try Again ↺</button>
        <button class="btn btn--ghost" id="boss-back-map">Back to Map</button>
      </div>
    `;

    document.getElementById('boss-retry').addEventListener('click', () => BossEngine.start(boss.id));
    document.getElementById('boss-back-map').addEventListener('click', () => this._hide());
  },

  _svgChevron() {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>`;
  },
};
