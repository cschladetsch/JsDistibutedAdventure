/**
 * Advanced Gameplay Features
 * Quest system, settlements, relationships, and world management
 */

import Logger from './Logger.js';
import ErrorHandler, { ValidationError } from './ErrorHandler.js';
// Simple UUID replacement
function uuidv4() {
  return 'xxxx-xxxx-4xxx-yxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export class Quest {
  constructor(id, title, description, type = 'main') {
    this.id = id || uuidv4();
    this.title = title;
    this.description = description;
    this.type = type; // main, side, daily, achievement
    this.status = 'available'; // available, active, completed, failed
    this.objectives = [];
    this.rewards = [];
    this.prerequisites = [];
    this.timeLimit = null; // in milliseconds
    this.startTime = null;
    this.completionTime = null;
    this.progress = new Map();
    this.metadata = {};
  }

  addObjective(id, description, target = 1, trackingType = 'counter') {
    this.objectives.push({
      id,
      description,
      target,
      current: 0,
      trackingType, // counter, flag, collection
      completed: false
    });
    this.progress.set(id, 0);
  }

  addReward(type, item, quantity = 1) {
    this.rewards.push({ type, item, quantity }); // type: gold, xp, item, skill
  }

  start() {
    if (this.status !== 'available') {
      throw new ValidationError('Quest cannot be started', { quest: this.id, status: this.status });
    }

    this.status = 'active';
    this.startTime = Date.now();

    Logger.quest(`Quest started: ${this.title}`, { questId: this.id, type: this.type });
  }

  updateProgress(objectiveId, amount = 1) {
    const objective = this.objectives.find(obj => obj.id === objectiveId);
    if (!objective) {
      throw new ValidationError('Objective not found', { questId: this.id, objectiveId });
    }

    if (objective.completed) return false;

    const oldProgress = objective.current;
    objective.current = Math.min(objective.target, objective.current + amount);
    this.progress.set(objectiveId, objective.current);

    if (objective.current >= objective.target && !objective.completed) {
      objective.completed = true;
      Logger.quest(`Objective completed: ${objective.description}`, {
        questId: this.id,
        objectiveId,
        progress: `${objective.current}/${objective.target}`
      });
    }

    return objective.current > oldProgress;
  }

  checkCompletion() {
    const allCompleted = this.objectives.every(obj => obj.completed);
    if (allCompleted && this.status === 'active') {
      this.complete();
      return true;
    }
    return false;
  }

  complete() {
    this.status = 'completed';
    this.completionTime = Date.now();
    Logger.quest(`Quest completed: ${this.title}`, {
      questId: this.id,
      duration: this.completionTime - this.startTime
    });
  }

  fail(reason = 'Unknown') {
    this.status = 'failed';
    Logger.quest(`Quest failed: ${this.title}`, { questId: this.id, reason });
  }

  getProgress() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      status: this.status,
      objectives: this.objectives.map(obj => ({
        description: obj.description,
        progress: `${obj.current}/${obj.target}`,
        completed: obj.completed
      })),
      timeRemaining: this.timeLimit ? this.timeLimit - (Date.now() - this.startTime) : null
    };
  }

  isExpired() {
    return this.timeLimit && this.startTime && (Date.now() - this.startTime) > this.timeLimit;
  }
}

export class QuestManager {
  constructor() {
    this.quests = new Map();
    this.activeQuests = new Set();
    this.questHistory = [];
    this.questGivers = new Map();
    this.questTemplates = new Map();
    this.loadDefaultQuests();
  }

