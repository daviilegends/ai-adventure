const LessonEngine = {
  _stages: [],
  _worlds: [],
  _nodeMap: {},
  _current: null,
  _stepIndex: 0,
  _currentStageRef: null,
  _pendingBossHandler: null,

  async load() {
    const [lessons, challenges, puzzles, stages, worlds] = await Promise.all([
      fetch('data/lessons.json').then(r => r.json()),
      fetch('data/challenges.json').then(r => r.json()),
      fetch('data/puzzles.json').then(r => r.json()),
      fetch('data/stages.json').then(r => r.json()),
      fetch('data/worlds.json').then(r => r.json()),
    ]);
    this._stages = stages;
    this._worlds = worlds;
    [...lessons, ...challenges, ...puzzles].forEach(node => {
      this._nodeMap[node.id] = node;
    });
    this._syncWorldUnlocks();
  },

  start(nodeId) {
    const stageRef = this._findStageForNode(nodeId);

    const bossNode = BossEngine.getById(nodeId);
    if (bossNode) {
      this._startBoss(nodeId, bossNode, stageRef);
      return;
    }

    const node = this._nodeMap[nodeId];
    if (!node) return;

    this._current = node;
    this._currentStageRef = stageRef;
    this._stepIndex = 0;
    document.dispatchEvent(new CustomEvent('lesson:started', { detail: { lesson: node } }));
    this._dispatchStep();
  },

  next() {
    if (!this._current) return;
    this._stepIndex++;

    if (this._stepIndex >= this._current.steps.length) {
      this._complete();
    } else {
      this._dispatchStep();
    }
  },

  isCompleted(nodeId) {
    return State.get().completedLessons.includes(nodeId);
  },

  getWorlds() {
    return this._worlds;
  },

  getStagesForWorld(worldId) {
    return this._stages
      .filter(s => s.worldId === worldId)
      .sort((a, b) => a.order - b.order);
  },

  getNodesForStage(worldId, stageOrder) {
    const stage = this._stages.find(s => s.worldId === worldId && s.order === stageOrder);
    if (!stage) return [];
    return stage.nodes.map(n => {
      const node = this._nodeMap[n.nodeId] || BossEngine.getById(n.nodeId);
      if (!node) return null;
      return { id: n.nodeId, type: n.nodeType, title: node.title };
    }).filter(Boolean);
  },

  getNodeType(nodeId) {
    for (const stage of this._stages) {
      const node = stage.nodes.find(n => n.nodeId === nodeId);
      if (node) return node.nodeType;
    }
    return null;
  },

  getForWorld(worldId) {
    const worldStages = this._stages.filter(s => s.worldId === worldId);
    return worldStages.flatMap(s => s.nodes).map(n => {
      const node = this._nodeMap[n.nodeId] || BossEngine.getById(n.nodeId);
      return node ? { id: n.nodeId, type: n.nodeType } : null;
    }).filter(Boolean);
  },

  _findStageForNode(nodeId) {
    for (const stage of this._stages) {
      if (stage.nodes.some(n => n.nodeId === nodeId)) {
        return { worldId: stage.worldId, stageOrder: stage.order };
      }
    }
    return null;
  },

  _startBoss(nodeId, bossData, stageRef) {
    if (this._pendingBossHandler) {
      document.removeEventListener('boss:completed', this._pendingBossHandler);
    }

    const handler = (e) => {
      if (e.detail.boss.id !== nodeId) return;
      document.removeEventListener('boss:completed', handler);
      this._pendingBossHandler = null;

      const player = State.get();
      if (!player.completedLessons.includes(nodeId)) {
        State.set({ completedLessons: [...player.completedLessons, nodeId] });
        if (stageRef) {
          this._checkStageComplete(stageRef.worldId, stageRef.stageOrder);
          this._checkWorldUnlock(stageRef.worldId);
        }
      }
      document.dispatchEvent(new CustomEvent('lesson:completed', {
        detail: { lesson: { id: nodeId, type: bossData.type || 'boss', title: bossData.title, xpReward: bossData.xpReward } },
      }));
    };

    this._pendingBossHandler = handler;
    document.addEventListener('boss:completed', handler);
    BossEngine.start(nodeId);
  },

  _dispatchStep() {
    document.dispatchEvent(new CustomEvent('lesson:step', {
      detail: {
        step: this._current.steps[this._stepIndex],
        progress: { current: this._stepIndex + 1, total: this._current.steps.length },
      },
    }));
  },

  _complete() {
    const lesson = this._current;
    const stageRef = this._currentStageRef;
    const player = State.get();

    if (!player.completedLessons.includes(lesson.id)) {
      XP.gainXp(lesson.xpReward);
      State.set({ completedLessons: [...player.completedLessons, lesson.id] });
      if (stageRef) {
        this._checkStageComplete(stageRef.worldId, stageRef.stageOrder);
        this._checkWorldUnlock(stageRef.worldId);
      }
    }

    this._current = null;
    this._stepIndex = 0;
    this._currentStageRef = null;
    document.dispatchEvent(new CustomEvent('lesson:completed', { detail: { lesson } }));
  },

  _checkStageComplete(worldId, stageOrder) {
    const stage = this._stages.find(s => s.worldId === worldId && s.order === stageOrder);
    if (!stage) return;
    const player = State.get();
    const allDone = stage.nodes.every(n => player.completedLessons.includes(n.nodeId));
    if (!allDone) return;
    document.dispatchEvent(new CustomEvent('stage:completed', { detail: { worldId, stageId: stageOrder } }));
  },

  _checkWorldUnlock(worldId) {
    const player = State.get();
    const worldStages = this._stages.filter(s => s.worldId === worldId);
    const allNodeIds = worldStages.flatMap(s => s.nodes.map(n => n.nodeId));
    if (allNodeIds.length === 0) return;
    const allDone = allNodeIds.every(id => player.completedLessons.includes(id));
    if (!allDone) return;

    const nextWorld = this._worlds.find(w => w.unlockRequirement && w.unlockRequirement.worldId === worldId);
    if (!nextWorld || player.unlockedWorlds.includes(nextWorld.id)) return;

    State.set({ unlockedWorlds: [...player.unlockedWorlds, nextWorld.id] });
    document.dispatchEvent(new CustomEvent('world:unlocked', { detail: { world: nextWorld } }));
  },

  _syncWorldUnlocks() {
    const player = State.get();
    const toUnlock = [];

    this._worlds.forEach(world => {
      if (!world.unlockRequirement) return;
      if (player.unlockedWorlds.includes(world.id)) return;

      const req = world.unlockRequirement;
      const worldStages = this._stages.filter(s => s.worldId === req.worldId);
      const allNodeIds = worldStages.flatMap(s => s.nodes.map(n => n.nodeId));
      const allDone = allNodeIds.length > 0 && allNodeIds.every(id => player.completedLessons.includes(id));
      if (allDone) toUnlock.push(world.id);
    });

    if (toUnlock.length > 0) {
      State.set({ unlockedWorlds: [...player.unlockedWorlds, ...toUnlock] });
    }
  },
};
