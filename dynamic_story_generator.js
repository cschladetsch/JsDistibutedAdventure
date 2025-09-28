/**
 * Dynamic Story Generator
 * Creates rich, branching narratives with multiple outcomes and character development
 */

import { StoryTemplates, NarrativeStructures, CharacterArchetypes, StoryMoods } from './enhanced_story_templates.js';
import { StorySystem, Story, Page, Prompt } from './StorySystem.js';

export class DynamicStoryGenerator {
    constructor() {
        this.storySystem = new StorySystem();
        this.currentTheme = null;
        this.currentStructure = null;
        this.characterPool = [];
        this.plotPoints = [];
        this.playerChoices = [];
    }

    /**
     * Generates a complete story based on user preferences
     */
    async generateStory(options = {}) {
        const {
            genre = this.getRandomGenre(),
            length = 'medium', // short, medium, long, epic
            tone = 'balanced', // light, dark, balanced, comedy, serious
            includeRomance = true,
            includeCombat = true,
            complexity = 'moderate' // simple, moderate, complex
        } = options;

        console.log(`🎭 Generating ${length} ${genre} story with ${tone} tone...`);

        // Select theme and structure
        this.currentTheme = this.selectTheme(genre);
        this.currentStructure = this.selectNarrativeStructure(genre, complexity);

        // Create characters
        this.characterPool = this.generateCharacters(this.currentTheme, includeRomance);

        // Generate plot outline
        this.plotPoints = this.generatePlotOutline(length, tone);

        // Build story structure
        const story = this.buildStoryStructure(this.currentTheme, this.plotPoints);

        // Add interactive elements
        this.addChoiceMechanics(story, complexity);
        this.addCombatEncounters(story, includeCombat);
        this.addRomanceOptions(story, includeRomance);

        console.log(`✨ Story "${story.title}" generated with ${Object.keys(story.pages).length} pages!`);

        return story;
    }

    /**
     * Selects a random genre or uses provided preference
     */
    getRandomGenre() {
        const genres = ['mystery', 'fantasy', 'scifi', 'horror', 'adventure', 'romance'];
        return genres[Math.floor(Math.random() * genres.length)];
    }

    /**
     * Selects an appropriate theme based on genre
     */
    selectTheme(genre) {
        const themes = StoryTemplates[genre]?.themes || StoryTemplates.adventure.themes;
        return themes[Math.floor(Math.random() * themes.length)];
    }

    /**
     * Chooses narrative structure based on genre and complexity
     */
    selectNarrativeStructure(genre, complexity) {
        if (genre === 'mystery') return NarrativeStructures.mystery;
        if (complexity === 'complex') return NarrativeStructures.heroJourney;
        return NarrativeStructures.threePart;
    }

    /**
     * Generates a cast of characters for the story
     */
    generateCharacters(theme, includeRomance) {
        const characters = [];

        // Add protagonist variants
        const protagonist = this.selectRandomFrom(CharacterArchetypes.protagonist);
        characters.push({
            ...protagonist,
            role: 'protagonist',
            relationship: 'self'
        });

        // Add supporting characters from theme
        theme.characters.forEach((charType, index) => {
            const archetype = this.selectAppropriateArchetype(charType, index);
            characters.push({
                ...archetype,
                role: charType,
                relationship: this.determineRelationship(charType, includeRomance)
            });
        });

        return characters;
    }

