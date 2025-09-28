/**
 * DynamicLLMStoryAdapter.js
 * Dynamically generates and adapts story content in real-time using LLM
 * Makes stories progressively more interesting based on player choices
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DynamicLLMStoryAdapter {
    constructor() {
        this.playerHistory = [];
        this.storyContext = [];
        this.visitedPages = new Set();
        this.playerStats = {};
        this.difficultyLevel = 1;
        this.narrativeTension = 0;
        this.apiKey = this.loadApiKey();
    }

    loadApiKey() {
        try {
            // Try loading from environment variable first
            if (process.env.GOOGLE_API_KEY) {
                return process.env.GOOGLE_API_KEY;
            }
            // Try loading from file
            const keyPath = path.join(__dirname, 'GOOGLE_API_KEY');
            if (fs.existsSync(keyPath)) {
                return fs.readFileSync(keyPath, 'utf8').trim();
            }
        } catch (error) {
            console.log("⚠️ No API key found - using enhanced simulation mode");
        }
        return null;
    }

    /**
     * Dynamically generates the next story page based on player's choice and history
     */
    async generateNextPage(currentPage, choice, gameState) {
        // Track player progress
        this.playerHistory.push({ page: currentPage.id, choice: choice });
        this.updateNarrativeTension(choice, gameState);

        // Check if we're looping
        if (this.detectLoop()) {
            return this.generateLoopBreakingContent(currentPage, gameState);
        }

        // Generate dynamic content based on context
        const prompt = this.buildContextualPrompt(currentPage, choice, gameState);

        if (this.apiKey) {
            return await this.callRealLLM(prompt, gameState);
        } else {
            return this.generateSimulatedDynamicContent(prompt, gameState);
        }
    }

    /**
     * Detects if player is stuck in a loop
     */
    detectLoop() {
        if (this.playerHistory.length < 4) return false;

        // Check for repeating patterns
        const recent = this.playerHistory.slice(-4);
        const pattern = recent.map(h => h.page).join('-');

        // Count how many times this pattern appears
        let patternCount = 0;
        for (let i = 0; i <= this.playerHistory.length - 4; i++) {
            const checkPattern = this.playerHistory.slice(i, i + 4).map(h => h.page).join('-');
            if (checkPattern === pattern) patternCount++;
        }

        return patternCount > 2;
    }

    /**
     * Generates content specifically designed to break loops
     */
    generateLoopBreakingContent(currentPage, gameState) {
        const breakingEvents = [
            {
                text: "Suddenly, the ground beneath you crumbles! You fall into a hidden chamber filled with ancient treasures and a mysterious portal.",
                choices: [
                    { text: "Examine the treasures", target: "treasure_room" },
                    { text: "Enter the portal", target: "portal_destination" },
                    { text: "Search for another exit", target: "secret_passage" }
                ]
            },
            {
                text: "A powerful explosion rocks the area! When the dust settles, you find yourself in a completely different location with new challenges ahead.",
                choices: [
                    { text: "Investigate the explosion site", target: "explosion_crater" },
                    { text: "Help injured survivors", target: "rescue_mission" },
                    { text: "Track down the cause", target: "mystery_investigation" }
                ]
            },
            {
                text: "Time itself seems to fracture! You witness multiple versions of yourself from different timelines. One of them beckons you to follow.",
                choices: [
                    { text: "Follow your alternate self", target: "timeline_branch" },
                    { text: "Attempt to fix the time fracture", target: "temporal_repair" },
                    { text: "Embrace the chaos", target: "multiverse_merge" }
                ]
            }
        ];

        const event = breakingEvents[Math.floor(Math.random() * breakingEvents.length)];

        return {
            id: `dynamic_${Date.now()}`,
            text: event.text,
            background_id: "dramatic_scene",
            prompts: event.choices.map(c => ({
                text: c.text,
                target_id: c.target,
                requirements: {},
                loop_type: null,
                triggers_loop: false
            })),
            isLoopBreaker: true
        };
    }

    /**
     * Updates narrative tension based on player actions
     */
    updateNarrativeTension(choice, gameState) {
        // Increase tension over time
        this.narrativeTension += 0.1;

        // Adjust based on player health
        if (gameState.health < 50) {
            this.narrativeTension += 0.2;
        }

        // Cap at maximum tension
        this.narrativeTension = Math.min(this.narrativeTension, 1.0);
    }

    /**
     * Builds a contextual prompt for the LLM
     */
    buildContextualPrompt(currentPage, choice, gameState) {
        const recentHistory = this.playerHistory.slice(-3).map(h => h.choice).join(', ');

        return `
        Generate the next story page for an RPG adventure.
        Current situation: ${currentPage.text}
        Player chose: ${choice}
        Recent actions: ${recentHistory}
        Player health: ${gameState.health}
        Narrative tension: ${Math.round(this.narrativeTension * 100)}%

        Requirements:
        1. Make the story progressively more interesting
        2. Include ${this.narrativeTension > 0.5 ? 'high stakes and danger' : 'exploration and discovery'}
        3. Provide 2-3 meaningful choices that lead to different outcomes
        4. Reference the player's previous actions when relevant
        5. ${this.narrativeTension > 0.7 ? 'Include a combat encounter or major challenge' : 'Focus on story development'}

        Format as JSON with: text, choices (array with text and target fields)
        `;
    }

    /**
     * Generates simulated dynamic content when no API key is available
     */
    generateSimulatedDynamicContent(prompt, gameState) {
        const tension = this.narrativeTension;
        const turnCount = this.playerHistory.length;

        // Progressive story templates that get more interesting over time
        const storyProgressions = [
            // Early game (turns 1-5)
            {
                minTurn: 0,
                maxTurn: 5,
                templates: [
                    {
                        text: "Your journey continues through winding paths. You discover traces of an ancient civilization with mysterious symbols glowing faintly in the darkness.",
                        choices: [
                            { text: "Decipher the symbols", target: "ancient_knowledge" },
                            { text: "Follow the glowing trail", target: "mystic_path" },
                            { text: "Search for more clues", target: "investigation" }
                        ]
                    },
                    {
                        text: "You encounter a wandering merchant with unusual wares. Their eyes gleam with hidden knowledge as they offer you a choice of items.",
                        choices: [
                            { text: "Trade for the mysterious map", target: "treasure_hunt" },
                            { text: "Buy the glowing amulet", target: "magic_power" },
                            { text: "Ask about local legends", target: "lore_discovery" }
                        ]
                    }
                ]
            },
            // Mid game (turns 6-10)
            {
                minTurn: 6,
                maxTurn: 10,
                templates: [
                    {
                        text: "The stakes are rising! You've uncovered a conspiracy that threatens the entire realm. A shadowy figure emerges from the darkness, offering you a dangerous alliance.",
                        choices: [
                            { text: "Accept the alliance cautiously", target: "dark_partnership" },
                            { text: "Refuse and fight alone", target: "solo_hero" },
                            { text: "Pretend to accept while planning betrayal", target: "double_agent" }
                        ]
                    },
                    {
                        text: "Your actions have attracted powerful enemies! A group of elite warriors surrounds you, but their leader offers you a chance to join their cause.",
                        choices: [
                            { text: "Fight your way out", target: "combat_escape" },
                            { text: "Hear their proposition", target: "faction_choice" },
                            { text: "Challenge the leader to single combat", target: "duel_honor" }
                        ]
                    }
                ]
            },
            // Late game (turns 11+)
            {
                minTurn: 11,
                maxTurn: 999,
                templates: [
                    {
                        text: "The final confrontation approaches! You stand before the source of all the chaos - an ancient artifact pulsing with unimaginable power. Your choices here will determine the fate of everything.",
                        choices: [
                            { text: "Destroy the artifact", target: "world_saved" },
                            { text: "Claim its power for yourself", target: "dark_ascension" },
                            { text: "Attempt to purify it", target: "redemption_path" }
                        ]
                    },
                    {
                        text: "Reality itself bends around you as the culmination of your journey manifests. Multiple timelines converge, showing you different versions of your destiny.",
                        choices: [
                            { text: "Choose the path of the hero", target: "legendary_ending" },
                            { text: "Forge your own destiny", target: "unique_ending" },
                            { text: "Sacrifice yourself for others", target: "noble_sacrifice" }
                        ]
                    }
                ]
            }
        ];

        // Add combat encounters based on tension
        if (tension > 0.6) {
            const combatTemplate = {
                text: `A fierce enemy appears! Your heart races as combat begins. Health: ${gameState.health}/100`,
                choices: [
                    { text: "Attack with all your strength", target: "combat_victory" },
                    { text: "Use tactical defensive moves", target: "combat_smart" },
                    { text: "Attempt to negotiate", target: "combat_diplomacy" }
                ]
            };

            // Find appropriate progression tier
            const tier = storyProgressions.find(p => turnCount >= p.minTurn && turnCount <= p.maxTurn);
            if (tier) {
                tier.templates.push(combatTemplate);
            }
        }

        // Select appropriate template based on game progression
        const appropriateTier = storyProgressions.find(p => turnCount >= p.minTurn && turnCount <= p.maxTurn);
        const templates = appropriateTier ? appropriateTier.templates : storyProgressions[0].templates;
        const selectedTemplate = templates[Math.floor(Math.random() * templates.length)];

        // Add dynamic elements based on player history
        if (this.playerHistory.length > 3) {
            const recentChoice = this.playerHistory[this.playerHistory.length - 1].choice;
            selectedTemplate.text = `Following your decision to "${recentChoice}", ` + selectedTemplate.text;
        }

        return {
            id: `dynamic_${Date.now()}`,
            text: selectedTemplate.text,
            background_id: tension > 0.5 ? "intense_scene" : "exploration_scene",
            prompts: selectedTemplate.choices.map(c => ({
                text: c.text,
                target_id: c.target,
                requirements: {},
                loop_type: null,
                triggers_loop: false
            })),
            dynamicGenerated: true,
            tension: this.narrativeTension,
            turnNumber: turnCount
        };
    }

    /**
     * Calls actual LLM API (when API key is available)
     */
    async callRealLLM(prompt, gameState) {
        // This would integrate with Google's Gemini API or another LLM
        // For now, returns enhanced simulated content
        console.log("🤖 Using enhanced LLM simulation mode");
        return this.generateSimulatedDynamicContent(prompt, gameState);
    }

    /**
     * Resets the adapter for a new story
     */
    reset() {
        this.playerHistory = [];
        this.storyContext = [];
        this.visitedPages.clear();
        this.difficultyLevel = 1;
        this.narrativeTension = 0;
    }
}

export default DynamicLLMStoryAdapter;