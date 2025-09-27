const fs = require('fs');
const readline = require('readline');
const { Story } = require('./StorySystem.js');
const { CombatSystem } = require('./StoryGenerator.js');
const Colors = require('./external/colors.js');

// Enhanced logging function
function debugLog(message, data = null) {
    const timestamp = new Date().toISOString();
    console.log(`[DEBUG ${timestamp}] ${message}`);
    if (data) {
        console.log('[DEBUG DATA]', JSON.stringify(data, null, 2));
    }
}

// Catch uncaught exceptions and promise rejections
process.on('uncaughtException', (error) => {
    console.error('[FATAL ERROR] Uncaught Exception:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('[FATAL ERROR] Unhandled Promise Rejection:', reason);
    console.error('Promise:', promise);
    process.exit(1);
});

// Log when script starts
debugLog('Script starting up');

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
        this.gameState = this.storyData.gameState || {
            playerStats: {
                // Core Stats
                health: 100, maxHealth: 100, mana: 50, maxMana: 50,
                stamina: 100, maxStamina: 100, energy: 100, maxEnergy: 100,

                // Primary Attributes
                strength: 10, dexterity: 10, constitution: 10, intelligence: 10,
                wisdom: 10, charisma: 10, luck: 10, perception: 10,

                // Combat Stats
                attack: 10, defense: 5, accuracy: 75, evasion: 10,
                criticalChance: 5, criticalDamage: 150, blockChance: 10,

                // Magic Stats
                spellPower: 5, manaRegeneration: 2, spellResistance: 0,

                // Social Stats
                reputation: 0, leadership: 5, intimidation: 5, persuasion: 5,
                deception: 5, insight: 5, diplomacy: 5,

                // Survival Stats
                survival: 5, stealth: 5, lockpicking: 0, trapDetection: 0,

                // Economic Stats
                gold: 0, merchantRep: 0, craftingSkill: 0,

                // Experience & Progression
                experience: 0, level: 1, skillPoints: 0,

                // Status Effects
                poisoned: false, blessed: false, cursed: false, exhausted: false
            },
            inventory: ["Basic Sword"],
            weapons: {
                "Basic Sword": { damage: 8, accuracy: 0.8 }
            }
        };

        try {
            debugLog('Creating readline interface');
            this.rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
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

    showStats() {
        const stats = this.gameState.playerStats;
        console.log(`\n📊 PLAYER STATS:`);
        console.log(`❤️  Health: ${stats.health}/${stats.maxHealth} | 🔵 Mana: ${stats.mana}/${stats.maxMana} | 💪 Stamina: ${stats.stamina}/${stats.maxStamina}`);
        console.log(`🏆 Level: ${stats.level} | ⭐ XP: ${stats.experience} | 🎯 Skill Points: ${stats.skillPoints}`);

        console.log(`\n🎯 COMBAT STATS:`);
        console.log(`⚔️  ATK: ${stats.attack} | 🛡️  DEF: ${stats.defense} | 🎯 ACC: ${stats.accuracy}% | 💨 EVA: ${stats.evasion}%`);
        console.log(`💥 Crit: ${stats.criticalChance}% | 🔥 Crit DMG: ${stats.criticalDamage}% | 🛡️  Block: ${stats.blockChance}%`);

        console.log(`\n💪 ATTRIBUTES:`);
        console.log(`STR: ${stats.strength} | DEX: ${stats.dexterity} | CON: ${stats.constitution} | INT: ${stats.intelligence}`);
        console.log(`WIS: ${stats.wisdom} | CHA: ${stats.charisma} | LUK: ${stats.luck} | PER: ${stats.perception}`);

        console.log(`\n🎭 SOCIAL & SKILLS:`);
        console.log(`👑 REP: ${stats.reputation} | 🗣️  Lead: ${stats.leadership} | 😤 Intim: ${stats.intimidation} | 💬 Persua: ${stats.persuasion}`);
        console.log(`🎭 Decep: ${stats.deception} | 👁️  Insight: ${stats.insight} | 🤝 Diplo: ${stats.diplomacy}`);
        console.log(`🏕️  Survival: ${stats.survival} | 🥷 Stealth: ${stats.stealth} | 🔓 Lockpick: ${stats.lockpicking} | 🪤 Traps: ${stats.trapDetection}`);

        if (stats.poisoned || stats.blessed || stats.cursed || stats.exhausted) {
            console.log(`\n⚡ STATUS EFFECTS:`);
            if (stats.poisoned) console.log(`🟢 Poisoned`);
            if (stats.blessed) console.log(`✨ Blessed`);
            if (stats.cursed) console.log(`😈 Cursed`);
            if (stats.exhausted) console.log(`😴 Exhausted`);
        }

        console.log(`\n💰 Gold: ${stats.gold} | 🎒 Items: ${this.gameState.inventory.slice(0, 3).join(', ')}${this.gameState.inventory.length > 3 ? '...' : ''}`);
        console.log(`💡 Tip: Type 'v' during choices to view detailed stats and inventory`);
    }

    async simulateTimingBar() {
        return new Promise((resolve) => {
            console.log('\n⚔️  COMBAT TIMING BAR');
            console.log('Press SPACE when the marker hits the blue target zone!');
            console.log(''); // Blank line for spacing

            let position = 0;
            const barLength = 50;
            const speed = 0.5;
            let direction = 1;
            const blueZone = { start: 25, end: 25 };  // Very small blue target zone (1 character wide)

            const interval = setInterval(() => {
                // Clear the current line and redraw
                process.stdout.write('\r\x1b[K'); // Clear entire line

                let animatedBar = '';
                for (let i = 0; i < barLength; i++) {
                    if (Math.floor(position) === i) {
                        animatedBar += Colors.brightWhiteOnBlack('█'); // Moving marker
                    } else if (i >= blueZone.start && i <= blueZone.end) {
                        animatedBar += Colors.bgBlue(' '); // Blue target zone
                    } else {
                        animatedBar += '═'; // Gray bar
                    }
                }

                process.stdout.write(`[${animatedBar}]`);

                position += speed * direction;
                if (position >= barLength - 1 || position <= 0) {
                    direction *= -1;
                }
            }, 100);

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

                    // Calculate timing accuracy based on hitting the blue zone
                    let timing = 0.1; // Default miss
                    let zoneHit = 'miss';

                    if (position >= blueZone.start && position <= blueZone.end) {
                        zoneHit = 'blue';
                        timing = 0.5; // Perfect hit
                        console.log(`🎯 ${Colors.blue('PERFECT HIT!')} Critical damage!`);
                    } else {
                        console.log(`🎯 Missed the target! Minimal damage.`);
                    }

                    resolve({ timing, zone: zoneHit, position: position });
                } else if (key === '\u0003') { // Ctrl+C
                    clearInterval(interval);
                    process.exit();
                }
            };

            process.stdin.on('data', handleInput);
            console.log('Press SPACE when the █ marker hits the blue zone!');
        });
    }

    async handleCombat(combatData) {
        console.log(`\n⚔️  COMBAT: ${combatData.enemy.name}`);
        console.log(`Enemy HP: ${combatData.enemy.health}/${combatData.enemy.maxHealth}`);
        console.log(`Enemy ATK: ${combatData.enemy.attack} | DEF: ${combatData.enemy.defense}`);

        const combat = new CombatSystem(
            this.gameState.playerStats,
            this.gameState.weapons[this.gameState.inventory[0]],
            combatData.enemy
        );

        let enemyHealth = combatData.enemy.health;
        let playerHealth = this.gameState.playerStats.health;
        let playerStamina = this.gameState.playerStats.stamina;

        while (enemyHealth > 0 && playerHealth > 0) {
            console.log(`\n--- COMBAT ROUND ---`);
            console.log(`Your HP: ${playerHealth}/${this.gameState.playerStats.maxHealth} | Stamina: ${playerStamina}/${this.gameState.playerStats.maxStamina}`);
            console.log(`Enemy HP: ${enemyHealth}/${combatData.enemy.maxHealth}`);

            // Combat action choice
            console.log(`\n⚔️  Choose your combat action:`);
            console.log(`[1] 🗡️  Attack - Use timing bar for damage`);
            console.log(`[2] 🛡️  Defend - Reduce incoming damage, restore stamina`);
            console.log(`[3] 💨 Rush - Quick attack, costs stamina, bonus crit chance`);
            console.log(`[4] 💬 Talk - Attempt to reason with enemy (uses Charisma)`);
            console.log(`[5] 🏃 Flee - Escape combat (uses Dexterity)`);

            const actionChoice = await this.getCombatChoice(5);
            let actionResult;

            switch(actionChoice) {
                case 1: // Attack
                    actionResult = await this.performAttack(combat);
                    enemyHealth = Math.max(0, enemyHealth - actionResult.damage);
                    break;

                case 2: // Defend
                    actionResult = this.performDefend();
                    playerStamina = Math.min(this.gameState.playerStats.maxStamina, playerStamina + actionResult.staminaGain);
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
                        this.gameState.playerStats.health = playerHealth;
                        this.gameState.playerStats.stamina = playerStamina;
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
                this.gameState.playerStats.experience += expGain;
                console.log(`⭐ You gain ${expGain} experience!`);
                this.gameState.playerStats.health = playerHealth;
                this.gameState.playerStats.stamina = playerStamina;
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
                this.gameState.playerStats.health = 1; // Leave with 1 HP
                return combatData.defeat;
            }

            // Regenerate small amount of stamina each turn
            playerStamina = Math.min(this.gameState.playerStats.maxStamina, playerStamina + 5);

            // Add a brief pause between rounds
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        this.gameState.playerStats.health = playerHealth;
        this.gameState.playerStats.stamina = playerStamina;
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
        const charisma = this.gameState.playerStats.charisma;
        const persuasion = this.gameState.playerStats.persuasion;
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
        const dexterity = this.gameState.playerStats.dexterity;
        const survival = this.gameState.playerStats.survival;
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
            console.log(`\n🎮 Running Story: "${this.story.title}"`);
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

            console.log(`\n${'='.repeat(50)}`);
            console.log(`TURN ${turnCount} | PAGE ${turnCount}: ${currentPageId.toUpperCase()}`);
            console.log(`${'='.repeat(50)}`);
            console.log(currentPage.text);

            // Handle combat - detect combat encounters and add combat data if missing
            const pageData = this.storyData.pages[currentPageId];
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
                    this.gameState.playerStats.gold += pageData.rewards.gold;
                    console.log(`\n💰 You found ${pageData.rewards.gold} gold!`);
                }
                if (pageData.rewards.items) {
                    pageData.rewards.items.forEach(item => {
                        this.gameState.inventory.push(item);
                        console.log(`🎒 You found: ${item}`);
                    });
                }
                if (pageData.rewards.healing) {
                    this.gameState.playerStats.health = Math.min(
                        this.gameState.playerStats.maxHealth,
                        this.gameState.playerStats.health + pageData.rewards.healing
                    );
                    console.log(`❤️  You heal ${pageData.rewards.healing} HP!`);
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
                console.log(`[${index + 1}] ${prompt.text}`);
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
            const askChoice = () => {
                this.rl.question(`\nEnter your choice (1-${maxChoice}) or 'v' for inventory: `, (answer) => {
                    const trimmedAnswer = answer.trim().toLowerCase();

                    if (trimmedAnswer === 'v') {
                        this.showDetailedInventory();
                        askChoice();
                        return;
                    }

                    const choice = parseInt(answer, 10);
                    if (isNaN(choice) || choice < 1 || choice > maxChoice) {
                        console.log(`❌ Invalid choice. Please enter a number between 1 and ${maxChoice}, or 'v' for inventory.`);
                        askChoice();
                    } else {
                        resolve(choice);
                    }
                });
            };
            askChoice();
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
console.log(`🎮 Loading story: ${latestStory}`);

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