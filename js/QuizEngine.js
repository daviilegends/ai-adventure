const QuizEngine = {
  _questions: [],
  _index: 0,
  _answers: [],
  _meta: null,

  start(quiz) {
    this._questions = quiz.questions;
    this._index = 0;
    this._answers = [];
    this._meta = { id: quiz.id, title: quiz.title, xpReward: quiz.xpReward };

    document.dispatchEvent(new CustomEvent('quiz:started', { detail: { quiz } }));
    this._dispatchQuestion();
  },

  answer(isCorrect) {
    this._answers.push({ index: this._index, correct: isCorrect });
    document.dispatchEvent(new CustomEvent('quiz:answered', {
      detail: { correct: isCorrect, index: this._index },
    }));
  },

  next() {
    this._index++;
    if (this._index >= this._questions.length) {
      this._complete();
    } else {
      this._dispatchQuestion();
    }
  },

  _dispatchQuestion() {
    document.dispatchEvent(new CustomEvent('quiz:question', {
      detail: {
        question: this._questions[this._index],
        progress: { current: this._index + 1, total: this._questions.length },
      },
    }));
  },

  _complete() {
    const correct = this._answers.filter(a => a.correct).length;
    const total = this._questions.length;
    const earned = Math.round(this._meta.xpReward * (correct / total));

    if (earned > 0) XP.gainXp(earned);

    const result = { correct, total, earned, meta: this._meta };

    this._questions = [];
    this._index = 0;
    this._answers = [];
    this._meta = null;

    document.dispatchEvent(new CustomEvent('quiz:completed', { detail: result }));
  },
};
