import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Story, Page, LLMStoryGenerator } from './StorySystem.js'; // Import classes
import HybridStoryGenerator from './external/HybridStoryGenerator.js';
import Colors from './external/colors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Combat system for timing-based battles
class CombatSystem {
    constructor(playerStats, weapon, enemy) {
        this.player = { ...playerStats };
        this.weapon = weapon;
        this.enemy = { ...enemy };
        this.timingBarPosition = 0;
        this.barSpeed = 0.1;
    }

    // Simulates the timing bar mechanism
    calculateDamage(timingAccuracy) {
        // timingAccuracy should be between 0-1, where 0.5 is perfect timing
        const perfectZone = 0.1; // 10% perfect zone
        const goodZone = 0.3; // 30% good zone

        let damageMultiplier;
        if (Math.abs(timingAccuracy - 0.5) < perfectZone) {
            damageMultiplier = 1.5; // Critical hit
        } else if (Math.abs(timingAccuracy - 0.5) < goodZone) {
            damageMultiplier = 1.0; // Normal hit
        } else {
            damageMultiplier = 0.3; // Poor hit
        }

        const baseDamage = this.weapon.damage + this.player.attack;
        const finalDamage = Math.max(1, Math.round(baseDamage * damageMultiplier * this.weapon.accuracy) - this.enemy.defense);
        return { damage: finalDamage, multiplier: damageMultiplier };
    }

    // Simulates enemy attack
    enemyAttack() {
        const damage = Math.max(1, this.enemy.attack - this.player.defense);
        return damage;
    }
}

// NOTE: In a real project, you would install a library like 'axios' or use Node's built-in fetch.
// For this simulation, we'll keep it dependency-free.
// const axios = require('axios'); 

class ClaudeStoryGenerator {
    constructor(storySystem) {
        this.system = storySystem;
        this.apiKey = this._readApiKey();
        this.apiEndpoint = 'https://api.anthropic.com/v1/messages'; // Example endpoint
    }

    /**
     * Reads the Claude API key from the specified file path.
     * @returns {string|null} The API key or null if not found.
     */
    _readApiKey() {
        try {
            const keyPath = path.join(process.env.HOME || process.env.USERPROFILE, '.CLAUDE_KEY');
            if (fs.existsSync(keyPath)) {
                console.log("Found Claude API key file.");
                return fs.readFileSync(keyPath, 'utf8').trim();
            } else {
                console.warn("Warning: ~/.CLAUDE_KEY file not found. Generator will run in simulation mode.");
                return null;
            }
        } catch (error) {
            console.error("Error reading API key:", error.message);
            return null;
        }
    }


    /**
     * Generates themes with more variety and interesting mechanics.
     */
    _generateInterestingThemes() {
        return [
            "A time-loop mystery where actions in past visits affect future outcomes",
            "A shape-shifting curse that changes your abilities based on moral choices",
            "A city where different districts exist in different time periods",
            "A world where your memories become currency and forgetting changes reality",
            "An underground society where social status is determined by riddle-solving",
            "A floating island chain where weather patterns are controlled by ancient music",
            "A desert where mirages show possible futures that can be made real",
            "A forest where trees grow backwards in time, revealing past secrets",
            "A mountain where each level exists in a different season simultaneously",
            "A library where books rewrite themselves based on the reader's actions",
            "A space station where artificial gravity creates impossible architecture",
            "A medieval kingdom where dreams and reality intersect unpredictably"
        ];
    }

