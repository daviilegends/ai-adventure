const AchievementConditions = {
  check(condition, context) {
    switch (condition.type) {
      case 'nodeCountAtLeast':
        return (context.nodeTypeCounts[condition.nodeType] || 0) >= condition.threshold;

      case 'worldsCompleted':
        return context.completedWorldIds.length >= condition.threshold;

      case 'xpAtLeast':
        return context.player.xp >= condition.threshold;

      case 'streakAtLeast':
        return context.player.streak >= condition.threshold;

      case 'levelAtLeast':
        return context.level >= condition.threshold;

      case 'and':
        return condition.conditions.every(c => this.check(c, context));

      case 'or':
        return condition.conditions.some(c => this.check(c, context));

      default:
        return false;
    }
  },
};
