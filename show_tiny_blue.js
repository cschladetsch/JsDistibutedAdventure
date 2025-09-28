// Demo of the tiny blue target zone
const Colors = require('./external/colors.js');

console.log('⚔️  COMBAT TIMING BAR');
console.log('Press SPACE when the marker hits the blue target zone!');
console.log('');

const barLength = 50;
const blueZone = { start: 25, end: 25 };  // Very small blue target zone (1 character wide)

// Show static reference bar with tiny blue target
let staticBar = '';
for (let i = 0; i < barLength; i++) {
    if (i >= blueZone.start && i <= blueZone.end) {
        staticBar += Colors.bgBlue(' '); // Tiny blue target zone
    } else {
        staticBar += '═'; // Gray bar
    }
}
console.log(`Target Zone: [${staticBar}]`);
console.log('             ' + ' '.repeat(blueZone.start) + '^'); // Single arrow pointing to target
console.log('');

// Show examples of the moving marker
console.log('Examples:');

// Example 1: Perfect hit (marker on blue)
let bar1 = '';
for (let i = 0; i < barLength; i++) {
    if (i === 25) { // Marker position = blue zone
        bar1 += Colors.brightWhiteOnBlack('█'); // Marker overlapping blue
    } else if (i >= blueZone.start && i <= blueZone.end) {
        bar1 += Colors.bgBlue(' '); // This won't show since marker is here
    } else {
        bar1 += '═';
    }
}
console.log(`Perfect Hit: [${bar1}] ${Colors.blue('CRITICAL!')}`);

// Example 2: Near miss
let bar2 = '';
for (let i = 0; i < barLength; i++) {
    if (i === 23) { // Marker near but not on blue
        bar2 += Colors.brightWhiteOnBlack('█');
    } else if (i >= blueZone.start && i <= blueZone.end) {
        bar2 += Colors.bgBlue(' '); // Tiny blue target
    } else {
        bar2 += '═';
    }
}
console.log(`Near Miss:   [${bar2}] ❌ MISS!`);

console.log('');
console.log('✅ NOW: Tiny blue target segment - much harder to hit!');
console.log('• Makes timing more challenging');
console.log('• Requires precise timing');
console.log('• Small target = big reward');