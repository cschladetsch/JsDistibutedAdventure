
const { ClaudeStoryGenerator } = require('./StoryGenerator.js');
const { StorySystem } = require('./StorySystem.js');

async function generateStory() {
    const storySystem = new StorySystem();
    const generator = new ClaudeStoryGenerator(storySystem);

    const themes = [
        "Epic fantasy quest with dragons and ancient magic",
        "Cyberpunk detective mystery in a neon city",
        "Space exploration adventure with alien encounters",
        "Medieval kingdom under siege by dark forces",
        "Post-apocalyptic survival with mutant creatures",
        "Pirate treasure hunt on mysterious islands",
        "Steampunk adventure with mechanical contraptions",
        "Horror mystery in a haunted mansion",
        "Wild west gunslinger adventure",
        "Underwater exploration with sea monsters"
    ];

    const theme = themes[Math.floor(Math.random() * themes.length)];
    console.log(`🎨 Theme: ${theme}`);

    try {
        const story = await generator.generateLongStory(theme, 500);
        if (story) {
            console.log(`✅ Story generated: "${story.title}"`);
            console.log(`📄 Pages: ${Object.keys(story.pages).length}`);
            return story;
        } else {
            console.log("❌ Story generation failed");
            return null;
        }
    } catch (error) {
        console.error("❌ Generation error:", error.message);
        return null;
    }
}

generateStory().then(story => {
    if (story) {
        console.log(`🏆 New story ready to play!`);
        process.exit(0);
    } else {
        process.exit(1);
    }
});
