#!/usr/bin/env node

/**
 * Create Interesting Story - Main script to generate engaging stories
 * Usage: node create_interesting_story.js [story-type] [options]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import DynamicStoryGenerator from './dynamic_story_generator.js';
import { StoryVariations } from './story_variations.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class InterestingStoryCreator {
    constructor() {
        this.generator = new DynamicStoryGenerator();
        this.storiesDir = path.join(__dirname, 'stories');
        this.ensureStoriesDirectory();
    }

    ensureStoriesDirectory() {
        if (!fs.existsSync(this.storiesDir)) {
            fs.mkdirSync(this.storiesDir, { recursive: true });
        }
    }

    /**
     * Main story creation interface
     */
    async createStory(options = {}) {
        const {
            type = 'random',
            genre = null,
            length = 'medium',
            tone = 'balanced',
            includeRomance = true,
            includeCombat = true,
            complexity = 'moderate',
            interactive = true
        } = options;

        console.log('🎬 Creating an interesting story...\n');

        let story;

        switch (type) {
            case 'mystery':
                story = await this.generator.generateMysteryStory();
                break;
            case 'romance':
                story = await this.generator.generateRomanticAdventure();
                break;
            case 'epic':
                story = await this.generator.generateEpicFantasy();
                break;
            case 'space':
                story = await this.generator.generateSpaceOpera();
                break;
            case 'quick':
                story = await this.createQuickAdventure();
                break;
            case 'horror':
                story = await this.createHorrorStory();
                break;
            case 'comedy':
                story = await this.createComedyStory();
                break;
            case 'custom':
                story = await this.generator.generateStory({
                    genre, length, tone, includeRomance, includeCombat, complexity
                });
                break;
            case 'random':
            default:
                story = await this.createRandomStory();
                break;
        }

        if (story) {
            await this.saveStory(story);
            this.displayStoryInfo(story);

            if (interactive) {
                await this.offerToPlayStory(story);
            }
        }

        return story;
    }

    /**
     * Creates a quick adventure story
     */
    async createQuickAdventure() {
        const adventures = StoryVariations.quickAdventures;
        const selectedAdventure = adventures[Math.floor(Math.random() * adventures.length)];

        console.log(`📚 Creating quick adventure: "${selectedAdventure.title}"`);

        return await this.convertVariationToStory(selectedAdventure);
    }

    /**
     * Creates a horror story
     */
    async createHorrorStory() {
        const horrorStories = StoryVariations.horrorStories;
        const selectedHorror = horrorStories[Math.floor(Math.random() * horrorStories.length)];

        console.log(`👻 Creating horror story: "${selectedHorror.title}"`);

        return await this.convertVariationToStory(selectedHorror);
    }

    /**
     * Creates a comedy story
     */
    async createComedyStory() {
        const comedyStories = StoryVariations.comedyStories;
        const selectedComedy = comedyStories[Math.floor(Math.random() * comedyStories.length)];

        console.log(`😄 Creating comedy story: "${selectedComedy.title}"`);

        return await this.convertVariationToStory(selectedComedy);
    }

    /**
     * Creates a random story with interesting elements
     */
    async createRandomStory() {
        const storyTypes = ['mystery', 'romance', 'epic', 'space', 'quick', 'horror', 'comedy'];
        const randomType = storyTypes[Math.floor(Math.random() * storyTypes.length)];

        console.log(`🎲 Randomly selected story type: ${randomType}`);

        return this.createStory({ type: randomType, interactive: false });
    }

    /**
     * Converts story variation format to full story object
     */
    async convertVariationToStory(variation) {
        const story = this.generator.storySystem.createStory(
            `${variation.title.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
            variation.title,
            'start'
        );

        const { Page } = await import('./StorySystem.js');

        // Convert pages
        for (const [pageId, pageData] of Object.entries(variation.pages)) {
            const page = new Page(pageId, pageData.text);

            if (pageData.background) {
                page.setBackground(pageData.background);
            }

            // Add choices as prompts
            if (pageData.choices) {
                pageData.choices.forEach(choice => {
                    page.addPrompt(choice.text, choice.target, choice.requirements || {});
                });
            }

            story.addPage(page);
        }

        return story;
    }

    /**
     * Saves story to file
     */
    async saveStory(story) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
        const filename = `${story.title.replace(/\s+/g, '_')}_${timestamp}.json`;
        const filepath = path.join(this.storiesDir, filename);

        try {
            fs.writeFileSync(filepath, story.toJSON(), 'utf8');
            console.log(`💾 Story saved to: ${filename}`);
        } catch (error) {
            console.error('❌ Error saving story:', error.message);
        }
    }

    /**
     * Displays story information
     */
    displayStoryInfo(story) {
        console.log('\n📖 Story Created Successfully!');
        console.log('=' * 50);
        console.log(`Title: ${story.title}`);
        console.log(`ID: ${story.id}`);
        console.log(`Pages: ${Object.keys(story.pages).length}`);
        console.log(`Starting Page: ${story.start_page_id}`);

        // Display some interesting stats
        const pages = Object.values(story.pages);
        const totalChoices = pages.reduce((sum, page) => sum + (page.prompts?.length || 0), 0);
        const combatPages = pages.filter(page => page.combat || page.text?.includes('battle')).length;
        const romancePages = pages.filter(page => page.text?.includes('love') || page.text?.includes('heart')).length;

        console.log(`Total Choices: ${totalChoices}`);
        console.log(`Combat Encounters: ${combatPages}`);
        console.log(`Romance Elements: ${romancePages}`);
        console.log('=' * 50 + '\n');
    }

    /**
     * Offers to play the story immediately
     */
    async offerToPlayStory(story) {
        console.log('🎮 Would you like to play this story now? (y/n)');

        // Simple prompt for demo - in a real implementation, you'd use readline
        console.log('💡 To play this story, run: npm run play:latest');
        console.log('💡 Or use: node run_story.js');
    }

    /**
     * Lists available story types
     */
    static listStoryTypes() {
        console.log('📚 Available Story Types:');
        console.log('- mystery: Detective and puzzle-solving adventures');
        console.log('- romance: Love stories with meaningful choices');
        console.log('- epic: Large-scale fantasy adventures');
        console.log('- space: Science fiction space operas');
        console.log('- quick: Short 5-10 minute adventures');
        console.log('- horror: Psychological and supernatural horror');
        console.log('- comedy: Humorous and lighthearted adventures');
        console.log('- custom: Create with specific parameters');
        console.log('- random: Surprise me with something interesting');
    }

    /**
     * Shows usage information
     */
    static showUsage() {
        console.log('📚 Interesting Story Creator');
        console.log('Usage: node create_interesting_story.js [story-type] [options]');
        console.log('');
        console.log('Examples:');
        console.log('  node create_interesting_story.js mystery');
        console.log('  node create_interesting_story.js romance');
        console.log('  node create_interesting_story.js epic');
        console.log('  node create_interesting_story.js random');
        console.log('');
        console.log('Options:');
        console.log('  --help, -h     Show this help message');
        console.log('  --list, -l     List available story types');
        console.log('  --no-romance   Exclude romance elements');
        console.log('  --no-combat    Exclude combat encounters');
        console.log('  --short        Create a short story');
        console.log('  --long         Create a long story');
        console.log('  --epic         Create an epic-length story');
        console.log('  --simple       Use simple choices and mechanics');
        console.log('  --complex      Use complex choices and consequences');
    }
}

// Command line interface
async function main() {
    const args = process.argv.slice(2);

    if (args.includes('--help') || args.includes('-h')) {
        InterestingStoryCreator.showUsage();
        return;
    }

    if (args.includes('--list') || args.includes('-l')) {
        InterestingStoryCreator.listStoryTypes();
        return;
    }

    const storyType = args[0] || 'random';

    const options = {
        type: storyType,
        includeRomance: !args.includes('--no-romance'),
        includeCombat: !args.includes('--no-combat'),
        length: args.includes('--short') ? 'short' :
                args.includes('--long') ? 'long' :
                args.includes('--epic') ? 'epic' : 'medium',
        complexity: args.includes('--simple') ? 'simple' :
                   args.includes('--complex') ? 'complex' : 'moderate'
    };

    const creator = new InterestingStoryCreator();
    await creator.createStory(options);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        console.error('❌ Error creating story:', error.message);
        process.exit(1);
    });
}

export default InterestingStoryCreator;