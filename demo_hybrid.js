/**
 * Hybrid Story Generator Demo
 * Demonstrates the combined Claude + DeepSeek system for X-rated content
 */

const { StorySystem } = require('./StorySystem');
const { HybridStoryGenerator } = require('./StoryGenerator');

class HybridDemo {
    constructor() {
        this.storySystem = new StorySystem();
    }

    async runDemo() {
        console.log('🎭 HYBRID STORY GENERATOR DEMO');
        console.log('🤖 Claude + DeepSeek Combined System');
        console.log('=' .repeat(60));

        // Demo 1: Check DeepSeek availability
        await this.checkDeepSeekAvailability();

        // Demo 2: Generate PG-13 story with Claude only
        await this.generatePG13Story();

        // Demo 3: Generate R-rated story with hybrid system
        await this.generateRRatedStory();

        // Demo 4: Generate X-rated story with maximum mature content
        await this.generateXRatedStory();

        console.log('');
        console.log('✅ Demo completed! Check the stories/ folder for generated content.');
        console.log('🎮 Run "node run_story.js" to play the latest generated story.');
    }

    async checkDeepSeekAvailability() {
        console.log('');
        console.log('🔍 CHECKING DEEPSEEK AVAILABILITY');
        console.log('-' .repeat(40));

        const DeepSeekClient = require('./external/DeepSeekClient');
        const deepSeekClient = new DeepSeekClient();

        try {
            const available = await deepSeekClient.isAvailable();

            if (available) {
                console.log('✅ DeepSeek model is available!');

                const modelInfo = await deepSeekClient.getModelInfo();
                console.log(`📊 Model: ${modelInfo.name}`);
                console.log(`💾 Parameters: ${modelInfo.parameters}`);
                console.log(`🔧 Quantization: ${modelInfo.quantization}`);
            } else {
                console.log('❌ DeepSeek model not available');
                console.log('💡 Tip: Install Ollama and run "ollama pull deepseek-r1:latest"');
                console.log('📖 See setup_deepseek.md for detailed instructions');
            }
        } catch (error) {
            console.log('❌ Error checking DeepSeek:', error.message);
        }
    }

    async generatePG13Story() {
        console.log('');
        console.log('📺 GENERATING PG-13 STORY (Claude Only)');
        console.log('-' .repeat(40));

        const generator = new HybridStoryGenerator(this.storySystem, {
            contentRating: 'PG-13',
            enableXRated: false
        });

        try {
            const story = await generator.generateHybridStory(
                "A space adventure with alien encounters and cosmic mysteries",
                15
            );

            if (story) {
                console.log(`✅ Generated: "${story.title}"`);
                console.log(`📚 Pages: ${Object.keys(story.pages).length}`);
                console.log(`🏷️  Rating: PG-13 (Family Friendly)`);
            }
        } catch (error) {
            console.log('❌ PG-13 generation failed:', error.message);
        }
    }

    async generateRRatedStory() {
        console.log('');
        console.log('🎬 GENERATING R-RATED STORY (Hybrid System)');
        console.log('-' .repeat(40));

        const generator = new HybridStoryGenerator(this.storySystem, {
            contentRating: 'R',
            enableXRated: true,
            xRatedThreshold: 0.25 // 25% mature content
        });

        try {
            const story = await generator.generateHybridStory(
                "A noir detective story with dark themes and adult situations",
                20,
                {
                    themes: ['crime', 'mystery', 'adult_relationships'],
                    includeExplicitContent: false
                }
            );

            if (story) {
                console.log(`✅ Generated: "${story.title}"`);
                console.log(`📚 Pages: ${Object.keys(story.pages).length}`);
                console.log(`🏷️  Rating: R (Mature Themes)`);

                // Count mature pages
                const maturePages = Object.values(story.pages).filter(page =>
                    page.mature_content
                ).length;
                console.log(`🔞 Mature Content: ${maturePages} pages (${((maturePages / Object.keys(story.pages).length) * 100).toFixed(1)}%)`);
            }
        } catch (error) {
            console.log('❌ R-rated generation failed:', error.message);
        }
    }

    async generateXRatedStory() {
        console.log('');
        console.log('🔞 GENERATING X-RATED STORY (Maximum Mature Content)');
        console.log('-' .repeat(40));

        const generator = new HybridStoryGenerator(this.storySystem, {
            contentRating: 'X',
            enableXRated: true,
            xRatedThreshold: 0.6 // 60% explicit content
        });

        try {
            const story = await generator.generateHybridStory(
                "A passionate cyberpunk romance with explicit encounters and intimate relationships",
                25,
                {
                    themes: ['romance', 'passion', 'intimacy', 'cyberpunk'],
                    includeExplicitContent: true,
                    matureThemes: ['sexual_content', 'adult_relationships', 'intimate_encounters']
                }
            );

            if (story) {
                console.log(`✅ Generated: "${story.title}"`);
                console.log(`📚 Pages: ${Object.keys(story.pages).length}`);
                console.log(`🏷️  Rating: X (Explicit Content)`);

                // Analyze content distribution
                const maturePages = Object.values(story.pages).filter(page =>
                    page.mature_content || (page.content_tags && page.content_tags.includes('adult'))
                ).length;

                const explicitPages = Object.values(story.pages).filter(page =>
                    page.content_tags && (
                        page.content_tags.includes('x-rated') ||
                        page.content_tags.includes('explicit')
                    )
                ).length;

                console.log(`🔞 Mature Content: ${maturePages} pages (${((maturePages / Object.keys(story.pages).length) * 100).toFixed(1)}%)`);
                console.log(`💋 Explicit Content: ${explicitPages} pages (${((explicitPages / Object.keys(story.pages).length) * 100).toFixed(1)}%)`);

                console.log('');
                console.log('⚠️  WARNING: This story contains explicit adult content');
                console.log('🔞 Intended for mature audiences only (18+)');
            }
        } catch (error) {
            console.log('❌ X-rated generation failed:', error.message);
            console.log('💡 Note: X-rated generation requires DeepSeek model');
        }
    }

    async demonstrateContentRatings() {
        console.log('');
        console.log('📊 CONTENT RATING COMPARISON');
        console.log('-' .repeat(40));

        const ratings = [
            {
                rating: 'PG-13',
                description: 'Family-friendly adventure content',
                features: ['General audiences', 'Mild violence', 'No explicit content']
            },
            {
                rating: 'R',
                description: 'Mature themes and situations',
                features: ['Adult themes', 'Strong language', 'Mature relationships', 'Violence']
            },
            {
                rating: 'X',
                description: 'Explicit adult content',
                features: ['Sexual content', 'Graphic descriptions', 'Adult-only themes', 'Explicit language']
            }
        ];

        ratings.forEach(({ rating, description, features }) => {
            console.log(`${rating}: ${description}`);
            features.forEach(feature => console.log(`   • ${feature}`));
            console.log('');
        });

        console.log('🎮 Usage Examples:');
        console.log('   node demo_hybrid.js          # Run this demo');
        console.log('   node generate_xrated_story.js # Generate X-rated story');
        console.log('   node run_story.js            # Play generated stories');
    }
}

async function main() {
    const demo = new HybridDemo();

    try {
        await demo.runDemo();
        await demo.demonstrateContentRatings();
    } catch (error) {
        console.error('❌ Demo failed:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

// Export for testing
module.exports = { HybridDemo };

// Run demo if executed directly
if (require.main === module) {
    main().catch(console.error);
}