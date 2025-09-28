/**
 * Open World Story Generator
 * Creates stories with main quest lines, side quests, and free exploration
 */

import { StorySystem, Story, Page, Prompt } from './StorySystem.js';

export class OpenWorldGenerator {
    constructor() {
        this.storySystem = new StorySystem();
        this.worldMap = {};
        this.mainQuests = [];
        this.sideQuests = [];
        this.locations = [];
        this.npcs = [];
        this.worldState = {
            playerLevel: 1,
            mainQuestProgress: 0,
            completedSideQuests: [],
            discoveredLocations: [],
            reputation: {},
            worldFlags: []
        };
    }

    /**
     * Generates a complete open world story
     */
    async generateOpenWorld(theme = 'fantasy_kingdom') {
        console.log('🌍 Generating open world story...');

        const worldThemes = {
            fantasy_kingdom: {
                title: "The Shattered Realm",
                mainQuest: "Restore the Ancient Crown",
                setting: "A magical kingdom torn by civil war",
                locations: ['capital_city', 'ancient_forest', 'mountain_pass', 'coastal_village', 'ruined_temple', 'wizard_tower', 'bandit_camp', 'dragon_lair']
            },
            space_station: {
                title: "Nexus Seven",
                mainQuest: "Prevent the Station's Destruction",
                setting: "A massive space station hub between galaxies",
                locations: ['command_center', 'trading_deck', 'residential_sector', 'engineering_bay', 'docking_bays', 'alien_quarter', 'research_labs', 'security_station']
            },
            post_apocalyptic: {
                title: "After the Fall",
                mainQuest: "Rebuild Civilization",
                setting: "Earth after a global catastrophe",
                locations: ['survivor_settlement', 'ruined_city', 'wasteland', 'underground_bunker', 'radio_tower', 'abandoned_mall', 'military_base', 'research_facility']
            }
        };

        const selectedTheme = worldThemes[theme] || worldThemes.fantasy_kingdom;

        // Create the main story structure
        const story = this.storySystem.createStory(
            `open_world_${theme}_${Date.now()}`,
            selectedTheme.title,
            'world_hub'
        );

        // Enable quest system
        story.quest_system_enabled = true;
        story.game_state = this.initializeGameState();

        // Generate world locations
        this.generateWorldLocations(story, selectedTheme);

        // Create main quest line
        this.generateMainQuests(story, selectedTheme);

        // Create side quests
        this.generateSideQuests(story, selectedTheme);

        // Create the world hub (central navigation)
        this.createWorldHub(story, selectedTheme);

        // Link everything together
        this.linkWorldContent(story);

        console.log(`✨ Open world "${story.title}" created!`);
        console.log(`📍 Locations: ${selectedTheme.locations.length}`);
        console.log(`🎯 Main Quests: ${this.mainQuests.length}`);
        console.log(`📋 Side Quests: ${this.sideQuests.length}`);

        return story;
    }

    /**
     * Initialize game state for open world
     */
    initializeGameState() {
        return {
            player_stats: {
                level: 1,
                experience: 0,
                health: 100,
                maxHealth: 100,
                mana: 50,
                maxMana: 50,
                gold: 100,
                strength: 10,
                dexterity: 10,
                intelligence: 10,
                wisdom: 10,
                charisma: 10
            },
            inventory: ['Basic Sword', 'Leather Armor', 'Health Potion'],
            story_flags: [],
            active_quests: [],
            completed_quests: [],
            discovered_locations: ['world_hub'],
            reputation: {
                'royal_guard': 0,
                'merchants_guild': 0,
                'thieves_guild': 0,
                'mages_circle': 0
            },
            world_state: {
                time_of_day: 'morning',
                weather: 'clear',
                main_quest_stage: 0
            }
        };
    }

