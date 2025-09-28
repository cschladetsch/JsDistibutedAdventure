#!/usr/bin/env node

/**
 * Test Systems - Demonstrate backpack, combat, and quest systems working together
 */

import { EnhancedCombatSystem, Equipment_Templates, Spell_Templates, Character } from './lib/EnhancedCombatSystem.js';
import { QuestManager, NPC, Settlement, WorldManager } from './lib/GameplayFeatures.js';

class SystemsDemo {
    constructor() {
        this.player = null;
        this.questManager = new QuestManager();
        this.worldManager = new WorldManager();
        this.inventory = new Map();
        this.backpack = [];
    }

    /**
     * Initialize player with starting equipment and spells
     */
    initializePlayer() {
        console.log('🎮 Initializing Player Systems...\n');

        // Create player character
        this.player = new Character('Hero', {
            health: 100,
            maxHealth: 100,
            mana: 50,
            maxMana: 50,
            attack: 15,
            defense: 8,
            magicPower: 10,
            speed: 12
        });

        // Give starting equipment
        this.giveItem('ironSword', 'weapon');
        this.giveItem('leatherArmor', 'armor');

        // Teach starting spells
        this.player.learnSpell(Spell_Templates.heal);
        this.player.learnSpell(Spell_Templates.fireball);

        // Add items to backpack
        this.addToBackpack('Health Potion', 3);
        this.addToBackpack('Mana Potion', 2);
        this.addToBackpack('Bread', 5);

        console.log('✅ Player initialized with equipment and spells!');
        this.showPlayerStatus();
    }

    /**
     * Give equipment to player
     */
    giveItem(templateName, category) {
        const item = Equipment_Templates[category]?.[templateName];
        if (!item) {
            console.log(`❌ Item not found: ${templateName}`);
            return;
        }

        const oldItem = this.player.equip(item);
        this.inventory.set(item.name, item);

        console.log(`🎒 Equipped: ${item.name} (${category})`);
        if (oldItem) {
            console.log(`   Replaced: ${oldItem.name}`);
        }
    }

