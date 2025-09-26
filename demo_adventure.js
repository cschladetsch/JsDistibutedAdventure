const fs = require('fs');
const { CombatSystem } = require('./StoryGenerator.js');

function simulateAdventure() {
    // Load the latest RPG story
    const storyFiles = fs.readdirSync('stories')
        .filter(f => f.endsWith('.json'))
        .map(f => ({
            name: f,
            time: fs.statSync(`stories/${f}`).mtime
        }))
        .sort((a, b) => b.time - a.time);

    const latestStory = storyFiles[0].name;
    const storyData = JSON.parse(fs.readFileSync(`stories/${latestStory}`, 'utf8'));

    console.log(`🎮 ${storyData.title}`);
    console.log(`📖 Simulated Adventure Run\n`);

    let gameState = { ...storyData.gameState };
    console.log(`🎯 Starting Stats: HP:${gameState.playerStats.health} ATK:${gameState.playerStats.attack} DEF:${gameState.playerStats.defense} Gold:${gameState.playerStats.gold}`);
    console.log(`⚔️  Equipped: ${gameState.inventory[0]}\n`);

    // Simulate an adventure path
    const adventurePath = [
        { pageId: "start", choice: "Enter the forest cautiously" },
        { pageId: "forest_path", choice: "Investigate the sound" },
        { pageId: "goblin_encounter", choice: "Fight the goblin!" },
        { pageId: "goblin_victory", choice: "Continue deeper into forest" },
        { pageId: "deeper_forest", choice: "Help the traveler" },
        { pageId: "helpful_reward", choice: "Take secret entrance to ruins" },
        { pageId: "secret_ruins", choice: "Prepare for battle" },
        { pageId: "skeleton_encounter", choice: "Engage in combat!" },
        { pageId: "skeleton_victory", choice: "Explore deeper into ruins" },
        { pageId: "treasure_room", choice: "Approach the dragon boldly" },
        { pageId: "dragon_encounter", choice: "Face the dragon in epic battle!" }
    ];

    let turn = 1;

    for (const step of adventurePath) {
        const page = storyData.pages[step.pageId];
        if (!page) continue;

        console.log(`${'='.repeat(50)}`);
        console.log(`TURN ${turn}: ${step.pageId.toUpperCase()}`);
        console.log(`${'='.repeat(50)}`);
        console.log(page.text);

        // Handle combat
        if (page.combat) {
            console.log(`\n⚔️  COMBAT: ${page.combat.enemy.name}`);
            console.log(`🐲 Enemy: HP:${page.combat.enemy.health} ATK:${page.combat.enemy.attack} DEF:${page.combat.enemy.defense}`);

            // Find the best weapon in inventory
            let bestWeapon = gameState.weapons["Basic Sword"];
            for (const item of gameState.inventory) {
                if (gameState.weapons[item]) {
                    const weapon = gameState.weapons[item];
                    if (weapon.damage > bestWeapon.damage) {
                        bestWeapon = weapon;
                    }
                }
            }

            const combat = new CombatSystem(
                gameState.playerStats,
                bestWeapon,
                page.combat.enemy
            );

            let enemyHealth = page.combat.enemy.health;
            let rounds = 0;

            while (enemyHealth > 0 && rounds < 5) { // Limit rounds for demo
                rounds++;
                console.log(`\n--- Combat Round ${rounds} ---`);

                // Simulate timing attack (random between 0.3-0.7 for good hits)
                const timing = 0.4 + Math.random() * 0.3;
                const attackResult = combat.calculateDamage(timing);
                enemyHealth = Math.max(0, enemyHealth - attackResult.damage);

                console.log(`🎯 Timing: ${(timing * 100).toFixed(0)}% → ${attackResult.damage} damage!`);

                if (attackResult.multiplier >= 1.5) {
                    console.log('⭐ CRITICAL HIT!');
                } else if (attackResult.multiplier >= 1.0) {
                    console.log('✅ Good hit!');
                } else {
                    console.log('⚠️  Poor timing...');
                }

                if (enemyHealth <= 0) {
                    console.log('🏆 VICTORY! Enemy defeated!');
                    break;
                }

                // Enemy attacks back
                const enemyDamage = combat.enemyAttack();
                gameState.playerStats.health = Math.max(1, gameState.playerStats.health - enemyDamage);
                console.log(`🐲 Enemy attacks for ${enemyDamage} damage! Your HP: ${gameState.playerStats.health}`);
            }
        }

        // Handle rewards
        if (page.rewards) {
            if (page.rewards.gold) {
                gameState.playerStats.gold += page.rewards.gold;
                console.log(`\n💰 Found ${page.rewards.gold} gold! Total: ${gameState.playerStats.gold}`);
            }
            if (page.rewards.items) {
                page.rewards.items.forEach(item => {
                    gameState.inventory.push(item);
                    console.log(`🎒 Found item: ${item}`);
                });
            }
            if (page.rewards.healing) {
                const oldHealth = gameState.playerStats.health;
                gameState.playerStats.health = Math.min(
                    gameState.playerStats.maxHealth,
                    gameState.playerStats.health + page.rewards.healing
                );
                console.log(`❤️  Healed ${gameState.playerStats.health - oldHealth} HP! Current: ${gameState.playerStats.health}`);
            }
        }

        if (step.choice) {
            console.log(`\n➡️  Choice: "${step.choice}"`);
        }

        console.log(`\n📊 Stats: HP:${gameState.playerStats.health}/${gameState.playerStats.maxHealth} | Gold:${gameState.playerStats.gold} | Weapons: ${gameState.inventory.join(', ')}`);

        turn++;
    }

    // Show final victory page
    const victoryPage = storyData.pages["dragon_victory"];
    if (victoryPage) {
        console.log(`\n${'='.repeat(50)}`);
        console.log(`🏆 FINAL VICTORY!`);
        console.log(`${'='.repeat(50)}`);
        console.log(victoryPage.text);

        if (victoryPage.rewards) {
            if (victoryPage.rewards.gold) {
                gameState.playerStats.gold += victoryPage.rewards.gold;
                console.log(`\n💰 Ultimate treasure: ${victoryPage.rewards.gold} gold!`);
            }
            if (victoryPage.rewards.items) {
                victoryPage.rewards.items.forEach(item => {
                    gameState.inventory.push(item);
                    console.log(`🗡️  Legendary weapon acquired: ${item}!`);
                });
            }
        }
    }

    console.log(`\n🎉 ADVENTURE COMPLETE!`);
    console.log(`📊 Final Stats:`);
    console.log(`   ❤️  Health: ${gameState.playerStats.health}/${gameState.playerStats.maxHealth}`);
    console.log(`   💰 Gold: ${gameState.playerStats.gold}`);
    console.log(`   🎒 Inventory: ${gameState.inventory.join(', ')}`);
    console.log(`\n🏆 You are now a legendary dragon slayer!`);
}

simulateAdventure();