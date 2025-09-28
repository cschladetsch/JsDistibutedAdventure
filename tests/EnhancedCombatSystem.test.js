/**
 * Test suite for Enhanced Combat System
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import {
  EnhancedCombatSystem,
  Character,
  Equipment,
  Spell,
  Equipment_Templates,
  Spell_Templates
} from '../lib/EnhancedCombatSystem.js';

describe('Equipment', () => {
  test('should create equipment with correct stats', () => {
    const sword = new Equipment('Iron Sword', 'weapon', {
      damage: 15,
      accuracy: 0.85,
      durability: 100
    });

    expect(sword.name).toBe('Iron Sword');
    expect(sword.type).toBe('weapon');
    expect(sword.stats.damage).toBe(15);
    expect(sword.stats.accuracy).toBe(0.85);
    expect(sword.stats.durability).toBe(100);
  });

  test('should calculate damage based on durability', () => {
    const sword = new Equipment('Test Sword', 'weapon', {
      damage: 20,
      durability: 50,
      maxDurability: 100
    });

    expect(sword.getDamage()).toBe(10); // 50% durability = 50% damage
  });

  test('should take damage and break when durability reaches 0', () => {
    const sword = new Equipment('Fragile Sword', 'weapon', {
      damage: 10,
      durability: 2,
      maxDurability: 100
    });

    expect(sword.takeDamage(1)).toBe(false); // Still has durability
    expect(sword.takeDamage(1)).toBe(true);  // Broken
    expect(sword.stats.durability).toBe(0);
  });

  test('should repair equipment correctly', () => {
    const sword = new Equipment('Damaged Sword', 'weapon', {
      durability: 50,
      maxDurability: 100
    });

    sword.repair(30);
    expect(sword.stats.durability).toBe(80);

    sword.repair(50); // Should cap at maxDurability
    expect(sword.stats.durability).toBe(100);
  });
});

describe('Spell', () => {
  test('should create spell with correct properties', () => {
    const fireball = new Spell('Fireball', 'damage', 15, {
      baseDamage: 25,
      cooldown: 2
    });

    expect(fireball.name).toBe('Fireball');
    expect(fireball.type).toBe('damage');
    expect(fireball.manaCost).toBe(15);
    expect(fireball.effect.baseDamage).toBe(25);
    expect(fireball.cooldown).toBe(2);
  });

  test('should check if caster can cast spell', () => {
    const spell = new Spell('Test Spell', 'damage', 20, {});
    const caster = { mana: 25 };

    expect(spell.canCast(caster)).toBe(true);

    caster.mana = 15;
    expect(spell.canCast(caster)).toBe(false);

    spell.currentCooldown = 1;
    caster.mana = 25;
    expect(spell.canCast(caster)).toBe(false);
  });

  test('should reduce cooldown over time', () => {
    const spell = new Spell('Test Spell', 'damage', 10, { cooldown: 3 });
    spell.currentCooldown = 3;

    spell.reduceCooldown();
    expect(spell.currentCooldown).toBe(2);

    spell.reduceCooldown();
    spell.reduceCooldown();
    expect(spell.currentCooldown).toBe(0);

    spell.reduceCooldown(); // Should not go below 0
    expect(spell.currentCooldown).toBe(0);
  });
});

describe('Character', () => {
  let character;

  beforeEach(() => {
    character = new Character('Test Hero', {
      health: 100,
      maxHealth: 100,
      mana: 50,
      attack: 15,
      defense: 8
    });
  });

  test('should create character with correct stats', () => {
    expect(character.name).toBe('Test Hero');
    expect(character.baseStats.health).toBe(100);
    expect(character.baseStats.attack).toBe(15);
    expect(character.stats.attack).toBe(15); // Should equal base stats initially
  });

  test('should equip and unequip items', () => {
    const sword = new Equipment('Test Sword', 'weapon', { damage: 10 });

    const oldWeapon = character.equip(sword);
    expect(oldWeapon).toBeNull(); // No previous weapon
    expect(character.equipment.weapon).toBe(sword);
    expect(character.stats.damage).toBe(10); // Should include weapon damage

    const unequipped = character.unequip('weapon');
    expect(unequipped).toBe(sword);
    expect(character.equipment.weapon).toBeNull();
  });

  test('should learn and cast spells', () => {
    const fireball = new Spell('Fireball', 'damage', 15, { baseDamage: 20 });

    character.learnSpell(fireball);
    expect(character.spells).toContain(fireball);
    expect(character.canCastSpell('Fireball')).toBe(true);

    // Mock target for spell casting
    const target = new Character('Enemy', { health: 50 });
    target.takeDamage = jest.fn();

    const result = character.castSpell('Fireball', target);
    expect(character.mana).toBe(35); // 50 - 15 mana cost
    expect(result.type).toBe('damage');
  });

  test('should take damage and heal correctly', () => {
    const initialHealth = character.health;

    const damageDealt = character.takeDamage(20);
    expect(damageDealt).toBeGreaterThan(0); // Some damage after defense
    expect(character.health).toBeLessThan(initialHealth);

    const healingAmount = character.heal(10);
    expect(healingAmount).toBe(10);
    expect(character.health).toBe(initialHealth - damageDealt + 10);
  });

  test('should check if character is alive', () => {
    expect(character.isAlive()).toBe(true);

    character.baseStats.health = 0;
    expect(character.isAlive()).toBe(false);
  });

  test('should update temporary effects', () => {
    character.temporaryEffects = [
      { type: 'buff', stat: 'attack', amount: 5, duration: 2 },
      { type: 'debuff', stat: 'defense', amount: -3, duration: 1 }
    ];

    character.updateEffects();

    expect(character.temporaryEffects).toHaveLength(1); // One effect should expire
    expect(character.temporaryEffects[0].duration).toBe(1); // Remaining effect duration reduced
  });
});

describe('EnhancedCombatSystem', () => {
  let combat;
  let player;
  let enemy;

  beforeEach(() => {
    player = {
      health: 100,
      maxHealth: 100,
      attack: 15,
      defense: 5,
      speed: 12
    };

    enemy = {
      name: 'Test Enemy',
      health: 80,
      attack: 12,
      defense: 3,
      speed: 10
    };

    combat = new EnhancedCombatSystem(player, enemy);
  });

  test('should initialize combat with correct participants', () => {
    expect(combat.player.name).toBe('Player');
    expect(combat.enemy.name).toBe('Test Enemy');
    expect(combat.round).toBe(0);
  });

  test('should determine turn order based on speed', () => {
    combat.initializeTurnOrder();
    expect(combat.turnQueue[0]).toBe('player'); // Player has higher speed
  });

  test('should get available player actions', () => {
    const actions = combat.getPlayerActions();

    expect(actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'attack', available: true }),
        expect.objectContaining({ type: 'defend', available: true }),
        expect.objectContaining({ type: 'flee', available: true })
      ])
    );
  });

  test('should perform attack with timing result', async () => {
    const timingResult = { multiplier: 1.2, zone: 'good' };

    const result = await combat.performAttack(combat.player, combat.enemy, timingResult);

    expect(result.type).toMatch(/hit|critical|miss/);
    if (result.type !== 'miss') {
      expect(result.damage).toBeGreaterThan(0);
    }
  });

  test('should perform defend action', () => {
    const result = combat.performDefend(combat.player);

    expect(result.type).toBe('defend');
    expect(result.defenseBoost).toBeGreaterThan(0);
    expect(result.manaRestore).toBeGreaterThan(0);
  });

  test('should attempt flee with success chance', () => {
    const result = combat.attemptFlee(combat.player);

    expect(result.type).toBe('flee');
    expect(typeof result.success).toBe('boolean');
  });

  test('should get combat stats', () => {
    const stats = combat.getCombatStats();

    expect(stats).toHaveProperty('round');
    expect(stats).toHaveProperty('player');
    expect(stats).toHaveProperty('enemy');
    expect(stats.player).toHaveProperty('health');
    expect(stats.player).toHaveProperty('mana');
    expect(stats.enemy).toHaveProperty('health');
  });
});

describe('Equipment Templates', () => {
  test('should have predefined weapons', () => {
    expect(Equipment_Templates.weapons.rustySword).toBeInstanceOf(Equipment);
    expect(Equipment_Templates.weapons.dragonSlayer).toBeInstanceOf(Equipment);
    expect(Equipment_Templates.weapons.dragonSlayer.rarity).toBe('legendary');
  });

  test('should have predefined armor', () => {
    expect(Equipment_Templates.armor.leatherArmor).toBeInstanceOf(Equipment);
    expect(Equipment_Templates.armor.plateArmor).toBeInstanceOf(Equipment);
  });
});

describe('Spell Templates', () => {
  test('should have predefined spells', () => {
    expect(Spell_Templates.fireball).toBeInstanceOf(Spell);
    expect(Spell_Templates.heal).toBeInstanceOf(Spell);
    expect(Spell_Templates.fireball.type).toBe('damage');
    expect(Spell_Templates.heal.type).toBe('heal');
  });

  test('should have correct mana costs', () => {
    expect(Spell_Templates.fireball.manaCost).toBe(15);
    expect(Spell_Templates.lightning.manaCost).toBe(20);
  });
});

describe('Integration Tests', () => {
  test('should simulate a complete combat encounter', async () => {
    const player = {
      health: 100,
      attack: 20,
      defense: 10,
      speed: 15
    };

    const enemy = {
      name: 'Goblin',
      health: 50,
      attack: 8,
      defense: 2,
      speed: 8
    };

    const combat = new EnhancedCombatSystem(player, enemy);

    // Mock the turn processing to avoid infinite loops
    combat.processTurn = jest.fn().mockResolvedValue();

    // Should be able to start combat without errors
    expect(() => combat.initializeTurnOrder()).not.toThrow();
    expect(combat.player.isAlive()).toBe(true);
    expect(combat.enemy.isAlive()).toBe(true);
  });

  test('should handle equipment effects in combat', () => {
    const character = new Character('Warrior');
    const enchantedSword = new Equipment('Enchanted Sword', 'weapon', {
      damage: 20,
      critChance: 0.2,
      durability: 100
    });

    character.equip(enchantedSword);

    expect(character.stats.damage).toBe(20);
    expect(character.getCritChance()).toBeGreaterThan(0.1); // Base + weapon bonus
  });
});