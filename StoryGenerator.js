const fs = require('fs');
const path = require('path');
const { Story, Page, LLMStoryGenerator } = require('./StorySystem.js'); // Import classes

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
     * Generates RPG-enhanced story data with combat, treasure, and loops.
     */
    _generateRPGStoryData() {
        return {
            startPage: "start",
            gameState: {
                playerStats: { health: 100, maxHealth: 100, attack: 10, defense: 5, gold: 0 },
                inventory: ["Basic Sword"],
                weapons: {
                    "Basic Sword": { damage: 8, accuracy: 0.8 },
                    "Iron Blade": { damage: 15, accuracy: 0.75 },
                    "Mystic Staff": { damage: 12, accuracy: 0.9 }
                }
            },
            pages: {
                "start": {
                    background: "forest_clearing",
                    text: "You stand at the edge of a dark forest, sword in hand. Ancient ruins beckon in the distance, promising treasure and danger.",
                    choices: [
                        { "text": "Enter the forest cautiously", "target": "forest_path" },
                        { "text": "Head directly to the ruins", "target": "ruins_entrance" },
                        { "text": "Search the clearing for supplies", "target": "treasure_find" }
                    ]
                },
                "forest_path": {
                    background: "dark_forest",
                    text: "The forest is thick and ominous. You hear rustling in the bushes ahead.",
                    choices: [
                        { "text": "Investigate the sound", "target": "goblin_encounter" },
                        { "text": "Sneak around quietly", "target": "hidden_chest" },
                        { "text": "Turn back to the clearing", "target": "start" }
                    ]
                },
                "goblin_encounter": {
                    background: "forest_combat",
                    text: "A snarling goblin jumps out! It has 25 HP and wields a rusty dagger.",
                    combat: {
                        enemy: { name: "Goblin", health: 25, maxHealth: 25, attack: 6, defense: 2 },
                        victory: "goblin_victory",
                        defeat: "player_defeat"
                    },
                    choices: [
                        { "text": "Attack with timing!", "target": "combat_timing", "action": "combat" }
                    ]
                },
                "combat_timing": {
                    background: "combat_bar",
                    text: "Press SPACE when the marker hits the green zone for maximum damage!",
                    timingBar: {
                        zones: ["miss", "hit", "critical", "hit", "miss"],
                        damageMultipliers: [0.1, 0.8, 1.5, 0.8, 0.1]
                    },
                    choices: [
                        { "text": "Continue combat", "target": "combat_result" }
                    ]
                },
                "goblin_victory": {
                    background: "victory",
                    text: "The goblin falls defeated! You find 15 gold coins and notice an Iron Blade glinting nearby.",
                    rewards: { gold: 15, items: ["Iron Blade"] },
                    choices: [
                        { "text": "Continue deeper into forest", "target": "deeper_forest" },
                        { "text": "Return to clearing", "target": "start" }
                    ]
                },
                "hidden_chest": {
                    background: "treasure_chest",
                    text: "You discover a hidden chest containing a Mystic Staff and 25 gold!",
                    rewards: { gold: 25, items: ["Mystic Staff"] },
                    choices: [
                        { "text": "Continue exploring", "target": "deeper_forest" },
                        { "text": "Head to the ruins", "target": "ruins_entrance" }
                    ]
                },
                "ruins_entrance": {
                    background: "ancient_ruins",
                    text: "The ancient ruins loom before you. Stone gargoyles guard the entrance, and you can hear echoing footsteps within.",
                    choices: [
                        { "text": "Enter boldly", "target": "skeleton_encounter" },
                        { "text": "Search around the perimeter", "target": "ruins_treasure" },
                        { "text": "Return to the forest", "target": "forest_path" }
                    ]
                },
                "skeleton_encounter": {
                    background: "ruins_combat",
                    text: "An ancient skeleton warrior emerges! It has 40 HP and carries a bone sword.",
                    combat: {
                        enemy: { name: "Skeleton Warrior", health: 40, maxHealth: 40, attack: 12, defense: 5 },
                        victory: "skeleton_victory",
                        defeat: "player_defeat"
                    },
                    choices: [
                        { "text": "Engage in combat!", "target": "combat_timing", "action": "combat" }
                    ]
                },
                "skeleton_victory": {
                    background: "victory",
                    text: "The skeleton crumbles to dust! You find 30 gold and a health potion.",
                    rewards: { gold: 30, healing: 25 },
                    choices: [
                        { "text": "Explore deeper into ruins", "target": "treasure_room" },
                        { "text": "Exit and explore elsewhere", "target": "start" }
                    ]
                },
                "treasure_room": {
                    background: "treasure_chamber",
                    text: "You've found the treasure chamber! Golden artifacts fill the room, but you sense a powerful guardian nearby.",
                    choices: [
                        { "text": "Grab treasure quickly", "target": "dragon_encounter" },
                        { "text": "Approach cautiously", "target": "stealth_treasure" }
                    ]
                },
                "dragon_encounter": {
                    background: "dragon_lair",
                    text: "A mighty dragon awakens! It has 80 HP and breathes fire.",
                    combat: {
                        enemy: { name: "Ancient Dragon", health: 80, maxHealth: 80, attack: 20, defense: 10 },
                        victory: "dragon_victory",
                        defeat: "player_defeat"
                    },
                    choices: [
                        { "text": "Face the dragon!", "target": "combat_timing", "action": "combat" }
                    ]
                },
                "dragon_victory": {
                    background: "ultimate_victory",
                    text: "Incredible! You have slain the dragon and claim the ultimate treasure: 500 gold and the legendary Dragon Slayer sword!",
                    rewards: { gold: 500, items: ["Dragon Slayer"] },
                    choices: []
                },
                "player_defeat": {
                    background: "defeat",
                    text: "You have been defeated! But fear not - you wake up back at the clearing with a chance to try again.",
                    choices: [
                        { "text": "Try again", "target": "start" }
                    ]
                }
            }
        };
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
    _generateAdvancedStoryData(theme) {
        const themes = this._generateInterestingThemes();
        const selectedTheme = theme || themes[Math.floor(Math.random() * themes.length)];

        // Generate base story but with enhanced mechanics
        const baseStory = this._generateRPGStoryData();

        // Add time-based elements and persistent world state tracking
        baseStory.gameState.worldState.timeLoop = 0;
        baseStory.gameState.worldState.decisions = [];
        baseStory.gameState.worldState.exploredAreas = [];
        baseStory.gameState.worldState.objectStates = {
            "start_table": "upright",
            "forest_bridge": "intact",
            "village_fountain": "clean",
            "ruins_door": "closed"
        };
        baseStory.gameState.worldState.relationships = {
            goblins: "neutral",
            villagers: "neutral",
            ancients: "unknown"
        };

        // Add pages with dynamic text based on world state
        Object.assign(baseStory.pages, {
            "dynamic_room": {
                background: "inn_room",
                dynamicText: {
                    base: "You enter a cozy inn room. A wooden table sits in the center.",
                    conditions: {
                        "objectStates.start_table == 'flipped'": "You enter a cozy inn room. The wooden table lies overturned from your previous visit, its contents scattered across the floor."
                    }
                },
                choices: [
                    { "text": "Flip the table", "target": "table_flipped", "condition": "objectStates.start_table == 'upright'" },
                    { "text": "Right the overturned table", "target": "table_righted", "condition": "objectStates.start_table == 'flipped'" },
                    { "text": "Leave the room", "target": "start", "condition": null }
                ]
            },
            "table_flipped": {
                background: "inn_room",
                text: "You angrily flip the table over! It crashes to the floor with a loud bang, sending dishes and papers flying everywhere. You feel slightly better but also a bit guilty.",
                worldStateChanges: { "objectStates.start_table": "flipped" },
                choices: [
                    { "text": "Leave the mess and go", "target": "start", "condition": null },
                    { "text": "Clean up the mess", "target": "table_righted", "condition": null }
                ]
            },
            "table_righted": {
                background: "inn_room",
                text: "You carefully right the table and organize the scattered items. The room looks neat and tidy again.",
                worldStateChanges: { "objectStates.start_table": "upright" },
                choices: [
                    { "text": "Leave the room", "target": "start", "condition": null }
                ]
            }
        });

        return baseStory;
    }

    /**
     * A private method to simulate or make a real call to the Claude API.
     */
    async _callClaudeApi(prompt, systemPrompt) {
        if (!this.apiKey) {
            // If no API key, we fall back to the simulated JSON from the original system.
            console.log("SIMULATING API CALL...");
            const simulator = new LLMStoryGenerator(this.system);
            return simulator.simulateLLMCall(prompt);
        }

        // In a real implementation, you would make the fetch request here.
        console.log("MAKING (simulated) REAL API CALL to Claude...");
        /*
        const headers = {
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json'
        };
        const body = JSON.stringify({
            model: "claude-3-opus-20240229", // Or another powerful model
            max_tokens: 4096,
            system: systemPrompt,
            messages: [{ role: "user", content: prompt }]
        });
        
        const response = await fetch(this.apiEndpoint, { method: 'POST', headers, body });
        const data = await response.json();
        return JSON.parse(data.content[0].text);
        */
       
        // For this demo, we'll return advanced RPG story data with enhanced mechanics
        return this._generateAdvancedStoryData();
    }

    /**
     * Generates a long-form story by first creating an outline, then generating content for each part.
     * @param {string} theme - A high-level theme for the story (e.g., "A haunted house mystery").
     * @param {number} minPages - Minimum number of pages the story should have.
     * @returns {Story|null} The fully generated Story object.
     */
    async generateLongStory(theme, minPages = 20) {
        console.log(`Generating long story for theme: "${theme}"`);

        // --- Phase 1: Generate the High-Level Outline ---
        const outlinePrompt = `Create a detailed story outline for a branching narrative with 5 major chapters. The theme is: ${theme}. The story should have a clear beginning, a complex middle with choices, and multiple endings (at least one good, one bad). Provide the outline as a JSON object with a "title" and a list of "chapters", where each chapter has a "title" and a "description" of the key events and choices within it.`;
        
        // In a real scenario, the outline would be dynamically generated. We'll simulate it here.
        const simulatedOutline = {
            title: "The Silent Watcher",
            chapters: [
                { title: "The Invitation", description: "The player inherits a secluded mansion from a distant relative. The first chapter involves arriving and the initial exploration, discovering the house is not as empty as it seems. Choices revolve around where to explore first." },
                { title: "Whispers in the Walls", description: "Player experiences strange events. They must find the source, leading them to a hidden study or a locked basement. Choices determine what clues they find about the house's past." },
                { title: "The Watcher's Journal", description: "Player finds a journal detailing the life of the previous owner, who was haunted by a 'silent watcher'. Choices involve deciphering clues in the journal to reveal the watcher's nature (ghost, creature, or psychological)." },
                { title: "The Confrontation", description: "Based on the clues, the player prepares to confront the entity. They must choose a method: a spiritual ritual, a scientific trap, or an attempt to communicate." },
                { title: "The Inheritance", description: "The final chapter. Success could mean cleansing the house and claiming the inheritance (Good Ending), while failure could mean becoming the next spirit trapped within (Bad Ending), or simply fleeing in terror (Neutral Ending)." }
            ]
        };
        console.log("Generated story outline:", simulatedOutline.title);

        // --- Phase 2 & 3: Generate Story from Outline & Assemble ---
        let fullStoryData = { startPage: "chapter1_start", pages: {} };
        let previousChapterSummary = "The story is just beginning.";

        for (let i = 0; i < simulatedOutline.chapters.length; i++) {
            const chapter = simulatedOutline.chapters[i];
            console.log(`Generating pages for Chapter ${i+1}: ${chapter.title}...`);

            const pageGenPrompt = `Generate the pages for a chapter titled "${chapter.title}".
            Overall Story Theme: ${theme}.
            Chapter Synopsis: ${chapter.description}.
            Events of Previous Chapter: ${previousChapterSummary}.
            
            The start page for this chapter must be named "chapter${i+1}_start".
            Ensure the choices at the end of this chapter lead to pages in the next chapter (e.g., "chapter${i+2}_start") or to an ending page.
            Return ONLY the JSON object for the "pages" of this chapter.`;

            // This call would generate a new set of pages for each chapter.
            const chapterPagesData = await this._callClaudeApi(pageGenPrompt, "You are a creative storyteller who generates content in a specific JSON format.");
            
            // For the demo, we'll just use the same JSON pages for each "chapter" to prove the loop works.
            Object.assign(fullStoryData.pages, chapterPagesData.pages);
            
            // Create links between chapters (a real LLM would be instructed to do this).
            // This is a simplified linking for the demo.
            if (i < simulatedOutline.chapters.length - 1) {
                const lastPageKey = Object.keys(chapterPagesData.pages).pop();
                if(fullStoryData.pages[lastPageKey].choices.length > 0) {
                   fullStoryData.pages[lastPageKey].choices[0].target = `chapter${i+2}_start`;
                }
            }
            
            previousChapterSummary = chapter.description; // Update for the next iteration.
        }

        console.log("Assembling all generated pages into a single story...");
        // We use the parser from the original generator as it's a perfect tool for this.
        const parser = new LLMStoryGenerator(this.system);
        const finalStory = parser.parse(fullStoryData, "long_form_story_1", simulatedOutline.title);

        // Ensure minimum page count by generating additional pages if needed
        let currentPageCount = Object.keys(finalStory.pages).length;
        console.log(`Initial story has ${currentPageCount} pages. Minimum required: ${minPages}`);

        if (currentPageCount < minPages) {
            console.log(`Generating additional pages to meet minimum requirement...`);
            const additionalPagesNeeded = minPages - currentPageCount;

            // Generate additional pages by creating more branching paths
            for (let i = 0; i < additionalPagesNeeded; i++) {
                const additionalPageData = await this._callClaudeApi(
                    `Generate a single additional page for the story "${simulatedOutline.title}" that extends one of the existing storylines. The page should have meaningful choices and connect to existing pages where appropriate.`,
                    "You are a creative storyteller who generates content in a specific JSON format."
                );

                // Add the new page to the story
                if (additionalPageData.pages) {
                    Object.assign(fullStoryData.pages, additionalPageData.pages);
                    Object.assign(finalStory.pages, additionalPageData.pages);
                }
            }

            currentPageCount = Object.keys(finalStory.pages).length;
            console.log(`Final story now has ${currentPageCount} pages.`);
        }

        // Save story to unique file in stories/ folder
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const sanitizedTitle = simulatedOutline.title.replace(/[^a-zA-Z0-9]/g, '_');
        const fileName = `${sanitizedTitle}_${timestamp}.json`;
        const filePath = path.join('stories', fileName);

        try {
            fs.writeFileSync(filePath, finalStory.toJSON());
            console.log(`Story saved to: ${filePath}`);
        } catch (error) {
            console.error(`Error saving story: ${error.message}`);
        }

        return finalStory;
    }
}

module.exports = { ClaudeStoryGenerator, CombatSystem };
