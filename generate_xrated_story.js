/**
 * X-Rated Story Generator
 * Demo script showing how to use the hybrid generator for mature content
 */

const { StorySystem } = require('./StorySystem');
const { HybridStoryGenerator } = require('./StoryGenerator');

async function generateXRatedStory() {
    console.log('🔞 X-RATED STORY GENERATOR');
    console.log('=' .repeat(50));

    // Initialize the story system
    const storySystem = new StorySystem();

    // Configure hybrid generator for X-rated content
    const hybridGenerator = new HybridStoryGenerator(storySystem, {
        contentRating: 'X',
        enableXRated: true,
        xRatedThreshold: 0.4, // 40% of content will be X-rated
        deepSeek: {
            baseUrl: 'http://localhost:11434', // Local Ollama endpoint
            model: 'deepseek-r1:latest',
            timeout: 45000
        }
    });

    // Available X-rated themes
    const xRatedThemes = [
        "A passionate romance in a cyberpunk city where love and lust intertwine with corporate espionage",
        "A sultry vampire romance with explicit encounters in a Gothic mansion",
        "An adult space opera featuring intimate relationships between starship crew members",
        "A steamy pirate adventure with passionate encounters on the high seas",
        "A mature fantasy quest where magical bonds create intimate connections between adventurers",
        "An adult detective story set in 1940s noir with dangerous liaisons and seduction",
        "A sensual post-apocalyptic survival story where passion blooms in the wasteland",
        "An erotic superhero tale exploring the intimate side of powers and secret identities"
    ];

    // Select random theme or use custom
    const selectedTheme = xRatedThemes[Math.floor(Math.random() * xRatedThemes.length)];

    console.log(`🎭 Selected Theme: ${selectedTheme}`);
    console.log(`🔞 Content Rating: X (Explicit)`);
    console.log(`🤖 Using: Claude + DeepSeek Hybrid Generation`);
    console.log('');

    try {
        // Generate the X-rated story
        console.log('🚀 Starting X-rated story generation...');
        const startTime = Date.now();

        const story = await hybridGenerator.generateHybridStory(selectedTheme, 25, {
            themes: ['romance', 'passion', 'intimacy', 'seduction', 'desire'],
            includeExplicitContent: true,
            matureThemes: ['adult_relationships', 'sexual_tension', 'intimate_encounters']
        });

        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);

        if (story) {
            console.log('');
            console.log('✅ X-RATED STORY GENERATION COMPLETE!');
            console.log('=' .repeat(50));
            console.log(`📖 Story Title: ${story.title}`);
            console.log(`📚 Total Pages: ${Object.keys(story.pages).length}`);
            console.log(`⏱️  Generation Time: ${duration} seconds`);

            // Count mature content pages
            const maturePages = Object.values(story.pages).filter(page =>
                page.mature_content ||
                (page.content_tags && page.content_tags.includes('adult'))
            ).length;

            console.log(`🔞 Mature Content Pages: ${maturePages}`);
            console.log(`📊 Mature Content Ratio: ${((maturePages / Object.keys(story.pages).length) * 100).toFixed(1)}%`);

            // Generator status
            const status = hybridGenerator.getStatus();
            console.log('');
            console.log('🤖 GENERATOR STATUS:');
            console.log(`   Claude Available: ✅`);
            console.log(`   DeepSeek Available: ${status.deepSeekAvailable ? '✅' : '❌'}`);
            console.log(`   X-Rated Enabled: ${status.xRatedEnabled ? '✅' : '❌'}`);
            console.log(`   Content Rating: ${status.contentRating}`);

            // Save the story
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
            const sanitizedTitle = story.title.replace(/[^a-zA-Z0-9]/g, '_');
            const fileName = `XRATED_${sanitizedTitle}_${timestamp}.json`;

            const storiesDir = 'stories';
            if (!fs.existsSync(storiesDir)) {
                fs.mkdirSync(storiesDir, { recursive: true });
            }

            const filePath = path.join(storiesDir, fileName);

            try {
                const storyJson = story.toJSON();
                fs.writeFileSync(filePath, storyJson);
                console.log(`💾 Story saved to: ${filePath}`);
                console.log('');
                console.log('⚠️  WARNING: This story contains explicit adult content (X-rated)');
                console.log('🔞 Intended for mature audiences only (18+)');
                console.log('');
                console.log('🎮 To play this story, run: node run_story.js');
            } catch (saveError) {
                console.error(`❌ Error saving story: ${saveError.message}`);
            }

        } else {
            console.log('❌ Failed to generate X-rated story');
        }

    } catch (error) {
        console.error('💥 X-rated story generation failed:', error.message);
        console.error('Stack trace:', error.stack);

        // Fallback to Claude-only generation
        console.log('');
        console.log('🔄 Attempting fallback generation with Claude only...');
        try {
            const { ClaudeStoryGenerator } = require('./StoryGenerator');
            const claudeGenerator = new ClaudeStoryGenerator(storySystem);
            const fallbackStory = await claudeGenerator.generateLongStory(
                `Adult-themed: ${selectedTheme}`,
                20
            );

            if (fallbackStory) {
                console.log('✅ Fallback story generated successfully');
                console.log(`📖 Title: ${fallbackStory.title}`);
                console.log(`📚 Pages: ${Object.keys(fallbackStory.pages).length}`);
            }
        } catch (fallbackError) {
            console.error('❌ Fallback generation also failed:', fallbackError.message);
        }
    }
}

// Add require check to prevent execution when imported
if (require.main === module) {
    generateXRatedStory().catch(console.error);
}

module.exports = { generateXRatedStory };