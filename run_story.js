// Suppress Node.js warnings
process.removeAllListeners('warning');
process.on('warning', () => {}); // Silently ignore warnings

const fs = require('fs');
const readline = require('readline');
const { Story } = require('./StorySystem.js');
const Colors = require('./external/colors.js');

// Enhanced logging function
function debugLog(message, data = null) {
    // Use new logging system
    return;
}

// Suppress error logging for cleaner output
process.on('uncaughtException', (error) => {
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    process.exit(1);
});

// Keep process alive if input is piped
process.stdin.on('end', () => {
    console.log('\n📝 Input stream ended. Press Ctrl+C to exit or run interactively.');
});

// Log when script starts
debugLog('Script starting up');

// Suppress terminal warnings for cleaner output

class StoryRunner {
    constructor(storyFile) {
        debugLog(`Initializing StoryRunner with file: ${storyFile}`);

        try {
            if (!fs.existsSync(storyFile)) {
                throw new Error(`Story file does not exist: ${storyFile}`);
            }

            debugLog(`Reading story file: ${storyFile}`);
            const fileContent = fs.readFileSync(storyFile, 'utf8');
            debugLog(`File content length: ${fileContent.length} characters`);

            this.storyData = JSON.parse(fileContent);
            debugLog('Story data parsed successfully');
        } catch (error) {
            debugLog('Error reading/parsing story file', { error: error.message, stack: error.stack });
            throw error;
        }
        try {
            debugLog('Creating Story instance from JSON data');
            this.story = Story.fromJSON(this.storyData);
            debugLog('Story instance created successfully', { title: this.story.title });
        } catch (error) {
            debugLog('Error creating Story instance', { error: error.message, stack: error.stack });
            throw error;
        }
        // Initialize game state from story data or use defaults
        this.gameState = this.storyData.game_state || {
            player_stats: {
                // Core Stats
                health: 100, max_health: 100, mana: 50, max_mana: 50,
                stamina: 100, max_stamina: 100, energy: 100, max_energy: 100,

                // Primary Attributes
                strength: 10, dexterity: 10, constitution: 10, intelligence: 10,
                wisdom: 10, charisma: 10, luck: 10, perception: 10,

                // Combat Stats
                attack: 10, defense: 5, accuracy: 75, evasion: 10,
                critical_chance: 5, critical_damage: 150, block_chance: 10,

                // Magic Stats
                spell_power: 5, mana_regeneration: 2, spell_resistance: 0,

                // Social Stats
                reputation: 0, leadership: 5, intimidation: 5, persuasion: 5,
                deception: 5, insight: 5, diplomacy: 5,

                // Survival Stats
                survival: 5, stealth: 5, lockpicking: 0, trap_detection: 0,

                // Economic Stats
                gold: 25, merchant_rep: 0, crafting_skill: 0,

                // Experience & Progression
                experience: 0, level: 1, skill_points: 0,

                // Status Effects
                poisoned: false, blessed: false, cursed: false, exhausted: false
            },
            inventory: ["Rusty Sword", "Leather Armor", "Healing Potion"],
            weapons: {
                "Rusty Sword": { damage: 8, accuracy: 0.8, rarity: "common" },
                "Iron Sword": { damage: 12, accuracy: 0.85, rarity: "common" },
                "Enchanted Blade": { damage: 18, accuracy: 0.9, rarity: "rare" }
            },
            story_flags: [],
            world_state: {
                time_of_day: "morning",
                weather: "clear",
                village_reputation: 0,
                explored_areas: []
            }
        };

        // Initialize quest tracking
        this.activeQuests = [];
        this.completedQuests = [];
        this.questProgress = {};

        try {
            debugLog('Creating readline interface');
            this.rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
                terminal: true
            });

            // Ensure stdin is in raw mode for proper input handling
            if (process.stdin.isTTY) {
                process.stdin.setRawMode(false);
            }

