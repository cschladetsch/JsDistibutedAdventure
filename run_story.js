const fs = require('fs');
const readline = require('readline');
const { Story } = require('./StorySystem.js');
const { CombatSystem } = require('./StoryGenerator.js');

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
            playerStats: { health: 100, maxHealth: 100, attack: 10, defense: 5, gold: 0 },
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

    showStats() {
        console.log(`\n📊 PLAYER STATS:`);
        console.log(`❤️  Health: ${this.gameState.playerStats.health}/${this.gameState.playerStats.maxHealth}`);
        console.log(`⚔️  Attack: ${this.gameState.playerStats.attack}`);
        console.log(`🛡️  Defense: ${this.gameState.playerStats.defense}`);
        console.log(`💰 Gold: ${this.gameState.playerStats.gold}`);
        if (this.gameState.playerStats.experience !== undefined) {
            console.log(`⭐ Experience: ${this.gameState.playerStats.experience}`);
        }
        if (this.gameState.playerStats.level !== undefined) {
            console.log(`🏆 Level: ${this.gameState.playerStats.level}`);
        }
        console.log(`🎒 Inventory: ${this.gameState.inventory.slice(0, 3).join(', ')}${this.gameState.inventory.length > 3 ? '...' : ''}`);
        console.log(`💡 Tip: Type 'v' during choices to view detailed inventory`);
    }

    async simulateTimingBar() {
        return new Promise((resolve) => {
            console.log('\n⚔️  COMBAT TIMING BAR');
            console.log('Press ENTER when you see the marker hit the target zone!');
            console.log('[----🎯----🔥----🎯----] ← Target zones');

            let position = 0;
            const barLength = 20;
            const speed = 0.2;
            let direction = 1;

            const interval = setInterval(() => {
                // Clear line and show moving bar
                process.stdout.write('\r');
                const bar = Array(barLength).fill('-');
                bar[Math.floor(position)] = '█';
                process.stdout.write(`[${bar.join('')}]`);

                position += speed * direction;
                if (position >= barLength - 1 || position <= 0) {
                    direction *= -1;
                }
            }, 50);

            this.rl.question('\n\nPress ENTER to attack! ', () => {
                clearInterval(interval);
                const timing = position / barLength;
                resolve(timing);
            });
        });
    }

    async handleCombat(combatData) {
        console.log(`\n🐲 COMBAT: ${combatData.enemy.name}`);
        console.log(`Enemy HP: ${combatData.enemy.health}/${combatData.enemy.maxHealth}`);
        console.log(`Enemy ATK: ${combatData.enemy.attack} | DEF: ${combatData.enemy.defense}`);

        const combat = new CombatSystem(
            this.gameState.playerStats,
            this.gameState.weapons[this.gameState.inventory[0]],
            combatData.enemy
        );

        let enemyHealth = combatData.enemy.health;
        let playerHealth = this.gameState.playerStats.health;

        while (enemyHealth > 0 && playerHealth > 0) {
            console.log(`\n--- COMBAT ROUND ---`);
            console.log(`Your HP: ${playerHealth} | Enemy HP: ${enemyHealth}`);

            // Player attack with timing
            const timing = await this.simulateTimingBar();
            const attackResult = combat.calculateDamage(timing);

            enemyHealth = Math.max(0, enemyHealth - attackResult.damage);

            console.log(`\n🎯 Timing: ${(timing * 100).toFixed(0)}% accuracy`);
            console.log(`💥 You deal ${attackResult.damage} damage!`);

            if (attackResult.multiplier >= 1.5) {
                console.log('⭐ CRITICAL HIT!');
            } else if (attackResult.multiplier >= 1.0) {
                console.log('✅ Good hit!');
            } else {
                console.log('⚠️  Poor timing...');
            }

            if (enemyHealth <= 0) {
                console.log('\n🏆 VICTORY! Enemy defeated!');
                return combatData.victory;
            }

            // Enemy attacks back
            const enemyDamage = combat.enemyAttack();
            playerHealth = Math.max(0, playerHealth - enemyDamage);
            console.log(`🐲 Enemy attacks for ${enemyDamage} damage!`);

            if (playerHealth <= 0) {
                console.log('\n💀 DEFEAT! You have been slain!');
                this.gameState.playerStats.health = playerHealth;
                return combatData.defeat;
            }
        }

        this.gameState.playerStats.health = playerHealth;
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
                debugLog('Page retrieved successfully', { pageId: currentPageId, hasText: !!currentPage.text, choicesCount: currentPage.choices?.length });
            } catch (error) {
                debugLog('Error getting page', { error: error.message, currentPageId });
                throw error;
            }

            console.log(`\n${'='.repeat(50)}`);
            console.log(`TURN ${turnCount} | PAGE ${turnCount}: ${currentPageId.toUpperCase()}`);
            console.log(`${'='.repeat(50)}`);
            console.log(currentPage.text);

            // Handle combat
            if (this.storyData.pages[currentPageId]?.combat) {
                currentPageId = await this.handleCombat(this.storyData.pages[currentPageId].combat);
                turnCount++;
                continue;
            }

            // Handle rewards
            const pageData = this.storyData.pages[currentPageId];
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
            if (currentPage.choices.length === 0) {
                console.log('\n🏁 THE END');
                break;
            }

            console.log('\n📋 What do you do?');
            currentPage.choices.forEach((choice, index) => {
                console.log(`[${index + 1}] ${choice.text}`);
            });

            const choiceIndex = await this.getChoice(currentPage.choices.length);
            const selectedChoice = currentPage.choices[choiceIndex - 1];

            console.log(`\n➡️  You chose: "${selectedChoice.text}"`);
            currentPageId = selectedChoice.target;
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