    /**
     * Enhanced story generation with dynamic world state and complex loops.
     */
    async _generateAdvancedStoryData(theme, outline) {
        const baseStoryPrompt = `Create a base RPG story structure for the theme "${theme}" with the following outline:

Title: ${outline.title}
Chapters: ${outline.chapters.map((ch, i) => `${i+1}. ${ch.title}: ${ch.description}`).join('\n')}

CRITICAL REQUIREMENTS - ALL STORIES MUST INCLUDE:
1. THE 7-ARC STRUCTURE: Each page must be tagged with one of these story arcs:
   - "setup": Ordinary world and call to adventure
   - "confrontation": Rising action and first conflicts
   - "midpoint": Major revelation or turning point
   - "crisis": Dark night of the soul
   - "climax": Final confrontation
   - "resolution": Falling action and consequences
   - "denouement": New equilibrium and endings

2. ALL NINE THEMES MUST BE PRESENT IN EVERY STORY:
   - LOVE: Romantic relationships, passion, emotional connections, intimate moments
   - VIOLENCE: Combat, conflict, brutality, physical confrontations, bloodshed
   - DEATH: Character deaths, mortality, loss, grief, fatal consequences
   - SEX: Sexual tension, intimate encounters, desire, physical attraction, adult relationships
   - SADNESS: Grief, loss, heartbreak, tragedy, emotional pain, despair
   - SURPRISE: Unexpected plot twists, shocking revelations, unforeseen events, sudden changes
   - HAPPINESS: Joy, celebration, triumph, positive outcomes, fulfillment, contentment
   - DISGUST: Revulsion, repulsion, moral outrage, physical revulsion, abhorrent situations
   - DISDAIN: Contempt, scorn, arrogance, superiority, dismissive attitudes, condescension

Generate a JSON object with:
- startPage: "start"
- gameState: Basic RPG stats and inventory
- pages: A set of interconnected story pages with choices, combat, and exploration

Include these RPG elements:
- Player stats (health, attack, defense, gold)
- Inventory system with weapons and items
- Combat encounters with enemies featuring brutal violence and potential death
- Treasure and rewards
- Branching storylines based on choices involving all nine themes
- Multiple endings (some tragic, some romantic, some violent)
- Romance and relationship mechanics with sexual content
- Romantic encounters and character development including intimate scenes
- Love interests and emotional connections that can lead to heartbreak or death
- Relationship choices that affect the story dramatically

STORY STRUCTURE: Each page should include:
- "arc": which of the 7 arcs this page belongs to
- "themes": array of which themes (love, violence, death, sex, sadness, surprise, happiness, disgust, disdain) are present in this page
- Meaningful integration of themes into the narrative, not just token mentions

Return ONLY valid JSON with this structure:
{
  "startPage": "start",
  "gameState": {
    "playerStats": {"health": 100, "maxHealth": 100, "attack": 10, "defense": 5, "gold": 0},
    "inventory": ["Basic Sword"],
    "weapons": {"Basic Sword": {"damage": 8, "accuracy": 0.8}},
    "worldState": {"timeLoop": 0, "decisions": [], "exploredAreas": []}
  },
  "pages": {
    "start": {
      "background": "appropriate_scene",
      "text": "Starting scene description",
      "arc": "setup",
      "themes": ["love", "violence", "death", "sex", "sadness", "surprise", "happiness", "disgust", "disdain"],
      "choices": [
        {"text": "Choice 1", "target": "page1"},
        {"text": "Choice 2", "target": "page2"}
      ]
    }
  }
}`;

        const systemPrompt = `You are an expert RPG game designer. Create engaging interactive story content with meaningful choices, combat mechanics, and exploration elements. Always return properly formatted JSON.`;

        try {
            const result = await this._callClaudeApi(baseStoryPrompt, systemPrompt);

            if (result && result.startPage && result.pages) {
                return result;
            } else {
                console.warn("LLM returned invalid story format, using fallback");
                return this._generateFallbackStoryData();
            }
        } catch (error) {
            console.warn("Error generating story with LLM, using fallback:", error.message);
            return this._generateFallbackStoryData();
        }
    }

