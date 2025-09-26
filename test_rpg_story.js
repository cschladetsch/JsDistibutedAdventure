const { ClaudeStoryGenerator, CombatSystem } = require('./StoryGenerator.js');
const { StorySystem } = require('./StorySystem.js');

async function testRPGStoryGenerator() {
    console.log("=== Testing Enhanced RPG Story Generator ===\n");

    // Create the story system and generator
    const storySystem = new StorySystem();
    const generator = new ClaudeStoryGenerator(storySystem);

    try {
        // Generate a story with minimum 15 pages and RPG elements
        const story = await generator.generateLongStory("A fantasy adventure with combat and treasure", 15);

        if (story) {
            console.log(`\n✅ Story Generation Successful!`);
            console.log(`📖 Title: ${story.title}`);
            console.log(`📄 Total Pages: ${Object.keys(story.pages).length}`);
            console.log(`🎮 Start Page: ${story.start_page_id}\n`);

            // Test combat system
            console.log("=== Testing Combat System ===");
            const gameState = story.gameState || {
                playerStats: { health: 100, maxHealth: 100, attack: 10, defense: 5, gold: 0 },
                weapons: { "Basic Sword": { damage: 8, accuracy: 0.8 } }
            };

            const combat = new CombatSystem(
                gameState.playerStats,
                gameState.weapons["Basic Sword"],
                { name: "Test Goblin", health: 25, attack: 6, defense: 2 }
            );

            // Simulate different timing accuracies
            const timingTests = [0.1, 0.4, 0.5, 0.6, 0.9];
            console.log("Timing Test Results:");
            timingTests.forEach(timing => {
                const result = combat.calculateDamage(timing);
                const quality = result.multiplier >= 1.5 ? "CRITICAL!" :
                               result.multiplier >= 1.0 ? "Hit" : "Poor";
                console.log(`⚔️  Timing: ${timing.toFixed(1)} → ${result.damage} damage (${quality})`);
            });

            // Show story structure
            console.log("\n=== Story Structure Preview ===");
            const startPage = story.getPage(story.start_page_id);
            if (startPage) {
                console.log(`📖 Opening: ${startPage.text.substring(0, 100)}...`);
                console.log(`🎯 Choices available: ${startPage.prompts.length}`);

                startPage.prompts.forEach((prompt, i) => {
                    console.log(`   ${i + 1}. ${prompt.text}`);
                });
            }

            // Count special page types
            let combatPages = 0;
            let treasurePages = 0;
            let loopPages = 0;

            Object.values(story.pages).forEach(page => {
                const pageData = JSON.stringify(page);
                if (pageData.includes('combat') || pageData.includes('encounter')) combatPages++;
                if (pageData.includes('treasure') || pageData.includes('gold') || pageData.includes('find')) treasurePages++;
                if (pageData.includes('return') || pageData.includes('back')) loopPages++;
            });

            console.log(`\n📊 RPG Elements Found:`);
            console.log(`⚔️  Combat pages: ${combatPages}`);
            console.log(`💰 Treasure pages: ${treasurePages}`);
            console.log(`🔄 Loop/Return pages: ${loopPages}`);

            console.log(`\n✅ Test completed successfully!`);
            return true;

        } else {
            console.log("❌ Story generation failed");
            return false;
        }

    } catch (error) {
        console.error("❌ Error during testing:", error.message);
        return false;
    }
}

// Run the test
testRPGStoryGenerator().then(success => {
    if (success) {
        console.log("\n🎉 All tests passed! Your RPG Story Generator is ready!");
    } else {
        console.log("\n⚠️  Some tests failed. Check the implementation.");
    }
});