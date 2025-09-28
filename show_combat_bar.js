// Simple display of the combat timing bar
const Colors = require('./external/colors.js');

console.log('🎮 COMBAT TIMING BAR VISUALIZATION');
console.log('=' .repeat(50));
console.log('This is what the colored combat bar looks like:');
console.log('');

console.log(`${Colors.green('GREEN')} = Your power zone | ${Colors.blue('BLUE')} = Perfect hit zone | ${Colors.red('RED')} = Enemy zone`);
console.log('');

// Define zones
const barLength = 50;
const greenZone = { start: 5, end: 20 };
const blueZone = { start: 21, end: 29 };
const redZone = { start: 30, end: 45 };

// Show static bar with colors
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

// Show example positions of the marker
console.log('Example combat scenarios:');
console.log('');

// Example 1: Perfect hit
let bar1 = '';
for (let i = 0; i < barLength; i++) {
    if (i === 25) { // In blue zone
        bar1 += Colors.brightWhiteOnBlack('█');
    } else if (i >= greenZone.start && i <= greenZone.end) {
        bar1 += Colors.bgGreen();
    } else if (i >= blueZone.start && i <= blueZone.end) {
        bar1 += Colors.bgBlue();
    } else if (i >= redZone.start && i <= redZone.end) {
        bar1 += Colors.bgRed();
    } else {
        bar1 += '-';
    }
}
console.log(`Perfect Hit:  [${bar1}] ${Colors.blue('CRITICAL DAMAGE!')}`);

// Example 2: Good hit
let bar2 = '';
for (let i = 0; i < barLength; i++) {
    if (i === 15) { // In green zone
        bar2 += Colors.brightWhiteOnBlack('█');
    } else if (i >= greenZone.start && i <= greenZone.end) {
        bar2 += Colors.bgGreen();
    } else if (i >= blueZone.start && i <= blueZone.end) {
        bar2 += Colors.bgBlue();
    } else if (i >= redZone.start && i <= redZone.end) {
        bar2 += Colors.bgRed();
    } else {
        bar2 += '-';
    }
}
console.log(`Good Hit:     [${bar2}] ${Colors.green('SOLID DAMAGE!')}`);

// Example 3: Poor hit
let bar3 = '';
for (let i = 0; i < barLength; i++) {
    if (i === 35) { // In red zone
        bar3 += Colors.brightWhiteOnBlack('█');
    } else if (i >= greenZone.start && i <= greenZone.end) {
        bar3 += Colors.bgGreen();
    } else if (i >= blueZone.start && i <= blueZone.end) {
        bar3 += Colors.bgBlue();
    } else if (i >= redZone.start && i <= redZone.end) {
        bar3 += Colors.bgRed();
    } else {
        bar3 += '-';
    }
}
console.log(`Enemy Zone:   [${bar3}] ${Colors.red('REDUCED DAMAGE!')}`);

// Example 4: Miss
let bar4 = '';
for (let i = 0; i < barLength; i++) {
    if (i === 2) { // Outside zones
        bar4 += Colors.brightWhiteOnBlack('█');
    } else if (i >= greenZone.start && i <= greenZone.end) {
        bar4 += Colors.bgGreen();
    } else if (i >= blueZone.start && i <= blueZone.end) {
        bar4 += Colors.bgBlue();
    } else if (i >= redZone.start && i <= redZone.end) {
        bar4 += Colors.bgRed();
    } else {
        bar4 += '-';
    }
}
console.log(`Miss:         [${bar4}] ❌ MINIMAL DAMAGE!`);

console.log('');
console.log('🎮 In the game:');
console.log('• The white marker (█) moves back and forth across the bar');
console.log('• Press SPACE when it hits your target zone');
console.log('• Timing determines damage multiplier');
console.log('• This replaces the missing plain text combat system');
console.log('');
console.log('✅ The combat timing bar now displays with proper colors!');