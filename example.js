/**
 * example.js
 * Example usage file that can be run directly
 */
const DungeonMaster = require('./DungeonMaster');

async function main() {
    const dm = new DungeonMaster();
    const ready = await dm.setupAdventure();
    if (ready) {
        dm.play();
    }
}

// Only run main if this file is executed directly
if (require.main === module) {
    main();
}