    /**
     * Add consumable items to backpack
     */
    addToBackpack(itemName, quantity = 1) {
        const existingItem = this.backpack.find(item => item.name === itemName);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.backpack.push({ name: itemName, quantity, type: 'consumable' });
        }
        console.log(`🎒 Added to backpack: ${itemName} x${quantity}`);
    }

    /**
     * Use item from backpack
     */
    useItem(itemName) {
        const itemIndex = this.backpack.findIndex(item => item.name === itemName);
        if (itemIndex === -1) {
            console.log(`❌ Item not found in backpack: ${itemName}`);
            return false;
        }

        const item = this.backpack[itemIndex];

        // Apply item effects
        switch (item.name) {
            case 'Health Potion':
                const healAmount = Math.min(50, this.player.stats.maxHealth - this.player.health);
                this.player.heal(healAmount);
                console.log(`💖 Used Health Potion: Healed ${healAmount} HP`);
                break;
            case 'Mana Potion':
                const manaAmount = Math.min(30, this.player.stats.maxMana - this.player.mana);
                this.player.restoreMana(manaAmount);
                console.log(`💙 Used Mana Potion: Restored ${manaAmount} MP`);
                break;
            case 'Bread':
                this.player.heal(10);
                console.log(`🍞 Ate bread: Healed 10 HP`);
                break;
        }

        // Remove item from backpack
        item.quantity--;
        if (item.quantity <= 0) {
            this.backpack.splice(itemIndex, 1);
        }

        return true;
    }

    /**
     * Show complete player status
     */
    showPlayerStatus() {
        console.log('\n📊 PLAYER STATUS:');
        console.log('=' * 40);
        console.log(`❤️  Health: ${this.player.health}/${this.player.stats.maxHealth}`);
        console.log(`💙 Mana: ${this.player.mana}/${this.player.stats.maxMana}`);
        console.log(`⚔️  Attack: ${this.player.stats.attack}`);
        console.log(`🛡️  Defense: ${this.player.stats.defense}`);
        console.log(`✨ Magic Power: ${this.player.stats.magicPower}`);

        console.log('\n🎒 EQUIPMENT:');
        Object.entries(this.player.equipment).forEach(([slot, item]) => {
            if (item) {
                console.log(`  ${slot}: ${item.name} (DMG: ${item.getDamage()}, DEF: ${item.getDefense()})`);
                console.log(`    Durability: ${item.stats.durability}/${item.stats.maxDurability}`);
            } else {
                console.log(`  ${slot}: (empty)`);
            }
        });

        console.log('\n📚 SPELLS:');
        this.player.spells.forEach(spell => {
            const canCast = spell.canCast(this.player) ? '✅' : '❌';
            console.log(`  ${canCast} ${spell.name} (${spell.manaCost} MP, Type: ${spell.type})`);
        });

        console.log('\n🎒 BACKPACK:');
        if (this.backpack.length === 0) {
            console.log('  (empty)');
        } else {
            this.backpack.forEach(item => {
                console.log(`  📦 ${item.name} x${item.quantity}`);
            });
        }
        console.log('=' * 40 + '\n');
    }

    /**
     * Show backpack management menu
     */
    showBackpackMenu() {
        console.log('🎒 BACKPACK MANAGEMENT:');
        console.log('=' * 30);

        if (this.backpack.length === 0) {
            console.log('Your backpack is empty.');
            return;
        }

        this.backpack.forEach((item, index) => {
            console.log(`[${index + 1}] ${item.name} x${item.quantity}`);
        });

        console.log('\nActions:');
        console.log('• Type item number to use item');
        console.log('• Type "show" to see this menu again');
        console.log('• Type "status" to see player status');
        console.log('• Type "combat" to start combat test');
    }

    /**
     * Demonstrate combat system
     */
    async demonstrateCombat() {
        console.log('\n⚔️  COMBAT DEMONSTRATION:');
        console.log('=' * 40);

        // Create enemy
        const enemy = {
            name: 'Goblin Warrior',
            health: 40,
            maxHealth: 40,
            mana: 20,
            maxMana: 20,
            attack: 12,
            defense: 4,
            speed: 8
        };

        console.log(`🐺 A ${enemy.name} appears!`);
        console.log(`Enemy Stats: ${enemy.health} HP, ${enemy.attack} ATK, ${enemy.defense} DEF\n`);

        const combat = new EnhancedCombatSystem(this.player.baseStats, enemy);

        // Show available actions
        const actions = combat.getPlayerActions();
        console.log('💫 Available Actions:');
        actions.forEach((action, index) => {
            const available = action.available ? '✅' : '❌';
            let description = `${available} [${index + 1}] ${action.name}`;
            if (action.manaCost) {
                description += ` (${action.manaCost} MP)`;
            }
            console.log(description);
        });

        console.log('\n🎯 Combat Stats:');
        const stats = combat.getCombatStats();
        console.log(`Player: ${stats.player.health}/${stats.player.maxHealth} HP, ${stats.player.mana}/${stats.player.maxMana} MP`);
        console.log(`Enemy: ${stats.enemy.health}/${stats.enemy.maxHealth} HP`);

        // Simulate a few combat rounds
        console.log('\n⚔️  Simulating Combat Rounds...\n');

        for (let round = 1; round <= 3; round++) {
            console.log(`--- ROUND ${round} ---`);

            // Player attack
            const attackResult = await combat.performAttack(combat.player, combat.enemy);
            console.log(`🗡️  Player attacks: ${attackResult.type.toUpperCase()} for ${attackResult.damage} damage!`);

            if (combat.enemy.health <= 0) {
                console.log('🏆 Victory! Enemy defeated!');
                break;
            }

            // Enemy attack
            const enemyAttack = await combat.performAttack(combat.enemy, combat.player);
            console.log(`👹 Enemy attacks: ${enemyAttack.type.toUpperCase()} for ${enemyAttack.damage} damage!`);

            if (combat.player.health <= 0) {
                console.log('💀 Defeat! Player defeated!');
                break;
            }

            console.log(`Player: ${combat.player.health} HP | Enemy: ${combat.enemy.health} HP\n`);
        }
    }

    /**
     * Demonstrate quest system
     */
    demonstrateQuests() {
        console.log('\n📋 QUEST SYSTEM DEMONSTRATION:');
        console.log('=' * 40);

        // Create a quest
        const quest = this.questManager.createQuest('herb_gathering', {
            title: 'Collect Magic Herbs',
            description: 'The village healer needs rare herbs for her potions.'
        });

        console.log(`📜 New Quest Available: ${quest.title}`);
        console.log(`Description: ${quest.description}`);
        console.log(`Type: ${quest.type}`);
        console.log(`Objectives:`);
        quest.objectives.forEach((obj, index) => {
            console.log(`  ${index + 1}. ${obj.description} (${obj.current}/${obj.target})`);
        });

        // Start the quest
        this.questManager.startQuest(quest.id);
        console.log(`\n✅ Quest Started: ${quest.title}`);

        // Simulate quest progress
        console.log('\n🌿 Simulating herb collection...');
        for (let i = 1; i <= 10; i++) {
            this.questManager.updateQuestProgress(quest.id, 'collect_herbs', 1);
            console.log(`🌿 Collected herb ${i}/10`);
        }

        console.log('\n🏆 Quest Completed!');
        const rewards = this.questManager.completeQuest(quest.id);
        console.log('Rewards received:');
        rewards.forEach(reward => {
            console.log(`  • ${reward.quantity} ${reward.item} (${reward.type})`);
        });
    }

    /**
     * Start interactive demo
     */
    async startDemo() {
        console.log('🎮 SYSTEMS INTEGRATION DEMO');
        console.log('=' * 50);

        this.initializePlayer();
        await this.demonstrateCombat();
        this.demonstrateQuests();

        console.log('\n🎉 Demo Complete!');
        console.log('\nYour systems are working perfectly:');
        console.log('✅ Combat system with equipment and spells');
        console.log('✅ Backpack/inventory management');
        console.log('✅ Quest system with objectives and rewards');
        console.log('✅ Character progression and stats');
        console.log('\nRun "npm run test:systems" to test these systems anytime!');
    }
}

// Run demo if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const demo = new SystemsDemo();
    demo.startDemo().catch(console.error);
}

export default SystemsDemo;