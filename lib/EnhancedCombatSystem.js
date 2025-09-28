/**
 * Enhanced Combat System
 * Advanced RPG combat with magic, armor, consumables, and tactical options
 */

import Logger from './Logger.js';
import ConfigManager from './ConfigManager.js';
import ErrorHandler, { CombatError } from './ErrorHandler.js';

export class Equipment {
  constructor(name, type, stats = {}) {
    this.name = name;
    this.type = type; // weapon, armor, accessory
    this.stats = {
      damage: stats.damage || 0,
      defense: stats.defense || 0,
      accuracy: stats.accuracy || 1.0,
      critChance: stats.critChance || 0,
      magicPower: stats.magicPower || 0,
      durability: stats.durability || 100,
      maxDurability: stats.maxDurability || 100,
      ...stats
    };
    this.enchantments = stats.enchantments || [];
    this.rarity = stats.rarity || 'common';
  }

  getDamage() {
    const durabilityMultiplier = this.stats.durability / this.stats.maxDurability;
    return Math.floor(this.stats.damage * durabilityMultiplier);
  }

  getDefense() {
    const durabilityMultiplier = this.stats.durability / this.stats.maxDurability;
    return Math.floor(this.stats.defense * durabilityMultiplier);
  }

  takeDamage(amount = 1) {
    this.stats.durability = Math.max(0, this.stats.durability - amount);
    return this.stats.durability <= 0;
  }

  repair(amount = 100) {
    this.stats.durability = Math.min(this.stats.maxDurability, this.stats.durability + amount);
  }
}

export class Spell {
  constructor(name, type, cost, effect) {
    this.name = name;
    this.type = type; // damage, heal, buff, debuff
    this.manaCost = cost;
    this.effect = effect;
    this.cooldown = effect.cooldown || 0;
    this.currentCooldown = 0;
  }

  canCast(caster) {
    return caster.mana >= this.manaCost && this.currentCooldown === 0;
  }

  cast(caster, target = null) {
    if (!this.canCast(caster)) {
      throw new CombatError('Cannot cast spell', { spell: this.name, reason: 'insufficient_mana_or_cooldown' });
    }

    caster.mana -= this.manaCost;
    this.currentCooldown = this.cooldown;

    return this.applyEffect(caster, target);
  }

  applyEffect(caster, target) {
    const result = { type: this.type, effects: [] };

    switch (this.type) {
      case 'damage':
        if (target) {
          const damage = this.calculateDamage(caster);
          target.takeDamage(damage);
          result.effects.push({ type: 'damage', amount: damage, target: target.name });
        }
        break;

      case 'heal':
        const healAmount = this.calculateHealing(caster);
        caster.heal(healAmount);
        result.effects.push({ type: 'heal', amount: healAmount, target: caster.name });
        break;

      case 'buff':
        this.applyBuff(caster);
        result.effects.push({ type: 'buff', spell: this.name, target: caster.name });
        break;

      case 'debuff':
        if (target) {
          this.applyDebuff(target);
          result.effects.push({ type: 'debuff', spell: this.name, target: target.name });
        }
        break;
    }

    return result;
  }

  calculateDamage(caster) {
    const baseDamage = this.effect.baseDamage || 10;
    const magicPower = caster.stats?.magicPower || 0;
    return Math.floor(baseDamage + (magicPower * 0.5));
  }

  calculateHealing(caster) {
    const baseHeal = this.effect.baseHeal || 15;
    const magicPower = caster.stats?.magicPower || 0;
    return Math.floor(baseHeal + (magicPower * 0.3));
  }

  applyBuff(target) {
    // Implementation for buff effects
    if (this.effect.statBonus) {
      target.temporaryEffects = target.temporaryEffects || [];
      target.temporaryEffects.push({
        type: 'buff',
        stat: this.effect.statBonus.stat,
        amount: this.effect.statBonus.amount,
        duration: this.effect.duration || 3
      });
    }
  }

  applyDebuff(target) {
    // Implementation for debuff effects
    if (this.effect.statPenalty) {
      target.temporaryEffects = target.temporaryEffects || [];
      target.temporaryEffects.push({
        type: 'debuff',
        stat: this.effect.statPenalty.stat,
        amount: -this.effect.statPenalty.amount,
        duration: this.effect.duration || 3
      });
    }
  }

  reduceCooldown() {
    if (this.currentCooldown > 0) {
      this.currentCooldown--;
    }
  }
}