    /**
     * Generate world locations
     */
    generateWorldLocations(story, theme) {
        const locationTemplates = {
            fantasy_kingdom: {
                capital_city: {
                    name: "Royal Capital of Aethermoor",
                    description: "A bustling city with towering spires and busy markets. The royal castle looms over everything.",
                    npcs: ['king', 'royal_guard_captain', 'merchant_leader', 'court_wizard'],
                    features: ['castle', 'market', 'tavern', 'temple'],
                    quests: ['throne_room_audience', 'market_investigation', 'tavern_rumors']
                },
                ancient_forest: {
                    name: "Whisperwind Forest",
                    description: "Ancient trees stretch skyward, their branches forming a canopy that filters sunlight into dancing patterns.",
                    npcs: ['forest_guardian', 'hermit_sage', 'lost_traveler'],
                    features: ['sacred_grove', 'hidden_glade', 'old_ruins'],
                    quests: ['forest_corruption', 'missing_herbs', 'ancient_spirit']
                },
                coastal_village: {
                    name: "Saltmere Harbor",
                    description: "A fishing village where the smell of salt and fish mingles with sea breezes. Ships from distant lands dock here.",
                    npcs: ['harbor_master', 'old_fisherman', 'foreign_trader'],
                    features: ['docks', 'lighthouse', 'fishing_boats'],
                    quests: ['sea_monster', 'smuggling_ring', 'lost_cargo']
                },
                wizard_tower: {
                    name: "Arcanum Spire",
                    description: "A impossibly tall tower that seems to pierce the clouds. Magical energy crackles around its peak.",
                    npcs: ['archmage', 'apprentice_mage', 'magical_construct'],
                    features: ['spell_library', 'alchemy_lab', 'scrying_chamber'],
                    quests: ['magical_research', 'tower_defense', 'arcane_mystery']
                }
            }
        };

        const locations = locationTemplates[theme.setting] || locationTemplates.fantasy_kingdom;

        theme.locations.forEach(locationId => {
            if (locations[locationId]) {
                this.createLocation(story, locationId, locations[locationId]);
            } else {
                // Generate generic location
                this.createGenericLocation(story, locationId);
            }
        });
    }

    /**
     * Create a detailed location
     */
    createLocation(story, locationId, locationData) {
        const page = new Page(locationId, this.generateLocationText(locationData));
        page.setBackground(locationId);

        // Add location metadata
        page.location_data = locationData;
        page.npcs = locationData.npcs || [];
        page.features = locationData.features || [];
        page.available_quests = locationData.quests || [];

        // Add standard location actions
        page.addPrompt("Explore this area thoroughly", `explore_${locationId}`);
        page.addPrompt("Talk to locals", `talk_${locationId}`);
        page.addPrompt("Return to world map", "world_hub");

        // Add feature-specific actions
        locationData.features?.forEach(feature => {
            page.addPrompt(`Visit the ${feature}`, `${locationId}_${feature}`);
        });

        // Add quest triggers
        locationData.quests?.forEach(questId => {
            page.addPrompt(`Check for available tasks`, `quest_${questId}`);
        });

        story.addPage(page);

        // Create sub-pages for features
        this.createLocationFeatures(story, locationId, locationData);
    }

    /**
     * Generate immersive location text
     */
    generateLocationText(locationData) {
        const atmosphereTexts = [
            "The atmosphere here is charged with possibility and adventure.",
            "You sense that important events have unfolded in this place.",
            "There's a feeling that this location holds secrets waiting to be discovered.",
            "The air seems to whisper of tales both ancient and yet to be written."
        ];

        const npcText = locationData.npcs?.length > 0 ?
            ` You notice ${locationData.npcs.length} people who might have important information or tasks.` :
            "";

        const featureText = locationData.features?.length > 0 ?
            ` Several notable features catch your attention: ${locationData.features.join(', ')}.` :
            "";

        return `${locationData.description}\n\n${this.randomChoice(atmosphereTexts)}${npcText}${featureText}`;
    }

    /**
     * Create sub-pages for location features
     */
    createLocationFeatures(story, locationId, locationData) {
        // Exploration page
        const explorePage = new Page(
            `explore_${locationId}`,
            `You carefully explore ${locationData.name}, discovering hidden details and gathering information about the area.`
        );
        explorePage.addPrompt("Continue exploring", `explore_${locationId}_deep`);
        explorePage.addPrompt("Return to main area", locationId);
        story.addPage(explorePage);

        // Talk to locals page
        const talkPage = new Page(
            `talk_${locationId}`,
            this.generateNPCInteractionText(locationData)
        );
        talkPage.addPrompt("Ask about local events", `rumors_${locationId}`);
        talkPage.addPrompt("Inquire about quests", `quest_board_${locationId}`);
        talkPage.addPrompt("Return to area", locationId);
        story.addPage(talkPage);

        // Feature pages
        locationData.features?.forEach(feature => {
            const featurePage = new Page(
                `${locationId}_${feature}`,
                this.generateFeatureText(feature, locationData.name)
            );
            featurePage.addPrompt("Investigate further", `${locationId}_${feature}_detail`);
            featurePage.addPrompt("Return to main area", locationId);
            story.addPage(featurePage);
        });
    }

