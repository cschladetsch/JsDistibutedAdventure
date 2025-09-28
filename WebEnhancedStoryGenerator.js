/**
 * WebEnhancedStoryGenerator.js
 * Enhanced LLM story generator with internet reading capabilities
 * Reduces repetitive loops by fetching dynamic content from the web
 */

const Page = require('./Page');
const WebContentFetcher = require('./WebContentFetcher');

class WebEnhancedStoryGenerator {
    constructor(storySystem) {
        this.system = storySystem;
        this.contentCache = new Map(); // Cache web content to reduce API calls
        this.storyPatterns = new Map(); // Track patterns to avoid repetition
        this.webFetcher = new WebContentFetcher(); // Real web content fetching
    }

    /**
     * Generates enhanced stories with web-sourced content
     */
    async generate(highLevelPrompt, storyId, storyTitle) {
        console.log("🌐 Generating web-enhanced story...");

        try {
            // Step 1: Analyze prompt and identify content needs
            const contentNeeds = this.analyzeContentNeeds(highLevelPrompt);

            // Step 2: Fetch relevant web content
            const webContent = await this.fetchRelevantContent(contentNeeds);

            // Step 3: Generate story structure using web content
            const storyData = await this.generateEnhancedStory(highLevelPrompt, webContent);

            // Step 4: Parse into story object
            const story = this.parse(storyData, storyId, storyTitle);

            console.log("✅ Web-enhanced story generated successfully!");
            return story;

        } catch (error) {
            console.error("❌ Web-enhanced generation failed:", error.message);
            // Fallback to basic generation
            return this.generateFallbackStory(highLevelPrompt, storyId, storyTitle);
        }
    }

    /**
     * Analyzes the prompt to identify what type of content to fetch from the web
     */
    analyzeContentNeeds(prompt) {
        const needs = {
            themes: [],
            settings: [],
            characters: [],
            mechanics: []
        };

        const promptLower = prompt.toLowerCase();

        // Identify themes
        if (promptLower.includes('fantasy') || promptLower.includes('magic')) {
            needs.themes.push('fantasy', 'mythology', 'medieval');
        }
        if (promptLower.includes('sci-fi') || promptLower.includes('space') || promptLower.includes('future')) {
            needs.themes.push('science fiction', 'technology', 'space exploration');
        }
        if (promptLower.includes('horror') || promptLower.includes('scary')) {
            needs.themes.push('horror', 'supernatural', 'mystery');
        }
        if (promptLower.includes('romance') || promptLower.includes('love')) {
            needs.themes.push('romance', 'relationships', 'drama');
        }

        // Identify settings
        if (promptLower.includes('city') || promptLower.includes('urban')) {
            needs.settings.push('urban environments', 'city planning');
        }
        if (promptLower.includes('forest') || promptLower.includes('nature')) {
            needs.settings.push('forests', 'wilderness', 'ecology');
        }

        return needs;
    }

    /**
     * Fetches relevant content from the web based on identified needs
     */
    async fetchRelevantContent(contentNeeds) {
        const webContent = {
            inspiration: [],
            worldBuilding: [],
            mechanics: []
        };

        try {
            // Fetch RPG and storytelling inspiration using real web fetcher
            if (contentNeeds.themes.length > 0) {
                const themeQuery = contentNeeds.themes.slice(0, 2).join(' '); // Limit to prevent overly broad searches

                // Search for RPG mechanics and world-building ideas
                const mechanicsUrls = await this.webFetcher.searchForContent(
                    `RPG game mechanics ${themeQuery} storytelling narrative choices`
                );
                const mechanicsContent = await this.webFetcher.fetchAndAnalyzeContent(
                    mechanicsUrls,
                    'Extract RPG mechanics, story structures, and narrative techniques'
                );
                webContent.mechanics.push(mechanicsContent);

                // Search for world-building inspiration
                const worldUrls = await this.webFetcher.searchForContent(
                    `${themeQuery} world building creative settings environments`
                );
                const worldContent = await this.webFetcher.fetchAndAnalyzeContent(
                    worldUrls,
                    'Extract world-building ideas, settings, and environmental descriptions'
                );
                webContent.worldBuilding.push(worldContent);

                // Search for character and plot inspiration
                const storyUrls = await this.webFetcher.searchForContent(
                    `${themeQuery} character archetypes plot hooks narrative ideas`
                );
                const storyContent = await this.webFetcher.fetchAndAnalyzeContent(
                    storyUrls,
                    'Extract character concepts, plot hooks, and narrative inspiration'
                );
                webContent.inspiration.push(storyContent);
            }

        } catch (error) {
            console.warn("⚠️ Web content fetch failed, using cached content:", error.message);
        }

        return webContent;
    }

