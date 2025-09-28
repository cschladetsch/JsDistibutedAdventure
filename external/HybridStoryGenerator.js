/**
 * HybridStoryGenerator.js
 * Combines Claude and DeepSeek models for comprehensive story generation
 * Claude handles general content, DeepSeek handles X-rated content
 */

import DeepSeekClient from './DeepSeekClient.js';
import { ClaudeStoryGenerator } from '../StoryGenerator.js';

class HybridStoryGenerator {
    constructor(storySystem, options = {}) {
        this.storySystem = storySystem;
        this.claudeGenerator = new ClaudeStoryGenerator(storySystem);
        this.deepSeekClient = new DeepSeekClient(options.deepSeek || {});

        // Content rating settings
        this.contentRating = options.contentRating || 'PG-13'; // PG-13, R, X
        this.enableXRated = options.enableXRated || false;
        this.xRatedThreshold = options.xRatedThreshold || 0.3; // Probability of X-rated content

        // Model availability
        this.deepSeekAvailable = null;
    }

    /**
     * Initialize the hybrid generator
     */
    async initialize() {
        console.log('🔄 Initializing Hybrid Story Generator...');

        try {
            this.deepSeekAvailable = await this.deepSeekClient.isAvailable();

            if (this.deepSeekAvailable) {
                const modelInfo = await this.deepSeekClient.getModelInfo();
                console.log(`✅ DeepSeek model available: ${modelInfo.name}`);

                if (this.enableXRated) {
                    console.log('🔞 X-rated content generation ENABLED');
                }
            } else {
                console.log('⚠️  DeepSeek model not available - using Claude only');
                this.enableXRated = false;
            }

            console.log(`📊 Content Rating: ${this.contentRating}`);
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize hybrid generator:', error.message);
            this.deepSeekAvailable = false;
            this.enableXRated = false;
            return false;
        }
    }

    /**
     * Generate a complete story using both models
     */
    async generateHybridStory(theme, minPages = 20, options = {}) {
        await this.initialize();

        console.log(`🎭 Generating hybrid story for theme: "${theme}"`);
        console.log(`📖 Target pages: ${minPages}, Rating: ${this.contentRating}`);

        // Phase 1: Generate base story with Claude
        console.log('📝 Phase 1: Generating base story structure with Claude...');
        const baseStory = await this.claudeGenerator.generateLongStory(theme, Math.floor(minPages * 0.7));

        if (!baseStory) {
            throw new Error('Failed to generate base story with Claude');
        }

        // Phase 2: Enhance with X-rated content if enabled
        if (this.enableXRated && this.deepSeekAvailable && this.contentRating !== 'PG-13') {
            console.log('🔞 Phase 2: Adding mature content with DeepSeek...');
            await this._enhanceWithXRatedContent(baseStory, theme, options);
        }

        // Phase 3: Add hybrid transitions and choices
        console.log('🔄 Phase 3: Creating hybrid transitions...');
        await this._addHybridTransitions(baseStory, theme);

        // Phase 4: Ensure minimum page count
        const currentPages = Object.keys(baseStory.pages).length;
        if (currentPages < minPages) {
            console.log(`📚 Phase 4: Adding ${minPages - currentPages} additional pages...`);
            await this._addAdditionalHybridPages(baseStory, theme, minPages - currentPages);
        }

        console.log(`✅ Hybrid story complete: ${Object.keys(baseStory.pages).length} pages`);
        return baseStory;
    }

    /**
     * Enhance story with X-rated content using DeepSeek
     */
    async _enhanceWithXRatedContent(story, theme, options = {}) {
        const storyPages = Object.keys(story.pages);
        const targetXRatedPages = Math.floor(storyPages.length * this.xRatedThreshold);

        console.log(`🎯 Adding ${targetXRatedPages} X-rated scenes...`);

        for (let i = 0; i < targetXRatedPages; i++) {
            try {
                const xRatedPrompt = this._createXRatedPrompt(theme, story, options);
                const xRatedContent = await this.deepSeekClient.generateXRatedContent(xRatedPrompt, {
                    rating: this.contentRating,
                    themes: options.themes || ['romance', 'passion', 'intimacy', 'love', 'relationships', 'emotional_connection'],
                    temperature: 0.9
                });

                if (xRatedContent && xRatedContent.pages) {
                    // Integrate X-rated pages into story
                    Object.assign(story.pages, xRatedContent.pages);

                    // Create connections to X-rated content
                    this._createXRatedConnections(story, xRatedContent);
                }

                // Rate limiting for API calls
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error) {
                console.warn(`⚠️  Failed to generate X-rated content ${i + 1}:`, error.message);
            }
        }
    }

    /**
     * Create prompt for X-rated content generation
     */
    _createXRatedPrompt(theme, story, options) {
        const storyContext = `
Story Theme: ${theme}
Story Title: ${story.title}
Content Rating: ${this.contentRating}
Existing Pages: ${Object.keys(story.pages).length}

Generate mature, adult-oriented story content that:
1. Fits naturally with the existing story theme
2. Contains explicit adult content appropriate for ${this.contentRating} rating
3. Includes meaningful player choices with adult consequences
4. Maintains story coherence and character development
5. Features mature relationship dynamics and intimate situations

The content should be provocative yet tasteful, focusing on:
- Adult romance and passion
- Mature emotional connections
- Intimate encounters and relationships
- Adult decision-making and consequences
- Sophisticated character interactions
- Love stories and romantic development
- Emotional vulnerability and trust
- Romantic tension and chemistry
- Relationship building and commitment

Create 2-3 interconnected pages with explicit content.`;

        return storyContext;
    }

