#!/usr/bin/env node

/**
 * Create Open World Story - Main script to generate open world adventures
 * Usage: node create_open_world.js [world-type] [options]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenWorldGenerator from './open_world_generator.js';
import QuestSystem from './quest_system.js';
import { StorySystem, Story, Page, Prompt } from './StorySystem.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class OpenWorldCreator {
    constructor() {
        this.generator = new OpenWorldGenerator();
        this.questSystem = new QuestSystem();
        this.storiesDir = path.join(__dirname, 'stories');
        this.ensureStoriesDirectory();
    }

    ensureStoriesDirectory() {
        if (!fs.existsSync(this.storiesDir)) {
            fs.mkdirSync(this.storiesDir, { recursive: true });
        }
    }

    /**
     * Main open world creation interface
     */
    async createOpenWorld(options = {}) {
        const {
            type = 'fantasy_kingdom',
            size = 'medium',           // small, medium, large, massive
            questDensity = 'normal',   // sparse, normal, dense
            difficulty = 'balanced',   // easy, balanced, hard
            themes = [],               // Additional themes to mix in
            customSettings = {}
        } = options;

        console.log('🌍 Creating Open World Adventure...\n');

        const worldTypes = {
            fantasy_kingdom: {
                name: "Fantasy Kingdom",
                description: "A magical realm with castles, forests, and ancient mysteries",
                mainQuest: "Restore the broken kingdom to its former glory",
                themes: ['magic', 'politics', 'ancient_mysteries']
            },
            space_station: {
                name: "Space Station Hub",
                description: "A massive space station connecting multiple galaxies",
                mainQuest: "Prevent the station's destruction and unite the factions",
                themes: ['sci_fi', 'diplomacy', 'technology']
            },
            post_apocalyptic: {
                name: "Post-Apocalyptic Earth",
                description: "Earth after civilization's collapse, struggling to rebuild",
                mainQuest: "Rebuild civilization and restore hope to humanity",
                themes: ['survival', 'community', 'hope']
            },
            steampunk_city: {
                name: "Victorian Steampunk Metropolis",
                description: "A steam-powered city where magic and technology collide",
                mainQuest: "Stop the industrial revolution from destroying magic",
                themes: ['steampunk', 'magic_vs_tech', 'social_change']
            },
            underwater_realm: {
                name: "Depths of Aquatica",
                description: "An underwater civilization facing ecological crisis",
                mainQuest: "Save the ocean realm from mysterious corruption",
                themes: ['underwater', 'ecology', 'ancient_powers']
            },
            floating_islands: {
                name: "Sky Realm of Aethros",
                description: "Floating islands connected by airship routes",
                mainQuest: "Prevent the islands from falling from the sky",
                themes: ['aerial', 'exploration', 'ancient_technology']
            }
        };

        const selectedType = worldTypes[type] || worldTypes.fantasy_kingdom;

        console.log(`🏰 Generating: ${selectedType.name}`);
        console.log(`📖 ${selectedType.description}`);
        console.log(`🎯 Main Quest: ${selectedType.mainQuest}\n`);

        // Generate the open world
        const story = await this.generator.generateOpenWorld(type);

        // Enhance with additional features
        await this.enhanceWithSize(story, size);
        await this.enhanceWithQuests(story, questDensity, selectedType);
        await this.enhanceWithDifficulty(story, difficulty);
        await this.addExplorationMechanics(story);
        await this.addWorldEvents(story);

        // Save the world
        await this.saveOpenWorld(story);
        this.displayWorldInfo(story, selectedType);

        return story;
    }

    /**
     * Enhance world based on size setting
     */
    async enhanceWithSize(story, size) {
        const sizeConfigs = {
            small: { locations: 6, questsPerLocation: 1, explorationDepth: 2 },
            medium: { locations: 10, questsPerLocation: 2, explorationDepth: 3 },
            large: { locations: 16, questsPerLocation: 3, explorationDepth: 4 },
            massive: { locations: 25, questsPerLocation: 4, explorationDepth: 5 }
        };

        const config = sizeConfigs[size] || sizeConfigs.medium;

        // Add additional locations if needed
        const currentLocationCount = Object.keys(story.pages).length;
        if (currentLocationCount < config.locations) {
            await this.addRandomLocations(story, config.locations - currentLocationCount);
        }

        // Add exploration depth
        await this.addExplorationDepth(story, config.explorationDepth);
    }

    /**
     * Add random locations to expand the world
     */
    async addRandomLocations(story, count) {
        const locationTemplates = [
            {
                id: 'hidden_cave',
                name: 'Mysterious Cave',
                description: 'A dark cave that seems to go deeper than it should.',
                features: ['underground_lake', 'crystal_formations', 'ancient_paintings']
            },
            {
                id: 'abandoned_outpost',
                name: 'Forgotten Outpost',
                description: 'An old military outpost reclaimed by nature.',
                features: ['watchtower', 'armory', 'training_grounds']
            },
            {
                id: 'traveling_merchant',
                name: 'Merchant Caravan',
                description: 'A traveling merchant with exotic goods from distant lands.',
                features: ['rare_items', 'foreign_news', 'trade_opportunities']
            },
            {
                id: 'mystical_shrine',
                name: 'Ancient Shrine',
                description: 'A small shrine dedicated to forgotten gods.',
                features: ['blessing_altar', 'meditation_circle', 'spirit_guardian']
            },
            {
                id: 'crossroads_inn',
                name: 'The Crossroads Inn',
                description: 'A popular stop for travelers from all directions.',
                features: ['tavern_hall', 'guest_rooms', 'stable', 'job_board']
            }
        ];

        for (let i = 0; i < count; i++) {
            const template = locationTemplates[i % locationTemplates.length];
            const locationId = `${template.id}_${i + 1}`;

            const page = new (await import('./StorySystem.js')).Page(
                locationId,
                template.description
            );

            // Add standard exploration options
            page.addPrompt("Explore thoroughly", `explore_${locationId}`);
            page.addPrompt("Look for secrets", `secrets_${locationId}`);
            page.addPrompt("Return to world hub", "world_hub");

            story.addPage(page);
        }
    }

    /**
     * Add exploration depth with sub-areas
     */
    async addExplorationDepth(story, depth) {
        const locations = Object.keys(story.pages).filter(id =>
            !id.includes('explore_') && !id.includes('quest_') && id !== 'world_hub'
        );

        for (const locationId of locations) {
            for (let d = 1; d <= depth; d++) {
                const subAreaId = `${locationId}_depth_${d}`;
                const page = new Page(
                    subAreaId,
                    `You venture deeper into this area, discovering hidden aspects that aren't visible from the surface. Layer ${d} reveals new mysteries.`
                );

                page.addPrompt("Go deeper", d < depth ? `${locationId}_depth_${d + 1}` : locationId);
                page.addPrompt("Return to surface", locationId);

                if (d === depth) {
                    page.addPrompt("Discover secret", `${locationId}_secret`);
                }

                story.addPage(page);
            }
        }
    }

    /**
     * Enhance with quest density
     */
    async enhanceWithQuests(story, density, worldType) {
        const densityConfigs = {
            sparse: { sideQuestsMultiplier: 0.5, dailyQuests: 2, chainQuests: 1 },
            normal: { sideQuestsMultiplier: 1.0, dailyQuests: 5, chainQuests: 2 },
            dense: { sideQuestsMultiplier: 1.5, dailyQuests: 8, chainQuests: 3 }
        };

        const config = densityConfigs[density] || densityConfigs.normal;

        // Add daily quests
        await this.addDailyQuests(story, config.dailyQuests, worldType);

        // Add quest chains
        await this.addQuestChains(story, config.chainQuests, worldType);

        // Add random encounter quests
        await this.addRandomEncounterQuests(story, Math.floor(config.sideQuestsMultiplier * 10));
    }

    /**
     * Add daily repeatable quests
     */
    async addDailyQuests(story, count, worldType) {
        const dailyQuestTemplates = {
            fantasy_kingdom: [
                { title: "Guard Duty", description: "Help patrol the city walls for threats", rewards: { gold: 50, experience: 100 } },
                { title: "Herb Gathering", description: "Collect medicinal herbs for the local healer", rewards: { gold: 30, experience: 75 } },
                { title: "Merchant Escort", description: "Escort a merchant safely to the next town", rewards: { gold: 80, experience: 120 } },
                { title: "Training Practice", description: "Spar with guards to improve combat skills", rewards: { experience: 150 } },
                { title: "Message Delivery", description: "Deliver important messages between officials", rewards: { gold: 40, experience: 60 } }
            ],
            space_station: [
                { title: "Maintenance Duty", description: "Help with routine station maintenance", rewards: { credits: 100, experience: 80 } },
                { title: "Cargo Loading", description: "Assist with loading/unloading cargo ships", rewards: { credits: 75, experience: 60 } },
                { title: "Security Patrol", description: "Patrol station sectors for security threats", rewards: { credits: 120, experience: 100 } },
                { title: "Data Courier", description: "Transport encrypted data between departments", rewards: { credits: 90, experience: 70 } },
                { title: "Research Assistant", description: "Help scientists with ongoing research", rewards: { credits: 60, experience: 120 } }
            ]
        };

        const templates = dailyQuestTemplates[worldType.themes[0]] || dailyQuestTemplates.fantasy_kingdom;

        for (let i = 0; i < count; i++) {
            const template = templates[i % templates.length];
            const questId = `daily_${template.title.toLowerCase().replace(/\s+/g, '_')}_${i}`;

            story.side_quests = story.side_quests || {};
            story.side_quests[questId] = {
                id: questId,
                title: template.title,
                description: template.description,
                type: 'daily',
                status: 'available',
                repeatable: true,
                rewards: template.rewards,
                objectives: [
                    {
                        id: `${questId}_objective`,
                        description: template.description,
                        required_progress: 1,
                        current_progress: 0,
                        completed: false
                    }
                ]
            };
        }
    }

    /**
     * Add multi-part quest chains
     */
    async addQuestChains(story, count, worldType) {
        const questChains = {
            fantasy_kingdom: [
                {
                    name: "The Lost Prince",
                    quests: [
                        { title: "Missing Heir", description: "Investigate the disappearance of the prince" },
                        { title: "Following Leads", description: "Track down witnesses to the prince's last known location" },
                        { title: "The Conspiracy", description: "Uncover the plot behind the prince's disappearance" },
                        { title: "Royal Rescue", description: "Rescue the prince from his captors" }
                    ]
                },
                {
                    name: "The Ancient Artifact",
                    quests: [
                        { title: "Artifact Research", description: "Study ancient texts about a powerful artifact" },
                        { title: "The First Clue", description: "Find the first piece of the artifact's location" },
                        { title: "Trials of the Ancients", description: "Complete trials to prove worthiness" },
                        { title: "The Artifact's Power", description: "Claim the artifact and decide its fate" }
                    ]
                }
            ]
        };

        const chains = questChains[worldType.themes[0]] || questChains.fantasy_kingdom;

        for (let i = 0; i < Math.min(count, chains.length); i++) {
            const chain = chains[i];

            chain.quests.forEach((quest, index) => {
                const questId = `chain_${chain.name.toLowerCase().replace(/\s+/g, '_')}_${index}`;

                story.side_quests = story.side_quests || {};
                story.side_quests[questId] = {
                    id: questId,
                    title: quest.title,
                    description: quest.description,
                    type: 'chain',
                    status: index === 0 ? 'available' : 'locked',
                    chainName: chain.name,
                    chainIndex: index,
                    rewards: {
                        experience: (index + 1) * 200,
                        gold: (index + 1) * 100
                    },
                    objectives: [
                        {
                            id: `${questId}_objective`,
                            description: quest.description,
                            required_progress: 1,
                            current_progress: 0,
                            completed: false
                        }
                    ]
                };
            });
        }
    }

    /**
     * Add random encounter quests
     */
    async addRandomEncounterQuests(story, count) {
        const encounterTypes = [
            { type: 'help_traveler', title: "Lost Traveler", description: "Help a lost traveler find their way" },
            { type: 'bandit_ambush', title: "Bandit Ambush", description: "Deal with bandits threatening the area" },
            { type: 'mysterious_stranger', title: "Mysterious Stranger", description: "Investigate a suspicious person" },
            { type: 'injured_animal', title: "Wounded Creature", description: "Help an injured animal" },
            { type: 'ancient_riddle', title: "Ancient Riddle", description: "Solve a riddle left by ancient peoples" }
        ];

        for (let i = 0; i < count; i++) {
            const encounter = encounterTypes[i % encounterTypes.length];
            const questId = `encounter_${encounter.type}_${i}`;

            story.side_quests = story.side_quests || {};
            story.side_quests[questId] = {
                id: questId,
                title: encounter.title,
                description: encounter.description,
                type: 'encounter',
                status: 'available',
                randomEncounter: true,
                rewards: {
                    experience: Math.floor(Math.random() * 200) + 100,
                    gold: Math.floor(Math.random() * 100) + 50
                },
                objectives: [
                    {
                        id: `${questId}_objective`,
                        description: encounter.description,
                        required_progress: 1,
                        current_progress: 0,
                        completed: false
                    }
                ]
            };
        }
    }

    /**
     * Add exploration mechanics
     */
    async addExplorationMechanics(story) {
        // Add discovery system
        const discoveryPage = new Page(
            'discovery_system',
            'Your exploration skills allow you to discover hidden areas, secret passages, and valuable resources that others might miss.'
        );

        discoveryPage.addPrompt("Search for hidden areas", "hidden_area_search");
        discoveryPage.addPrompt("Look for valuable resources", "resource_gathering");
        discoveryPage.addPrompt("Track unusual phenomena", "phenomena_tracking");
        discoveryPage.addPrompt("Return to world hub", "world_hub");

        story.addPage(discoveryPage);

        // Add resource gathering
        const resourcePage = new Page(
            'resource_gathering',
            'You carefully search the area for valuable resources, rare materials, and hidden treasures.'
        );

        resourcePage.addPrompt("Gather herbs and plants", "herb_gathering");
        resourcePage.addPrompt("Mine for precious metals", "mining_activity");
        resourcePage.addPrompt("Hunt for rare creatures", "creature_hunting");
        resourcePage.addPrompt("Search for artifacts", "artifact_hunting");
        resourcePage.addPrompt("Return to exploration", "discovery_system");

        story.addPage(resourcePage);

        // Add weather and time mechanics
        const environmentPage = new Page(
            'environment_system',
            'The world around you changes with time and weather. Different conditions reveal different opportunities and challenges.'
        );

        environmentPage.addPrompt("Wait for nightfall", "night_exploration");
        environmentPage.addPrompt("Explore during storms", "storm_exploration");
        environmentPage.addPrompt("Follow seasonal patterns", "seasonal_exploration");
        environmentPage.addPrompt("Return to world hub", "world_hub");

        story.addPage(environmentPage);
    }

    /**
     * Add dynamic world events
     */
    async addWorldEvents(story) {
        const worldEvents = [
            {
                id: 'festival_celebration',
                title: 'Festival of Lights',
                description: 'A joyous festival brings people together from across the realm.',
                duration: 'temporary',
                effects: ['increased_reputation_gains', 'special_vendors', 'unique_quests']
            },
            {
                id: 'trade_disruption',
                title: 'Trade Route Blockade',
                description: 'Bandits have blocked major trade routes, affecting commerce.',
                duration: 'until_resolved',
                effects: ['higher_prices', 'supply_shortages', 'escort_missions']
            },
            {
                id: 'magical_phenomenon',
                title: 'Arcane Storm',
                description: 'Wild magic surges affect the entire region.',
                duration: 'temporary',
                effects: ['magic_enhancement', 'unpredictable_spells', 'rare_materials']
            }
        ];

        for (const event of worldEvents) {
            const eventPage = new Page(
                `event_${event.id}`,
                `${event.title}: ${event.description}\n\nThis world event creates new opportunities and challenges for adventurers.`
            );

            eventPage.addPrompt("Participate in event", `participate_${event.id}`);
            eventPage.addPrompt("Observe from distance", `observe_${event.id}`);
            eventPage.addPrompt("Return to world hub", "world_hub");

            story.addPage(eventPage);
        }
    }

    /**
     * Save the open world story
     */
    async saveOpenWorld(story) {
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `${story.title.replace(/\s+/g, '_')}_OpenWorld_${timestamp}.json`;
        const filepath = path.join(this.storiesDir, filename);

        try {
            fs.writeFileSync(filepath, story.toJSON(), 'utf8');
            console.log(`💾 Open world saved to: ${filename}`);
        } catch (error) {
            console.error('❌ Error saving open world:', error.message);
        }
    }

    /**
     * Display world information
     */
    displayWorldInfo(story, worldType) {
        console.log('\n🌍 Open World Created Successfully!');
        console.log('=' * 60);
        console.log(`Title: ${story.title}`);
        console.log(`Type: ${worldType.name}`);
        console.log(`ID: ${story.id}`);

        const pages = Object.values(story.pages);
        const locations = pages.filter(p => !p.id.includes('_') || p.id.includes('world_hub')).length;
        const quests = Object.keys(story.side_quests || {}).length;
        const mainQuests = Object.values(story.side_quests || {}).filter(q => q.type === 'main').length;
        const sideQuests = Object.values(story.side_quests || {}).filter(q => q.type === 'side').length;
        const dailyQuests = Object.values(story.side_quests || {}).filter(q => q.type === 'daily').length;

        console.log(`📍 Total Locations: ${locations}`);
        console.log(`📄 Total Pages: ${pages.length}`);
        console.log(`🎯 Main Quests: ${mainQuests}`);
        console.log(`📋 Side Quests: ${sideQuests}`);
        console.log(`🔄 Daily Quests: ${dailyQuests}`);
        console.log(`📊 Total Quests: ${quests}`);

        console.log('\n🎮 How to Play:');
        console.log('• Start at the World Hub and explore locations');
        console.log('• Accept main quests to advance the story');
        console.log('• Complete side quests for extra rewards');
        console.log('• Explore thoroughly to discover secrets');
        console.log('• Check your quest log regularly for updates');

        console.log('\n' + '=' * 60);
    }

    /**
     * Show available world types
     */
    static showWorldTypes() {
        console.log('🌍 Available World Types:');
        console.log('• fantasy_kingdom - Magical realm with castles and mysteries');
        console.log('• space_station - Massive space hub between galaxies');
        console.log('• post_apocalyptic - Earth after civilization\'s collapse');
        console.log('• steampunk_city - Victorian city with steam technology');
        console.log('• underwater_realm - Ocean civilization facing crisis');
        console.log('• floating_islands - Sky realm connected by airships');
    }

    /**
     * Show usage information
     */
    static showUsage() {
        console.log('🌍 Open World Story Creator');
        console.log('Usage: node create_open_world.js [world-type] [options]');
        console.log('');
        console.log('Examples:');
        console.log('  node create_open_world.js fantasy_kingdom');
        console.log('  node create_open_world.js space_station --large');
        console.log('  node create_open_world.js post_apocalyptic --dense');
        console.log('');
        console.log('Options:');
        console.log('  --help, -h      Show this help message');
        console.log('  --types, -t     Show available world types');
        console.log('  --small         Create a small world (6 locations)');
        console.log('  --medium        Create a medium world (10 locations)');
        console.log('  --large         Create a large world (16 locations)');
        console.log('  --massive       Create a massive world (25+ locations)');
        console.log('  --sparse        Fewer quests and content');
        console.log('  --normal        Normal quest density');
        console.log('  --dense         More quests and content');
        console.log('  --easy          Easier difficulty and requirements');
        console.log('  --balanced      Balanced difficulty');
        console.log('  --hard          Harder challenges and requirements');
    }
}

// Command line interface
async function main() {
    const args = process.argv.slice(2);

    if (args.includes('--help') || args.includes('-h')) {
        OpenWorldCreator.showUsage();
        return;
    }

    if (args.includes('--types') || args.includes('-t')) {
        OpenWorldCreator.showWorldTypes();
        return;
    }

    const worldType = args[0] || 'fantasy_kingdom';

    const options = {
        type: worldType,
        size: args.includes('--small') ? 'small' :
              args.includes('--medium') ? 'medium' :
              args.includes('--large') ? 'large' :
              args.includes('--massive') ? 'massive' : 'medium',
        questDensity: args.includes('--sparse') ? 'sparse' :
                     args.includes('--dense') ? 'dense' : 'normal',
        difficulty: args.includes('--easy') ? 'easy' :
                   args.includes('--hard') ? 'hard' : 'balanced'
    };

    const creator = new OpenWorldCreator();
    await creator.createOpenWorld(options);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        console.error('❌ Error creating open world:', error.message);
        process.exit(1);
    });
}

export default OpenWorldCreator;