  loadDefaultQuests() {
    // Main story quests
    this.addQuestTemplate('rescue_princess', {
      title: 'The Missing Princess',
      description: 'The princess has been kidnapped by dark forces. Find and rescue her.',
      type: 'main',
      objectives: [
        { id: 'find_clues', description: 'Find clues about the princess\'s whereabouts', target: 3 },
        { id: 'defeat_boss', description: 'Defeat the Dark Lord', target: 1 },
        { id: 'rescue_princess', description: 'Rescue the princess', target: 1 }
      ],
      rewards: [
        { type: 'xp', item: 'experience', quantity: 1000 },
        { type: 'gold', item: 'gold', quantity: 500 },
        { type: 'item', item: 'royal_sword', quantity: 1 }
      ]
    });

    // Side quests
    this.addQuestTemplate('herb_gathering', {
      title: 'Herb Collector',
      description: 'Collect rare herbs for the village healer.',
      type: 'side',
      objectives: [
        { id: 'collect_herbs', description: 'Collect magical herbs', target: 10 }
      ],
      rewards: [
        { type: 'xp', item: 'experience', quantity: 200 },
        { type: 'gold', item: 'gold', quantity: 100 }
      ]
    });

    this.addQuestTemplate('monster_hunter', {
      title: 'Monster Hunter',
      description: 'Clear the roads of dangerous monsters.',
      type: 'side',
      objectives: [
        { id: 'kill_wolves', description: 'Defeat wolves', target: 5 },
        { id: 'kill_goblins', description: 'Defeat goblins', target: 3 }
      ],
      rewards: [
        { type: 'xp', item: 'experience', quantity: 300 },
        { type: 'item', item: 'iron_sword', quantity: 1 }
      ]
    });
  }

  addQuestTemplate(id, template) {
    this.questTemplates.set(id, template);
  }

  createQuest(templateId, customizations = {}) {
    const template = this.questTemplates.get(templateId);
    if (!template) {
      throw new ValidationError('Quest template not found', { templateId });
    }

    const quest = new Quest(
      customizations.id,
      customizations.title || template.title,
      customizations.description || template.description,
      customizations.type || template.type
    );

    // Add objectives
    template.objectives.forEach(objTemplate => {
      quest.addObjective(
        objTemplate.id,
        objTemplate.description,
        objTemplate.target,
        objTemplate.trackingType
      );
    });

    // Add rewards
    template.rewards.forEach(reward => {
      quest.addReward(reward.type, reward.item, reward.quantity);
    });

    this.quests.set(quest.id, quest);
    return quest;
  }

  startQuest(questId) {
    const quest = this.quests.get(questId);
    if (!quest) {
      throw new ValidationError('Quest not found', { questId });
    }

    quest.start();
    this.activeQuests.add(questId);
    return quest;
  }

  updateQuestProgress(questId, objectiveId, amount = 1) {
    const quest = this.quests.get(questId);
    if (!quest) return false;

    const updated = quest.updateProgress(objectiveId, amount);
    if (updated && quest.checkCompletion()) {
      this.completeQuest(questId);
    }

    return updated;
  }

  completeQuest(questId) {
    const quest = this.quests.get(questId);
    if (!quest) return null;

    quest.complete();
    this.activeQuests.delete(questId);
    this.questHistory.push({
      id: questId,
      title: quest.title,
      completedAt: Date.now(),
      rewards: quest.rewards
    });

    return quest.rewards;
  }

  getActiveQuests() {
    return Array.from(this.activeQuests).map(id => this.quests.get(id));
  }

  getAvailableQuests() {
    return Array.from(this.quests.values()).filter(quest => quest.status === 'available');
  }

  getQuestById(questId) {
    return this.quests.get(questId);
  }
}

export class NPC {
  constructor(id, name, description) {
    this.id = id || uuidv4();
    this.name = name;
    this.description = description;
    this.location = null;
    this.dialogue = new Map();
    this.quests = [];
    this.relationship = 0; // -100 to 100
    this.personality = {
      friendly: 0.5,
      trustworthy: 0.5,
      aggressive: 0.5,
      helpful: 0.5
    };
    this.inventory = [];
    this.services = []; // shop, inn, training, etc.
    this.backstory = '';
    this.currentMood = 'neutral';
  }

  addDialogue(trigger, text, responses = []) {
    this.dialogue.set(trigger, { text, responses });
  }

  addQuest(questId) {
    this.quests.push(questId);
  }

  modifyRelationship(amount, reason = '') {
    const oldRelationship = this.relationship;
    this.relationship = Math.max(-100, Math.min(100, this.relationship + amount));

    Logger.quest(`Relationship with ${this.name} changed`, {
      npcId: this.id,
      oldValue: oldRelationship,
      newValue: this.relationship,
      change: amount,
      reason
    });
  }

  getDialogue(trigger = 'greeting') {
    const baseDialogue = this.dialogue.get(trigger);
    if (!baseDialogue) return null;

    // Modify dialogue based on relationship
    let modifiedText = baseDialogue.text;
    if (this.relationship > 50) {
      modifiedText = `${modifiedText} (${this.name} seems very friendly toward you)`;
    } else if (this.relationship < -50) {
      modifiedText = `${modifiedText} (${this.name} glares at you with obvious hostility)`;
    }

    return {
      text: modifiedText,
      responses: baseDialogue.responses,
      relationship: this.relationship
    };
  }

