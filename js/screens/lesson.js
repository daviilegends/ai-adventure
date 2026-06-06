const LessonScreen = {
  _el: null,

  init() {
    this._el = document.getElementById('lesson-screen');
    document.addEventListener('lesson:started', () => this._show());
    document.addEventListener('lesson:step', (e) => this._renderStep(e.detail));
    document.addEventListener('lesson:completed', (e) => this._renderComplete(e.detail));
  },

  _show() {
    document.getElementById('home-screen').classList.add('hidden');
    this._el.classList.remove('hidden');
    Animations.screenEnter(this._el);
  },

  _hide() {
    this._el.classList.add('hidden');
    document.getElementById('home-screen').classList.remove('hidden');
    Home.render();
  },

  _renderStep({ step, progress }) {
    const pct = Math.round((progress.current / progress.total) * 100);

    this._el.innerHTML = `
      <div class="lesson-header">
        <button class="lesson-back" id="lesson-back"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg></button>
        <div class="lesson-progress">
          <div class="lesson-progress__bar">
            <div class="lesson-progress__fill" style="width: ${pct}%"></div>
          </div>
        </div>
      </div>
      <div class="lesson-content" id="lesson-content"></div>
    `;

    document.getElementById('lesson-back').addEventListener('click', () => this._hide());

    if (step.type === 'text') {
      this._renderText(step);
    } else if (step.type === 'quiz') {
      this._renderQuiz(step);
    }
  },

  _renderText(step) {
    document.getElementById('lesson-content').innerHTML = `
      <h2 class="lesson-heading">${step.heading}</h2>
      <p class="lesson-body">${step.body}</p>
      <button class="btn btn--primary" id="lesson-next">Continue →</button>
    `;
    document.getElementById('lesson-next').addEventListener('click', () => LessonEngine.next());
  },

  _renderQuiz(step) {
    const letters = ['A', 'B', 'C', 'D'];
    const options = step.options
      .map((opt, i) => `<button class="quiz-option" data-index="${i}"><span class="quiz-option-letter">${letters[i] || i + 1}</span>${opt}</button>`)
      .join('');

    document.getElementById('lesson-content').innerHTML = `
      <h2 class="lesson-heading">${step.question}</h2>
      <div class="quiz-options">${options}</div>
      <div class="quiz-feedback hidden" id="quiz-feedback"></div>
      <button class="btn btn--primary hidden" id="lesson-next">Continue →</button>
    `;

    document.querySelectorAll('.quiz-option').forEach(btn => {
      btn.addEventListener('click', (e) => this._checkAnswer(e, step));
    });
  },

  _checkAnswer(e, step) {
    const picked = parseInt(e.currentTarget.dataset.index);
    const correct = picked === step.correct;

    document.querySelectorAll('.quiz-option').forEach((btn, i) => {
      btn.disabled = true;
      if (i === step.correct) btn.classList.add('quiz-option--correct');
      if (i === picked && !correct) btn.classList.add('quiz-option--wrong');
    });

    const feedback = document.getElementById('quiz-feedback');
    feedback.textContent = correct
      ? '✓ Correct!'
      : `✗ The correct answer is: "${step.options[step.correct]}"`;
    feedback.className = `quiz-feedback quiz-feedback--${correct ? 'correct' : 'wrong'}`;

    const next = document.getElementById('lesson-next');
    next.classList.remove('hidden');
    next.addEventListener('click', () => LessonEngine.next());
  },

  _renderComplete({ lesson }) {
    const typeConfig = {
      lesson:    { icon: '🎓', title: 'Lesson Complete!' },
      challenge: { icon: '⚡', title: 'Challenge Complete!' },
      puzzle:    { icon: '🧩', title: 'Puzzle Solved!' },
      miniboss:  { icon: '🥈', title: 'Checkpoint Cleared!' },
      boss:      { icon: '👑', title: 'Boss Defeated!' },
    };
    const config = typeConfig[lesson.type] || typeConfig.lesson;
    const xpLine = lesson.xpReward ? `<div class="xp-reward">⚡ +${lesson.xpReward} XP</div>` : '';

    this._el.innerHTML = `
      <div class="lesson-complete">
        <div class="lesson-complete__icon">${config.icon}</div>
        <h2>${config.title}</h2>
        <p>Great work — keep it up!</p>
        ${xpLine}
        <button class="btn btn--primary" id="lesson-done">Back to Map →</button>
      </div>
    `;
    document.getElementById('lesson-done').addEventListener('click', () => this._hide());
  },
};