    selectRandomFrom(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    selectAppropriateArchetype(charType, index) {
        // First character is usually an ally, last is often antagonist
        if (index === 0) return this.selectRandomFrom(CharacterArchetypes.ally);
        if (index >= 2) return this.selectRandomFrom(CharacterArchetypes.antagonist);

        // Mix allies and antagonists for middle characters
        const allTypes = [...CharacterArchetypes.ally, ...CharacterArchetypes.antagonist];
        return this.selectRandomFrom(allTypes);
    }

    determineRelationship(charType, includeRomance) {
        const relationships = ['ally', 'neutral', 'rival', 'enemy'];
        if (includeRomance && Math.random() < 0.3) {
            relationships.push('romantic_interest', 'potential_partner');
        }
        return this.selectRandomFrom(relationships);
    }

    /**
     * Creates a detailed plot outline
     */
    generatePlotOutline(length, tone) {
        const plotPoints = [];
        const storyBeats = this.calculateStoryBeats(length);

        for (let i = 0; i < storyBeats; i++) {
            const beatType = this.determineBeatType(i, storyBeats);
            const mood = this.selectMoodForBeat(beatType, tone);

            plotPoints.push({
                index: i,
                type: beatType,
                mood: mood,
                tension: this.calculateTension(i, storyBeats),
                characters: this.selectCharactersForBeat(beatType),
                conflicts: this.generateConflictsForBeat(beatType, tone)
            });
        }

        return plotPoints;
    }

    calculateStoryBeats(length) {
        const beatCounts = {
            short: 8,
            medium: 15,
            long: 25,
            epic: 40
        };
        return beatCounts[length] || beatCounts.medium;
    }

    determineBeatType(index, total) {
        const progression = index / total;

        if (progression < 0.25) return 'setup';
        if (progression < 0.5) return 'rising_action';
        if (progression < 0.75) return 'climax_approach';
        if (progression < 0.9) return 'climax';
        return 'resolution';
    }

    selectMoodForBeat(beatType, tone) {
        const moodMap = {
            setup: ['atmospheric', 'mysterious'],
            rising_action: ['action_packed', 'mysterious'],
            climax_approach: ['atmospheric', 'action_packed'],
            climax: ['action_packed'],
            resolution: ['romantic', 'atmospheric']
        };

        const possibleMoods = moodMap[beatType] || ['atmospheric'];
        return this.selectRandomFrom(possibleMoods);
    }

    calculateTension(index, total) {
        // Create a tension curve that rises toward climax
        const progression = index / total;

        if (progression < 0.25) return Math.random() * 0.3; // Low tension start
        if (progression < 0.75) return 0.3 + (progression * 0.5); // Rising tension
        if (progression < 0.9) return 0.8 + (Math.random() * 0.2); // High tension climax
        return Math.random() * 0.4; // Falling tension resolution
    }

    selectCharactersForBeat(beatType) {
        // Different beats focus on different character combinations
        const charSelections = {
            setup: ['protagonist', 'mentor_figure'],
            rising_action: ['protagonist', 'ally', 'obstacle'],
            climax_approach: ['protagonist', 'antagonist'],
            climax: ['protagonist', 'antagonist', 'ally'],
            resolution: ['protagonist', 'romantic_interest', 'ally']
        };

        return charSelections[beatType] || ['protagonist'];
    }

    generateConflictsForBeat(beatType, tone) {
        const conflicts = {
            setup: ['internal_doubt', 'mystery_introduction', 'call_to_adventure'],
            rising_action: ['external_obstacle', 'character_conflict', 'skill_challenge'],
            climax_approach: ['betrayal', 'revelation', 'major_setback'],
            climax: ['final_confrontation', 'ultimate_choice', 'supreme_test'],
            resolution: ['reconciliation', 'new_understanding', 'peaceful_ending']
        };

        return this.selectRandomFrom(conflicts[beatType] || ['general_conflict']);
    }

    /**
     * Builds the actual story structure with pages and choices
     */
    buildStoryStructure(theme, plotPoints) {
        const storyId = `generated_${theme.title.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
        const story = this.storySystem.createStory(storyId, theme.title, 'opening');

        // Create opening page
        const openingPage = this.createStoryPage('opening', plotPoints[0], theme);
        story.addPage(openingPage);

        // Create main story pages
        plotPoints.slice(1).forEach((plotPoint, index) => {
            const pageId = `story_${index + 1}`;
            const page = this.createStoryPage(pageId, plotPoint, theme);
            story.addPage(page);
        });

        // Link pages together
        this.linkStoryPages(story, plotPoints);

        return story;
    }

    createStoryPage(pageId, plotPoint, theme) {
        const page = new Page(pageId, this.generatePageText(plotPoint, theme));

        // Set background based on theme and mood
        page.setBackground(this.selectBackground(theme.setting, plotPoint.mood));

        // Add mood-specific details
        this.enhancePageWithMood(page, plotPoint.mood);

        return page;
    }

    generatePageText(plotPoint, theme) {
        const moodTexts = StoryMoods[plotPoint.mood]?.descriptions || [];
        const sensoryDetails = StoryMoods[plotPoint.mood]?.sensory_details || [];

        const baseText = this.createContextualText(plotPoint, theme);
        const moodDescription = this.selectRandomFrom(moodTexts);
        const sensoryDetail = this.selectRandomFrom(sensoryDetails);

        return `${baseText}\n\n${moodDescription} ${sensoryDetail}`;
    }

    createContextualText(plotPoint, theme) {
        const contextTexts = {
            setup: `You find yourself in ${theme.setting}, drawn into ${theme.description}. The atmosphere is thick with possibility and unknown dangers.`,
            rising_action: `The situation grows more complex as new revelations emerge. Every choice you make seems to have far-reaching consequences.`,
            climax_approach: `The tension reaches a breaking point. You can feel that everything has been leading to this moment.`,
            climax: `This is it - the moment of truth. Everything you've learned and everyone you've met has prepared you for what comes next.`,
            resolution: `As the dust settles, you reflect on the journey that brought you here. The choices you made have shaped not just the outcome, but who you've become.`
        };

        return contextTexts[plotPoint.type] || "Your adventure continues in unexpected ways.";
    }

