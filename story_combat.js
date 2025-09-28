/**
 * Simple Story Combat Game
 * AI storyline with timing-based combat and item effects
 */

import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Game state
let player = {
    name: 'Hero',
    health: 100,
    maxHealth: 100,
    attack: 15,
    defense: 8,
    items: ['Health Potion', 'Strength Scroll', 'Shield Scroll']
};

let storyStage = 0;
let timeElapsed = 0;

// AI Story stages that evolve over time
const storyStages = [
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

function generateStoryText(stage, timeElapsed) {
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
    const storyData = storyStages[stage];

    return `${storyData.title}\n\n${timeText}\n\n${storyData.description}\n\n${storyData.storyText}`;
}

function showStatus() {
    console.log('\n📊 PLAYER STATUS:');
    console.log('==============================');
    console.log(`❤️  Health: ${player.health}/${player.maxHealth}`);
    console.log(`⚔️  Attack: ${player.attack}`);
    console.log(`🛡️  Defense: ${player.defense}`);
    console.log(`🎒 Items: ${player.items.join(', ')}`);
    console.log('==============================');
}

function useItem(itemName) {
    const itemIndex = player.items.indexOf(itemName);
    if (itemIndex === -1) {
        console.log(`❌ You don't have ${itemName}`);
        return false;
    }

    switch (itemName) {
        case 'Health Potion':
            const healAmount = Math.min(50, player.maxHealth - player.health);
            player.health = Math.min(player.maxHealth, player.health + healAmount);
            console.log(`💖 Used Health Potion: Healed ${healAmount} HP`);
            break;

        case 'Strength Scroll':
            player.attack += 5;
            console.log(`💪 Used Strength Scroll: Attack increased by 5! (Now ${player.attack})`);
            break;

        case 'Shield Scroll':
            player.defense += 3;
            console.log(`🛡️  Used Shield Scroll: Defense increased by 3! (Now ${player.defense})`);
            break;

        case 'Fire Scroll':
            console.log(`🔥 Fire Scroll ready! Next attack will deal bonus fire damage!`);
            player.fireBonus = 15;
            break;
    }

    player.items.splice(itemIndex, 1);
    return true;
}

function performTimingAttack(attacker, defender) {
    return new Promise((resolve) => {
        console.log('\n⚔️  TIMING ATTACK!');
        console.log('Press ENTER when you see the PERFECT zone!');

        const zones = ['💀', '❌', '⚠️', '✅', '🎯', '✅', '⚠️', '❌', '💀'];
        const optimalZone = 4; // Middle position

        let position = 0;
        let direction = 1;
        let moves = 0;

        const showBar = () => {
            process.stdout.write('\r');
            zones.forEach((zone, index) => {
                if (index === position) {
                    process.stdout.write(`[${zone}]`);
                } else {
                    process.stdout.write(` ${zone} `);
                }
            });
        };

        const interval = setInterval(() => {
            showBar();

            position += direction;
            if (position >= zones.length - 1 || position <= 0) {
                direction *= -1;
            }

            moves++;

            // Auto-stop after 50 moves to prevent infinite loop
            if (moves > 50) {
                clearInterval(interval);
                process.stdout.write('\n⏰ Time up! Auto-attacking...\n');
                position = Math.floor(Math.random() * zones.length);
                calculateDamage();
            }
        }, 300);

        function calculateDamage() {
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

            let baseDamage = attacker.attack;

            if (attacker === player && player.fireBonus) {
                baseDamage += player.fireBonus;
                console.log(`🔥 Fire bonus: +${player.fireBonus} damage!`);
                player.fireBonus = 0;
            }

            let finalDamage = Math.floor(baseDamage * multiplier);
            let actualDamage = Math.max(1, finalDamage - defender.defense);

            defender.health = Math.max(0, defender.health - actualDamage);

            console.log(`💥 ${attacker.name} deals ${actualDamage} damage to ${defender.name}!`);
            console.log(`🩸 ${defender.name}: ${defender.health} HP remaining`);

            resolve({ damage: actualDamage, zoneType, multiplier });
        }

        rl.once('line', () => {
            clearInterval(interval);
            process.stdout.write('\n');
            calculateDamage();
        });
    });
}

function enemyAttack(enemy, player) {
    const damage = Math.max(1, enemy.attack - player.defense);
    player.health = Math.max(0, player.health - damage);

    console.log(`👹 ${enemy.name} attacks for ${damage} damage!`);
    console.log(`❤️  Player: ${player.health} HP remaining`);

    return damage;
}

async function doCombat(enemy) {
    console.log(`\n⚔️  COMBAT BEGINS!`);
    console.log(`🐺 ${enemy.name} (${enemy.health} HP, ${enemy.attack} ATK, ${enemy.defense} DEF)`);
    console.log(`👤 ${player.name} (${player.health} HP, ${player.attack} ATK, ${player.defense} DEF)`);

    let round = 1;

    while (player.health > 0 && enemy.health > 0) {
        console.log(`\n--- ROUND ${round} ---`);

        console.log('\nChoose your action:');
        console.log('[1] ⚔️  Attack (timing-based)');
        console.log('[2] 🛡️  Defend (+5 defense this turn)');
        if (player.items.length > 0) {
            console.log('[3] 🎒 Use Item');
        }

        const choice = await new Promise(resolve => {
            rl.question('Your choice: ', resolve);
        });

        if (choice === '1') {
            await performTimingAttack(player, enemy);
        } else if (choice === '2') {
            const oldDefense = player.defense;
            player.defense += 5;
            console.log(`🛡️  You defend! Defense increased to ${player.defense} this turn.`);
            enemyAttack(enemy, player);
            player.defense = oldDefense;
        } else if (choice === '3' && player.items.length > 0) {
            console.log('\nAvailable items:');
            player.items.forEach((item, index) => {
                console.log(`[${index + 1}] ${item}`);
            });

            const itemChoice = await new Promise(resolve => {
                rl.question('Choose item: ', resolve);
            });

            const itemIndex = parseInt(itemChoice) - 1;
            if (itemIndex >= 0 && itemIndex < player.items.length) {
                useItem(player.items[itemIndex]);
            } else {
                console.log('❌ Invalid item choice!');
            }
            enemyAttack(enemy, player);
        } else {
            console.log('❌ Invalid choice!');
            continue;
        }

        if (enemy.health > 0 && choice !== '2') {
            enemyAttack(enemy, player);
        }

        round++;
    }

    if (player.health <= 0) {
        console.log('\n💀 You have been defeated!');
        console.log('🔄 Game Over');
        return false;
    } else {
        console.log(`\n🏆 Victory! You defeated the ${enemy.name}!`);

        const expGain = enemy.attack + enemy.defense;
        const healthRestore = Math.floor(player.maxHealth * 0.2);
        player.health = Math.min(player.maxHealth, player.health + healthRestore);

        console.log(`⭐ Gained ${expGain} experience!`);
        console.log(`💖 Restored ${healthRestore} health!`);

        if (Math.random() < 0.3) {
            const newItems = ['Fire Scroll', 'Health Potion', 'Shield Scroll'];
            const newItem = newItems[Math.floor(Math.random() * newItems.length)];
            player.items.push(newItem);
            console.log(`🎁 Found: ${newItem}!`);
        }

        return true;
    }
}

async function progressStory() {
    while (storyStage < storyStages.length && player.health > 0) {
        const storyText = generateStoryText(storyStage, timeElapsed);

        console.log('\n' + '='.repeat(60));
        console.log(storyText);
        console.log('='.repeat(60));

        showStatus();

        const currentStage = storyStages[storyStage];
        const enemy = { ...currentStage.enemy };

        const victory = await doCombat(enemy);

        if (!victory) {
            break;
        }

        storyStage++;
        timeElapsed++;

        if (storyStage < storyStages.length) {
            console.log('\n🚶 You continue your journey...');
            await new Promise(resolve => {
                rl.question('Press ENTER to continue...', resolve);
            });
        }
    }

    if (player.health > 0 && storyStage >= storyStages.length) {
        console.log('\n' + '='.repeat(60));
        console.log('🎉 THE END 🎉');
        console.log('\nYou have successfully completed your quest!');
        console.log('The dark corruption has been cleansed from the land.');
        console.log('Peace is restored, and you are hailed as a hero!');
        console.log('='.repeat(60));
    }
}

async function startGame() {
    console.log('🎮 AI STORY WITH TIMING COMBAT');
    console.log('='.repeat(50));
    console.log('🎯 Use timing attacks for maximum damage!');
    console.log('💪 Items boost your combat abilities!');
    console.log('📖 The story evolves as time passes!');
    console.log('='.repeat(50));

    await new Promise(resolve => {
        rl.question('Press ENTER to begin your adventure...', resolve);
    });

    await progressStory();
    rl.close();
}

startGame().catch(console.error);