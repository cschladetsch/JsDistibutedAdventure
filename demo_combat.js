// Demo script to show combat timing bar
const fs = require('fs');
const { Story } = require('./StorySystem.js');
const { CombatSystem } = require('./StoryGenerator.js');
const Colors = require('./external/colors.js');

// Simple demo of the combat timing bar
async function demoCombatBar() {
    console.log('🎮 COMBAT TIMING BAR DEMO');
    console.log('=' .repeat(50));
    console.log('This demonstrates the colored combat timing system');
    console.log('Press SPACE when the marker hits your target zone!\n');

    console.log(`${Colors.green('GREEN')} = Your power zone | ${Colors.blue('BLUE')} = Perfect hit zone | ${Colors.red('RED')} = Enemy zone`);
    console.log('');

    let position = 0;
    const barLength = 50;
    const speed = 0.4;
    let direction = 1;

    // Define zones
    const greenZone = { start: 5, end: 20 };
    const blueZone = { start: 21, end: 29 };
    const redZone = { start: 30, end: 45 };

    // Show static bar first
    let staticBar = '';
    for (let i = 0; i < barLength; i++) {
        if (i >= greenZone.start && i <= greenZone.end) {
            staticBar += Colors.bgGreen();
        } else if (i >= blueZone.start && i <= blueZone.end) {
            staticBar += Colors.bgBlue();
        } else if (i >= redZone.start && i <= redZone.end) {
            staticBar += Colors.bgRed();
        } else {
            staticBar += '-';
        }
    }
    console.log(`Zone Map: [${staticBar}]`);
    console.log('');

    return new Promise((resolve) => {
        const interval = setInterval(() => {
            // Clear the current line and redraw
            process.stdout.write('\r\x1b[K');

            let animatedBar = '';
            for (let i = 0; i < barLength; i++) {
                if (Math.floor(position) === i) {
                    animatedBar += Colors.brightWhiteOnBlack('█');
                } else if (i >= greenZone.start && i <= greenZone.end) {
                    animatedBar += Colors.bgGreen();
                } else if (i >= blueZone.start && i <= blueZone.end) {
                    animatedBar += Colors.bgBlue();
                } else if (i >= redZone.start && i <= redZone.end) {
                    animatedBar += Colors.bgRed();
                } else {
                    animatedBar += '-';
                }
            }

            process.stdout.write(`Combat Bar: [${animatedBar}] Position: ${Math.floor(position)}`);

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

                console.log('\n');

                // Calculate result
                let zoneHit = 'miss';
                if (position >= greenZone.start && position <= greenZone.end) {
                    zoneHit = 'green';
                    console.log(`🎯 ${Colors.green('HIT GREEN ZONE!')} Good damage!`);
                } else if (position >= blueZone.start && position <= blueZone.end) {
                    zoneHit = 'blue';
                    console.log(`🎯 ${Colors.blue('HIT BLUE ZONE!')} PERFECT SHOT!`);
                } else if (position >= redZone.start && position <= redZone.end) {
                    zoneHit = 'red';
                    console.log(`🎯 ${Colors.red('Hit red zone...')} reduced damage.`);
                } else {
                    console.log(`🎯 Missed the zones! Minimal damage.`);
                }

                console.log('\n✅ Demo complete! This is how combat looks in the full game.');
                resolve({ zone: zoneHit, position: position });
            } else if (key === '\u0003') { // Ctrl+C
                clearInterval(interval);
                process.stdin.setRawMode(false);
                process.stdin.pause();
                process.exit();
            }
        };

        process.stdin.on('data', handleInput);
        console.log('\nPress SPACE when the █ marker hits your target zone!');
    });
}

// Show game stats
function showGameStats() {
    console.log('\n📊 SAMPLE PLAYER STATS:');
    console.log(`❤️  Health: 85/100 | 🔵 Mana: 30/50 | 💪 Stamina: 75/100`);
    console.log(`🏆 Level: 3 | ⭐ XP: 150 | 🎯 Skill Points: 2`);
    console.log('\n⚔️  FACING: Orc Warrior (HP: 45/50)');
    console.log('🛡️  Enemy ATK: 15 | DEF: 6\n');
}

// Run the demo
async function runDemo() {
    console.clear();
    console.log('🎮 INTERACTIVE STORY SYSTEM - COMBAT DEMO');
    console.log('=' .repeat(60));
    console.log('This shows the colored combat timing system that was missing.');
    console.log('In the full game, this appears during combat encounters.\n');

    showGameStats();

    console.log('🎬 Starting combat demo in 3 seconds...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    await demoCombatBar();

    console.log('\n🎮 In the full game:');
    console.log('• Navigate story choices to reach combat encounters');
    console.log('• Use this timing system for attacks');
    console.log('• Different zones provide different damage multipliers');
    console.log('• Green = Good damage, Blue = Perfect/Critical, Red = Reduced damage');

    process.exit(0);
}

runDemo();