    /**
     * Generate main quest line
     */
    generateMainQuests(story, theme) {
        const mainQuestTemplates = {
            fantasy_kingdom: [
                {
                    id: 'crown_fragment_1',
                    title: 'The First Fragment',
                    description: 'Discover the location of the first crown fragment in the Ancient Forest.',
                    location: 'ancient_forest',
                    requirements: { level: 1 },
                    rewards: { experience: 500, gold: 200, items: ['Crown Fragment 1'] }
                },
                {
                    id: 'crown_fragment_2',
                    title: 'The Sunken Fragment',
                    description: 'Retrieve the second crown fragment from the depths near Saltmere Harbor.',
                    location: 'coastal_village',
                    requirements: { level: 3, items: ['Crown Fragment 1'] },
                    rewards: { experience: 750, gold: 300, items: ['Crown Fragment 2'] }
                },
                {
                    id: 'crown_fragment_3',
                    title: 'The Arcane Fragment',
                    description: 'Seek the final crown fragment in the Wizard Tower archives.',
                    location: 'wizard_tower',
                    requirements: { level: 5, items: ['Crown Fragment 1', 'Crown Fragment 2'] },
                    rewards: { experience: 1000, gold: 500, items: ['Crown Fragment 3'] }
                },
                {
                    id: 'restore_crown',
                    title: 'The Crown Reborn',
                    description: 'Restore the Ancient Crown and bring peace to the realm.',
                    location: 'capital_city',
                    requirements: { level: 7, items: ['Crown Fragment 1', 'Crown Fragment 2', 'Crown Fragment 3'] },
                    rewards: { experience: 2000, gold: 1000, items: ['Ancient Crown'], story_flags: ['crown_restored'] }
                }
            ]
        };

        const quests = mainQuestTemplates[theme.setting] || mainQuestTemplates.fantasy_kingdom;

        quests.forEach((questData, index) => {
            this.createMainQuest(story, questData, index);
            this.mainQuests.push(questData);
        });

        // Add to story quest system
        story.side_quests = story.side_quests || {};
        quests.forEach(quest => {
            story.side_quests[quest.id] = {
                ...quest,
                type: 'main',
                status: index === 0 ? 'available' : 'locked',
                objectives: [
                    {
                        id: `${quest.id}_objective`,
                        description: quest.description,
                        required_progress: 1,
                        current_progress: 0,
                        completed: false
                    }
                ]
            };
        });
    }