    /**
     * Performs web search using WebSearch tool with WebFetch for detailed content
     */
    async searchWeb(query, prompt) {
        const cacheKey = query.substring(0, 50); // Use first 50 chars as cache key
        if (this.contentCache.has(cacheKey)) {
            console.log(`📋 Using cached content for: ${query.substring(0, 30)}...`);
            return this.contentCache.get(cacheKey);
        }

        try {
            console.log(`🔍 Searching web for: ${query}`);

            // Step 1: Search for relevant URLs
            const searchResults = await this.performWebSearch(query);

            // Step 2: Fetch and analyze content from top results
            const content = await this.analyzeWebContent(searchResults, prompt);

            this.contentCache.set(cacheKey, content);
            return content;

        } catch (error) {
            console.warn(`⚠️ Web search failed for "${query}", using fallback:`, error.message);
            // Fallback to generated content
            const content = this.generateDynamicContent(query);
            this.contentCache.set(cacheKey, content);
            return content;
        }
    }

    /**
     * Performs the actual web search
     */
    async performWebSearch(query) {
        // This would be replaced with actual WebSearch tool call
        // For demo purposes, we'll return simulated search results
        return [
            `https://www.dndbeyond.com/articles/${query.replace(/\s+/g, '-')}`,
            `https://www.worldanvil.com/inspiration/${query.replace(/\s+/g, '-')}`,
            `https://tvtropes.org/pmwiki/pmwiki.php/Main/${query.replace(/\s+/g, '')}`
        ];
    }

    /**
     * Analyzes web content using WebFetch
     */
    async analyzeWebContent(urls, analysisPrompt) {
        const content = {
            themes: [],
            mechanics: [],
            settings: [],
            characters: []
        };

        // For demo, we'll analyze one URL
        if (urls.length > 0) {
            try {
                console.log(`📄 Fetching content from: ${urls[0]}`);
                // This would use WebFetch tool in real implementation
                const fetchedContent = await this.simulateWebFetch(urls[0], analysisPrompt);

                // Parse the content
                if (fetchedContent.themes) content.themes.push(...fetchedContent.themes);
                if (fetchedContent.mechanics) content.mechanics.push(...fetchedContent.mechanics);
                if (fetchedContent.settings) content.settings.push(...fetchedContent.settings);
                if (fetchedContent.characters) content.characters.push(...fetchedContent.characters);

            } catch (error) {
                console.warn(`⚠️ Content fetch failed: ${error.message}`);
            }
        }

        return content;
    }