export class Character {
  constructor(name, stats = {}) {
    this.name = name;
    this.baseStats = {
      health: stats.health || 100,
      maxHealth: stats.maxHealth || 100,
      mana: stats.mana || 50,
      maxMana: stats.maxMana || 50,
      attack: stats.attack || 10,
      defense: stats.defense || 5,
      magicPower: stats.magicPower || 5,
      speed: stats.speed || 10,
      accuracy: stats.accuracy || 0.8,
      critChance: stats.critChance || 0.1
    };

    this.equipment = {
      weapon: null,
      armor: null,
      accessory: null
    };

    this.spells = [];
    this.temporaryEffects = [];
    this.statusEffects = new Set();
  }

  get stats() {
    const total = { ...this.baseStats };

    // Apply equipment bonuses
    for (const [slot, item] of Object.entries(this.equipment)) {
      if (item) {
        for (const [stat, value] of Object.entries(item.stats)) {
          if (total[stat] !== undefined) {
            total[stat] += value;
          }
        }
      }
    }

    // Apply temporary effects
    for (const effect of this.temporaryEffects) {
      if (total[effect.stat] !== undefined) {
        total[effect.stat] += effect.amount;
      }
    }

    return total;
  }

  get health() {
    return this.baseStats.health;
  }

  get mana() {
    return this.baseStats.mana;
  }

  equip(item) {
    if (!(item instanceof Equipment)) {
      throw new CombatError('Invalid equipment', { item });
    }

    const oldItem = this.equipment[item.type];
    this.equipment[item.type] = item;

    Logger.combat(`${this.name} equipped ${item.name}`, {
      character: this.name,
      item: item.name,
      type: item.type
    });

    return oldItem;
  }

  unequip(slot) {
    const item = this.equipment[slot];
    this.equipment[slot] = null;
    return item;
  }

  learnSpell(spell) {
    if (!(spell instanceof Spell)) {
      throw new CombatError('Invalid spell', { spell });
    }

    this.spells.push(spell);
    Logger.combat(`${this.name} learned ${spell.name}`, {
      character: this.name,
      spell: spell.name
    });
  }

  canCastSpell(spellName) {
    const spell = this.spells.find(s => s.name === spellName);
    return spell && spell.canCast(this);
  }

  castSpell(spellName, target = null) {
    const spell = this.spells.find(s => s.name === spellName);
    if (!spell) {
      throw new CombatError('Spell not found', { spell: spellName });
    }

    return spell.cast(this, target);
  }

  takeDamage(amount) {
    const actualDamage = Math.max(1, amount - this.stats.defense);
    this.baseStats.health = Math.max(0, this.baseStats.health - actualDamage);

    // Damage equipment
    if (this.equipment.armor && Math.random() < 0.1) {
      this.equipment.armor.takeDamage(1);
    }

    Logger.combat(`${this.name} takes ${actualDamage} damage`, {
      character: this.name,
      damage: actualDamage,
      healthRemaining: this.baseStats.health
    });

    return actualDamage;
  }

  heal(amount) {
    const oldHealth = this.baseStats.health;
    this.baseStats.health = Math.min(this.stats.maxHealth, this.baseStats.health + amount);
    const actualHealing = this.baseStats.health - oldHealth;

    Logger.combat(`${this.name} heals ${actualHealing} HP`, {
      character: this.name,
      healing: actualHealing,
      currentHealth: this.baseStats.health
    });

    return actualHealing;
  }

  restoreMana(amount) {
    const oldMana = this.baseStats.mana;
    this.baseStats.mana = Math.min(this.stats.maxMana, this.baseStats.mana + amount);
    return this.baseStats.mana - oldMana;
  }

  isAlive() {
    return this.baseStats.health > 0;
  }

  updateEffects() {
    // Update temporary effects
    this.temporaryEffects = this.temporaryEffects.filter(effect => {
      effect.duration--;
      return effect.duration > 0;
    });

    // Update spell cooldowns
    this.spells.forEach(spell => spell.reduceCooldown());
  }

  getEffectiveAccuracy() {
    let accuracy = this.stats.accuracy;

    // Apply status effects
    if (this.statusEffects.has('blinded')) accuracy *= 0.5;
    if (this.statusEffects.has('focused')) accuracy *= 1.2;

    return Math.min(1.0, Math.max(0.1, accuracy));
  }

