const { ClaudeStoryGenerator, CombatSystem } = require('./StoryGenerator.js');
const { StorySystem } = require('./StorySystem.js');

async function runRPGDemo() {
    console.log("🎮 Starting RPG Story Adventure Demo\n");

    const storySystem = new StorySystem();
    const generator = new ClaudeStoryGenerator(storySystem);

    // Generate story with RPG elements
    const story = await generator.generateLongStory("Epic fantasy quest with monsters and treasure", 10);

    console.log(`\n📖 Generated Story: "${story.title}"`);
    console.log(`📄 Pages: ${Object.keys(story.pages).length}`);

    // Start the adventure
    let currentPageId = story.start_page_id;
    let gameState = story.gameState || {
        playerStats: { health: 100, maxHealth: 100, attack: 10, defense: 5, gold: 0 },
        inventory: ["Basic Sword"],
        weapons: {
            "Basic Sword": { damage: 8, accuracy: 0.8 }
        }
    };

    console.log(`\n🎯 Player Stats: HP:${gameState.playerStats.health} ATK:${gameState.playerStats.attack} DEF:${gameState.playerStats.defense} Gold:${gameState.playerStats.gold}`);
    console.log(`⚔️  Equipped: ${gameState.inventory[0]}\n`);

    // Simulate adventure path
    const adventurePath = ["start", "forest_path", "goblin_encounter"];

    for (const pageId of adventurePath) {
        const page = story.pages[pageId];
        if (!page) continue;

        console.log(`\n=== ${pageId.toUpperCase()} ===`);
        console.log(page.text);

        // Handle combat encounters
        if (page.combat) {
            console.log(`\n⚔️  COMBAT INITIATED!`);
            console.log(`🐲 Enemy: ${page.combat.enemy.name} (HP: ${page.combat.enemy.health})`);

            const combat = new CombatSystem(
                gameState.playerStats,
                gameState.weapons[gameState.inventory[0]],
                page.combat.enemy
            );

            // Simulate player attack with different timing
            const timingAccuracy = Math.random(); // Random timing between 0-1
            const attackResult = combat.calculateDamage(timingAccuracy);

            console.log(`🎯 Timing: ${(timingAccuracy * 100).toFixed(0)}% → ${attackResult.damage} damage!`);

            if (attackResult.multiplier >= 1.5) {
                console.log("💥 CRITICAL HIT!");
            } else if (attackResult.multiplier >= 1.0) {
                console.log("✅ Good hit!");
            } else {
                console.log("⚠️  Poor timing...");
            }

            // Simulate enemy defeat
            console.log(`🏆 Victory! Enemy defeated!`);
        }

        // Show available choices
        if (page.choices && page.choices.length > 0) {
            console.log("\n📋 Available actions:");
            page.choices.forEach((choice, i) => {
                console.log(`   ${i + 1}. ${choice.text}`);
            });
        }

        // Handle rewards
        if (page.rewards) {
            if (page.rewards.gold) {
                gameState.playerStats.gold += page.rewards.gold;
                console.log(`💰 Found ${page.rewards.gold} gold! Total: ${gameState.playerStats.gold}`);
            }
            if (page.rewards.items) {
                page.rewards.items.forEach(item => {
                    gameState.inventory.push(item);
                    console.log(`🎒 Found item: ${item}`);
                });
            }
        }
    }

    console.log(`\n🎉 Demo Complete!`);
    console.log(`📊 Final Stats: HP:${gameState.playerStats.health} Gold:${gameState.playerStats.gold}`);
    console.log(`🎒 Inventory: ${gameState.inventory.join(', ')}`);
}

runRPGDemo().catch(console.error);