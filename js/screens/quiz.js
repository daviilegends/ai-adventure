const QuizScreen = {
  _el: null,

  init() {
    this._el = document.getElementById('quiz-screen');
    document.addEventListener('quiz:started', () => this._show());
    document.addEventListener('quiz:question', (e) => this._renderQuestion(e.detail));
    document.addEventListener('quiz:completed', (e) => this._renderResults(e.detail));
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

  _renderQuestion({ question, progress }) {
    const pct = Math.round((progress.current / progress.total) * 100);

    this._el.innerHTML = `
      <div class="lesson-header">
        <button class="lesson-back" id="quiz-back"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg></button>
        <div class="lesson-progress">
          <div class="lesson-progress__bar">
            <div class="lesson-progress__fill" style="width: ${pct}%"></div>
          </div>
        </div>
        <span class="quiz-counter">${progress.current}/${progress.total}</span>
      </div>
      <div class="lesson-content" id="quiz-content"></div>
    `;

    document.getElementById('quiz-back').addEventListener('click', () => this._hide());

    if (question.type === 'multiple-choice') {
      this._renderMultipleChoice(question);
    } else if (question.type === 'true-false') {
      this._renderTrueFalse(question);
    }
  },

  _renderMultipleChoice(question) {
    const letters = ['A', 'B', 'C', 'D'];
    const options = question.options
      .map((opt, i) => `<button class="quiz-option" data-index="${i}"><span class="quiz-option-letter">${letters[i] || i + 1}</span>${opt}</button>`)
      .join('');

    document.getElementById('quiz-content').innerHTML = `
      <h2 class="lesson-heading">${question.question}</h2>
      <div class="quiz-options">${options}</div>
      <div class="quiz-feedback hidden" id="quiz-feedback"></div>
      <button class="btn btn--primary hidden" id="quiz-next">Continue →</button>
    `;

    document.querySelectorAll('.quiz-option').forEach(btn => {
      btn.addEventListener('click', (e) => this._checkMultipleChoice(e, question));
    });
  },

  _renderTrueFalse(question) {
    document.getElementById('quiz-content').innerHTML = `
      <h2 class="lesson-heading">${question.question}</h2>
      <div class="true-false-options">
        <button class="true-false-btn" data-value="true">✓ True</button>
        <button class="true-false-btn" data-value="false">✗ False</button>
      </div>
      <div class="quiz-feedback hidden" id="quiz-feedback"></div>
      <button class="btn btn--primary hidden" id="quiz-next">Continue →</button>
    `;

    document.querySelectorAll('.true-false-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this._checkTrueFalse(e, question));
    });
  },

  _checkMultipleChoice(e, question) {
    const picked = parseInt(e.currentTarget.dataset.index);
    const correct = picked === question.correct;

    document.querySelectorAll('.quiz-option').forEach((btn, i) => {
      btn.disabled = true;
      if (i === question.correct) btn.classList.add('quiz-option--correct');
      if (i === picked && !correct) btn.classList.add('quiz-option--wrong');
    });

    this._showFeedback(correct, question.options[question.correct]);
    QuizEngine.answer(correct);
  },

  _checkTrueFalse(e, question) {
    const picked = e.currentTarget.dataset.value === 'true';
    const correct = picked === question.correct;

    document.querySelectorAll('.true-false-btn').forEach(btn => {
      btn.disabled = true;
      const val = btn.dataset.value === 'true';
      if (val === question.correct) btn.classList.add('quiz-option--correct');
      if (val === picked && !correct) btn.classList.add('quiz-option--wrong');
    });

    this._showFeedback(correct, question.correct ? 'True' : 'False');
    QuizEngine.answer(correct);
  },

  _showFeedback(correct, correctLabel) {
    const feedback = document.getElementById('quiz-feedback');
    feedback.textContent = correct
      ? '✓ Correct!'
      : `✗ The correct answer is: "${correctLabel}"`;
    feedback.className = `quiz-feedback quiz-feedback--${correct ? 'correct' : 'wrong'}`;

    const next = document.getElementById('quiz-next');
    next.classList.remove('hidden');
    next.addEventListener('click', () => QuizEngine.next());
  },

  _renderResults({ correct, total, earned, meta }) {
    const pct = Math.round((correct / total) * 100);
    const icon = pct === 100 ? '🏆' : pct >= 60 ? '🎯' : '📚';
    const stars = pct === 100 ? 3 : pct >= 60 ? 2 : 1;

    const starsHtml = [1,2,3].map(n =>
      `<span class="score-star${n <= stars ? ' score-star--lit' : ''}">⭐</span>`
    ).join('');

    this._el.innerHTML = `
      <div class="lesson-complete">
        <div class="lesson-complete__icon">${icon}</div>
        <h2>${meta.title}</h2>
        <p class="quiz-score">${correct} / ${total}</p>
        <div class="score-stars">${starsHtml}</div>
        <div class="xp-reward">⚡ +${earned} XP</div>
        <button class="btn btn--primary" id="quiz-done">Back to Map →</button>
      </div>
    `;

    document.getElementById('quiz-done').addEventListener('click', () => this._hide());
  },
};