  getCritChance() {
    let critChance = this.stats.critChance;

    // Apply temporary effects
    for (const effect of this.temporaryEffects) {
      if (effect.stat === 'critChance') {
        critChance += effect.amount;
      }
    }

    return Math.min(0.95, Math.max(0, critChance));
  }
}

export class EnhancedCombatSystem {
  constructor(player, enemy) {
    this.player = new Character('Player', player);
    this.enemy = new Character(enemy.name || 'Enemy', enemy);
    this.round = 0;
    this.combatLog = [];
    this.turnQueue = [];
  }

  async startCombat() {
    Logger.combat('Combat started', {
      player: this.player.name,
      enemy: this.enemy.name
    });

    this.initializeTurnOrder();

    while (this.player.isAlive() && this.enemy.isAlive()) {
      this.round++;
      await this.processTurn();
    }

    const result = this.player.isAlive() ? 'victory' : 'defeat';
    Logger.combat('Combat ended', {
      result,
      rounds: this.round,
      playerHealth: this.player.health,
      enemyHealth: this.enemy.health
    });

    return result;
  }

  initializeTurnOrder() {
    // Simple speed-based turn order
    if (this.player.stats.speed >= this.enemy.stats.speed) {
      this.turnQueue = ['player', 'enemy'];
    } else {
      this.turnQueue = ['enemy', 'player'];
    }
  }

  async processTurn() {
    for (const actor of this.turnQueue) {
      if (actor === 'player') {
        await this.playerTurn();
      } else {
        await this.enemyTurn();
      }

      if (!this.player.isAlive() || !this.enemy.isAlive()) {
        break;
      }
    }

    // Update effects at end of round
    this.player.updateEffects();
    this.enemy.updateEffects();
  }

  async playerTurn() {
    // This would integrate with the UI system for player input
    // For now, return the available actions
    return this.getPlayerActions();
  }

  getPlayerActions() {
    const actions = [
      { type: 'attack', name: 'Attack', available: true },
      { type: 'defend', name: 'Defend', available: true }
    ];

    // Add spell actions
    this.player.spells.forEach(spell => {
      actions.push({
        type: 'spell',
        name: spell.name,
        available: spell.canCast(this.player),
        manaCost: spell.manaCost
      });
    });

    // Add item actions (placeholder)
    actions.push({ type: 'item', name: 'Use Item', available: false });
    actions.push({ type: 'flee', name: 'Flee', available: true });

    return actions;
  }

  async executePlayerAction(action, timingResult = null) {
    try {
      switch (action.type) {
        case 'attack':
          return await this.performAttack(this.player, this.enemy, timingResult);
        case 'defend':
          return this.performDefend(this.player);
        case 'spell':
          return this.player.castSpell(action.spellName, this.enemy);
        case 'flee':
          return this.attemptFlee(this.player);
        default:
          throw new CombatError('Unknown action type', { action });
      }
    } catch (error) {
      return ErrorHandler.handleStoryError(error, { action, combat: true });
    }
  }

  async enemyTurn() {
    // Simple AI for enemy actions
    const actions = ['attack', 'defend'];

    // Add spell casting if enemy has spells
    if (this.enemy.spells.length > 0) {
      const availableSpells = this.enemy.spells.filter(spell => spell.canCast(this.enemy));
      if (availableSpells.length > 0) {
        actions.push('spell');
      }
    }

    const action = actions[Math.floor(Math.random() * actions.length)];

    switch (action) {
      case 'attack':
        return await this.performAttack(this.enemy, this.player);
      case 'defend':
        return this.performDefend(this.enemy);
      case 'spell':
        const spell = this.enemy.spells.find(s => s.canCast(this.enemy));
        return this.enemy.castSpell(spell.name, this.player);
    }
  }

