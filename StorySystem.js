/**
 * StorySystem.js
 * * A self-contained system for creating and managing the data structure for a
 * text-based, branching narrative game like "The Dust Pilgrim".
 * * This system is designed to:
 * 1. Define a clear structure for Stories, Pages, and Prompts.
 * 2. Be easily serializable to and from JSON for storage and network transfer.
 * 3. Serve as the foundation for a potential story editor tool.
 */
import readline from 'readline'; // Import the readline module for console input
import Colors from './external/colors.js'; // Import colors for AI display

// Represents a single choice the player can make.
class Prompt {
    constructor(text, targetPageID, requirements = {}) {
        this.text = text;               // The text displayed on the choice button (e.g., "Open the door").
        this.target_id = targetPageID;  // The ID of the Page this choice leads to.
        this.requirements = requirements; // Optional: e.g., { "requiresItem": "axe", "flagNotSet": "scared_of_dark" }
        this.loop_type = null;          // null, "good", or "bad" - for loop tracking
        this.triggers_loop = false;     // Whether this choice triggers a new loop
        this.quest_interaction = false; // Whether this choice involves quest NPCs
        this.quest_context = null;      // Quest-related context for this choice
        this.combat_encounter = false;  // Whether this choice leads to combat
    }
}

// Represents a single scene or screen in the game.
class Page {
    constructor(id, text) {
        if (!id) throw new Error("Page must have a unique ID.");
        this.id = id;               // Unique identifier for this page (e.g., "substation_gate").
        this.text = text;           // The main descriptive text for the scene.
        this.background_id = null;  // An identifier for the background image (e.g., "wasteland_sunset").
        this.prompts = [];          // An array of Prompt objects representing player choices.
        this.page_number = null;    // Page number in the story sequence
        this.loop_number = null;    // Which loop this page belongs to (1-5)
        this.is_loop_decision = false; // Whether this page contains a choice that can change outcomes

        // Quest system properties
        this.quest_triggers = null; // Quest events triggered when visiting this page
        this.quest_variants = null; // Different text/prompts based on quest status
        this.npcs = [];             // NPCs present on this page
        this.rewards = null;        // Items/gold/XP awarded when visiting this page
        this.combat = null;         // Combat encounter data
    }

    /**
     * Sets the background identifier for this page.
     * @param {string} backgroundID The unique ID of the background image.
     */
    setBackground(backgroundID) {
        this.background_id = backgroundID;
    }

    /**
     * Adds a new choice to this page.
     * @param {string} text The text for the choice button.
     * @param {string} targetPageID The ID of the page this choice leads to.
     * @param {object} requirements Optional requirements to see or select this prompt.
     * @param {string} loopType Optional: "good" or "bad" for outcome tracking
     * @param {boolean} triggersLoop Whether this choice triggers a new loop
     */
    addPrompt(text, targetPageID, requirements = {}, loopType = null, triggersLoop = false) {
        const newPrompt = new Prompt(text, targetPageID, requirements);
        newPrompt.loop_type = loopType;
        newPrompt.triggers_loop = triggersLoop;
        this.prompts.push(newPrompt);
    }

    /**
     * Sets page numbering and loop information
     * @param {number} pageNum The page number in sequence
     * @param {number} loopNum Which loop (1-5) this page belongs to
     * @param {boolean} isDecision Whether this page has outcome-changing choices
     */
    setLoopInfo(pageNum, loopNum, isDecision = false) {
        this.page_number = pageNum;
        this.loop_number = loopNum;
        this.is_loop_decision = isDecision;
    }
}

// Represents an entire Story, which is a collection of interconnected Pages.
class Story {
    constructor(id, title, startPageID) {
        if (!id || !title || !startPageID) {
            throw new Error("Story must have an ID, Title, and a starting Page ID.");
        }
        this.id = id;                 // Unique ID for the story (e.g., "TheDustPilgrimage").
        this.title = title;           // The display title of the story.
        this.start_page_id = startPageID; // The entry point of the story.
        this.pages = {};              // An object to store all pages, indexed by their ID for fast lookups.

        // Quest system properties
        this.quest_system_enabled = false; // Whether this story supports quests
        this.side_quests = {};        // Collection of all side quests
        this.quest_npcs = {};         // NPCs that give or are involved in quests
        this.quest_connections = {};  // Relationships between quests
        this.game_state = null;       // Player stats, inventory, flags, etc.
    }