  canOfferQuest(questId) {
    return this.quests.includes(questId) && this.relationship > -25;
  }
}

export class Settlement {
  constructor(id, name, type = 'village') {
    this.id = id || uuidv4();
    this.name = name;
    this.type = type; // village, town, city, fortress
    this.population = 0;
    this.prosperity = 50; // 0-100
    this.safety = 50; // 0-100
    this.buildings = new Map();
    this.npcs = new Map();
    this.resources = new Map();
    this.events = [];
    this.playerReputation = 0;
    this.established = Date.now();
  }

  addBuilding(type, name, level = 1) {
    const buildingId = uuidv4();
    this.buildings.set(buildingId, {
      id: buildingId,
      type,
      name,
      level,
      built: Date.now(),
      services: this.getBuildingServices(type),
      maintenance: 0
    });

    this.updateSettlementStats();
    return buildingId;
  }

  getBuildingServices(type) {
    const services = {
      'inn': ['rest', 'room_rental', 'information'],
      'shop': ['buy', 'sell', 'repair'],
      'blacksmith': ['weapon_crafting', 'armor_crafting', 'repair'],
      'temple': ['healing', 'blessing', 'resurrection'],
      'library': ['research', 'spell_learning', 'lore'],
      'guard_post': ['security', 'job_board', 'law_enforcement'],
      'market': ['trading', 'quest_items', 'rumors'],
      'tavern': ['food', 'drink', 'entertainment', 'rumors']
    };

    return services[type] || [];
  }

  addNPC(npc) {
    this.npcs.set(npc.id, npc);
    npc.location = this.id;
    this.population++;
    this.updateSettlementStats();
  }

  upgradeBuilding(buildingId) {
    const building = this.buildings.get(buildingId);
    if (!building) return false;

    const cost = this.getUpgradeCost(building.type, building.level);
    if (this.canAffordUpgrade(cost)) {
      building.level++;
      this.spendResources(cost);
      this.updateSettlementStats();
      return true;
    }
    return false;
  }

  getUpgradeCost(buildingType, currentLevel) {
    const baseCosts = {
      'inn': { gold: 100, wood: 20, stone: 10 },
      'shop': { gold: 150, wood: 15, stone: 15 },
      'blacksmith': { gold: 200, wood: 10, stone: 30 },
      'temple': { gold: 300, wood: 25, stone: 40 },
      'library': { gold: 250, wood: 30, stone: 20 }
    };

    const baseCost = baseCosts[buildingType] || { gold: 100 };
    const multiplier = Math.pow(1.5, currentLevel);

    const cost = {};
    for (const [resource, amount] of Object.entries(baseCost)) {
      cost[resource] = Math.floor(amount * multiplier);
    }

    return cost;
  }

  canAffordUpgrade(cost) {
    for (const [resource, amount] of Object.entries(cost)) {
      if ((this.resources.get(resource) || 0) < amount) {
        return false;
      }
    }
    return true;
  }

  spendResources(cost) {
    for (const [resource, amount] of Object.entries(cost)) {
      const current = this.resources.get(resource) || 0;
      this.resources.set(resource, Math.max(0, current - amount));
    }
  }

  addResource(type, amount) {
    const current = this.resources.get(type) || 0;
    this.resources.set(type, current + amount);
  }

  updateSettlementStats() {
    // Calculate prosperity based on buildings and population
    let buildingBonus = 0;
    for (const building of this.buildings.values()) {
      buildingBonus += building.level * 5;
    }

    this.prosperity = Math.min(100,
      Math.floor(this.population * 2) + buildingBonus + this.playerReputation
    );

    // Calculate safety based on guard posts and population
    const guardPosts = Array.from(this.buildings.values())
      .filter(b => b.type === 'guard_post')
      .reduce((sum, b) => sum + b.level, 0);

    this.safety = Math.min(100, 50 + (guardPosts * 10) + Math.floor(this.population * 0.5));
  }

