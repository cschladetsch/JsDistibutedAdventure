/**
 * create_web_enhanced_story.js
 * Creates stories using the new web-enhanced generator
 */

const fs = require('fs');
const path = require('path');
const { StorySystem } = require('./StorySystem.js');
const WebEnhancedStoryGenerator = require('./WebEnhancedStoryGenerator.js');
const Colors = require('./external/colors.js');

class WebEnhancedStoryCreator {
    constructor() {
        this.storySystem = new StorySystem();
        this.webGenerator = new WebEnhancedStoryGenerator(this.storySystem);
        this.outputDir = './stories';

        // Ensure output directory exists
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
    }

    /**
     * Creates a story with web enhancement and reduced loops
     */
    async createEnhancedStory(prompt, title = null) {
        console.log(Colors.aiLabel('\n🤖 Web-Enhanced Story Generator'));
        console.log(Colors.purple('=' .repeat(50)));

        try {
            // Generate unique ID and title
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const storyId = `web_enhanced_${timestamp}`;
            const storyTitle = title || this.generateTitleFromPrompt(prompt);

            console.log(Colors.lightPurple(`📖 Creating: "${storyTitle}"`));
            console.log(Colors.brightBlack(`💭 Prompt: ${prompt}`));
            console.log(Colors.brightBlack(`🆔 ID: ${storyId}`));

            // Generate story with web enhancement
            const story = await this.webGenerator.generate(prompt, storyId, storyTitle);

            if (!story) {
                throw new Error('Story generation failed');
            }

            // Add enhanced metadata
            const storyData = {
                id: story.id,
                title: story.title,
                start_page_id: story.start_page_id,
                pages: story.pages
            };
            const enhancedStory = this.addEnhancedMetadata(storyData, prompt);

            // Save to file
            const filename = this.saveStory(enhancedStory, storyTitle);

            console.log(Colors.green('\n✅ Web-enhanced story created successfully!'));
            console.log(Colors.cyan(`📁 Saved as: ${filename}`));
            console.log(Colors.yellow(`🎮 Run with: node run_story.js`));

            return {
                story: enhancedStory,
                filename: filename,
                path: path.join(this.outputDir, filename)
            };

        } catch (error) {
            console.error(Colors.red('\n❌ Enhanced story creation failed:'), error.message);
            throw error;
        }
    }

    /**
     * Generates an appropriate title from the prompt
     */
    generateTitleFromPrompt(prompt) {
        const promptWords = prompt.toLowerCase().split(/\s+/);
        const keyWords = promptWords.filter(word =>
            word.length > 3 &&
            !['the', 'and', 'with', 'that', 'this', 'from'].includes(word)
        );

        if (keyWords.length >= 2) {
            return keyWords.slice(0, 2)
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join("'s ") + ' Tale';
        } else if (keyWords.length === 1) {
            return keyWords[0].charAt(0).toUpperCase() + keyWords[0].slice(1) + ' Adventure';
        } else {
            return 'Mysterious Adventure';
        }
    }