  async performAttack(attacker, defender, timingResult = null) {
    const weapon = attacker.equipment.weapon;
    let baseDamage = attacker.stats.attack;

    if (weapon) {
      baseDamage += weapon.getDamage();
    }

    let accuracy = attacker.getEffectiveAccuracy();
    let critChance = attacker.getCritChance();

    // Apply timing result if provided (from timing bar)
    if (timingResult) {
      accuracy *= timingResult.multiplier;
      if (timingResult.zone === 'perfect') {
        critChance = Math.min(0.95, critChance + 0.3);
      }
    }

    // Check if attack hits
    if (Math.random() > accuracy) {
      Logger.combat(`${attacker.name} misses attack`, {
        attacker: attacker.name,
        defender: defender.name
      });
      return { type: 'miss', damage: 0 };
    }

    // Check for critical hit
    const isCritical = Math.random() < critChance;
    let finalDamage = baseDamage;

    if (isCritical) {
      finalDamage *= 2;
    }

    // Apply variance
    const variance = 0.1;
    finalDamage *= (1 + (Math.random() - 0.5) * variance);
    finalDamage = Math.floor(finalDamage);

    const actualDamage = defender.takeDamage(finalDamage);

    // Damage weapon durability
    if (weapon && Math.random() < 0.05) {
      weapon.takeDamage(1);
    }

    return {
      type: isCritical ? 'critical' : 'hit',
      damage: actualDamage,
      weaponDamaged: weapon && weapon.stats.durability <= 0
    };
  }

  performDefend(character) {
    // Defending increases defense and restores mana
    const defenseBoost = Math.floor(character.stats.defense * 0.5);
    const manaRestore = Math.floor(character.stats.maxMana * 0.1);

    character.temporaryEffects.push({
      type: 'buff',
      stat: 'defense',
      amount: defenseBoost,
      duration: 1
    });

    character.restoreMana(manaRestore);

    Logger.combat(`${character.name} defends`, {
      character: character.name,
      defenseBoost,
      manaRestore
    });

    return {
      type: 'defend',
      defenseBoost,
      manaRestore
    };
  }

  attemptFlee(character) {
    const fleeChance = 0.6; // Base 60% chance to flee
    const speedAdvantage = character.stats.speed - this.enemy.stats.speed;
    const finalChance = Math.min(0.9, fleeChance + (speedAdvantage * 0.02));

    const success = Math.random() < finalChance;

    Logger.combat(`${character.name} attempts to flee`, {
      character: character.name,
      success,
      chance: finalChance
    });

    return {
      type: 'flee',
      success
    };
  }

  getCombatStats() {
    return {
      round: this.round,
      player: {
        name: this.player.name,
        health: this.player.health,
        maxHealth: this.player.stats.maxHealth,
        mana: this.player.mana,
        maxMana: this.player.stats.maxMana,
        effects: this.player.temporaryEffects.length,
        spells: this.player.spells.map(s => ({
          name: s.name,
          available: s.canCast(this.player)
        }))
      },
      enemy: {
        name: this.enemy.name,
        health: this.enemy.health,
        maxHealth: this.enemy.stats.maxHealth,
        effects: this.enemy.temporaryEffects.length
      }
    };
  }
}

// Predefined equipment
export const Equipment_Templates = {
  weapons: {
    rustySword: new Equipment('Rusty Sword', 'weapon', { damage: 8, accuracy: 0.8, durability: 80 }),
    ironSword: new Equipment('Iron Sword', 'weapon', { damage: 12, accuracy: 0.85, durability: 100 }),
    enchantedBlade: new Equipment('Enchanted Blade', 'weapon', {
      damage: 18, accuracy: 0.9, magicPower: 5, durability: 120, rarity: 'rare'
    }),
    dragonSlayer: new Equipment('Dragon Slayer', 'weapon', {
      damage: 25, accuracy: 0.95, critChance: 0.15, durability: 150, rarity: 'legendary'
    })
  },
  armor: {
    leatherArmor: new Equipment('Leather Armor', 'armor', { defense: 3, durability: 60 }),
    chainMail: new Equipment('Chain Mail', 'armor', { defense: 7, durability: 100 }),
    plateArmor: new Equipment('Plate Armor', 'armor', { defense: 12, durability: 150 }),
    magicRobes: new Equipment('Magic Robes', 'armor', {
      defense: 5, magicPower: 8, maxMana: 20, durability: 80, rarity: 'rare'
    })
  }
};

// Predefined spells
export const Spell_Templates = {
  fireball: new Spell('Fireball', 'damage', 15, { baseDamage: 20, cooldown: 2 }),
  heal: new Spell('Heal', 'heal', 10, { baseHeal: 25 }),
  shield: new Spell('Shield', 'buff', 12, {
    statBonus: { stat: 'defense', amount: 5 },
    duration: 3
  }),
  lightning: new Spell('Lightning Bolt', 'damage', 20, { baseDamage: 30, cooldown: 3 }),
  regeneration: new Spell('Regeneration', 'heal', 15, { baseHeal: 15, duration: 3 })
};