            debugLog('Readline interface created successfully');
        } catch (error) {
            debugLog('Error creating readline interface', { error: error.message, stack: error.stack });
            throw error;
        }

        debugLog('StoryRunner constructor completed successfully');
    }

    generateCombatDataForPage(pageId) {
        // Generate appropriate combat data based on the page ID and story context
        const enemies = [
            { name: "Bandit", health: 30, maxHealth: 30, attack: 9, defense: 3 },
            { name: "Goblin Warrior", health: 25, maxHealth: 25, attack: 7, defense: 2 },
            { name: "Orc Brute", health: 50, maxHealth: 50, attack: 15, defense: 6 },
            { name: "Beast", health: 45, maxHealth: 45, attack: 14, defense: 5 },
            { name: "Undead Soldier", health: 35, maxHealth: 35, attack: 12, defense: 4 },
            { name: "Wild Wolf", health: 28, maxHealth: 28, attack: 10, defense: 2 },
            { name: "Skeleton Archer", health: 22, maxHealth: 22, attack: 8, defense: 1 },
            { name: "Dark Mage", health: 40, maxHealth: 40, attack: 18, defense: 3 }
        ];

        // Select enemy based on encounter number or randomly
        let enemyIndex = 0;
        if (pageId.includes('combat_encounter_1')) {
            enemyIndex = 0; // Bandit
        } else if (pageId.includes('combat_encounter_2')) {
            enemyIndex = 2; // Orc Brute (tougher)
        } else {
            enemyIndex = Math.floor(Math.random() * enemies.length);
        }

        const selectedEnemy = { ...enemies[enemyIndex] };

        return {
            enemy: selectedEnemy,
            victory: this.findVictoryPage(pageId),
            defeat: this.findDefeatPage(pageId)
        };
    }

    findVictoryPage(combatPageId) {
        // Look for victory pages related to this combat
        const storyPages = Object.keys(this.storyData.pages);

        // Try to find specific victory page for this encounter
        const victoryId = combatPageId.replace('combat_encounter', 'victory');
        if (storyPages.includes(victoryId)) {
            return victoryId;
        }

        // Look for any victory page
        const victoryPage = storyPages.find(pageId =>
            pageId.includes('victory') ||
            this.storyData.pages[pageId].text?.toLowerCase().includes('victory') ||
            this.storyData.pages[pageId].text?.toLowerCase().includes('defeated')
        );

        return victoryPage || "start"; // Fallback to start
    }

    findDefeatPage(combatPageId) {
        // Look for defeat pages or safe fallback
        const storyPages = Object.keys(this.storyData.pages);

        // Try to find specific defeat page
        const defeatId = combatPageId.replace('combat_encounter', 'defeat');
        if (storyPages.includes(defeatId)) {
            return defeatId;
        }

        // Look for any defeat page
        const defeatPage = storyPages.find(pageId =>
            pageId.includes('defeat') ||
            this.storyData.pages[pageId].text?.toLowerCase().includes('defeat') ||
            this.storyData.pages[pageId].text?.toLowerCase().includes('retreat')
        );

        return defeatPage || "start"; // Fallback to start
    }

    // Quest Management Methods
    processQuestTriggers(pageData) {
        if (!this.story.quest_system_enabled || !pageData.quest_triggers) return;

        const triggers = pageData.quest_triggers;

        // Discover new quests
        if (triggers.discover_quests) {
            for (const questId of triggers.discover_quests) {
                if (this.story.side_quests[questId] && this.story.side_quests[questId].status === 'locked') {
                    this.story.side_quests[questId].status = 'available';
                    console.log(`\n🔍 New Quest Available: "${this.story.side_quests[questId].title}"`);
                }
            }
        }

        // Progress existing quests
        if (triggers.progress_quests) {
            for (const progressData of triggers.progress_quests) {
                const result = this.story.progressQuest(
                    progressData.quest_id,
                    progressData.objective_id,
                    progressData.progress_amount,
                    this.gameState
                );

                if (result.success) {
                    console.log(`\n📋 Quest Progress: ${progressData.quest_id} - ${result.objective.description}`);
                    if (result.questCompleted) {
                        console.log(`🏆 Quest Completed: "${this.story.side_quests[progressData.quest_id].title}"`);
                        this.showQuestRewards(progressData.quest_id);
                    }
                }
            }
        }

        // Complete quests
        if (triggers.complete_quests) {
            for (const questId of triggers.complete_quests) {
                this.story.completeQuest(questId, this.gameState);
                console.log(`🏆 Quest Completed: "${this.story.side_quests[questId].title}"`);
                this.showQuestRewards(questId);
            }
        }

        // Add story flags
        if (triggers.story_flags_added) {
            for (const flag of triggers.story_flags_added) {
                if (!this.gameState.story_flags.includes(flag)) {
                    this.gameState.story_flags.push(flag);
                }
            }
        }
    }

    showQuestRewards(questId) {
        const quest = this.story.side_quests[questId];
        if (!quest || !quest.rewards) return;

        console.log(`\n🎁 QUEST REWARDS:`);
        if (quest.rewards.experience) console.log(`⭐ +${quest.rewards.experience} Experience`);
        if (quest.rewards.gold) console.log(`💰 +${quest.rewards.gold} Gold`);
        if (quest.rewards.items) {
            quest.rewards.items.forEach(item => console.log(`🎒 Found: ${item}`));
        }
        if (quest.rewards.stat_bonuses) {
            for (const [stat, bonus] of Object.entries(quest.rewards.stat_bonuses)) {
                console.log(`📈 +${bonus} ${stat.toUpperCase()}`);
            }
        }
    }

    showActiveQuests() {
        if (!this.story.quest_system_enabled) return;

        const availableQuests = this.story.getAvailableQuests(this.gameState);
        const activeQuests = Object.values(this.story.side_quests).filter(q => q.status === 'active');

        if (availableQuests.length === 0 && activeQuests.length === 0) {
            console.log(`\n📋 No active quests`);
            return;
        }

        console.log(`\n📋 QUEST LOG:`);

        if (activeQuests.length > 0) {
            console.log(`\n🔄 ACTIVE QUESTS:`);
            activeQuests.forEach(quest => {
                console.log(`• ${quest.title}`);
                const currentObj = quest.objectives.find(obj => !obj.completed);
                if (currentObj) {
                    console.log(`  └─ ${currentObj.description} (${currentObj.current_progress}/${currentObj.required_progress})`);
                }
            });
        }

        if (availableQuests.length > 0) {
            console.log(`\n✨ AVAILABLE QUESTS:`);
            availableQuests.forEach(quest => {
                console.log(`• ${quest.title} - ${quest.description}`);
            });
        }
    }

    showStats() {
        const stats = this.gameState.player_stats;
        console.log(`\n📊 PLAYER STATS:`);
        console.log(`❤️  Health: ${stats.health}/${stats.max_health} | 🔵 Mana: ${stats.mana}/${stats.max_mana} | 💪 Stamina: ${stats.stamina}/${stats.max_stamina}`);
        console.log(`🏆 Level: ${stats.level} | ⭐ XP: ${stats.experience} | 🎯 Skill Points: ${stats.skill_points}`);

        console.log(`\n🎯 COMBAT STATS:`);
        console.log(`⚔️  ATK: ${stats.attack} | 🛡️  DEF: ${stats.defense} | 🎯 ACC: ${stats.accuracy}% | 💨 EVA: ${stats.evasion}%`);
        console.log(`💥 Crit: ${stats.critical_chance}% | 🔥 Crit DMG: ${stats.critical_damage}% | 🛡️  Block: ${stats.block_chance}%`);

        console.log(`\n💪 ATTRIBUTES:`);
        console.log(`STR: ${stats.strength} | DEX: ${stats.dexterity} | CON: ${stats.constitution} | INT: ${stats.intelligence}`);
        console.log(`WIS: ${stats.wisdom} | CHA: ${stats.charisma} | LUK: ${stats.luck} | PER: ${stats.perception}`);

        console.log(`\n🎭 SOCIAL & SKILLS:`);
        console.log(`👑 REP: ${stats.reputation} | 🗣️  Lead: ${stats.leadership} | 😤 Intim: ${stats.intimidation} | 💬 Persua: ${stats.persuasion}`);
        console.log(`🎭 Decep: ${stats.deception} | 👁️  Insight: ${stats.insight} | 🤝 Diplo: ${stats.diplomacy}`);
        console.log(`🏕️  Survival: ${stats.survival} | 🥷 Stealth: ${stats.stealth} | 🔓 Lockpick: ${stats.lockpicking} | 🪤 Traps: ${stats.trap_detection}`);

        if (stats.poisoned || stats.blessed || stats.cursed || stats.exhausted) {
            console.log(`\n⚡ STATUS EFFECTS:`);
            if (stats.poisoned) console.log(`🟢 Poisoned`);
            if (stats.blessed) console.log(`✨ Blessed`);
            if (stats.cursed) console.log(`😈 Cursed`);
            if (stats.exhausted) console.log(`😴 Exhausted`);
        }

        console.log(`\n💰 Gold: ${stats.gold} | 🎒 Items: ${this.gameState.inventory.slice(0, 3).join(', ')}${this.gameState.inventory.length > 3 ? '...' : ''}`);

        // Show quest summary
        if (this.story.quest_system_enabled) {
            const activeQuests = Object.values(this.story.side_quests).filter(q => q.status === 'active');
            const availableQuests = this.story.getAvailableQuests(this.gameState);
            if (activeQuests.length > 0 || availableQuests.length > 0) {
                console.log(`📋 Quests: ${activeQuests.length} active, ${availableQuests.length} available`);
            }
        }

        console.log(`💡 Tip: Type 'v' for inventory, 'q' for quest log`);
    }

    async simulateTimingBar() {
        return new Promise((resolve) => {
            console.log('\n⚔️  COMBAT TIMING BAR');
            console.log('Press SPACE when the marker hits the blue target zone!');

            let position = 0;
            const barLength = 60;
            const speed = 1.2; // Much faster for challenge
            let direction = 1;
            const blueZone = { start: 29, end: 31 };  // Smaller blue target zone (3 chars wide)

            // Show static reference bar first
            let staticBar = '';
            for (let i = 0; i < barLength; i++) {
                if (i >= blueZone.start && i <= blueZone.end) {
                    staticBar += Colors.bgBlue(' '); // Blue target zone
                } else {
                    staticBar += '═'; // Gray bar
                }
            }
            console.log(`\nTarget:   [${staticBar}]`);
            console.log('Timing:   [', { end: '' });

            const interval = setInterval(() => {
                // Clear only the timing bar line and redraw smoothly
                process.stdout.write('\r          [');

                let animatedBar = '';
                const currentPos = Math.floor(position);

                for (let i = 0; i < barLength; i++) {
                    if (currentPos === i) {
                        // Use different markers based on position for smoother visual
                        const subPosition = position - currentPos;
                        if (subPosition < 0.3) {
                            animatedBar += Colors.brightWhiteOnBlack('▌'); // Left part of marker
                        } else if (subPosition < 0.7) {
                            animatedBar += Colors.brightWhiteOnBlack('█'); // Full marker
                        } else {
                            animatedBar += Colors.brightWhiteOnBlack('▐'); // Right part of marker
                        }
                    } else if (i >= blueZone.start && i <= blueZone.end) {
                        animatedBar += Colors.bgBlue(' '); // Blue target zone
                    } else {
                        animatedBar += '═'; // Gray bar
                    }
                }

                process.stdout.write(animatedBar + ']');

                position += speed * direction;
                if (position >= barLength - 1) {
                    position = barLength - 1;
                    direction = -1;
                } else if (position <= 0) {
                    position = 0;
                    direction = 1;
                }
            }, 16); // 60 FPS for ultra-smooth animation

            // Set up input handling
            process.stdin.setRawMode(true);
            process.stdin.resume();
            process.stdin.setEncoding('utf8');

            const handleInput = (key) => {
                if (key === ' ' || key === '\r' || key === '\n') {
                    clearInterval(interval);
                    process.stdin.setRawMode(false);
                    process.stdin.pause();
                    process.stdin.removeListener('data', handleInput);

                    console.log('\n'); // New line after bar

                    // Calculate timing accuracy based on position
                    let timing = position / barLength; // Convert position to 0-1 timing
                    let zoneHit = 'miss';

                    if (position >= blueZone.start && position <= blueZone.end) {
                        zoneHit = 'blue';
                        timing = 0.5; // Perfect hit
                        console.log(`🎯 ${Colors.blue('PERFECT HIT!')} Critical damage!`);
                    } else if (Math.abs(position - 30) <= 5) { // Green zone around blue
                        zoneHit = 'green';
                        timing = 0.4 + (Math.random() * 0.2); // Good hit range
                        console.log(`🎯 ${Colors.green('GOOD HIT!')} Solid damage!`);
                    } else {
                        zoneHit = 'miss';
                        timing = Math.random() * 0.3; // Poor hit
                        console.log(`🎯 Missed the target! Minimal damage.`);
                    }

                    resolve({ timing, zone: zoneHit, position: position });
                } else if (key === '\u0003') { // Ctrl+C
                    clearInterval(interval);
                    process.exit();
                }
            };

            process.stdin.on('data', handleInput);
        });
    }

    async handleCombat(combatData) {
        console.log(`\n⚔️  COMBAT: ${combatData.enemy.name}`);
        console.log(`Enemy HP: ${combatData.enemy.health}/${combatData.enemy.maxHealth}`);
        console.log(`Enemy ATK: ${combatData.enemy.attack} | DEF: ${combatData.enemy.defense}`);

        // Import CombatSystem locally to avoid circular dependency
        const { CombatSystem } = require('./StoryGenerator.js');

        const combat = new CombatSystem(
            this.gameState.player_stats,
            this.gameState.weapons[this.gameState.inventory[0]],
            combatData.enemy
        );

        let enemyHealth = combatData.enemy.health;
        let playerHealth = this.gameState.player_stats.health;
        let playerStamina = this.gameState.player_stats.stamina;

        while (enemyHealth > 0 && playerHealth > 0) {
            console.log(`\n--- COMBAT ROUND ---`);
            console.log(`Your HP: ${playerHealth}/${this.gameState.player_stats.max_health} | Stamina: ${playerStamina}/${this.gameState.player_stats.max_stamina}`);
            console.log(`Enemy HP: ${enemyHealth}/${combatData.enemy.maxHealth}`);

            // Combat action choice
            console.log(`\n⚔️  Choose your combat action:`);
            console.log(`${Colors.cyan('[1]')} ${Colors.red('🗡️  Attack')} - Use timing bar for damage`);
            console.log(`${Colors.cyan('[2]')} ${Colors.blue('🛡️  Defend')} - Reduce incoming damage, restore stamina`);
            console.log(`${Colors.cyan('[3]')} ${Colors.yellow('💨 Rush')} - Quick attack, costs stamina, bonus crit chance`);
            console.log(`${Colors.cyan('[4]')} ${Colors.green('💬 Talk')} - Attempt to reason with enemy (uses Charisma)`);
            console.log(`${Colors.cyan('[5]')} ${Colors.magenta('🏃 Flee')} - Escape combat (uses Dexterity)`);

            const actionChoice = await this.getCombatChoice(5);
            let actionResult;

            switch(actionChoice) {
                case 1: // Attack
                    actionResult = await this.performAttack(combat);
                    enemyHealth = Math.max(0, enemyHealth - actionResult.damage);
                    break;

                case 2: // Defend
                    actionResult = this.performDefend();
                    playerStamina = Math.min(this.gameState.player_stats.max_stamina, playerStamina + actionResult.staminaGain);
                    console.log(`🛡️  You raise your guard and recover ${actionResult.staminaGain} stamina!`);
                    break;

                case 3: // Rush
                    if (playerStamina < 20) {
                        console.log(`❌ Not enough stamina! (Need 20, have ${playerStamina})`);
                        continue;
                    }
                    actionResult = await this.performRush(combat);
                    enemyHealth = Math.max(0, enemyHealth - actionResult.damage);
                    playerStamina -= 20;
                    break;

                case 4: // Talk
                    actionResult = this.performTalk(combatData.enemy);
                    if (actionResult.success) {
                        console.log(`💬 Success! ${actionResult.message}`);
                        if (actionResult.flee) {
                            console.log(`🕊️  Combat ended peacefully!`);
                            return combatData.victory; // Peaceful resolution
                        }
                        enemyHealth = Math.max(0, enemyHealth - actionResult.damage);
                    } else {
                        console.log(`💬 ${actionResult.message}`);
                    }
                    break;

                case 5: // Flee
                    actionResult = this.performFlee();
                    if (actionResult.success) {
                        console.log(`🏃 You successfully escape from combat!`);
                        this.gameState.player_stats.health = playerHealth;
                        this.gameState.player_stats.stamina = playerStamina;
                        return combatData.defeat || "start"; // Return to safe area
                    } else {
                        console.log(`🏃 Failed to escape! The enemy blocks your path!`);
                    }
                    break;
            }

            if (enemyHealth <= 0) {
                console.log('\n🏆 VICTORY! Enemy defeated!');
                // Award experience
                const expGain = Math.floor(combatData.enemy.maxHealth / 2) + combatData.enemy.attack;
                this.gameState.player_stats.experience += expGain;
                console.log(`⭐ You gain ${expGain} experience!`);
                this.gameState.player_stats.health = playerHealth;
                this.gameState.player_stats.stamina = playerStamina;
                return combatData.victory;
            }

            // Enemy attacks back (reduced if player defended)
            let enemyDamage = combat.enemyAttack();
            if (actionChoice === 2) { // Defended
                enemyDamage = Math.floor(enemyDamage * 0.5);
                console.log(`🛡️  Your defense reduces the damage!`);
            }

            playerHealth = Math.max(0, playerHealth - enemyDamage);
            console.log(`🐲 Enemy attacks for ${enemyDamage} damage!`);

            if (playerHealth <= 0) {
                console.log('\n💀 DEFEAT! You have been slain!');
                this.gameState.player_stats.health = 1; // Leave with 1 HP
                return combatData.defeat;
            }

            // Regenerate small amount of stamina each turn
            playerStamina = Math.min(this.gameState.player_stats.max_stamina, playerStamina + 5);

            // Add a brief pause between rounds
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        this.gameState.player_stats.health = playerHealth;
        this.gameState.player_stats.stamina = playerStamina;
    }

    async performAttack(combat) {
        const timingResult = await this.simulateTimingBar();
        const attackResult = combat.calculateDamage(timingResult.timing);

        console.log(`\n🎯 Zone Hit: ${timingResult.zone.toUpperCase()}`);
        console.log(`💥 You deal ${attackResult.damage} damage!`);

        if (timingResult.zone === 'blue') {
            console.log('💎 PERFECT HIT! Maximum damage!');
        } else if (timingResult.zone === 'green') {
            console.log('✅ Good hit! Solid damage!');
        } else if (timingResult.zone === 'red') {
            console.log('⚠️  Hit in enemy zone - reduced damage!');
        } else {
            console.log('❌ Miss! Minimal damage!');
        }

        return { damage: attackResult.damage };
    }

    performDefend() {
        return { staminaGain: 15 };
    }

    async performRush(combat) {
        console.log(`💨 RUSH ATTACK! Bonus critical chance!`);
        const timingResult = await this.simulateTimingBar();

        // Rush gives bonus critical chance
        let enhancedTiming = timingResult.timing;
        if (timingResult.zone === 'green' || timingResult.zone === 'blue') {
            enhancedTiming = 0.4; // Better timing for rush
        }

        const attackResult = combat.calculateDamage(enhancedTiming);
        const rushDamage = Math.floor(attackResult.damage * 1.3); // 30% bonus damage

        console.log(`\n💨 RUSH! Zone Hit: ${timingResult.zone.toUpperCase()}`);
        console.log(`💥 You deal ${rushDamage} rush damage!`);
        console.log('⚡ Rush bonus applied!');

        return { damage: rushDamage };
    }

    performTalk(enemy) {
        const charisma = this.gameState.player_stats.charisma;
        const persuasion = this.gameState.player_stats.persuasion;
        const roll = Math.floor(Math.random() * 20) + 1;
        const total = roll + charisma + persuasion;

        console.log(`💬 Diplomacy attempt: Roll ${roll} + CHA ${charisma} + Persuasion ${persuasion} = ${total}`);

        if (total >= 25) {
            return {
                success: true,
                flee: true,
                message: `${enemy.name} is convinced by your words and agrees to let you pass!`
            };
        } else if (total >= 20) {
            return {
                success: true,
                damage: Math.floor(enemy.maxHealth * 0.3),
                message: `You confuse ${enemy.name}, causing them to hesitate and become vulnerable!`
            };
        } else if (total >= 15) {
            return {
                success: true,
                damage: 0,
                message: `${enemy.name} pauses, but remains hostile. You've bought yourself time!`
            };
        } else {
            return {
                success: false,
                message: `${enemy.name} ignores your words and prepares to attack!`
            };
        }
    }

    performFlee() {
        const dexterity = this.gameState.player_stats.dexterity;
        const survival = this.gameState.player_stats.survival;
        const roll = Math.floor(Math.random() * 20) + 1;
        const total = roll + dexterity + survival;

        console.log(`🏃 Escape attempt: Roll ${roll} + DEX ${dexterity} + Survival ${survival} = ${total}`);

        return { success: total >= 15 };
    }

    async getCombatChoice(maxChoice) {
        return new Promise((resolve) => {
            const askChoice = () => {
                this.rl.question(`\nEnter your combat action (1-${maxChoice}): `, (answer) => {
                    const choice = parseInt(answer, 10);
                    if (isNaN(choice) || choice < 1 || choice > maxChoice) {
                        console.log(`❌ Invalid choice. Please enter a number between 1 and ${maxChoice}.`);
                        askChoice();
                    } else {
                        resolve(choice);
                    }
                });
            };
            askChoice();
        });
    }

    async runStory() {
        debugLog('runStory() method called');

        try {
            console.log(Colors.aiLabel(`\n🤖 AI Story:`), Colors.lightPurple(`"${this.story.title}"`));
            debugLog('Story title displayed');

            this.showStats();
            debugLog('Player stats displayed');
        } catch (error) {
            debugLog('Error in runStory initialization', { error: error.message, stack: error.stack });
            throw error;
        }

        let currentPageId = this.story.start_page_id;
        let turnCount = 1;

        debugLog('Starting story loop', { startPageId: currentPageId, turnCount });

        while (currentPageId) {
            debugLog(`Starting turn ${turnCount}`, { currentPageId });
            let currentPage;
            try {
                debugLog(`Getting page: ${currentPageId}`);
                currentPage = this.story.getPage(currentPageId);
                if (!currentPage) {
                    debugLog('Page not found', { currentPageId });
                    console.log('\n❌ Story page not found. Adventure ends.');
                    break;
                }
                debugLog('Page retrieved successfully', { pageId: currentPageId, hasText: !!currentPage.text, choicesCount: currentPage.prompts?.length });
            } catch (error) {
                debugLog('Error getting page', { error: error.message, currentPageId });
                throw error;
            }

            console.log(Colors.purple(`\n${'='.repeat(50)}`));
            console.log(Colors.aiLabel(`🤖 TURN ${turnCount}`), Colors.lightPurple(`| PAGE ${turnCount}: ${currentPageId.toUpperCase()}`));
            console.log(Colors.purple(`${'='.repeat(50)}`));

            // Get page data and process quest triggers first
            const pageData = this.storyData.pages[currentPageId];
            this.processQuestTriggers(pageData);

            // Show quest-aware page text
            let pageText = currentPage.text;
            if (this.story.quest_system_enabled && pageData?.quest_variants) {
                for (const [questId, variants] of Object.entries(pageData.quest_variants)) {
                    const quest = this.story.side_quests[questId];
                    if (quest) {
                        if (quest.status === 'active' && variants.active_text) {
                            pageText = variants.active_text;
                        } else if (quest.status === 'completed' && variants.completed_text) {
                            pageText = variants.completed_text;
                        }
                    }
                }
            }
            console.log(Colors.aiText(pageText));

            // Handle combat - detect combat encounters and add combat data if missing
            if (pageData?.combat) {
                currentPageId = await this.handleCombat(pageData.combat);
                turnCount++;
                continue;
            } else if (currentPageId.includes('combat_encounter')) {
                // Auto-generate combat data for combat encounter pages that are missing it
                const combatData = this.generateCombatDataForPage(currentPageId);
                if (combatData) {
                    currentPageId = await this.handleCombat(combatData);
                    turnCount++;
                    continue;
                }
            }

            // Handle rewards
            if (pageData?.rewards) {
                if (pageData.rewards.gold) {
                    this.gameState.player_stats.gold += pageData.rewards.gold;
                    console.log(`\n💰 You found ${pageData.rewards.gold} gold!`);
                }
                if (pageData.rewards.items) {
                    pageData.rewards.items.forEach(item => {
                        this.gameState.inventory.push(item);
                        console.log(`🎒 You found: ${item}`);
                    });
                }
                if (pageData.rewards.healing) {
                    this.gameState.player_stats.health = Math.min(
                        this.gameState.player_stats.max_health,
                        this.gameState.player_stats.health + pageData.rewards.healing
                    );
                    console.log(`❤️  You heal ${pageData.rewards.healing} HP!`);
                }
                if (pageData.rewards.experience) {
                    this.gameState.player_stats.experience += pageData.rewards.experience;
                    console.log(`⭐ You gain ${pageData.rewards.experience} experience!`);
                }
                this.showStats();
            }

            // Show choices
            if (!currentPage.prompts || currentPage.prompts.length === 0) {
                console.log('\n🏁 THE END');
                break;
            }

            console.log('\n📋 What do you do?');
            currentPage.prompts.forEach((prompt, index) => {
                console.log(`${Colors.cyan(`[${index + 1}]`)} ${Colors.yellow(prompt.text)}`);
            });

            const choiceIndex = await this.getChoice(currentPage.prompts.length);
            const selectedChoice = currentPage.prompts[choiceIndex - 1];

            console.log(`\n➡️  You chose: "${selectedChoice.text}"`);
            currentPageId = selectedChoice.target_id;
            turnCount++;
        }

        debugLog('Story loop completed');
        console.log('\n🎉 Adventure Complete!');
        this.showStats();

        debugLog('Closing readline interface');
        this.rl.close();
        debugLog('runStory() method completed successfully');
    }

    async getChoice(maxChoice) {
        return new Promise((resolve) => {
            // Check if we can use raw mode (TTY environment)
            const canUseRawMode = process.stdin.isTTY && typeof process.stdin.setRawMode === 'function';

            if (canUseRawMode) {
                // Use instant key press mode
                let promptText = `\nPress a key for your choice (1-${maxChoice}) or 'v' for inventory`;
                if (this.story.quest_system_enabled) {
                    promptText += ", 'q' for quest log";
                }
                promptText += ": ";

                console.log(promptText);

                // Enable raw mode for immediate key detection
                process.stdin.setRawMode(true);
                process.stdin.resume();
                process.stdin.setEncoding('utf8');

                const handleKeyPress = (key) => {
                    // Clean up listeners and reset stdin
                    process.stdin.setRawMode(false);
                    process.stdin.pause();
                    process.stdin.removeListener('data', handleKeyPress);

                    // Handle Ctrl+C
                    if (key === '\u0003') {
                        console.log('\n👋 Goodbye!');
                        process.exit();
                    }

                    const keyPressed = key.toLowerCase();

                    if (keyPressed === 'v') {
                        console.log(`\n📦 You pressed 'v' - showing inventory...`);
                        this.showDetailedInventory();
                        // Restart choice selection
                        this.getChoice(maxChoice).then(resolve);
                        return;
                    }

                    if (keyPressed === 'q' && this.story.quest_system_enabled) {
                        console.log(`\n📋 You pressed 'q' - showing quest log...`);
                        this.showActiveQuests();
                        // Restart choice selection
                        this.getChoice(maxChoice).then(resolve);
                        return;
                    }

                    const choice = parseInt(keyPressed, 10);
                    if (isNaN(choice) || choice < 1 || choice > maxChoice) {
                        let errorMsg = `\n❌ Invalid key '${keyPressed}'. Press a number between 1 and ${maxChoice}, or 'v' for inventory`;
                        if (this.story.quest_system_enabled) {
                            errorMsg += ", 'q' for quest log";
                        }
                        errorMsg += ".";
                        console.log(errorMsg);
                        // Restart choice selection
                        this.getChoice(maxChoice).then(resolve);
                        return;
                    }

                    console.log(`\n⚡ You pressed '${keyPressed}' - choice selected instantly!`);
                    resolve(choice);
                };

                process.stdin.on('data', handleKeyPress);
            } else {
                // Fallback to traditional readline mode
                const askChoice = () => {
                    let promptText = `\nEnter your choice (1-${maxChoice}) or 'v' for inventory`;
                    if (this.story.quest_system_enabled) {
                        promptText += ", 'q' for quest log";
                    }
                    promptText += ": ";

                    this.rl.question(promptText, (answer) => {
                        if (!answer) {
                            console.log(`❌ Please enter a choice.`);
                            askChoice();
                            return;
                        }

                        const trimmedAnswer = answer.trim().toLowerCase();

                        if (trimmedAnswer === 'v') {
                            this.showDetailedInventory();
                            askChoice();
                            return;
                        }

                        if (trimmedAnswer === 'q') {
                            this.showActiveQuests();
                            askChoice();
                            return;
                        }

                        const choice = parseInt(answer, 10);
                        if (isNaN(choice) || choice < 1 || choice > maxChoice) {
                            let errorMsg = `❌ Invalid choice. Please enter a number between 1 and ${maxChoice}, or 'v' for inventory`;
                            if (this.story.quest_system_enabled) {
                                errorMsg += ", 'q' for quest log";
                            }
                            errorMsg += ".";
                            console.log(errorMsg);
                            askChoice();
                            return;
                        }

                        resolve(choice);
                    });
                };
                askChoice();
            }
        });
    }

    showDetailedInventory() {
        console.log('\n' + '='.repeat(60));
        console.log('📦 DETAILED INVENTORY');
        console.log('='.repeat(60));

        // Weapons
        const weapons = this.gameState.inventory.filter(item =>
            this.gameState.weapons && this.gameState.weapons[item]
        );
        if (weapons.length > 0) {
            console.log('⚔️  WEAPONS:');
            weapons.forEach(weapon => {
                const stats = this.gameState.weapons[weapon];
                const rarity = stats.rarity ? `[${stats.rarity.toUpperCase()}]` : '';
                console.log(`   • ${weapon} ${rarity}`);
                console.log(`     Damage: ${stats.damage} | Accuracy: ${(stats.accuracy * 100).toFixed(0)}%`);
            });
            console.log('');
        }

        // Items
        const items = this.gameState.inventory.filter(item =>
            this.gameState.items && this.gameState.items[item]
        );
        if (items.length > 0) {
            console.log('🎲 ITEMS:');
            items.forEach(item => {
                const stats = this.gameState.items[item];
                console.log(`   • ${item}`);
                if (stats.description) {
                    console.log(`     ${stats.description}`);
                }
                if (stats.value) {
                    console.log(`     Value: ${stats.value}`);
                }
            });
            console.log('');
        }

        // Other items
        const otherItems = this.gameState.inventory.filter(item =>
            !this.gameState.weapons?.[item] && !this.gameState.items?.[item]
        );
        if (otherItems.length > 0) {
            console.log('🎯 OTHER:');
            otherItems.forEach(item => {
                console.log(`   • ${item}`);
            });
            console.log('');
        }

        // World State Summary
        if (this.gameState.worldState) {
            console.log('🌍 WORLD STATUS:');
            const ws = this.gameState.worldState;
            if (ws.timeOfDay) console.log(`   Time: ${ws.timeOfDay}`);
            if (ws.weatherCondition) console.log(`   Weather: ${ws.weatherCondition}`);
            if (ws.villageReputation !== undefined) console.log(`   Village Rep: ${ws.villageReputation}`);
            if (ws.exploredAreas && ws.exploredAreas.length > 0) {
                console.log(`   Explored: ${ws.exploredAreas.join(', ')}`);
            }
            console.log('');
        }

        console.log('='.repeat(60));
    }
}