    /**
     * Adds a Page object to the story's collection.
     * @param {Page} page The Page object to add.
     */
    addPage(page) {
        if (this.pages[page.id]) {
            console.warn(`Warning: Overwriting page with existing ID: ${page.id}`);
        }
        this.pages[page.id] = page;
    }

    /**
     * Retrieves a page by its ID.
     * @param {string} pageID The ID of the page to retrieve.
     * @returns {Page|null} The Page object or null if not found.
     */
    getPage(pageID) {
        return this.pages[pageID] || null;
    }

    /**
     * Gets all available quests for the current game state
     * @param {object} gameState Current player state and story flags
     * @returns {Array} Array of available quest objects
     */
    getAvailableQuests(gameState) {
        if (!this.quest_system_enabled) return [];

        const availableQuests = [];
        for (const questId in this.side_quests) {
            const quest = this.side_quests[questId];
            if (quest.status === 'available' && this.meetsQuestPrerequisites(quest, gameState)) {
                availableQuests.push(quest);
            }
        }
        return availableQuests;
    }

    /**
     * Checks if player meets quest prerequisites
     * @param {object} quest Quest object to check
     * @param {object} gameState Current player state
     * @returns {boolean} True if prerequisites are met
     */
    meetsQuestPrerequisites(quest, gameState) {
        const prereqs = quest.prerequisites || {};

        // Check required story flags
        if (prereqs.story_flags) {
            for (const flag of prereqs.story_flags) {
                if (!gameState.story_flags || !gameState.story_flags.includes(flag)) {
                    return false;
                }
            }
        }

        // Check required stats
        if (prereqs.stats_required) {
            for (const [stat, requiredValue] of Object.entries(prereqs.stats_required)) {
                if (!gameState.player_stats || gameState.player_stats[stat] < requiredValue) {
                    return false;
                }
            }
        }

        // Check required items
        if (prereqs.items_required) {
            for (const item of prereqs.items_required) {
                if (!gameState.inventory || !gameState.inventory.includes(item)) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Progresses a quest objective
     * @param {string} questId Quest to progress
     * @param {string} objectiveId Objective to progress
     * @param {number} amount Amount to progress
     * @param {object} gameState Current game state
     * @returns {object} Progress result with completion status
     */
    progressQuest(questId, objectiveId, amount = 1, gameState) {
        if (!this.side_quests[questId]) return { success: false, error: 'Quest not found' };

        const quest = this.side_quests[questId];
        const objective = quest.objectives.find(obj => obj.id === objectiveId);

        if (!objective) return { success: false, error: 'Objective not found' };
        if (objective.completed) return { success: false, error: 'Objective already completed' };

        objective.current_progress = Math.min(
            objective.current_progress + amount,
            objective.required_progress
        );

        if (objective.current_progress >= objective.required_progress) {
            objective.completed = true;
        }

        // Check if all objectives are complete
        const allComplete = quest.objectives.every(obj => obj.completed);
        if (allComplete && quest.status !== 'completed') {
            this.completeQuest(questId, gameState);
            return { success: true, questCompleted: true, objective };
        }

        return { success: true, questCompleted: false, objective };
    }

    /**
     * Completes a quest and awards rewards
     * @param {string} questId Quest to complete
     * @param {object} gameState Current game state to modify
     */
    completeQuest(questId, gameState) {
        const quest = this.side_quests[questId];
        if (!quest) return;

        quest.status = 'completed';

        // Award rewards
        if (quest.rewards) {
            if (quest.rewards.experience) {
                gameState.player_stats.experience += quest.rewards.experience;
            }
            if (quest.rewards.gold) {
                gameState.player_stats.gold += quest.rewards.gold;
            }
            if (quest.rewards.items) {
                gameState.inventory.push(...quest.rewards.items);
            }
            if (quest.rewards.stat_bonuses) {
                for (const [stat, bonus] of Object.entries(quest.rewards.stat_bonuses)) {
                    gameState.player_stats[stat] += bonus;
                }
            }
            if (quest.rewards.story_flags) {
                if (!gameState.story_flags) gameState.story_flags = [];
                gameState.story_flags.push(...quest.rewards.story_flags);
            }
            if (quest.rewards.unlock_quests) {
                for (const unlockQuestId of quest.rewards.unlock_quests) {
                    if (this.side_quests[unlockQuestId]) {
                        this.side_quests[unlockQuestId].status = 'available';
                    }
                }
            }
        }

        // Handle quest connections
        if (quest.connections && quest.connections.unlocks) {
            for (const unlockQuestId of quest.connections.unlocks) {
                if (this.side_quests[unlockQuestId]) {
                    this.side_quests[unlockQuestId].status = 'available';
                }
            }
        }
    }

    /**
     * Serializes the entire story into a clean JSON string.
     * @returns {string} A JSON string representing the story.
     */
    toJSON() {
        const storyData = {
            id: this.id,
            title: this.title,
            start_page_id: this.start_page_id,
            pages: this.pages
        };

        // Include quest system data if enabled
        if (this.quest_system_enabled) {
            storyData.quest_system_enabled = this.quest_system_enabled;
            storyData.side_quests = this.side_quests;
            storyData.quest_npcs = this.quest_npcs;
            storyData.quest_connections = this.quest_connections;
            storyData.game_state = this.game_state;
        }

        return JSON.stringify(storyData, null, 2);
    }

    /**
     * Creates a Story instance from a JSON string or object.
     * @param {string|object} jsonData The story data.
     * @returns {Story} A new Story instance.
     */
    static fromJSON(jsonData) {
        const data = (typeof jsonData === 'string') ? JSON.parse(jsonData) : jsonData;
        const story = new Story(data.id, data.title, data.start_page_id);
        story.pages = data.pages;

        // Load quest system data if present
        if (data.quest_system_enabled) {
            story.quest_system_enabled = data.quest_system_enabled;
            story.side_quests = data.side_quests || {};
            story.quest_npcs = data.quest_npcs || {};
            story.quest_connections = data.quest_connections || {};
            story.game_state = data.game_state || null;
        }

        return story;
    }
}

// Main system class for managing stories.
class StorySystem {
    constructor() {
        this.stories = {}; // A collection of all stories, indexed by their ID.
    }

    /**
     * Creates and adds a new story to the system.
     * @param {string} id The unique ID for the new story.
     * @param {string} title The display title.
     * @param {string} startPageID The ID of the entry page.
     * @returns {Story} The newly created Story object.
     */
    createStory(id, title, startPageID) {
        const story = new Story(id, title, startPageID);
        this.stories[id] = story;
        return story;
    }

    getStory(id) {
        return this.stories[id] || null;
    }
}

// =============================================================================
// --- LLMStoryGenerator ---
// =============================================================================

class LLMStoryGenerator {
    constructor(storySystem) {
        this.system = storySystem;
    }

    /**
     * Simulates a call to an LLM and parses the result into a story.
     * @param {string} highLevelPrompt A high-level concept for the story.
     * @param {string} storyId A unique ID for the new story.
     * @param {string} storyTitle The display title for the new story.
     * @returns {Story|null} The generated Story object.
     */
    async generate(highLevelPrompt, storyId, storyTitle) {
        console.log(Colors.aiLabel("🤖 Requesting structured JSON from AI..."));
        const llmResponse = await this.simulateLLMCall(highLevelPrompt);
        console.log(Colors.lightPurple("🤖 AI JSON response received. Parsing story..."));
        
        try {
            const story = this.parse(llmResponse, storyId, storyTitle);
            console.log(Colors.aiText("🤖 AI Story parsed successfully!"));
            return story;
        } catch (error)
        {
            console.error("Failed to parse LLM response:", error.message);
            return null;
        }
    }

    /**
     * Simulates an API call to a Large Language Model that returns structured JSON.
     */
    simulateLLMCall(prompt) {
        return new Promise(resolve => {
            setTimeout(() => {
                // Analyze prompt to generate appropriate content
                const promptLower = prompt.toLowerCase();

                // If it's an outline request, generate a story outline
                if (promptLower.includes('outline') || promptLower.includes('chapters')) {
                    const themes = {
                        'space': { title: 'Stellar Odyssey', setting: 'spaceship bridge' },
                        'cyberpunk': { title: 'Neural Static', setting: 'cyber city' },
                        'fantasy': { title: 'Dragon\'s Crown', setting: 'medieval castle' },
                        'pirate': { title: 'Crimson Tides', setting: 'pirate ship' },
                        'western': { title: 'Dead Man\'s Justice', setting: 'saloon' },
                        'horror': { title: 'Silent Watcher', setting: 'haunted mansion' },
                        'steampunk': { title: 'Gears of Destiny', setting: 'workshop' },
                        'underwater': { title: 'Abyssal Depths', setting: 'submarine' },
                        'post-apocalyptic': { title: 'Wasteland Echoes', setting: 'ruins' }
                    };

                    let selectedTheme = null;
                    for (const [key, value] of Object.entries(themes)) {
                        if (promptLower.includes(key)) {
                            selectedTheme = value;
                            break;
                        }
                    }

                    if (!selectedTheme) {
                        selectedTheme = { title: 'Adventure Quest', setting: 'unknown realm' };
                    }

                    resolve({
                        title: selectedTheme.title,
                        chapters: [
                            { title: "The Beginning", description: "The adventure starts with a crucial first choice." },
                            { title: "The Challenge", description: "Facing obstacles and making difficult decisions." },
                            { title: "The Discovery", description: "Uncovering secrets and gaining new abilities." },
                            { title: "The Trial", description: "The ultimate test of courage and wisdom." },
                            { title: "The Resolution", description: "Multiple endings based on player choices." }
                        ]
                    });
                }

                // If it's a story structure request, generate appropriate RPG content
                if (promptLower.includes('rpg') || promptLower.includes('base') || promptLower.includes('structure')) {
                    let theme = 'adventure';
                    let setting = 'adventure_start';
                    let scenario = 'You begin your adventure in an unknown land.';

                    if (promptLower.includes('space')) {
                        theme = 'space';
                        setting = 'spaceship_bridge';
                        scenario = 'You are aboard a starship when alien signals are detected from an uncharted system.';
                    } else if (promptLower.includes('cyberpunk')) {
                        theme = 'cyberpunk';
                        setting = 'cyber_city_rain';
                        scenario = 'You\'re a detective in a neon-lit metropolis investigating corporate espionage.';
                    } else if (promptLower.includes('fantasy')) {
                        theme = 'fantasy';
                        setting = 'fantasy_forest';
                        scenario = 'You stand at the edge of an enchanted forest, quest in hand.';
                    }

                    // Generate appropriate enemies based on theme
                    let enemies = [];
                    if (promptLower.includes('space')) {
                        enemies = [
                            { name: "Alien Scout", health: 30, maxHealth: 30, attack: 8, defense: 3 },
                            { name: "Space Pirate", health: 40, maxHealth: 40, attack: 12, defense: 4 }
                        ];
                    } else if (promptLower.includes('fantasy')) {
                        enemies = [
                            { name: "Goblin Warrior", health: 25, maxHealth: 25, attack: 7, defense: 2 },
                            { name: "Orc Brute", health: 50, maxHealth: 50, attack: 15, defense: 6 }
                        ];
                    } else if (promptLower.includes('pirate')) {
                        enemies = [
                            { name: "Rival Pirate", health: 35, maxHealth: 35, attack: 10, defense: 3 },
                            { name: "Sea Monster", health: 60, maxHealth: 60, attack: 18, defense: 8 }
                        ];
                    } else {
                        enemies = [
                            { name: "Bandit", health: 30, maxHealth: 30, attack: 9, defense: 3 },
                            { name: "Beast", health: 45, maxHealth: 45, attack: 14, defense: 5 }
                        ];
                    }

                    resolve({
                        startPage: "start",
                        gameState: {
                            playerStats: { health: 100, maxHealth: 100, attack: 10, defense: 5, gold: 0 },
                            inventory: ["Basic Sword"],
                            weapons: { "Basic Sword": { damage: 8, accuracy: 0.8 } },
                            worldState: { timeLoop: 0, decisions: [], exploredAreas: [] }
                        },
                        pages: {
                            "start": {
                                background: setting,
                                text: scenario,
                                choices: [
                                    { "text": "Investigate the situation", "target": "investigate" },
                                    { "text": "Prepare for action", "target": "prepare" },
                                    { "text": "Seek help from others", "target": "seek_help" }
                                ]
                            },
                            "investigate": {
                                background: "investigation_scene",
                                text: "You carefully examine your surroundings and discover important clues. Suddenly, you hear movement nearby!",
                                choices: [
                                    { "text": "Face the threat", "target": "combat_encounter_1" },
                                    { "text": "Try to avoid conflict", "target": "prepare" }
                                ]
                            },
                            "prepare": {
                                background: "preparation_area",
                                text: "You take time to ready yourself for the challenges ahead. Your preparations are interrupted by danger!",
                                choices: [
                                    { "text": "Fight!", "target": "combat_encounter_2" },
                                    { "text": "Flee to safety", "target": "seek_help" }
                                ]
                            },
                            "seek_help": {
                                background: "ally_meeting",
                                text: "You find helpful allies who provide valuable assistance. Together, you face new challenges.",
                                choices: [
                                    { "text": "Continue the adventure", "target": "start" }
                                ]
                            },
                            "combat_encounter_1": {
                                background: "battle_scene",
                                text: `A ${enemies[0].name} blocks your path! Prepare for battle!`,
                                combat: {
                                    enemy: enemies[0],
                                    victory: "victory_1",
                                    defeat: "defeat"
                                },
                                choices: [
                                    { "text": "Attack!", "target": "combat_timing", "action": "combat" }
                                ]
                            },
                            "combat_encounter_2": {
                                background: "battle_scene",
                                text: `A fierce ${enemies[1].name} appears! This will be a tough fight!`,
                                combat: {
                                    enemy: enemies[1],
                                    victory: "victory_2",
                                    defeat: "defeat"
                                },
                                choices: [
                                    { "text": "Engage in combat!", "target": "combat_timing", "action": "combat" }
                                ]
                            },
                            "victory_1": {
                                background: "victory_scene",
                                text: `You have defeated the ${enemies[0].name}! You feel stronger and find some treasure.`,
                                rewards: { gold: 20, healing: 15 },
                                choices: [
                                    { "text": "Continue exploring", "target": "start" }
                                ]
                            },
                            "victory_2": {
                                background: "victory_scene",
                                text: `Incredible! You have bested the mighty ${enemies[1].name}! You gain valuable rewards.`,
                                rewards: { gold: 50, healing: 25 },
                                choices: [
                                    { "text": "Celebrate your victory", "target": "start" }
                                ]
                            },
                            "defeat": {
                                background: "defeat_scene",
                                text: "You have been defeated, but you manage to escape with your life. You retreat to safety to recover.",
                                choices: [
                                    { "text": "Try again", "target": "start" }
                                ]
                            }
                        }
                    });
                }

                // Default fallback - generate requested number of pages
                let pageCount = 3; // Default
                if (promptLower.includes('generate') && promptLower.includes('pages')) {
                    const matches = prompt.match(/generate (\d+)/i);
                    if (matches) {
                        pageCount = Math.min(parseInt(matches[1]), 20); // Cap at 20 per batch
                    }
                }

                const pages = {};

                for (let i = 1; i <= pageCount; i++) {
                    const pageId = `adventure_page_${i}`;
                    const nextPageId = i < pageCount ? `adventure_page_${i + 1}` : `adventure_page_1`;

                    pages[pageId] = {
                        background: `adventure_scene_${i}`,
                        text: `Adventure continues at location ${i}. You face new challenges and discoveries here.`,
                        choices: [
                            { "text": "Continue exploring", "target": nextPageId },
                            { "text": "Search for treasure", "target": `treasure_${i}` },
                            { "text": "Rest and recover", "target": `rest_${i}` }
                        ]
                    };

                    // Add treasure and rest pages
                    pages[`treasure_${i}`] = {
                        background: "treasure_scene",
                        text: `You search for treasure and find valuable items!`,
                        rewards: { gold: 10 + i * 2 },
                        choices: [
                            { "text": "Continue adventure", "target": nextPageId }
                        ]
                    };

                    pages[`rest_${i}`] = {
                        background: "rest_area",
                        text: `You take time to rest and recover your strength.`,
                        rewards: { healing: 10 },
                        choices: [
                            { "text": "Continue refreshed", "target": nextPageId }
                        ]
                    };
                }

                resolve({ pages });
            }, 100); // Reduced latency for better experience
        });
    }

    /**
     * Parses the structured JSON from the LLM into a Story object.
     */
    parse(llmJSONObject, storyId, storyTitle) {
        if (!llmJSONObject.startPage || !llmJSONObject.pages) {
            throw new Error("Invalid JSON structure from LLM.");
        }

        const story = this.system.createStory(storyId, storyTitle, llmJSONObject.startPage);

        for (const pageId in llmJSONObject.pages) {
            const pageData = llmJSONObject.pages[pageId];
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
}


// =============================================================================
// --- EXAMPLE USAGE ---
// =============================================================================

/**
 * The DungeonMaster class simulates a separate project that USES the StorySystem.
 * It's responsible for generating a story and then running a player through it
 * in an interactive console session.
 */
class DungeonMaster {
    constructor() {
        this.storySystem = new StorySystem();
        this.generator = new LLMStoryGenerator(this.storySystem);
        this.story = null;
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    async setupAdventure() {
        console.log(Colors.purple("--- Project: Dungeon Master ---"));
        console.log(Colors.aiLabel("AI DM:"), Colors.lightPurple("'Alright, let's create a new adventure module.'"));
        const highLevelPrompt = "A short, sharp, entertaining detective story in a cyberpunk setting.";
        this.story = await this.generator.generate(
            highLevelPrompt,
            "CyberpunkDetective_Ep1",
            "The Neon Dragon Case"
        );

        if (!this.story) {
            console.log(Colors.aiLabel("AI DM:"), Colors.lightPurple("'Looks like the creative energies failed us. Can't generate a story.'"));
            this.rl.close();
            return false;
        }

        console.log(Colors.aiLabel("AI DM:"), Colors.lightPurple(`'Excellent. The module "${this.story.title}" is ready.'`));
        return true;
    }

    play() {
        if (!this.story) {
            console.error("No story has been generated to play.");
            this.rl.close();
            return;
        }

        console.log("\n--- Simulation: A Player starts the adventure ---");
        let currentPage = this.story.getPage(this.story.start_page_id);
        this.gameLoop(currentPage, 1);
    }
    
    gameLoop(currentPage, turn) {
        if (!currentPage || currentPage.prompts.length === 0) {
            if (currentPage) {
                 console.log(`\n--- Turn ${turn} ---`);
                 console.log(Colors.aiLabel("AI DM (narrating):"), Colors.aiText(`"${currentPage.text}"`));
            }
            console.log("\n--- END OF ADVENTURE ---");
            this.rl.close();
            return;
        }

        console.log(`\n--- Turn ${turn} ---`);
        console.log(`DM (narrating): "${currentPage.text}"`);
        console.log(Colors.aiLabel("AI DM:"), Colors.lightPurple("'What do you do?'"));
        
        currentPage.prompts.forEach((prompt, index) => {
            console.log(`[${index}] ${prompt.text}`);
        });

        this.rl.question('\nEnter the number of your choice: ', (answer) => {
            const choiceIndex = parseInt(answer, 10);

            if (isNaN(choiceIndex) || choiceIndex < 0 || choiceIndex >= currentPage.prompts.length) {
                console.log(Colors.aiLabel("\nAI DM:"), Colors.lightPurple("'That's not a valid choice. Try again.'"));
                this.gameLoop(currentPage, turn); // Ask again on the same turn
            } else {
                const playerChoice = currentPage.prompts[choiceIndex];
                console.log(`\nPlayer chooses: "${playerChoice.text}"`);
                const nextPage = this.story.getPage(playerChoice.target_id);
                this.gameLoop(nextPage, turn + 1); // Proceed to the next turn
            }
        });
    }
}

async function main() {
    const dm = new DungeonMaster();
    const ready = await dm.setupAdventure();
    if (ready) {
        dm.play();
    }
}

// Export all classes for use in other modules
export { StorySystem, Story, Page, Prompt, LLMStoryGenerator, DungeonMaster };

// Only run main if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

