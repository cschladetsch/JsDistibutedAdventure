// Simple script to simulate combat sequence
const { spawn } = require('child_process');

const game = spawn('node', ['run_story.js'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    cwd: __dirname
});

// Queue of inputs to send
const inputs = ['1', '1', '1']; // Investigate -> Face threat -> Attack
let inputIndex = 0;

game.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(output);

    // Look for input prompts and send next input
    if (output.includes('Enter your choice') || output.includes('Enter your combat action')) {
        if (inputIndex < inputs.length) {
            setTimeout(() => {
                console.log(`\nSending input: ${inputs[inputIndex]}`);
                game.stdin.write(inputs[inputIndex] + '\n');
                inputIndex++;
            }, 500);
        }
    }

    // Handle timing bar (if present)
    if (output.includes('Press SPACE when the marker hits')) {
        setTimeout(() => {
            console.log('\nSending SPACE for timing bar...');
            game.stdin.write(' ');
        }, 2000); // Wait 2 seconds then hit space
    }
});

game.stderr.on('data', (data) => {
    console.error(data.toString());
});

game.on('close', (code) => {
    console.log(`\nGame ended with code ${code}`);
});

// Keep process alive
setTimeout(() => {
    console.log('\nSimulation timeout reached');
    game.kill();
}, 30000); // 30 second timeout