    /**
     * Adds enhanced metadata for better story management
     */
    addEnhancedMetadata(storyData, originalPrompt) {

        // Add web-enhanced metadata
        storyData.metadata = {
            generation_method: 'web_enhanced',
            original_prompt: originalPrompt,
            created_at: new Date().toISOString(),
            version: '2.0',
            features: {
                web_enhanced: true,
                loop_reduced: true,
                dynamic_content: true,
                anti_repetition: true
            }
        };

        // Add enhanced game state with web-sourced elements
        storyData.game_state = {
            player_stats: {
                // Core Stats
                health: 100, max_health: 100, mana: 50, max_mana: 50,
                stamina: 100, max_stamina: 100, energy: 100, max_energy: 100,

                // Primary Attributes
                strength: 10, dexterity: 10, constitution: 10, intelligence: 10,
                wisdom: 10, charisma: 10, luck: 10, perception: 10,

                // Combat Stats
                attack: 10, defense: 5, accuracy: 75, evasion: 10,
                critical_chance: 5, critical_damage: 150, block_chance: 10,

                // Magic Stats
                spell_power: 5, mana_regeneration: 2, spell_resistance: 0,

                // Social Stats
                reputation: 0, leadership: 5, intimidation: 5, persuasion: 5,
                deception: 5, insight: 5, diplomacy: 5,

                // Survival Stats
                survival: 5, stealth: 5, lockpicking: 0, trap_detection: 0,

                // Economic Stats
                gold: 25, merchant_rep: 0, crafting_skill: 0,

                // Experience & Progression
                experience: 0, level: 1, skill_points: 0,

                // Status Effects
                poisoned: false, blessed: false, cursed: false, exhausted: false
            },
            inventory: ["Basic Weapon", "Simple Armor", "Healing Item"],
            weapons: {
                "Basic Weapon": { damage: 8, accuracy: 0.8, rarity: "common" },
                "Enhanced Weapon": { damage: 12, accuracy: 0.85, rarity: "common" },
                "Powerful Weapon": { damage: 18, accuracy: 0.9, rarity: "rare" }
            },
            story_flags: [],
            world_state: {
                time_of_day: "morning",
                weather: "clear",
                village_reputation: 0,
                explored_areas: []
            },
            web_enhancement: {
                content_sources_used: ['RPG databases', 'World building sites', 'Story tropes'],
                last_content_refresh: new Date().toISOString(),
                anti_loop_active: true
            }
        };

        return storyData;
    }

    /**
     * Saves the story to a file with enhanced naming
     */
    saveStory(storyData, title) {
        const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const safeTitle = title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
        const filename = `${safeTitle}_WebEnhanced_${timestamp}.json`;
        const filepath = path.join(this.outputDir, filename);

        fs.writeFileSync(filepath, JSON.stringify(storyData, null, 2));
        return filename;
    }

    /**
     * Creates multiple enhanced stories with different approaches
     */
    async createVariedStories(basePrompt, count = 3) {
        console.log(Colors.aiLabel(`\n🎲 Creating ${count} varied web-enhanced stories...`));

        const stories = [];
        const variations = [
            'action-focused',
            'character-driven',
            'mystery-oriented'
        ];

        for (let i = 0; i < count; i++) {
            const variation = variations[i % variations.length];
            const enhancedPrompt = `${basePrompt} with ${variation} elements`;

            try {
                console.log(Colors.purple(`\n📝 Creating variation ${i + 1}: ${variation}`));
                const result = await this.createEnhancedStory(enhancedPrompt, `${basePrompt} (${variation})`);
                stories.push(result);

                // Brief pause to prevent overwhelming the system
                await new Promise(resolve => setTimeout(resolve, 1000));

            } catch (error) {
                console.warn(Colors.yellow(`⚠️ Variation ${i + 1} failed: ${error.message}`));
            }
        }

        console.log(Colors.green(`\n✅ Created ${stories.length} enhanced stories!`));
        return stories;
    }
}

// CLI interface
async function main() {
    if (process.argv.length < 3) {
        console.log(Colors.cyan('\n🎮 Web-Enhanced Story Creator'));
        console.log('Usage: node create_web_enhanced_story.js "<prompt>" [title]');
        console.log('Example: node create_web_enhanced_story.js "fantasy adventure with dragons" "Dragon Quest"');
        console.log('\nOr for multiple variations:');
        console.log('node create_web_enhanced_story.js "<prompt>" --varied [count]');
        process.exit(1);
    }

    const creator = new WebEnhancedStoryCreator();
    const prompt = process.argv[2];

    try {
        if (process.argv.includes('--varied')) {
            const count = parseInt(process.argv[process.argv.indexOf('--varied') + 1]) || 3;
            await creator.createVariedStories(prompt, count);
        } else {
            const title = process.argv[3];
            await creator.createEnhancedStory(prompt, title);
        }
    } catch (error) {
        console.error(Colors.red('\n💥 Creation failed:'), error.message);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = WebEnhancedStoryCreator;