    /**
     * Generate side quests
     */
    generateSideQuests(story, theme) {
        const sideQuestTemplates = {
            fantasy_kingdom: [
                {
                    id: 'merchant_troubles',
                    title: 'Merchant Guild Problems',
                    description: 'Help the merchants deal with increased bandit attacks on trade routes.',
                    location: 'capital_city',
                    giver: 'merchant_leader',
                    requirements: { level: 2 },
                    rewards: { experience: 300, gold: 150, reputation: { merchants_guild: 10 } }
                },
                {
                    id: 'forest_corruption',
                    title: 'The Corrupted Grove',
                    description: 'Investigate the dark magic spreading through Whisperwind Forest.',
                    location: 'ancient_forest',
                    giver: 'forest_guardian',
                    requirements: { level: 3 },
                    rewards: { experience: 400, gold: 100, items: ['Nature\'s Blessing'] }
                },
                {
                    id: 'lighthouse_mystery',
                    title: 'The Dark Lighthouse',
                    description: 'Find out why the lighthouse at Saltmere Harbor has gone dark.',
                    location: 'coastal_village',
                    giver: 'harbor_master',
                    requirements: { level: 2 },
                    rewards: { experience: 350, gold: 200, reputation: { coastal_folk: 15 } }
                },
                {
                    id: 'apprentice_test',
                    title: 'The Mage\'s Trial',
                    description: 'Help a young apprentice pass their magical examination.',
                    location: 'wizard_tower',
                    giver: 'apprentice_mage',
                    requirements: { intelligence: 15 },
                    rewards: { experience: 250, items: ['Spell Scroll', 'Magic Ring'] }
                },
                {
                    id: 'bandit_leader',
                    title: 'The Bandit King',
                    description: 'Defeat the notorious bandit leader terrorizing travelers.',
                    location: 'bandit_camp',
                    giver: 'royal_guard_captain',
                    requirements: { level: 4 },
                    rewards: { experience: 600, gold: 400, items: ['Bandit Leader\'s Sword'] }
                },
                {
                    id: 'lost_heirloom',
                    title: 'Family Heirloom',
                    description: 'Recover a family heirloom stolen by thieves.',
                    location: 'capital_city',
                    giver: 'worried_noble',
                    requirements: { level: 1 },
                    rewards: { experience: 200, gold: 100 }
                }
            ]
        };

        const quests = sideQuestTemplates[theme.setting] || sideQuestTemplates.fantasy_kingdom;

        quests.forEach(questData => {
            this.createSideQuest(story, questData);
            this.sideQuests.push(questData);
        });

        // Add to story quest system
        story.side_quests = story.side_quests || {};
        quests.forEach(quest => {
            story.side_quests[quest.id] = {
                ...quest,
                type: 'side',
                status: 'available',
                objectives: [
                    {
                        id: `${quest.id}_objective`,
                        description: quest.description,
                        required_progress: 1,
                        current_progress: 0,
                        completed: false
                    }
                ]
            };
        });
    }

    /**
     * Create world hub (central navigation)
     */
    createWorldHub(story, theme) {
        const hubPage = new Page(
            'world_hub',
            `Welcome to ${theme.title}! ${theme.setting}\n\nFrom here, you can travel to any discovered location, check your quests, or explore new areas. The world is vast and full of opportunities for adventure.`
        );

        hubPage.setBackground('world_map');

        // Add travel options
        hubPage.addPrompt("📍 View World Map", "world_map");
        hubPage.addPrompt("📋 Check Quest Log", "quest_log");
        hubPage.addPrompt("📊 View Character Status", "character_status");
        hubPage.addPrompt("🎒 Manage Inventory", "inventory_management");

        // Add location travel options
        theme.locations.forEach(locationId => {
            const locationName = this.formatLocationName(locationId);
            hubPage.addPrompt(`🗺️ Travel to ${locationName}`, locationId);
        });

        // Add exploration option
        hubPage.addPrompt("🔍 Explore Unknown Areas", "random_exploration");

        story.addPage(hubPage);

        // Create supporting hub pages
        this.createHubPages(story);
    }

    /**
     * Create supporting pages for the hub
     */
    createHubPages(story) {
        // World Map page
        const mapPage = new Page(
            'world_map',
            'The world map shows all locations you\'ve discovered. Some areas remain shrouded in mystery, waiting to be explored.'
        );
        mapPage.addPrompt("Return to Hub", "world_hub");
        story.addPage(mapPage);

        // Quest Log page
        const questPage = new Page(
            'quest_log',
            'Your active quests and completed adventures are tracked here. Main quests advance the story, while side quests offer additional rewards and experiences.'
        );
        questPage.addPrompt("View Main Quests", "main_quest_details");
        questPage.addPrompt("View Side Quests", "side_quest_details");
        questPage.addPrompt("Return to Hub", "world_hub");
        story.addPage(questPage);

        // Random exploration
        const explorationPage = new Page(
            'random_exploration',
            'You venture into uncharted territory, never knowing what you might discover. Adventure awaits in the unknown!'
        );
        explorationPage.addPrompt("Explore the wilderness", "wilderness_encounter");
        explorationPage.addPrompt("Search for hidden locations", "hidden_location_search");
        explorationPage.addPrompt("Return safely", "world_hub");
        story.addPage(explorationPage);
    }