    /**
     * Simulates WebFetch tool behavior
     */
    async simulateWebFetch(url, prompt) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Return simulated analyzed content based on URL pattern
        if (url.includes('dndbeyond')) {
            return {
                themes: ['Epic quests', 'Character development', 'Moral dilemmas'],
                mechanics: ['Dice-based outcomes', 'Character progression', 'Party dynamics'],
                settings: ['Taverns', 'Ancient dungeons', 'Mystical forests'],
                characters: ['Wise wizard', 'Brave paladin', 'Cunning rogue']
            };
        } else if (url.includes('worldanvil')) {
            return {
                themes: ['World building', 'Political intrigue', 'Cultural diversity'],
                mechanics: ['Faction systems', 'Resource management', 'Territory control'],
                settings: ['Capital cities', 'Trade routes', 'Sacred temples'],
                characters: ['Noble lord', 'Merchant guild leader', 'Religious zealot']
            };
        } else {
            return this.generateDynamicContent(url);
        }
    }

    /**
     * Generates dynamic content based on search query (simulation)
     */
    generateDynamicContent(query) {
        const queryLower = query.toLowerCase();

        if (queryLower.includes('fantasy')) {
            return {
                themes: ['Ancient magical academies', 'Elemental spirits', 'Lost kingdoms'],
                mechanics: ['Spell crafting system', 'Reputation with magical factions', 'Artifact discovery'],
                settings: ['Floating crystal cities', 'Underground dwarven forges', 'Enchanted libraries'],
                characters: ['Wise oracle', 'Rebellious apprentice', 'Cursed noble']
            };
        }

        if (queryLower.includes('sci-fi') || queryLower.includes('science fiction')) {
            return {
                themes: ['AI consciousness', 'Quantum realities', 'Interstellar politics'],
                mechanics: ['Ship customization', 'Tech tree progression', 'Faction diplomacy'],
                settings: ['Space stations', 'Alien worlds', 'Corporate megacities'],
                characters: ['Rogue AI', 'Alien ambassador', 'Corporate spy']
            };
        }

        if (queryLower.includes('horror')) {
            return {
                themes: ['Psychological terror', 'Cosmic horror', 'Body horror'],
                mechanics: ['Sanity system', 'Fear accumulation', 'Hidden information'],
                settings: ['Abandoned hospitals', 'Cursed forests', 'Underground tunnels'],
                characters: ['Mysterious doctor', 'Paranoid survivor', 'Occult researcher']
            };
        }

        // Default dynamic content
        return {
            themes: ['Mystery and discovery', 'Personal growth', 'Moral choices'],
            mechanics: ['Branching narratives', 'Skill progression', 'Relationship building'],
            settings: ['Small towns', 'Ancient ruins', 'Modern cities'],
            characters: ['Helpful mentor', 'Mysterious stranger', 'Old friend']
        };
    }

    /**
     * Generates enhanced story using web content
     */
    async generateEnhancedStory(prompt, webContent) {
        console.log("🔄 Integrating web content into story structure...");

        // Extract inspiration from web content
        const allThemes = webContent.inspiration.flatMap(content => content.themes || []);
        const allMechanics = webContent.mechanics.flatMap(content => content.mechanics || []);
        const allSettings = webContent.worldBuilding.flatMap(content => content.settings || []);
        const allCharacters = webContent.inspiration.flatMap(content => content.characters || []);

        // Select unique elements to avoid repetition
        const selectedTheme = this.selectUnique(allThemes) || 'Adventure and discovery';
        const selectedMechanic = this.selectUnique(allMechanics) || 'Choice consequences';
        const selectedSetting = this.selectUnique(allSettings) || 'Mysterious location';
        const selectedCharacter = this.selectUnique(allCharacters) || 'Helpful guide';

        // Generate story structure with web-inspired content
        const storyData = {
            startPage: "start",
            pages: this.generateDynamicPages(selectedTheme, selectedMechanic, selectedSetting, selectedCharacter, prompt)
        };

        return storyData;
    }

    /**
     * Selects a unique element that hasn't been used recently
     */
    selectUnique(elements) {
        if (!elements || elements.length === 0) return null;

        // Filter out recently used patterns
        const available = elements.filter(element => {
            const useCount = this.storyPatterns.get(element) || 0;
            return useCount < 3; // Allow each element to be used max 3 times
        });

        const selected = available.length > 0 ?
            available[Math.floor(Math.random() * available.length)] :
            elements[Math.floor(Math.random() * elements.length)];

        // Track usage
        const currentCount = this.storyPatterns.get(selected) || 0;
        this.storyPatterns.set(selected, currentCount + 1);

        return selected;
    }

    /**
     * Generates dynamic story pages based on web content
     */
    generateDynamicPages(theme, mechanic, setting, character, originalPrompt) {
        const pages = {};

        // Start page with web-enhanced content
        pages.start = {
            text: `In a ${setting.toLowerCase()}, you encounter ${character.toLowerCase()}. The air is thick with ${theme.toLowerCase()}. Your choices here will have lasting consequences through ${mechanic.toLowerCase()}.`,
            choices: [
                { text: `Approach the ${character.toLowerCase()} cautiously`, target: "cautious_approach" },
                { text: `Boldly introduce yourself`, target: "bold_approach" },
                { text: `Observe from a distance first`, target: "observation" }
            ]
        };

        // Dynamic branches based on mechanics
        pages.cautious_approach = {
            text: `Your careful approach pays off. The ${character.toLowerCase()} respects your wisdom and shares valuable information about the ${theme.toLowerCase()} that surrounds this place.`,
            choices: [
                { text: `Ask for guidance about the ${mechanic.toLowerCase()}`, target: "guidance_path" },
                { text: `Offer to help with their mission`, target: "alliance_path" }
            ]
        };

        pages.bold_approach = {
            text: `Your boldness surprises the ${character.toLowerCase()}. They are intrigued by your confidence and decide to test your resolve with a challenge related to ${theme.toLowerCase()}.`,
            choices: [
                { text: `Accept the challenge immediately`, target: "challenge_accepted" },
                { text: `Ask about the stakes first`, target: "cautious_challenge" }
            ]
        };

        pages.observation = {
            text: `By watching carefully, you notice subtle details about the ${setting.toLowerCase()} and the ${character.toLowerCase()}'s true nature. Knowledge is power, and you now understand the ${mechanic.toLowerCase()} at play.`,
            choices: [
                { text: `Use your knowledge strategically`, target: "strategic_path" },
                { text: `Reveal what you've learned`, target: "revelation_path" }
            ]
        };

        // Add resolution pages
        pages.guidance_path = {
            text: `With wisdom gained, you navigate the challenges ahead. The ${theme.toLowerCase()} becomes your ally rather than your obstacle.`,
            choices: []
        };

        pages.alliance_path = {
            text: `Together with the ${character.toLowerCase()}, you unlock the secrets of ${setting.toLowerCase()} and master the ${mechanic.toLowerCase()}.`,
            choices: []
        };

        pages.challenge_accepted = {
            text: `Your courage is rewarded. Through the trial, you discover the true power of ${theme.toLowerCase()} and gain unprecedented control over ${mechanic.toLowerCase()}.`,
            choices: []
        };

        pages.strategic_path = {
            text: `Your strategic thinking allows you to turn the ${mechanic.toLowerCase()} to your advantage, transforming the ${setting.toLowerCase()} in unexpected ways.`,
            choices: []
        };

        return pages;
    }

    /**
     * Fallback story generation if web enhancement fails
     */
    generateFallbackStory(prompt, storyId, storyTitle) {
        console.log("📝 Generating fallback story...");

        const basicStory = {
            startPage: "start",
            pages: {
                "start": {
                    text: `You begin your adventure in a world shaped by ${prompt}. The path ahead is full of possibilities.`,
                    choices: [
                        { text: "Explore the immediate area", target: "explore" },
                        { text: "Seek out others", target: "social" }
                    ]
                },
                "explore": {
                    text: "Your exploration reveals hidden secrets and new opportunities.",
                    choices: []
                },
                "social": {
                    text: "Meeting others opens new paths and alliances.",
                    choices: []
                }
            }
        };

        return this.parse(basicStory, storyId, storyTitle);
    }

    /**
     * Parses story data into Story object
     */
    parse(storyData, storyId, storyTitle) {
        if (!storyData.startPage || !storyData.pages) {
            throw new Error("Invalid story structure");
        }

        const story = this.system.createStory(storyId, storyTitle, storyData.startPage);

        for (const pageId in storyData.pages) {
            const pageData = storyData.pages[pageId];
            const newPage = new Page(pageId, pageData.text);

            if (pageData.background) {
                newPage.setBackground(pageData.background);
            }

            if (pageData.choices) {
                for (const choice of pageData.choices) {
                    newPage.addPrompt(choice.text, choice.target);
                }
            }

            story.addPage(newPage);
        }

        return story;
    }

    /**
     * Clears old cache entries to prevent memory buildup
     */
    clearOldCache() {
        if (this.contentCache.size > 50) {
            // Keep only the 25 most recent entries
            const entries = Array.from(this.contentCache.entries());
            this.contentCache.clear();
            entries.slice(-25).forEach(([key, value]) => {
                this.contentCache.set(key, value);
            });
        }
    }
}

module.exports = WebEnhancedStoryGenerator;