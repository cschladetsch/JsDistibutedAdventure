/**
 * StorySystem.js
 * * A self-contained system for creating and managing the data structure for a
 * text-based, branching narrative game like "The Dust Pilgrim".
 * * This system is designed to:
 * 1. Define a clear structure for Stories, Pages, and Prompts.
 * 2. Be easily serializable to and from JSON for storage and network transfer.
 * 3. Serve as the foundation for a potential story editor tool.
 */
const readline = require('readline'); // Import the readline module for console input

// Represents a single choice the player can make.
class Prompt {
    constructor(text, targetPageID, requirements = {}) {
        this.text = text;               // The text displayed on the choice button (e.g., "Open the door").
        this.target_id = targetPageID;  // The ID of the Page this choice leads to.
        this.requirements = requirements; // Optional: e.g., { "requiresItem": "axe", "flagNotSet": "scared_of_dark" }
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
     */
    addPrompt(text, targetPageID, requirements = {}) {
        const newPrompt = new Prompt(text, targetPageID, requirements);
        this.prompts.push(newPrompt);
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
     * Serializes the entire story into a clean JSON string.
     * @returns {string} A JSON string representing the story.
     */
    toJSON() {
        return JSON.stringify({
            id: this.id,
            title: this.title,
            start_page_id: this.start_page_id,
            pages: this.pages
        }, null, 2); // The '2' makes the JSON output nicely formatted.
    }

    /**
     * Creates a Story instance from a JSON string or object.
     * @param {string|object} jsonData The story data.
     * @returns {Story} A new Story instance.
     */
    static fromJSON(jsonData) {
        const data = (typeof jsonData === 'string') ? JSON.parse(jsonData) : jsonData;
        const story = new Story(data.id, data.title, data.start_page_id);
        story.pages = data.pages; // Directly assign the pages object.
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
        console.log("Requesting structured JSON from LLM...");
        const llmResponse = await this.simulateLLMCall(highLevelPrompt);
        console.log("LLM JSON response received. Parsing story...");
        
        try {
            const story = this.parse(llmResponse, storyId, storyTitle);
            console.log("Story parsed successfully!");
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
                // This object mimics the structured JSON output we would demand from an LLM.
                const structuredStoryJSON = {
                    startPage: "start",
                    pages: {
                        "start": {
                            background: "cyber_city_rain",
                            text: "You're a private investigator in a rain-slicked metropolis in 2077. A mysterious client has offered you a fortune to retrieve a stolen data chip. You're at a crossroads.",
                            choices: [
                                { "text": "Head to the Neon Dragon nightclub to find your informant.", "target": "neon_dragon" },
                                { "text": "Break into the corporate archives where the chip was last seen.", "target": "archives_entry" },
                                { "text": "Wait in your office for more information.", "target": "office_fail" }
                            ]
                        },
                        "neon_dragon": {
                            background: "nightclub_interior_crowded",
                            text: "The Neon Dragon is a sensory overload of holographic ads and synth music. Your informant, a cyborg named Kai, is at the bar. He looks nervous.",
                            choices: [
                                { "text": "Subtly ask Kai about the chip.", "target": "kai_success" },
                                { "text": "Loudly demand information.", "target": "kai_fail" }
                            ]
                        },
                        "archives_entry": {
                            background: "corporate_lobby_sterile",
                            text: "The archives are housed in a sterile mega-corporation tower. The front desk is guarded by an imposing security cyborg.",
                            choices: [
                                { "text": "Bribe the guard.", "target": "archives_success" },
                                { "text": "Try to sneak past.", "target": "archives_fail" }
                            ]
                        },
                        "office_fail": {
                            background: "detective_office_dark",
                            text: "You wait for hours, but no one calls. The trail goes cold. Your career fizzles out in this lonely, rain-streaked office. A pathetic end.",
                            choices: []
                        },
                        "kai_success": {
                            background: "nightclub_bar_close_up",
                            text: "Kai discreetly slides a keycard across the bar. 'The chip is in a high-security vault. This will get you in,' he whispers. 'Now get out of here.' You have what you need.",
                            choices: []
                        },
                        "kai_fail": {
                            background: "nightclub_brawl",
                            text: "Your loud demands attract the attention of corporate enforcers. A brutal fight breaks out. You're no match for their augmented muscle.",
                            choices: []
                        },
                        "archives_success": {
                            background: "vault_door_futuristic",
                            text: "The guard's optical sensors whir as he scans the credits. He nods, disabling the security lasers for 60 seconds. You stride towards the vault, the mission a success.",
                            choices: []
                        },
                        "archives_fail": {
                            background: "security_lasers_red",
                            text: "You slip into the shadows, but silent alarms trip instantly. Red lasers grid the hallway. There is no escape.",
                            choices: []
                        }
                    }
                };
                resolve(structuredStoryJSON);
            }, 1500); // Simulate network latency
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
        console.log("--- Project: Dungeon Master ---");
        console.log("DM: 'Alright, let's create a new adventure module.'");
        const highLevelPrompt = "A short, sharp, entertaining detective story in a cyberpunk setting.";
        this.story = await this.generator.generate(
            highLevelPrompt,
            "CyberpunkDetective_Ep1",
            "The Neon Dragon Case"
        );

        if (!this.story) {
            console.log("DM: 'Looks like the creative energies failed us. Can't generate a story.'");
            this.rl.close();
            return false;
        }

        console.log(`DM: 'Excellent. The module "${this.story.title}" is ready.'`);
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
                 console.log(`DM (narrating): "${currentPage.text}"`);
            }
            console.log("\n--- END OF ADVENTURE ---");
            this.rl.close();
            return;
        }

        console.log(`\n--- Turn ${turn} ---`);
        console.log(`DM (narrating): "${currentPage.text}"`);
        console.log("DM: 'What do you do?'");
        
        currentPage.prompts.forEach((prompt, index) => {
            console.log(`[${index}] ${prompt.text}`);
        });

        this.rl.question('\nEnter the number of your choice: ', (answer) => {
            const choiceIndex = parseInt(answer, 10);

            if (isNaN(choiceIndex) || choiceIndex < 0 || choiceIndex >= currentPage.prompts.length) {
                console.log("\nDM: 'That's not a valid choice. Try again.'");
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
module.exports = { StorySystem, Story, Page, Prompt, LLMStoryGenerator, DungeonMaster };

// Only run main if this file is executed directly
if (require.main === module) {
    main();
}

