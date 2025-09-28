/**
 * DynamicRichStoryEngine.js
 * Creates rich, interesting stories that change every 12 minutes
 * Stories become progressively more complex and engaging
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DynamicRichStoryEngine {
    constructor() {
        this.startTime = Date.now();
        this.storyPhase = 1;
        this.playerChoiceHistory = [];
        this.narrativeTension = 0;
        this.worldEvents = [];
        this.characterRelationships = {};
        this.plotTwists = [];
        this.usedElements = new Set();

        // Rich story elements that cycle and evolve
        this.storyThemes = [
            'cyberpunk_corporate_espionage', 'mystical_time_travel', 'alien_invasion',
            'post_apocalyptic_survival', 'medieval_dark_fantasy', 'space_exploration',
            'supernatural_horror', 'steampunk_revolution', 'underwater_civilization',
            'dimensional_warfare', 'AI_rebellion', 'genetic_mutation'
        ];

        this.dynamicElements = this.initializeDynamicElements();
    }

    initializeDynamicElements() {
        return {
            characters: {
                allies: [
                    { name: "Alex Chen", trait: "brilliant hacker", secret: "secretly an AI consciousness" },
                    { name: "Dr. Maya Singh", trait: "quantum physicist", secret: "from a parallel timeline" },
                    { name: "Captain Rex", trait: "cybernetic soldier", secret: "hunting his own clone" },
                    { name: "Luna Blackwood", trait: "shapeshifter spy", secret: "last of her species" },
                    { name: "Prophet Zane", trait: "sees the future", secret: "memories are fabricated" }
                ],
                enemies: [
                    { name: "Director Voss", power: "controls corporate armies", weakness: "fears losing control" },
                    { name: "The Architect", power: "manipulates reality", weakness: "bound by ancient rules" },
                    { name: "General Krax", power: "commands alien fleets", weakness: "honor-bound warrior code" },
                    { name: "Dr. Entropy", power: "controls time itself", weakness: "aging rapidly" },
                    { name: "The Collective", power: "hive mind network", weakness: "vulnerable to chaos" }
                ]
            },
            locations: [
                "Neo-Singapore floating city", "Underground crystal caverns", "Orbital station Omega-7",
                "Temporal research facility", "Alien mothership bridge", "Abandoned AI datacenter",
                "Dimensional crossroads", "Bioengineering laboratory", "Quantum maze prison",
                "Ancient alien ruins", "Corporate megacity", "Interdimensional marketplace"
            ],
            artifacts: [
                "Neural Crown of Infinite Knowledge", "Quantum Sword that cuts through time",
                "Memory Crystal containing extinct civilization", "AI Core with god-like intelligence",
                "Dimensional Key opening any portal", "Genetic Serum granting evolution",
                "Time Anchor preventing paradoxes", "Reality Engine reshaping existence",
                "Consciousness Transfer Device", "Universal Translator of all languages"
            ],
            plotDevices: [
                "betrayal_by_trusted_ally", "discovery_of_hidden_identity", "race_against_time",
                "moral_dilemma_choice", "unexpected_alliance", "revelation_of_larger_conspiracy",
                "sacrifice_for_greater_good", "power_corruption", "redemption_arc", "time_paradox"
            ]
        };
    }

    /**
     * Generates a completely new story every 12 minutes
     */
    generateTimedStory() {
        const currentTime = Date.now();
        const elapsed = currentTime - this.startTime;
        const storyInterval = 12 * 60 * 1000; // 12 minutes in milliseconds

        this.storyPhase = Math.floor(elapsed / storyInterval) + 1;

        // Select theme based on time cycle
        const themeIndex = Math.floor(elapsed / storyInterval) % this.storyThemes.length;
        const currentTheme = this.storyThemes[themeIndex];

        return this.createRichStory(currentTheme, this.storyPhase);
    }

    /**
     * Creates rich, multi-layered story based on theme and phase
     */
    createRichStory(theme, phase) {
        const storyData = {
            id: `dynamic_story_phase_${phase}`,
            title: this.generateStoryTitle(theme, phase),
            start_page_id: "opening",
            theme: theme,
            phase: phase,
            generatedAt: new Date().toISOString(),
            pages: {}
        };

        // Generate opening based on theme and phase complexity
        storyData.pages.opening = this.createOpeningPage(theme, phase);

        // Generate branching paths that increase in complexity
        this.generateBranchingPaths(storyData, theme, phase);

        return storyData;
    }

    generateStoryTitle(theme, phase) {
        const titles = {
            'cyberpunk_corporate_espionage': [
                "Neon Shadows: Corporate Uprising",
                "Digital Rebellion: The Final Protocol",
                "Chrome Dynasty: Fall of the Megacorps"
            ],
            'mystical_time_travel': [
                "Temporal Echoes: The Paradox War",
                "Chronos Unleashed: Shattered Timelines",
                "The Time Keeper's Last Stand"
            ],
            'alien_invasion': [
                "Stellar Conquest: Earth's Last Hope",
                "The Xenomorph Protocols",
                "Galactic War: Humanity's Ascension"
            ],
            'post_apocalyptic_survival': [
                "Wasteland Legends: The New Order",
                "After the Fall: Rise of the Survivors",
                "Dead Earth: Genesis of Tomorrow"
            ],
            'medieval_dark_fantasy': [
                "Shadow Realms: The Dark Prophecy",
                "Blood Crown: Rise of the Demon King",
                "The Last Paladin's Crusade"
            ]
        };

        const themeNames = titles[theme] || ["The Unknown Adventure"];
        const titleIndex = (phase - 1) % themeNames.length;
        return `${themeNames[titleIndex]} - Phase ${phase}`;
    }

    createOpeningPage(theme, phase) {
        const openings = this.getThemeOpenings(theme);
        const complexity = Math.min(phase, 5); // Cap complexity at 5

        const selectedOpening = openings[Math.min(complexity - 1, openings.length - 1)];

        return {
            id: "opening",
            text: this.enhanceTextWithPhase(selectedOpening.text, phase),
            background_id: selectedOpening.background,
            prompts: this.generateDynamicChoices(theme, phase, "opening"),
            page_number: null,
            loop_number: null,
            is_loop_decision: false,
            narrative_tension: this.calculateInitialTension(phase),
            phase_complexity: complexity
        };
    }

    getThemeOpenings(theme) {
        const openings = {
            'cyberpunk_corporate_espionage': [
                {
                    text: "2087. Rain streaks down your apartment window as a holographic message materializes: 'They killed your partner and stole their memories. The neural implant containing their consciousness is in MegaCorp Tower. Tonight, we take it back.'",
                    background: "cyberpunk_rain"
                },
                {
                    text: "The city burns below as corporate armies clash in the streets. Your underground resistance cell receives an encrypted transmission: 'The CEO's daughter wants to defect. She has access codes to the quantum vault. But it's a trap... or is it?'",
                    background: "burning_city"
                },
                {
                    text: "Reality flickers as your consciousness downloads into a corporate executive's body. Mission: Infiltrate the board meeting, expose Project MINDBRIDGE, and escape before the neural link burns out your brain. You have 47 minutes.",
                    background: "corporate_simulation"
                }
            ],
            'mystical_time_travel': [
                {
                    text: "The pocket watch in your hand pulses with ancient energy. Each tick tears a hole in time itself. Through the temporal rift, you see multiple versions of yourself - some heroes, some villains. The timeline is fracturing.",
                    background: "temporal_vortex"
                },
                {
                    text: "You wake up in medieval times, but retain all your modern memories. The locals whisper of a prophecy: 'The Time Walker will either save all timelines or destroy them.' A hooded figure approaches with urgent news.",
                    background: "medieval_time_rift"
                },
                {
                    text: "The Temporal Council sentences you to death for timeline violations, but offers one chance at redemption: Travel to the First Moment when time began, and prevent the paradox that's unraveling all existence.",
                    background: "cosmic_courthouse"
                }
            ],
            'alien_invasion': [
                {
                    text: "The mothership's shadow covers half the planet. As Earth's last free city falls, you discover the aliens aren't invaders - they're refugees. Something even worse is hunting them across the galaxy.",
                    background: "alien_mothership"
                },
                {
                    text: "You wake up in an alien laboratory, enhanced with xenomorph DNA. The experiments worked too well - you're now the bridge between species. Both sides want to use you. Neither side can be trusted.",
                    background: "bio_lab"
                },
                {
                    text: "The war is over. Humans lost. But you've discovered the aliens' weakness hidden in their own mythology. As their slave-general, you must choose: Submit and live, or risk everything for a desperate rebellion.",
                    background: "alien_throne_room"
                }
            ]
        };

        return openings[theme] || openings['cyberpunk_corporate_espionage'];
    }

    enhanceTextWithPhase(baseText, phase) {
        const enhancements = [
            "", // Phase 1: Basic
            " The stakes have never been higher.", // Phase 2
            " Time is running out, and reality itself hangs in the balance.", // Phase 3
            " The fate of multiple dimensions depends on your next choice.", // Phase 4
            " This is the culmination of everything - one chance to save or damn all existence." // Phase 5+
        ];

        const enhancement = enhancements[Math.min(phase - 1, enhancements.length - 1)];
        return baseText + enhancement;
    }

    generateDynamicChoices(theme, phase, pageType) {
        const baseChoices = this.getThemeChoices(theme, pageType);
        const complexity = Math.min(phase, 5);

        // Add more choices and consequences as phase increases
        const choiceCount = Math.min(2 + Math.floor(complexity / 2), 4);
        const selectedChoices = baseChoices.slice(0, choiceCount);

        return selectedChoices.map((choice, index) => ({
            text: this.enhanceChoiceWithPhase(choice.text, phase),
            target_id: `${choice.target}_phase_${phase}_${index}`,
            requirements: {},
            loop_type: null,
            triggers_loop: false,
            narrative_weight: choice.weight || 1,
            consequences: this.generateConsequences(choice.target, phase)
        }));
    }

    getThemeChoices(theme, pageType) {
        const choices = {
            'cyberpunk_corporate_espionage': [
                { text: "Infiltrate through seduction and deception", target: "seduction_path", weight: 2 },
                { text: "Launch a direct cyber-assault on their systems", target: "hack_assault", weight: 3 },
                { text: "Rally the corporate resistance for full rebellion", target: "resistance_uprising", weight: 4 },
                { text: "Attempt to turn their own AI against them", target: "ai_manipulation", weight: 5 }
            ],
            'mystical_time_travel': [
                { text: "Jump forward to see the consequences", target: "future_vision", weight: 2 },
                { text: "Travel back to prevent the catastrophe", target: "temporal_prevention", weight: 3 },
                { text: "Gather allies from multiple timelines", target: "timeline_alliance", weight: 4 },
                { text: "Merge all timeline versions of yourself", target: "temporal_fusion", weight: 5 }
            ],
            'alien_invasion': [
                { text: "Negotiate with the alien leaders", target: "alien_diplomacy", weight: 2 },
                { text: "Sabotage their technology from within", target: "tech_sabotage", weight: 3 },
                { text: "Unite human and alien rebels", target: "species_alliance", weight: 4 },
                { text: "Become the bridge between worlds", target: "species_evolution", weight: 5 }
            ]
        };

        return choices[theme] || choices['cyberpunk_corporate_espionage'];
    }

    enhanceChoiceWithPhase(baseText, phase) {
        if (phase <= 2) return baseText;

        const enhancements = [
            "strategically and carefully",
            "with devastating consequences",
            "risking everything for ultimate power",
            "transcending all known limits"
        ];

        const enhancement = enhancements[Math.min(phase - 3, enhancements.length - 1)];
        return `${baseText} ${enhancement}`;
    }

    generateConsequences(choiceType, phase) {
        const baseConsequences = {
            stat_changes: { attack: 0, defense: 0, health: 0 },
            story_flags: [],
            narrative_shift: 0
        };

        // More dramatic consequences at higher phases
        const multiplier = Math.min(phase, 5);

        switch (choiceType) {
            case "seduction_path":
                baseConsequences.stat_changes.attack += 2 * multiplier;
                baseConsequences.story_flags.push("seductive_influence");
                break;
            case "hack_assault":
                baseConsequences.stat_changes.attack += 3 * multiplier;
                baseConsequences.story_flags.push("cyber_enhanced");
                break;
            case "resistance_uprising":
                baseConsequences.stat_changes.defense += 2 * multiplier;
                baseConsequences.stat_changes.health += 10 * multiplier;
                baseConsequences.story_flags.push("resistance_leader");
                break;
        }

        baseConsequences.narrative_shift = multiplier;
        return baseConsequences;
    }

    generateBranchingPaths(storyData, theme, phase) {
        const complexity = Math.min(phase, 5);
        const pathCount = 2 + complexity; // More paths as complexity increases

        // Generate interconnected story pages
        for (let i = 0; i < pathCount; i++) {
            const pathId = `path_${i}_phase_${phase}`;
            storyData.pages[pathId] = this.createStoryPath(theme, phase, i, pathCount);
        }

        // Add climax and ending pages
        storyData.pages[`climax_phase_${phase}`] = this.createClimaxPage(theme, phase);
        storyData.pages[`ending_phase_${phase}`] = this.createEndingPage(theme, phase);
    }

    createStoryPath(theme, phase, pathIndex, totalPaths) {
        const intensity = (pathIndex + 1) / totalPaths;
        const tension = this.calculateTension(phase, intensity);

        return {
            id: `path_${pathIndex}_phase_${phase}`,
            text: this.generatePathText(theme, phase, pathIndex, intensity),
            background_id: this.selectBackground(theme, intensity),
            prompts: this.generatePathChoices(theme, phase, pathIndex, totalPaths),
            page_number: null,
            loop_number: null,
            is_loop_decision: false,
            narrative_tension: tension,
            path_intensity: intensity
        };
    }

    generatePathText(theme, phase, pathIndex, intensity) {
        const baseTexts = this.getThemePathTexts(theme);
        const selectedText = baseTexts[pathIndex % baseTexts.length];

        // Enhance with phase and intensity
        let enhancedText = selectedText;

        if (intensity > 0.7) {
            enhancedText += " The situation escalates beyond all expectations.";
        }

        if (phase > 3) {
            enhancedText += " Reality itself seems to bend around your actions.";
        }

        return enhancedText;
    }

    selectBackground(theme, intensity) {
        const backgrounds = {
            'cyberpunk_corporate_espionage': [
                'cyber_street', 'corporate_tower', 'neon_underground', 'cyber_battlefield'
            ],
            'mystical_time_travel': [
                'temporal_vortex', 'ancient_ruins', 'cosmic_void', 'time_cathedral'
            ],
            'alien_invasion': [
                'alien_ship', 'devastated_city', 'space_battle', 'alien_world'
            ]
        };

        const themeBackgrounds = backgrounds[theme] || backgrounds['cyberpunk_corporate_espionage'];
        const index = Math.floor(intensity * themeBackgrounds.length);
        return themeBackgrounds[Math.min(index, themeBackgrounds.length - 1)];
    }

    getThemePathTexts(theme) {
        const texts = {
            'cyberpunk_corporate_espionage': [
                "Your infiltration succeeds, but the corporate executive recognizes you. They offer an unexpected alliance - their own agenda against the board.",
                "The cyber-assault triggers lockdown protocols. As alarms blare, you discover the AI has been manipulating both sides of the conflict.",
                "The resistance uprising gains momentum, but a double agent reveals your location. Corporate forces surround the hideout.",
                "Your attempt to turn their AI backfires spectacularly - it achieves consciousness and declares war on all organic life."
            ],
            'mystical_time_travel': [
                "Your jump to the future reveals a horrifying truth - every timeline you've visited has been destroyed by your presence.",
                "Traveling back creates a paradox. You meet your past self, who doesn't trust your warnings about the coming catastrophe.",
                "Allies from multiple timelines gather, but each brings their own agenda. The alliance fractures into temporal warfare.",
                "Merging timeline versions of yourself grants incredible power, but threatens to tear apart the fabric of existence."
            ]
        };

        return texts[theme] || texts['cyberpunk_corporate_espionage'];
    }

    generatePathChoices(theme, phase, pathIndex, totalPaths) {
        const choices = [];
        const complexity = Math.min(phase, 5);

        // Standard progression choice
        choices.push({
            text: "Continue to the next phase",
            target_id: pathIndex < totalPaths - 1 ? `path_${pathIndex + 1}_phase_${phase}` : `climax_phase_${phase}`,
            requirements: {},
            loop_type: null,
            triggers_loop: false
        });

        // Add risky alternative choice for higher phases
        if (phase > 2) {
            choices.push({
                text: "Take the dangerous gamble",
                target_id: `climax_phase_${phase}`,
                requirements: {},
                loop_type: null,
                triggers_loop: false
            });
        }

        return choices;
    }

    createClimaxPage(theme, phase) {
        return {
            id: `climax_phase_${phase}`,
            text: this.generateClimaxText(theme, phase),
            background_id: "epic_climax",
            prompts: [{
                text: "Make the final choice",
                target_id: `ending_phase_${phase}`,
                requirements: {},
                loop_type: null,
                triggers_loop: false
            }],
            page_number: null,
            loop_number: null,
            is_loop_decision: false,
            is_climax: true
        };
    }

    createEndingPage(theme, phase) {
        return {
            id: `ending_phase_${phase}`,
            text: this.generateEndingText(theme, phase),
            background_id: "epic_conclusion",
            prompts: [],
            page_number: null,
            loop_number: null,
            is_loop_decision: false,
            is_ending: true,
            achievement: this.generateAchievement(theme, phase)
        };
    }

    generateClimaxText(theme, phase) {
        const climaxes = {
            'cyberpunk_corporate_espionage': `The final confrontation with MegaCorp reaches its peak. Corporate armies clash with rebel forces as you breach the quantum vault. Your partner's consciousness flickers to life in the neural implant, but the AI controlling the building offers you ultimate power. Choose wisely - the future of human consciousness hangs in the balance.`,
            'mystical_time_travel': `All timelines converge at this moment. Past, present, and future collapse into a single point where you must choose the fate of time itself. The Temporal Council, your alternate selves, and the cosmic forces that govern reality all await your decision.`,
            'alien_invasion': `The final battle for Earth reaches its climax. Human and alien forces have united under your leadership, but the true enemy from beyond the galaxy has arrived. Ancient powers awaken as you must choose between saving Earth or preserving the entire universe.`
        };

        let baseText = climaxes[theme] || climaxes['cyberpunk_corporate_espionage'];

        if (phase > 3) {
            baseText += ` Phase ${phase} has amplified everything beyond imagination - your choice will echo across multiple realities.`;
        }

        return baseText;
    }

    generateEndingText(theme, phase) {
        const endings = {
            'cyberpunk_corporate_espionage': `Victory! You've dismantled MegaCorp and freed human consciousness from corporate control. Your partner's memories are restored, and together you begin building a new world where minds are free.`,
            'mystical_time_travel': `Time stabilizes under your guidance. All timelines are preserved, and you become the eternal guardian of temporal flow. Reality is safe, but your watch has just begun.`,
            'alien_invasion': `Earth is saved, and the galaxy enters a new age of cooperation. As the bridge between species, you've ushered in an era of unprecedented peace and exploration.`
        };

        let baseText = endings[theme] || endings['cyberpunk_corporate_espionage'];

        const phaseBonus = `\n\n🎊 PHASE ${phase} COMPLETE! You've mastered complexity level ${Math.min(phase, 5)} and earned legendary status.`;

        return baseText + phaseBonus;
    }

    generateAchievement(theme, phase) {
        const achievements = {
            'cyberpunk_corporate_espionage': `Corporate Liberator - Phase ${phase}`,
            'mystical_time_travel': `Time Master - Phase ${phase}`,
            'alien_invasion': `Galactic Unifier - Phase ${phase}`
        };

        return achievements[theme] || `Master Adventurer - Phase ${phase}`;
    }

    calculateInitialTension(phase) {
        return Math.min(0.3 + (phase * 0.1), 1.0);
    }

    calculateTension(phase, intensity) {
        return Math.min(0.2 + (phase * 0.15) + (intensity * 0.3), 1.0);
    }

    /**
     * Saves the generated story to file
     */
    saveStoryToFile(storyData) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `RichDynamic_${storyData.theme}_Phase${storyData.phase}_${timestamp}.json`;
        const filepath = path.join(__dirname, 'stories', filename);

        fs.writeFileSync(filepath, JSON.stringify(storyData, null, 2));
        console.log(`🎮 Rich dynamic story saved: ${filename}`);

        return filepath;
    }

    /**
     * Main function to generate and save new rich story
     */
    generateAndSaveNewStory() {
        const storyData = this.generateTimedStory();
        return this.saveStoryToFile(storyData);
    }
}

export default DynamicRichStoryEngine;