    /**
     * Create connections between regular and X-rated content
     */
    _createXRatedConnections(story, xRatedContent) {
        const regularPages = Object.keys(story.pages).filter(id =>
            !story.pages[id].mature_content
        );
        const xRatedPages = Object.keys(xRatedContent.pages);

        // Add choices from regular pages to X-rated content
        const connectionCount = Math.min(3, regularPages.length);
        for (let i = 0; i < connectionCount; i++) {
            const regularPageId = regularPages[Math.floor(Math.random() * regularPages.length)];
            const xRatedPageId = xRatedPages[Math.floor(Math.random() * xRatedPages.length)];

            const regularPage = story.pages[regularPageId];
            if (regularPage && regularPage.prompts) {
                // Add a choice leading to mature content
                regularPage.prompts.push({
                    text: "Follow your heart's desires... 💕🔞",
                    target_id: xRatedPageId,
                    requirements: { contentRating: this.contentRating }
                });
            }
        }

        // Add return paths from X-rated to regular content
        xRatedPages.forEach(xRatedPageId => {
            const xRatedPage = story.pages[xRatedPageId];
            if (xRatedPage && xRatedPage.prompts) {
                const returnPageId = regularPages[Math.floor(Math.random() * regularPages.length)];
                xRatedPage.prompts.push({
                    text: "Return to the main story",
                    target_id: returnPageId
                });
            }
        });
    }

    /**
     * Add hybrid transitions between different content types
     */
    async _addHybridTransitions(story, theme) {
        const transitionPrompt = `Create transition pages for a story about "${theme}" that bridge between different content ratings.

Generate pages that:
1. Provide natural transitions between general and mature content
2. Give players clear choices about content they want to experience
3. Include content warnings where appropriate
4. Maintain story flow and coherence

Create 3-5 transition pages with appropriate choices.`;

        try {
            const transitionContent = await this.claudeGenerator._callClaudeApi(
                transitionPrompt,
                "You are a story designer creating smooth transitions between different content ratings."
            );

            if (transitionContent && transitionContent.pages) {
                Object.assign(story.pages, transitionContent.pages);
            }
        } catch (error) {
            console.warn('⚠️  Failed to create hybrid transitions:', error.message);
        }
    }

    /**
     * Add additional pages using both models
     */
    async _addAdditionalHybridPages(story, theme, pageCount) {
        const pagesPerBatch = 5;
        const batches = Math.ceil(pageCount / pagesPerBatch);

        for (let batch = 0; batch < batches; batch++) {
            const currentBatchSize = Math.min(pagesPerBatch, pageCount - (batch * pagesPerBatch));

            // Alternate between Claude and DeepSeek for variety
            const useXRated = this.enableXRated &&
                              this.deepSeekAvailable &&
                              Math.random() < this.xRatedThreshold;

            if (useXRated) {
                console.log(`🔞 Generating batch ${batch + 1} with DeepSeek (X-rated)...`);
                await this._addXRatedBatch(story, theme, currentBatchSize);
            } else {
                console.log(`📝 Generating batch ${batch + 1} with Claude (general)...`);
                await this._addClaudeBatch(story, theme, currentBatchSize);
            }

            // Rate limiting
            await new Promise(resolve => setTimeout(resolve, 200));
        }
    }

    /**
     * Add X-rated batch using DeepSeek
     */
    async _addXRatedBatch(story, theme, batchSize) {
        try {
            const prompt = `Generate ${batchSize} additional X-rated story pages for "${theme}" with mature content.`;
            const content = await this.deepSeekClient.generateXRatedContent(prompt, {
                rating: this.contentRating,
                maxTokens: 1500 * batchSize
            });

            if (content && content.pages) {
                Object.assign(story.pages, content.pages);
            }
        } catch (error) {
            console.warn('⚠️  X-rated batch generation failed, falling back to Claude');
            await this._addClaudeBatch(story, theme, batchSize);
        }
    }

    /**
     * Add general batch using Claude
     */
    async _addClaudeBatch(story, theme, batchSize) {
        const prompt = `Generate ${batchSize} additional story pages for "${theme}" with engaging content suitable for ${this.contentRating} rating.`;

        try {
            const content = await this.claudeGenerator._callClaudeApi(
                prompt,
                "Generate diverse, engaging story content with meaningful choices."
            );

            if (content && content.pages) {
                Object.assign(story.pages, content.pages);
            }
        } catch (error) {
            console.warn('⚠️  Claude batch generation failed:', error.message);
        }
    }

    /**
     * Set content rating and update settings
     */
    setContentRating(rating) {
        const validRatings = ['PG-13', 'R', 'X'];
        if (validRatings.includes(rating)) {
            this.contentRating = rating;
            this.enableXRated = rating !== 'PG-13';
            console.log(`📊 Content rating updated to: ${rating}`);
            return true;
        }
        return false;
    }

    /**
     * Get generator status
     */
    getStatus() {
        return {
            contentRating: this.contentRating,
            xRatedEnabled: this.enableXRated,
            deepSeekAvailable: this.deepSeekAvailable,
            claudeAvailable: true,
            xRatedThreshold: this.xRatedThreshold
        };
    }
}

export default HybridStoryGenerator;