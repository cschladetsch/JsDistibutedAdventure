// Simple static timing bar demo
const Colors = require('./external/colors.js');

console.log('⚔️  COMBAT TIMING BAR');
console.log('Press SPACE when the marker hits the blue target zone!');
console.log('');

const barLength = 50;
const blueZone = { start: 24, end: 26 };  // Narrow blue target zone (3 characters wide)

// Show single static timing bar with narrow blue target
let timingBar = '';
for (let i = 0; i < barLength; i++) {
    if (i >= blueZone.start && i <= blueZone.end) {
        timingBar += Colors.bgBlue(' '); // Blue target zone
    } else {
        timingBar += '═'; // Gray bar
    }
}
console.log(`Timing Bar: [${timingBar}]`);
console.log('            ' + ' '.repeat(blueZone.start) + '^^^'); // Arrow pointing to target
console.log('            ' + ' '.repeat(blueZone.start) + 'HIT'); // Label
console.log('');

console.log('✅ This is the NEW timing bar design:');
console.log('• Single static image - no flickering');
console.log('• Narrow blue target zone');
console.log('• Clean and simple');
console.log('• Press SPACE to hit the target');