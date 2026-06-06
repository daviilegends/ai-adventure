const XP = {
  thresholdForLevel(level) {
    return level * 100;
  },

  calculate(totalXp) {
    let level = 1;
    let remaining = totalXp;

    while (remaining >= this.thresholdForLevel(level)) {
      remaining -= this.thresholdForLevel(level);
      level++;
    }

    const threshold = this.thresholdForLevel(level);
    return { level, xp: remaining, threshold, percent: remaining / threshold };
  },

  gainXp(amount) {
    const player = State.get();
    const before = this.calculate(player.xp);
    const newTotal = player.xp + amount;
    const after = this.calculate(newTotal);

    State.set({ xp: newTotal, level: after.level });

    document.dispatchEvent(new CustomEvent('xp:gained', {
      detail: { amount, before, after, totalXp: newTotal },
    }));

    if (after.level > before.level) {
      document.dispatchEvent(new CustomEvent('level:up', {
        detail: { level: after.level, prevLevel: before.level },
      }));
    }
  },
};