    /**
     * Fallback story data when LLM generation fails.
     */
    _generateFallbackStoryData() {
        return {
            startPage: "start",
            gameState: {
                playerStats: { health: 100, maxHealth: 100, attack: 10, defense: 5, gold: 0 },
                inventory: ["Basic Sword"],
                weapons: { "Basic Sword": { damage: 8, accuracy: 0.8 } },
                worldState: { timeLoop: 0, decisions: [], exploredAreas: [] }
            },
            pages: {
                "start": {
                    background: "adventure_start",
                    text: "Your adventure begins in a bustling tavern where mysterious strangers catch your eye. The air is thick with possibility and romance.",
                    arc: "setup",
                    themes: ["love", "surprise", "happiness"],
                    choices: [
                        { "text": "Approach the mysterious stranger by the fireplace", "target": "romantic_encounter" },
                        { "text": "Explore the area alone", "target": "explore" },
                        { "text": "Rest and prepare for the journey ahead", "target": "prepare" }
                    ]
                },
                "romantic_encounter": {
                    background: "tavern_fireplace",
                    text: "A captivating figure turns to you with eyes that seem to hold ancient secrets. 'I've been waiting for someone like you,' they say with a smile that makes your heart race.",
                    choices: [
                        { "text": "Offer to buy them a drink and learn more", "target": "romantic_conversation" },
                        { "text": "Ask if they'd like to join your adventure", "target": "romantic_partnership" },
                        { "text": "Politely excuse yourself and explore elsewhere", "target": "explore" }
                    ]
                },
                "romantic_conversation": {
                    background: "tavern_intimate_table",
                    text: "Over wine and candlelight, you share stories of your past adventures. The connection between you grows stronger with each passing moment.",
                    choices: [
                        { "text": "Suggest continuing the evening somewhere more private", "target": "romantic_deepening" },
                        { "text": "Propose adventuring together tomorrow", "target": "romantic_partnership" }
                    ]
                },
                "romantic_partnership": {
                    background: "tavern_handshake",
                    text: "Your new companion's hand feels warm in yours as you agree to face the dangers ahead together. With love as your motivation, you feel unstoppable.",
                    choices: [
                        { "text": "Begin the adventure as lovers", "target": "explore_together" },
                        { "text": "Take time to get to know each other better", "target": "romantic_deepening" }
                    ]
                },
                "romantic_deepening": {
                    background: "intimate_chamber",
                    text: "In the quiet intimacy of shared space, you discover that this connection runs deeper than mere attraction. Your hearts beat in harmony.",
                    choices: [
                        { "text": "Confess your growing feelings", "target": "love_confession" },
                        { "text": "Focus on the adventure ahead", "target": "explore_together" }
                    ]
                },
                "love_confession": {
                    background: "moonlit_balcony",
                    text: "Under the starlit sky, you both admit that this meeting feels like destiny. Your love story has only just begun, but it already feels eternal.",
                    choices: [
                        { "text": "Begin your romantic adventure together", "target": "explore_together" }
                    ]
                },
                "explore_together": {
                    background: "exploration_couple",
                    text: "Hand in hand, you venture forth together. Every challenge seems conquerable when faced with your beloved by your side.",
                    choices: [
                        { "text": "Continue your romantic adventure", "target": "start" },
                        { "text": "Find a quiet place to rest together", "target": "romantic_rest" }
                    ]
                },
                "romantic_rest": {
                    background: "cozy_campfire",
                    text: "By the warmth of the campfire, you hold each other close. The adventure can wait - this moment of love is all that matters.",
                    choices: [
                        { "text": "Continue the journey with renewed passion", "target": "start" }
                    ]
                },
                "explore": {
                    background: "exploration",
                    text: "You venture forth alone and discover new challenges. Yet part of you wonders what might have been if you'd chosen companionship.",
                    choices: [
                        { "text": "Continue exploring solo", "target": "start" },
                        { "text": "Return to seek that mysterious stranger", "target": "romantic_encounter" }
                    ]
                },
                "prepare": {
                    background: "preparation",
                    text: "You take time to prepare for the journey ahead, but your thoughts keep drifting to potential companions and the adventures you might share together.",
                    choices: [
                        { "text": "Begin the adventure", "target": "start" },
                        { "text": "Look for a companion first", "target": "romantic_encounter" }
                    ]
                }
            }
        };
    }