  processEvent(event) {
    this.events.push({
      ...event,
      timestamp: Date.now(),
      id: uuidv4()
    });

    // Apply event effects
    if (event.effects) {
      if (event.effects.prosperity) {
        this.prosperity = Math.max(0, Math.min(100, this.prosperity + event.effects.prosperity));
      }
      if (event.effects.safety) {
        this.safety = Math.max(0, Math.min(100, this.safety + event.effects.safety));
      }
      if (event.effects.reputation) {
        this.playerReputation = Math.max(-100, Math.min(100, this.playerReputation + event.effects.reputation));
      }
    }

    Logger.quest(`Settlement event: ${event.title}`, {
      settlementId: this.id,
      eventType: event.type,
      effects: event.effects
    });
  }

  getStatus() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      population: this.population,
      prosperity: this.prosperity,
      safety: this.safety,
      buildings: Array.from(this.buildings.values()),
      resources: Object.fromEntries(this.resources),
      playerReputation: this.playerReputation,
      age: Date.now() - this.established
    };
  }
}

export class RelationshipManager {
  constructor() {
    this.relationships = new Map(); // npcId -> relationship data
    this.factions = new Map(); // factionId -> faction data
    this.playerFactionStanding = new Map(); // factionId -> standing
  }

  addNPCRelationship(npcId, initialValue = 0) {
    this.relationships.set(npcId, {
      value: initialValue,
      history: [],
      traits: new Set(),
      lastInteraction: null
    });
  }

  modifyRelationship(npcId, amount, reason = '', context = {}) {
    const rel = this.relationships.get(npcId);
    if (!rel) {
      this.addNPCRelationship(npcId);
      return this.modifyRelationship(npcId, amount, reason, context);
    }

    const oldValue = rel.value;
    rel.value = Math.max(-100, Math.min(100, rel.value + amount));
    rel.lastInteraction = Date.now();
    rel.history.push({
      timestamp: Date.now(),
      change: amount,
      reason,
      context,
      newValue: rel.value
    });

    // Add relationship traits based on interactions
    if (amount > 0 && amount >= 10) {
      rel.traits.add('grateful');
    } else if (amount < 0 && amount <= -10) {
      rel.traits.add('antagonistic');
    }

    Logger.quest(`Relationship modified with NPC ${npcId}`, {
      npcId,
      oldValue,
      newValue: rel.value,
      change: amount,
      reason
    });

    return rel.value;
  }

  getRelationship(npcId) {
    return this.relationships.get(npcId)?.value || 0;
  }

  getRelationshipStatus(npcId) {
    const value = this.getRelationship(npcId);

    if (value >= 80) return 'beloved';
    if (value >= 60) return 'trusted_friend';
    if (value >= 40) return 'friend';
    if (value >= 20) return 'friendly';
    if (value >= -20) return 'neutral';
    if (value >= -40) return 'unfriendly';
    if (value >= -60) return 'hostile';
    if (value >= -80) return 'enemy';
    return 'nemesis';
  }

  addFaction(id, name, description, alignment = 'neutral') {
    this.factions.set(id, {
      id,
      name,
      description,
      alignment,
      members: new Set(),
      enemies: new Set(),
      allies: new Set(),
      reputation: 0,
      influence: 50
    });

    this.playerFactionStanding.set(id, 0);
  }

  modifyFactionStanding(factionId, amount, reason = '') {
    const currentStanding = this.playerFactionStanding.get(factionId) || 0;
    const newStanding = Math.max(-100, Math.min(100, currentStanding + amount));
    this.playerFactionStanding.set(factionId, newStanding);

    Logger.quest(`Faction standing modified: ${factionId}`, {
      factionId,
      oldStanding: currentStanding,
      newStanding,
      change: amount,
      reason
    });

    return newStanding;
  }

  getFactionStanding(factionId) {
    return this.playerFactionStanding.get(factionId) || 0;
  }

  getInfluentialRelationships() {
    const influential = [];

    for (const [npcId, rel] of this.relationships.entries()) {
      if (Math.abs(rel.value) >= 50) {
        influential.push({
          npcId,
          value: rel.value,
          status: this.getRelationshipStatus(npcId),
          traits: Array.from(rel.traits)
        });
      }
    }

    return influential.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
  }
}

export class WorldManager {
  constructor() {
    this.settlements = new Map();
    this.questManager = new QuestManager();
    this.relationshipManager = new RelationshipManager();
    this.worldEvents = [];
    this.timeManager = new TimeManager();
    this.worldState = {
      day: 1,
      season: 'spring',
      year: 1,
      weather: 'clear',
      globalEvents: new Set()
    };
  }