    selectBackground(themeSetting, mood) {
        const backgroundMap = {
            atmospheric: `${themeSetting}_moody`,
            action_packed: `${themeSetting}_action`,
            romantic: `${themeSetting}_romantic`,
            mysterious: `${themeSetting}_mystery`
        };

        return backgroundMap[mood] || themeSetting;
    }

    enhancePageWithMood(page, mood) {
        // Add mood-specific metadata that the UI can use
        page.mood = mood;
        page.atmosphere = StoryMoods[mood] || {};
    }

    linkStoryPages(story, plotPoints) {
        const pageIds = Object.keys(story.pages);

        pageIds.forEach((pageId, index) => {
            const page = story.getPage(pageId);
            const nextIndex = (index + 1) % pageIds.length;
            const nextPageId = pageIds[nextIndex];

            // Create meaningful choices based on plot point
            const plotPoint = plotPoints[index] || plotPoints[0];
            const choices = this.generateChoicesForPlotPoint(plotPoint, nextPageId, pageIds);

            choices.forEach(choice => {
                page.addPrompt(choice.text, choice.target, choice.requirements || {});
            });
        });
    }

    generateChoicesForPlotPoint(plotPoint, defaultNext, allPageIds) {
        const baseChoices = [
            { text: "Continue forward", target: defaultNext },
            { text: "Take a moment to observe", target: this.selectRandomFrom(allPageIds) },
            { text: "Act decisively", target: defaultNext }
        ];

        // Add plot-specific choices
        const plotSpecificChoices = this.getPlotSpecificChoices(plotPoint, allPageIds);

        return [...baseChoices.slice(0, 2), ...plotSpecificChoices].slice(0, 4);
    }

    getPlotSpecificChoices(plotPoint, allPageIds) {
        const choiceMap = {
            setup: [
                { text: "Investigate the mystery", target: this.selectRandomFrom(allPageIds) },
                { text: "Seek guidance from others", target: this.selectRandomFrom(allPageIds) }
            ],
            rising_action: [
                { text: "Confront the challenge head-on", target: this.selectRandomFrom(allPageIds) },
                { text: "Look for an alternative approach", target: this.selectRandomFrom(allPageIds) }
            ],
            climax: [
                { text: "Make the ultimate sacrifice", target: this.selectRandomFrom(allPageIds) },
                { text: "Find a third option", target: this.selectRandomFrom(allPageIds) }
            ]
        };

        return choiceMap[plotPoint.type] || [
            { text: "Choose wisdom", target: this.selectRandomFrom(allPageIds) }
        ];
    }

    /**
     * Adds complex choice mechanics and consequences
     */
    addChoiceMechanics(story, complexity) {
        if (complexity === 'simple') return;

        Object.values(story.pages).forEach(page => {
            // Add choice consequences
            page.prompts.forEach(prompt => {
                if (complexity === 'complex') {
                    prompt.consequences = this.generateChoiceConsequences();
                    prompt.skill_requirements = this.generateSkillRequirements();
                }

                prompt.emotional_impact = this.generateEmotionalImpact();
            });
        });
    }

    generateChoiceConsequences() {
        return {
            reputation_change: (Math.random() - 0.5) * 20,
            relationship_effects: this.characterPool.map(char => ({
                character: char.role,
                change: (Math.random() - 0.5) * 10
            })),
            story_flags: [`choice_${Math.random().toString(36).substr(2, 9)}`]
        };
    }

    generateSkillRequirements() {
        const skills = ['strength', 'dexterity', 'intelligence', 'wisdom', 'charisma', 'perception'];
        const selectedSkill = this.selectRandomFrom(skills);
        return {
            [selectedSkill]: Math.floor(Math.random() * 15) + 5
        };
    }

    generateEmotionalImpact() {
        const emotions = ['hope', 'fear', 'love', 'anger', 'curiosity', 'determination'];
        return {
            primary_emotion: this.selectRandomFrom(emotions),
            intensity: Math.random()
        };
    }

    /**
     * Adds combat encounters with variety
     */
    addCombatEncounters(story, includeCombat) {
        if (!includeCombat) return;

        const combatPages = Math.floor(Object.keys(story.pages).length * 0.3);
        const pageIds = Object.keys(story.pages);

        for (let i = 0; i < combatPages; i++) {
            const randomPageId = this.selectRandomFrom(pageIds);
            const page = story.getPage(randomPageId);

            // Add combat choice
            const enemy = this.generateEnemyForTheme(this.currentTheme);
            page.addPrompt(
                `Face the ${enemy.name} in battle`,
                this.createCombatPage(story, enemy, randomPageId)
            );
        }
    }