    /**
     * A private method to simulate or make a real call to the Claude API.
     */
    async _callClaudeApi(prompt, systemPrompt) {
        if (!this.apiKey) {
            console.log(Colors.aiLabel("🤖 SIMULATING AI API CALL..."));
            const simulator = new LLMStoryGenerator(this.system);
            return simulator.simulateLLMCall(prompt);
        }

        console.log(Colors.aiLabel("🤖 MAKING (simulated) REAL AI API CALL..."));
        /*
        const headers = {
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json'
        };
        const body = JSON.stringify({
            model: "claude-3-opus-20240229",
            max_tokens: 4096,
            system: systemPrompt,
            messages: [{ role: "user", content: prompt }]
        });

        const response = await fetch(this.apiEndpoint, { method: 'POST', headers, body });
        const data = await response.json();
        return JSON.parse(data.content[0].text);
        */

        // Since no API key is available, use the simulator
        const simulator = new LLMStoryGenerator(this.system);
        return simulator.simulateLLMCall(prompt);
    }

    /**
     * Generates a theme-appropriate story outline using LLM prompting.
     * @param {string} theme - The theme to base the story on.
     * @returns {Promise<Object>} An outline object with title and chapters.
     */
    async _generateOutlineForTheme(theme) {
        const outlinePrompt = `You are a master storyteller creating an interactive RPG adventure. Generate a compelling story outline for the theme: "${theme}"

REQUIREMENTS:
- Create a captivating story title that captures the essence of the theme
- Design exactly 5 chapters that form a complete narrative arc
- Each chapter should have meaningful player choices that affect the story
- Include multiple possible endings (good, bad, neutral)
- Make the story engaging for interactive gameplay

FORMAT: Return ONLY a valid JSON object with this exact structure:
{
  "title": "Your Creative Title Here",
  "chapters": [
    {
      "title": "Chapter 1 Title",
      "description": "Detailed description of what happens in this chapter, including the main choices players face and their consequences."
    },
    {
      "title": "Chapter 2 Title",
      "description": "Description of chapter 2..."
    },
    {
      "title": "Chapter 3 Title",
      "description": "Description of chapter 3..."
    },
    {
      "title": "Chapter 4 Title",
      "description": "Description of chapter 4..."
    },
    {
      "title": "Chapter 5 Title",
      "description": "Description of the final chapter with multiple possible endings..."
    }
  ]
}

GUIDELINES:
- Title should be 2-4 words, evocative and memorable
- Chapter descriptions should be 1-3 sentences describing key events and choices
- Focus on player agency and meaningful decisions
- Include elements like combat, exploration, social interaction, and moral dilemmas
- Each chapter should build upon the previous one
- The final chapter should offer distinctly different endings based on player choices

Theme: ${theme}`;

        const systemPrompt = `You are a creative RPG story designer with expertise in interactive fiction. You specialize in creating engaging branching narratives that give players meaningful choices. Always respond with properly formatted JSON that follows the exact structure requested.`;

        try {
            const result = await this._callClaudeApi(outlinePrompt, systemPrompt);

            // Validate the result has the required structure
            if (result && result.title && result.chapters && Array.isArray(result.chapters) && result.chapters.length === 5) {
                return result;
            } else {
                console.warn("LLM returned invalid outline format, using fallback");
                return this._generateFallbackOutline(theme);
            }
        } catch (error) {
            console.warn("Error generating outline with LLM, using fallback:", error.message);
            return this._generateFallbackOutline(theme);
        }
    }

    /**
     * Generates a simple fallback outline when LLM generation fails.
     * @param {string} theme - The theme to base the story on.
     * @returns {Object} A basic outline object.
     */
    _generateFallbackOutline(theme) {
        const words = theme.toLowerCase().split(' ');
        const titleWords = words.slice(0, 3).map(word => word.charAt(0).toUpperCase() + word.slice(1));
        const title = titleWords.join(' ') + " Quest";

        return {
            title: title,
            chapters: [
                { title: "The Beginning", description: `The adventure starts in a world of ${theme}. The protagonist must make their first crucial choice about how to approach their quest.` },
                { title: "The Challenge", description: `Facing the main obstacles and conflicts inherent in ${theme}. Player choices determine their strategy and allies.` },
                { title: "The Discovery", description: `Uncovering secrets and gaining new understanding about the world and the quest. Moral dilemmas test the protagonist's values.` },
                { title: "The Trial", description: `The ultimate test that will determine the outcome of the adventure. Multiple paths lead to different final scenarios.` },
                { title: "The Resolution", description: `The final choices that shape the ending: triumph and glory, tragic sacrifice, or bittersweet compromise.` }
            ]
        };
    }