  addSettlement(settlement) {
    this.settlements.set(settlement.id, settlement);
    Logger.quest(`Settlement added: ${settlement.name}`, {
      settlementId: settlement.id,
      type: settlement.type
    });
  }

  processWorldEvent(event) {
    this.worldEvents.push({
      ...event,
      timestamp: Date.now(),
      id: uuidv4()
    });

    // Apply global effects
    if (event.globalEffects) {
      for (const settlement of this.settlements.values()) {
        settlement.processEvent(event);
      }
    }

    // Apply specific settlement effects
    if (event.settlementEffects) {
      for (const [settlementId, effects] of Object.entries(event.settlementEffects)) {
        const settlement = this.settlements.get(settlementId);
        if (settlement) {
          settlement.processEvent({ ...event, effects });
        }
      }
    }

    Logger.quest(`World event processed: ${event.title}`, {
      eventId: event.id,
      type: event.type,
      affectedSettlements: event.settlementEffects ? Object.keys(event.settlementEffects) : 'all'
    });
  }

  advanceTime(hours = 1) {
    this.worldState.day += hours / 24;

    // Process daily events
    if (Math.floor(this.worldState.day) > Math.floor(this.worldState.day - hours / 24)) {
      this.processDailyEvents();
    }

    // Update seasons
    if (this.worldState.day >= 90) {
      this.worldState.day = 0;
      this.advanceSeason();
    }
  }

  advanceSeason() {
    const seasons = ['spring', 'summer', 'autumn', 'winter'];
    const currentIndex = seasons.indexOf(this.worldState.season);
    const nextIndex = (currentIndex + 1) % seasons.length;

    if (nextIndex === 0) {
      this.worldState.year++;
    }

    this.worldState.season = seasons[nextIndex];

    // Trigger seasonal events
    this.processWorldEvent({
      title: `${this.worldState.season} has arrived`,
      type: 'seasonal',
      description: `The world transitions into ${this.worldState.season}`,
      globalEffects: true
    });
  }

  processDailyEvents() {
    // Random world events
    if (Math.random() < 0.1) { // 10% chance daily
      const events = [
        {
          title: 'Merchant Caravan Arrives',
          type: 'economic',
          description: 'A trading caravan brings new goods and opportunities',
          effects: { prosperity: 5 }
        },
        {
          title: 'Bandit Attack',
          type: 'conflict',
          description: 'Bandits threaten the roads between settlements',
          effects: { safety: -10 }
        },
        {
          title: 'Good Harvest',
          type: 'economic',
          description: 'The harvest is bountiful this season',
          effects: { prosperity: 10 }
        }
      ];

      const randomEvent = events[Math.floor(Math.random() * events.length)];
      this.processWorldEvent(randomEvent);
    }
  }

  getWorldStatus() {
    return {
      worldState: this.worldState,
      settlements: Array.from(this.settlements.values()).map(s => s.getStatus()),
      activeQuests: this.questManager.getActiveQuests().length,
      recentEvents: this.worldEvents.slice(-10),
      playerInfluence: this.calculatePlayerInfluence()
    };
  }

  calculatePlayerInfluence() {
    let totalInfluence = 0;

    for (const settlement of this.settlements.values()) {
      totalInfluence += settlement.playerReputation;
    }

    for (const standing of this.relationshipManager.playerFactionStanding.values()) {
      totalInfluence += standing * 0.5;
    }

    return Math.max(0, Math.min(1000, totalInfluence));
  }
}

class TimeManager {
  constructor() {
    this.gameTime = 0; // in game hours
    this.timeScale = 1; // 1 real minute = 1 game hour by default
    this.lastUpdate = Date.now();
  }

  update() {
    const now = Date.now();
    const realTimeElapsed = now - this.lastUpdate;
    const gameTimeElapsed = (realTimeElapsed / 60000) * this.timeScale; // Convert to game hours

    this.gameTime += gameTimeElapsed;
    this.lastUpdate = now;

    return gameTimeElapsed;
  }

  getTimeOfDay() {
    const hour = Math.floor(this.gameTime % 24);

    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  }

  getDayOfWeek() {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dayIndex = Math.floor(this.gameTime / 24) % 7;
    return days[dayIndex];
  }

  setTimeScale(scale) {
    this.timeScale = scale;
  }
}

// WorldManager and TimeManager are already exported above