    generateEnemyForTheme(theme) {
        const enemyTypes = {
            mystery: [
                { name: "Shadowy Figure", health: 35, attack: 8, defense: 4 },
                { name: "Corrupt Official", health: 40, attack: 10, defense: 3 }
            ],
            fantasy: [
                { name: "Dark Sorcerer", health: 45, attack: 12, defense: 6 },
                { name: "Ancient Dragon", health: 80, attack: 20, defense: 10 }
            ],
            scifi: [
                { name: "Rogue Android", health: 50, attack: 14, defense: 8 },
                { name: "Alien Warrior", health: 60, attack: 16, defense: 7 }
            ],
            horror: [
                { name: "Nightmare Entity", health: 40, attack: 15, defense: 2 },
                { name: "Possessed Victim", health: 30, attack: 12, defense: 5 }
            ]
        };

        const themeEnemies = enemyTypes[theme.tone] || enemyTypes.fantasy;
        return this.selectRandomFrom(themeEnemies);
    }

    createCombatPage(story, enemy, returnPageId) {
        const combatPageId = `combat_${enemy.name.toLowerCase().replace(/\s+/g, '_')}`;
        const combatPage = new Page(
            combatPageId,
            `You face ${enemy.name} in intense combat! Victory requires both skill and strategy.`
        );

        combatPage.combat = {
            enemy: enemy,
            victory_page: `victory_${combatPageId}`,
            defeat_page: `defeat_${combatPageId}`
        };

        combatPage.addPrompt("Engage in battle!", "combat_system");

        story.addPage(combatPage);
        this.createCombatOutcomePages(story, combatPageId, returnPageId);

        return combatPageId;
    }

    createCombatOutcomePages(story, combatPageId, returnPageId) {
        // Victory page
        const victoryPage = new Page(
            `victory_${combatPageId}`,
            "Your skill and determination have won the day! You emerge victorious, stronger and wiser."
        );
        victoryPage.addPrompt("Continue your journey", returnPageId);
        story.addPage(victoryPage);

        // Defeat page
        const defeatPage = new Page(
            `defeat_${combatPageId}`,
            "Though defeated, you live to fight another day. Sometimes retreat is the wisest choice."
        );
        defeatPage.addPrompt("Regroup and try again", returnPageId);
        story.addPage(defeatPage);
    }

    /**
     * Adds romance storylines and relationship mechanics
     */
    addRomanceOptions(story, includeRomance) {
        if (!includeRomance) return;

        const romanticCharacters = this.characterPool.filter(
            char => char.relationship === 'romantic_interest' || char.relationship === 'potential_partner'
        );

        if (romanticCharacters.length === 0) return;

        // Add romance subplot pages
        romanticCharacters.forEach(character => {
            this.createRomanceSubplot(story, character);
        });
    }

    createRomanceSubplot(story, character) {
        const romancePages = [
            {
                id: `meet_${character.role}`,
                text: `You encounter ${character.name}, and there's an immediate connection. Their ${character.traits[0]} nature draws you in.`,
                choices: [
                    "Start a conversation",
                    "Offer to help them",
                    "Maintain professional distance"
                ]
            },
            {
                id: `develop_${character.role}`,
                text: `Your relationship with ${character.name} deepens. You find yourself thinking about them often.`,
                choices: [
                    "Express your feelings",
                    "Keep things platonic",
                    "Suggest working together"
                ]
            },
            {
                id: `romance_climax_${character.role}`,
                text: `A crucial moment arrives in your relationship with ${character.name}. What you choose now will define your future together.`,
                choices: [
                    "Commit to the relationship",
                    "Remain friends",
                    "Take time to think"
                ]
            }
        ];

        romancePages.forEach(pageData => {
            const page = new Page(pageData.id, pageData.text);
            pageData.choices.forEach(choice => {
                page.addPrompt(choice, this.selectRandomPageId(story));
            });
            story.addPage(page);
        });
    }

    selectRandomPageId(story) {
        const pageIds = Object.keys(story.pages);
        return this.selectRandomFrom(pageIds);
    }

    /**
     * Generates story with specific parameters for different moods
     */
    async generateMysteryStory() {
        return this.generateStory({
            genre: 'mystery',
            tone: 'dark',
            includeCombat: false,
            complexity: 'complex'
        });
    }

    async generateRomanticAdventure() {
        return this.generateStory({
            genre: 'adventure',
            tone: 'light',
            includeRomance: true,
            complexity: 'moderate'
        });
    }

    async generateEpicFantasy() {
        return this.generateStory({
            genre: 'fantasy',
            length: 'epic',
            tone: 'serious',
            includeCombat: true,
            complexity: 'complex'
        });
    }

    async generateSpaceOpera() {
        return this.generateStory({
            genre: 'scifi',
            length: 'long',
            tone: 'balanced',
            includeCombat: true,
            includeRomance: true,
            complexity: 'complex'
        });
    }
}

export default DynamicStoryGenerator;