    /**
     * Create main quest page
     */
    createMainQuest(story, questData, index) {
        const questPage = new Page(
            `main_quest_${questData.id}`,
            `Main Quest: ${questData.title}\n\n${questData.description}\n\nThis quest is essential to your main journey. Completing it will advance the story and unlock new possibilities.`
        );

        if (index === 0) {
            questPage.addPrompt("Accept this quest", `accept_quest_${questData.id}`);
        } else {
            questPage.addPrompt("Quest locked - complete previous quests first", "quest_log");
        }

        questPage.addPrompt("Return to quest log", "quest_log");
        story.addPage(questPage);

        // Create quest accept page
        const acceptPage = new Page(
            `accept_quest_${questData.id}`,
            `You have accepted the quest: ${questData.title}\n\nObjective: ${questData.description}\n\nTravel to ${questData.location} to begin this quest.`
        );
        acceptPage.addPrompt(`Travel to ${this.formatLocationName(questData.location)}`, questData.location);
        acceptPage.addPrompt("Return to hub", "world_hub");
        story.addPage(acceptPage);
    }

    /**
     * Create side quest page
     */
    createSideQuest(story, questData) {
        const questPage = new Page(
            `side_quest_${questData.id}`,
            `Side Quest: ${questData.title}\n\n${questData.description}\n\nQuest Giver: ${questData.giver}\nLocation: ${this.formatLocationName(questData.location)}\n\nThis optional quest offers valuable rewards and experiences.`
        );

        questPage.addPrompt("Accept this quest", `accept_side_quest_${questData.id}`);
        questPage.addPrompt("Decline quest", "quest_log");
        story.addPage(questPage);

        // Create quest accept page
        const acceptPage = new Page(
            `accept_side_quest_${questData.id}`,
            `You have accepted the side quest: ${questData.title}\n\n${questData.description}\n\nSpeak with ${questData.giver} at ${this.formatLocationName(questData.location)} to get started.`
        );
        acceptPage.addPrompt(`Travel to ${this.formatLocationName(questData.location)}`, questData.location);
        acceptPage.addPrompt("Return to hub", "world_hub");
        story.addPage(acceptPage);
    }

    /**
     * Link world content together
     */
    linkWorldContent(story) {
        // Ensure all pages can return to hub
        Object.values(story.pages).forEach(page => {
            if (!page.prompts.some(p => p.target_id === 'world_hub')) {
                page.addPrompt("🏠 Return to World Hub", "world_hub");
            }
        });
    }

    /**
     * Helper methods
     */
    randomChoice(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    formatLocationName(locationId) {
        return locationId.split('_').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    generateNPCInteractionText(locationData) {
        const npcCount = locationData.npcs?.length || 0;
        if (npcCount === 0) {
            return "This area seems quiet today. You don't see anyone around to talk to.";
        }

        return `You approach the locals in ${locationData.name}. ${npcCount} people are willing to talk with you. They might have information about quests, local events, or useful advice.`;
    }

    generateFeatureText(feature, locationName) {
        const featureDescriptions = {
            castle: "The magnificent castle towers above you, its ancient stones telling stories of kings and legends.",
            market: "The bustling marketplace is filled with merchants, exotic goods, and the sounds of commerce.",
            tavern: "The warm tavern welcomes you with the scent of hearty food and the sound of friendly conversation.",
            temple: "Sacred architecture reaches toward the heavens, inspiring reverence and peace.",
            sacred_grove: "Ancient trees form a natural cathedral, their branches whispering with mystical energy.",
            docks: "Ships from distant lands bob in the harbor while workers load and unload precious cargo.",
            lighthouse: "The tall lighthouse stands sentinel against storms, its beacon guiding travelers safely home."
        };

        return featureDescriptions[feature] || `You examine the ${feature} at ${locationName}, noting its unique characteristics and potential significance.`;
    }

    createGenericLocation(story, locationId) {
        const page = new Page(
            locationId,
            `You arrive at ${this.formatLocationName(locationId)}. This area holds mysteries and opportunities for the observant traveler.`
        );
        page.addPrompt("Explore thoroughly", `explore_${locationId}`);
        page.addPrompt("Return to world hub", "world_hub");
        story.addPage(page);
    }
}

export default OpenWorldGenerator;