// Get the latest story file and run it
debugLog('Looking for story files in stories/ directory');

let storyFiles;

try {
    if (!fs.existsSync('stories')) {
        debugLog('Stories directory does not exist');
        console.log('❌ Stories directory not found');
        process.exit(1);
    }

    storyFiles = fs.readdirSync('stories')
    .filter(f => f.endsWith('.json'))
    .map(f => ({
        name: f,
        time: fs.statSync(`stories/${f}`).mtime
    }))
    .sort((a, b) => b.time - a.time);

    debugLog(`Found ${storyFiles.length} story files`, { files: storyFiles.map(f => f.name) });

    if (storyFiles.length === 0) {
        debugLog('No story files found');
        console.log('❌ No story files found in stories/ directory');
        process.exit(1);
    }
} catch (error) {
    debugLog('Error reading stories directory', { error: error.message, stack: error.stack });
    console.log('❌ Error reading stories directory:', error.message);
    process.exit(1);
}

const latestStory = storyFiles[0].name;
const storyPath = `stories/${latestStory}`;

debugLog('Selected story file', { latestStory, storyPath });
console.log(Colors.aiLabel(`🤖 Loading AI story:`), Colors.lightPurple(latestStory));

try {
    debugLog('Creating StoryRunner instance');
    const runner = new StoryRunner(storyPath);
    debugLog('StoryRunner instance created, starting story');

    runner.runStory().catch((error) => {
        debugLog('Error in runStory()', { error: error.message, stack: error.stack });
        console.error('❌ Story execution failed:', error.message);
        console.error('Full error:', error);
        process.exit(1);
    });
} catch (error) {
    debugLog('Error creating StoryRunner', { error: error.message, stack: error.stack });
    console.error('❌ Failed to initialize story:', error.message);
    console.error('Full error:', error);
    process.exit(1);
}