#!/usr/bin/env node

/**
 * Simple AI Story with Time-Based Combat
 * - AI-generated storyline that evolves over time
 * - ATK/DEF combat with timing mechanics
 * - Item effects on combat
 */

import readline from 'readline';

class SimpleStoryCombat {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        // Player stats
        this.player = {
            name: 'Hero',
            health: 100,
            maxHealth: 100,
            attack: 15,
            defense: 8,
            items: ['Health Potion', 'Strength Scroll', 'Shield Scroll']
        };

        // Story progression
        this.storyStage = 0;
        this.timeElapsed = 0;

        // AI Story stages that change over time
        this.storyStages = [
            {
                title: "The Awakening",
                description: "You wake up in a strange forest. Ancient magic fills the air.",
                enemy: { name: "Forest Wolf", health: 30, attack: 12, defense: 3 },
                storyText: "A lone wolf blocks your path, its eyes glowing with unnatural hunger."
            },
            {
                title: "The Dark Woods",
                description: "The forest grows darker. Something evil stirs in the shadows.",
                enemy: { name: "Shadow Beast", health: 45, attack: 16, defense: 5 },
                storyText: "A creature of living darkness emerges from the twisted trees."
            },
            {
                title: "The Cursed Clearing",
                description: "You reach a clearing where dark magic has corrupted the land.",
                enemy: { name: "Corrupted Druid", health: 60, attack: 20, defense: 8 },
                storyText: "A once-noble druid, now twisted by dark forces, raises his cursed staff."
            },
            {
                title: "The Ancient Temple",
                description: "An ancient temple looms before you, pulsing with malevolent energy.",
                enemy: { name: "Temple Guardian", health: 80, attack: 25, defense: 12 },
                storyText: "A massive stone guardian awakens, its eyes burning with arcane fire."
            },
            {
                title: "The Final Confrontation",
                description: "You face the source of the corruption - an ancient evil awakened.",
                enemy: { name: "Dark Sorcerer", health: 100, attack: 30, defense: 15 },
                storyText: "The Dark Sorcerer emerges, reality bending around his terrible power."
            }
        ];
    }

    /**
     * Generate AI story text based on current situation
     */
    generateStoryText(stage, timeElapsed) {
        const timeDescriptions = [
            "The morning mist clings to the ground as you begin your journey.",
            "The sun climbs higher, casting long shadows through the trees.",
            "Afternoon light filters through the canopy above.",
            "Evening approaches, and the shadows grow longer.",
            "Night falls, and mysterious sounds echo in the darkness.",
            "The moon rises, bathing everything in an eerie silver light."
        ];

        const timeIndex = Math.min(timeElapsed, timeDescriptions.length - 1);
        const timeText = timeDescriptions[timeIndex];

        const storyData = this.storyStages[stage];

        return `${storyData.title}\n\n${timeText}\n\n${storyData.description}\n\n${storyData.storyText}`;
    }

    /**
     * Show player status
     */
    showStatus() {
        console.log('\n📊 PLAYER STATUS:');
        console.log('=' * 30);
        console.log(`❤️  Health: ${this.player.health}/${this.player.maxHealth}`);
        console.log(`⚔️  Attack: ${this.player.attack}`);
        console.log(`🛡️  Defense: ${this.player.defense}`);
        console.log(`🎒 Items: ${this.player.items.join(', ')}`);
        console.log('=' * 30);
    }

    /**
     * Use item with effects
     */
    useItem(itemName) {
        const itemIndex = this.player.items.indexOf(itemName);
        if (itemIndex === -1) {
            console.log(`❌ You don't have ${itemName}`);
            return false;
        }

        switch (itemName) {
            case 'Health Potion':
                const healAmount = Math.min(50, this.player.maxHealth - this.player.health);
                this.player.health = Math.min(this.player.maxHealth, this.player.health + healAmount);
                console.log(`💖 Used Health Potion: Healed ${healAmount} HP`);
                break;

            case 'Strength Scroll':
                this.player.attack += 5;
                console.log(`💪 Used Strength Scroll: Attack increased by 5! (Now ${this.player.attack})`);
                break;

            case 'Shield Scroll':
                this.player.defense += 3;
                console.log(`🛡️  Used Shield Scroll: Defense increased by 3! (Now ${this.player.defense})`);
                break;

            case 'Fire Scroll':
                console.log(`🔥 Fire Scroll ready! Next attack will deal bonus fire damage!`);
                this.player.fireBonus = 15;
                break;
        }

        // Remove used item
        this.player.items.splice(itemIndex, 1);
        return true;
    }

    /**
     * Timing-based attack system
     */
    async performTimingAttack(attacker, defender) {
        console.log('\n⚔️  TIMING ATTACK!');
        console.log('Press ENTER when the marker hits the optimal zone!');

        // Show timing bar
        const zones = ['💀', '❌', '⚠️', '✅', '🎯', '✅', '⚠️', '❌', '💀'];
        const optimalZone = 4; // Middle position

        let position = 0;
        let direction = 1;

        return new Promise((resolve) => {
            const interval = setInterval(() => {
                // Clear line and show timing bar
                process.stdout.write('\r');
                zones.forEach((zone, index) => {
                    if (index === position) {
                        process.stdout.write(`[${zone}]`);
                    } else {
                        process.stdout.write(` ${zone} `);
                    }
                });

                // Move marker
                position += direction;
                if (position >= zones.length - 1 || position <= 0) {
                    direction *= -1;
                }
            }, 200);

            // Wait for user input
            this.rl.once('line', () => {
                clearInterval(interval);
                process.stdout.write('\n');

                // Calculate timing result
                const distance = Math.abs(position - optimalZone);
                let multiplier = 1.0;
                let zoneType = 'miss';

                if (distance === 0) {
                    multiplier = 2.0;
                    zoneType = 'perfect';
                    console.log('🎯 PERFECT HIT! Critical damage!');
                } else if (distance === 1) {
                    multiplier = 1.5;
                    zoneType = 'excellent';
                    console.log('✅ EXCELLENT! Bonus damage!');
                } else if (distance === 2) {
                    multiplier = 1.2;
                    zoneType = 'good';
                    console.log('⚠️  GOOD HIT! Normal damage!');
                } else {
                    multiplier = 0.5;
                    zoneType = 'poor';
                    console.log('❌ POOR TIMING! Reduced damage!');
                }

                // Calculate damage
                let baseDamage = attacker.attack;

                // Apply item effects
                if (attacker === this.player && this.player.fireBonus) {
                    baseDamage += this.player.fireBonus;
                    console.log(`🔥 Fire bonus: +${this.player.fireBonus} damage!`);
                    this.player.fireBonus = 0;
                }

                let finalDamage = Math.floor(baseDamage * multiplier);
                let actualDamage = Math.max(1, finalDamage - defender.defense);

                defender.health = Math.max(0, defender.health - actualDamage);

                console.log(`💥 ${attacker.name} deals ${actualDamage} damage to ${defender.name}!`);
                console.log(`🩸 ${defender.name}: ${defender.health} HP remaining`);

                resolve({ damage: actualDamage, zoneType, multiplier });
            });
        });
    }

    /**
     * Simple enemy AI attack
     */
    enemyAttack(enemy, player) {
        const damage = Math.max(1, enemy.attack - player.defense);
        player.health = Math.max(0, player.health - damage);

        console.log(`👹 ${enemy.name} attacks for ${damage} damage!`);
        console.log(`❤️  Player: ${player.health} HP remaining`);

        return damage;
    }

    /**
     * Combat system
     */
    async doCombat(enemy) {
        console.log(`\n⚔️  COMBAT BEGINS!`);
        console.log(`🐺 ${enemy.name} (${enemy.health} HP, ${enemy.attack} ATK, ${enemy.defense} DEF)`);
        console.log(`👤 ${this.player.name} (${this.player.health} HP, ${this.player.attack} ATK, ${this.player.defense} DEF)`);

        let round = 1;

        while (this.player.health > 0 && enemy.health > 0) {
            console.log(`\n--- ROUND ${round} ---`);

            // Show combat options
            console.log('\nChoose your action:');
            console.log('[1] ⚔️  Attack (timing-based)');
            console.log('[2] 🛡️  Defend (+5 defense this turn)');
            if (this.player.items.length > 0) {
                console.log('[3] 🎒 Use Item');
            }

            const choice = await this.getInput('Your choice: ');

            if (choice === '1') {
                // Player timing attack
                await this.performTimingAttack(this.player, enemy);

            } else if (choice === '2') {
                // Defend - boost defense temporarily
                const oldDefense = this.player.defense;
                this.player.defense += 5;
                console.log(`🛡️  You defend! Defense increased to ${this.player.defense} this turn.`);

                // Enemy attacks with reduced damage
                this.enemyAttack(enemy, this.player);

                // Restore defense
                this.player.defense = oldDefense;

            } else if (choice === '3' && this.player.items.length > 0) {
                // Use item
                console.log('\nAvailable items:');
                this.player.items.forEach((item, index) => {
                    console.log(`[${index + 1}] ${item}`);
                });

                const itemChoice = await this.getInput('Choose item: ');
                const itemIndex = parseInt(itemChoice) - 1;

                if (itemIndex >= 0 && itemIndex < this.player.items.length) {
                    this.useItem(this.player.items[itemIndex]);
                } else {
                    console.log('❌ Invalid item choice!');
                }

                // Enemy still attacks
                this.enemyAttack(enemy, this.player);

            } else {
                console.log('❌ Invalid choice!');
                continue;
            }

            // Enemy attacks if still alive and player didn't defend
            if (enemy.health > 0 && choice !== '2') {
                this.enemyAttack(enemy, this.player);
            }

            round++;
        }

        // Combat result
        if (this.player.health <= 0) {
            console.log('\n💀 You have been defeated!');
            console.log('🔄 Game Over - Try again?');
            return false;
        } else {
            console.log(`\n🏆 Victory! You defeated the ${enemy.name}!`);

            // Rewards
            const expGain = enemy.attack + enemy.defense;
            const healthRestore = Math.floor(this.player.maxHealth * 0.2);
            this.player.health = Math.min(this.player.maxHealth, this.player.health + healthRestore);

            console.log(`⭐ Gained ${expGain} experience!`);
            console.log(`💖 Restored ${healthRestore} health!`);

            // Sometimes get new items
            if (Math.random() < 0.3) {
                const newItems = ['Fire Scroll', 'Health Potion', 'Shield Scroll'];
                const newItem = newItems[Math.floor(Math.random() * newItems.length)];
                this.player.items.push(newItem);
                console.log(`🎁 Found: ${newItem}!`);
            }

            return true;
        }
    }

    /**
     * Main story progression
     */
    async progressStory() {
        while (this.storyStage < this.storyStages.length && this.player.health > 0) {
            // Generate AI story text
            const storyText = this.generateStoryText(this.storyStage, this.timeElapsed);

            console.log('\n' + '=' * 60);
            console.log(storyText);
            console.log('=' * 60);

            this.showStatus();

            // Get current enemy
            const currentStage = this.storyStages[this.storyStage];
            const enemy = { ...currentStage.enemy }; // Copy enemy stats

            // Combat
            const victory = await this.doCombat(enemy);

            if (!victory) {
                break; // Game over
            }

            // Progress story
            this.storyStage++;
            this.timeElapsed++;

            if (this.storyStage < this.storyStages.length) {
                console.log('\n🚶 You continue your journey...');
                await this.getInput('Press ENTER to continue...');
            }
        }

        // Story conclusion
        if (this.player.health > 0 && this.storyStage >= this.storyStages.length) {
            console.log('\n' + '=' * 60);
            console.log('🎉 THE END 🎉');
            console.log('\nYou have successfully completed your quest!');
            console.log('The dark corruption has been cleansed from the land.');
            console.log('Peace is restored, and you are hailed as a hero!');
            console.log('=' * 60);
        }
    }

    /**
     * Helper to get user input
     */
    async getInput(prompt) {
        return new Promise((resolve) => {
            this.rl.question(prompt, (answer) => {
                resolve(answer.trim());
            });
        });
    }

    /**
     * Start the game
     */
    async start() {
        console.log('🎮 AI STORY WITH TIMING COMBAT');
        console.log('=' * 50);
        console.log('🎯 Use timing attacks for maximum damage!');
        console.log('💪 Items boost your combat abilities!');
        console.log('📖 The story evolves as time passes!');
        console.log('=' * 50);

        await this.getInput('Press ENTER to begin your adventure...');

        await this.progressStory();

        this.rl.close();
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const game = new SimpleStoryCombat();
    game.start().catch(console.error);
}

export default SimpleStoryCombat;