    /**
     * Generates a long-form story by first creating an outline, then generating content for each part.
     * @param {string} theme - A high-level theme for the story (e.g., "A haunted house mystery").
     * @param {number} minPages - Minimum number of pages the story should have.
     * @param {Object} options - Generation options including content rating
     * @returns {Story|null} The fully generated Story object.
     */
    async generateLongStory(theme, minPages = 20, options = {}) {
        console.log(Colors.lightPurple(`🤖 Generating AI story for theme: "${theme}"`));

        // --- Phase 1: Generate the High-Level Outline ---
        const outlinePrompt = `Create a detailed story outline for a branching narrative with 5 major chapters. The theme is: ${theme}. The story should have a clear beginning, a complex middle with choices, and multiple endings (at least one good, one bad). Provide the outline as a JSON object with a "title" and a list of "chapters", where each chapter has a "title" and a "description" of the key events and choices within it.`;

        // Generate dynamic outline based on theme
        const simulatedOutline = await this._generateOutlineForTheme(theme);
        console.log(Colors.aiText("🤖 AI Generated outline:"), Colors.lightPurple(simulatedOutline.title));

        // --- Phase 2: Generate Base Story Structure ---
        console.log(Colors.aiText("🤖 AI Generating base story structure..."));
        let fullStoryData = await this._generateAdvancedStoryData(theme, simulatedOutline);

        // --- Phase 3: Generate Additional Chapter Pages (Optimized) ---
        const chapterPromises = [];
        for (let i = 0; i < simulatedOutline.chapters.length; i++) {
            const chapter = simulatedOutline.chapters[i];
            console.log(Colors.lightPurple(`🤖 AI Generating pages for Chapter ${i+1}: ${chapter.title}...`));

            // Enhanced prompt with content rating awareness
            const contentRating = options.contentRating || 'PG-13';
            const matureContent = contentRating !== 'PG-13' ? `
- Include content appropriate for ${contentRating} rating
- Add mature themes and situations where suitable
- Create adult character interactions and consequences` : '';

            const pageGenPrompt = `Generate additional story pages for Chapter ${i+1}: "${chapter.title}"

Chapter Description: ${chapter.description}
Overall Theme: ${theme}
Story Title: ${simulatedOutline.title}
Content Rating: ${contentRating}

MANDATORY REQUIREMENTS FOR ALL PAGES:
- Each page MUST include "arc" field (setup/confrontation/midpoint/crisis/climax/resolution/denouement)
- Each page MUST include "themes" array with applicable themes from: love, violence, death, sex, sadness, surprise, happiness, disgust, disdain
- ALL NINE THEMES must appear across the chapter pages

Create interconnected pages that expand on this chapter. Include:
- Combat encounters appropriate to the theme (violence/death themes)
- Exploration and discovery elements (surprise theme)
- Character interactions and dialogue (love/happiness themes)
- Meaningful player choices that affect the story (all themes)
- Emotional moments including joy and sorrow (happiness/sadness themes)
- Romantic and intimate encounters (love/sex themes)
- Unexpected plot developments (surprise theme)
- Morally repugnant or physically revolting situations (disgust theme)
- Characters displaying arrogance, contempt, or superiority (disdain theme)
- Connections to other parts of the story${matureContent}

Return ONLY a JSON object with a "pages" property containing the new pages:
{
  "pages": {
    "page_id_1": {
      "background": "scene_description",
      "text": "What happens in this scene",
      "choices": [
        {"text": "Choice text", "target": "next_page_id"}
      ]
    }
  }
}`;

            // Generate chapters in parallel for better performance
            chapterPromises.push(
                this._callClaudeApi(pageGenPrompt, "You are a creative RPG story designer. Generate engaging interactive content with meaningful choices and consequences.")
                    .then(chapterPagesData => {
                        if (chapterPagesData && chapterPagesData.pages) {
                            return chapterPagesData.pages;
                        }
                        return {};
                    })
                    .catch(error => {
                        console.warn(`Failed to generate chapter ${i+1}:`, error.message);
                        return {};
                    })
            );
        }

        // Wait for all chapters to complete
        const chapterResults = await Promise.all(chapterPromises);
        chapterResults.forEach(pages => {
            Object.assign(fullStoryData.pages, pages);
        });

        console.log(Colors.aiText("🤖 AI Assembling all generated pages into a single story..."));
        const parser = new LLMStoryGenerator(this.system);
        const finalStory = parser.parse(fullStoryData, "generated_story", simulatedOutline.title);

        // Ensure minimum page count by generating additional pages if needed
        let currentPageCount = Object.keys(finalStory.pages).length;
        console.log(`Initial story has ${currentPageCount} pages. Minimum required: ${minPages}`);

        if (currentPageCount < minPages) {
            console.log(Colors.lightPurple(`🤖 AI Generating additional pages to meet minimum requirement...`));
            const additionalPagesNeeded = minPages - currentPageCount;

            const BATCH_SIZE = 50;
            const MAX_PAGES = 500;

            if (additionalPagesNeeded > MAX_PAGES) {
                console.warn(`⚠️  Requested ${minPages} pages exceeds maximum of ${MAX_PAGES + currentPageCount} pages.`);
                console.warn(`   Limiting generation to ${MAX_PAGES} additional pages for performance.`);
            }

            const pagesToGenerate = Math.min(additionalPagesNeeded, MAX_PAGES);

            for (let batchStart = 0; batchStart < pagesToGenerate; batchStart += BATCH_SIZE) {
                const batchEnd = Math.min(batchStart + BATCH_SIZE, pagesToGenerate);
                const batchSize = batchEnd - batchStart;

                console.log(Colors.lightPurple(`🤖 AI Generating batch: pages ${batchStart + 1}-${batchEnd} of ${pagesToGenerate}...`));

                const batchPrompt = `Generate ${batchSize} additional interconnected story pages for "${simulatedOutline.title}".

Theme: ${theme}
Story Context: ${simulatedOutline.chapters.map(ch => ch.title).join(', ')}

Create diverse content including:
- Combat encounters with enemies appropriate to the theme
- Exploration and discovery sequences
- Social interactions and dialogue
- Puzzle-solving challenges
- Treasure hunting and rewards
- Moral dilemmas and meaningful choices
- Multiple story paths and outcomes

Each page should connect to others through player choices. Include variety in:
- Combat difficulty and enemy types
- Exploration locations and secrets
- Character interactions and relationships
- Rewards and consequences for actions

Return ONLY valid JSON:
{
  "pages": {
    "unique_page_id_1": {
      "background": "scene_setting",
      "text": "Engaging scene description with clear choices",
      "choices": [
        {"text": "Action choice", "target": "another_page_id"}
      ]
    }
  }
}`;

                const batchData = await this._callClaudeApi(batchPrompt, "You are an expert RPG content creator. Generate diverse, interconnected story content that creates engaging player experiences.");

                if (batchData && batchData.pages) {
                    Object.assign(fullStoryData.pages, batchData.pages);
                    Object.assign(finalStory.pages, batchData.pages);
                }

                if (batchEnd < pagesToGenerate) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }

            currentPageCount = Object.keys(finalStory.pages).length;
            console.log(`Final story now has ${currentPageCount} pages.`);
        }

        // Save story to unique file in stories/ folder
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const sanitizedTitle = simulatedOutline.title.replace(/[^a-zA-Z0-9]/g, '_');
        const fileName = `${sanitizedTitle}_${timestamp}.json`;

        // Ensure stories directory exists
        const storiesDir = 'stories';
        if (!fs.existsSync(storiesDir)) {
            fs.mkdirSync(storiesDir, { recursive: true });
            console.log(`Created directory: ${storiesDir}`);
        }

        const filePath = path.join(storiesDir, fileName);

        try {
            fs.writeFileSync(filePath, finalStory.toJSON());
            console.log(`Story saved to: ${filePath}`);
        } catch (error) {
            console.error(`Error saving story: ${error.message}`);
        }

        return finalStory;
    }
}

export { ClaudeStoryGenerator, CombatSystem, HybridStoryGenerator };
