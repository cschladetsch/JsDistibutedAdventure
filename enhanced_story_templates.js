/**
 * Enhanced Story Templates
 * Rich, engaging story content with diverse themes and narrative structures
 */

export const StoryTemplates = {
    // Mystery/Detective Stories
    mystery: {
        themes: [
            {
                title: "The Vanishing Heir",
                setting: "gothic_mansion",
                description: "A wealthy family's heir has disappeared on the night of their inheritance ceremony.",
                tone: "suspenseful",
                characters: ["suspicious_butler", "grieving_widow", "ambitious_lawyer", "mysterious_stranger"]
            },
            {
                title: "Digital Shadows",
                setting: "cyber_office",
                description: "Corporate secrets are being leaked through an impossible security breach.",
                tone: "tech_noir",
                characters: ["paranoid_ceo", "hacker_informant", "security_chief", "whistleblower"]
            },
            {
                title: "The Lighthouse Keeper's Secret",
                setting: "coastal_lighthouse",
                description: "Ships have been mysteriously wrecking near an automated lighthouse.",
                tone: "maritime_gothic",
                characters: ["old_fisherman", "coast_guard_captain", "marine_biologist", "local_historian"]
            }
        ]
    },

    // Fantasy Adventures
    fantasy: {
        themes: [
            {
                title: "The Shattered Crown",
                setting: "war_torn_kingdom",
                description: "Ancient magic has fractured the royal crown, splitting the realm into warring territories.",
                tone: "epic_fantasy",
                characters: ["exiled_prince", "war_mage", "dragon_rider", "prophecy_keeper"]
            },
            {
                title: "Echoes of the Void",
                setting: "floating_islands",
                description: "Reality tears are spreading across the sky realms, threatening all existence.",
                tone: "surreal_fantasy",
                characters: ["void_touched_sage", "sky_pirate_captain", "elemental_guardian", "lost_god"]
            },
            {
                title: "The Last Alchemist",
                setting: "steampunk_city",
                description: "Magic is dying as technology rises, but one alchemist holds the key to balance.",
                tone: "steampunk_fantasy",
                characters: ["inventor_rival", "mechanical_familiar", "guild_master", "ancient_spirit"]
            }
        ]
    },

    // Sci-Fi Adventures
    scifi: {
        themes: [
            {
                title: "Quantum Entanglement",
                setting: "space_station",
                description: "A quantum experiment has connected your consciousness to multiple realities.",
                tone: "hard_scifi",
                characters: ["quantum_physicist", "ai_consciousness", "parallel_self", "reality_guardian"]
            },
            {
                title: "The Terraforming Crisis",
                setting: "alien_planet",
                description: "Your colony ship's terraforming equipment is malfunctioning, and time is running out.",
                tone: "survival_scifi",
                characters: ["chief_engineer", "xenobiologist", "colonial_leader", "native_entity"]
            },
            {
                title: "Memory Merchants",
                setting: "cyberpunk_city",
                description: "In a world where memories can be traded, you've discovered your past was stolen.",
                tone: "cyberpunk",
                characters: ["memory_dealer", "neural_hacker", "corporate_agent", "lost_love"]
            }
        ]
    },

    // Horror/Thriller
    horror: {
        themes: [
            {
                title: "The Whispering Woods",
                setting: "haunted_forest",
                description: "Campers have been disappearing, and the trees seem to move when no one's watching.",
                tone: "psychological_horror",
                characters: ["park_ranger", "local_shaman", "missing_person", "forest_entity"]
            },
            {
                title: "Midnight Broadcast",
                setting: "abandoned_radio_station",
                description: "A pirate radio signal is broadcasting from a station closed for decades.",
                tone: "supernatural_thriller",
                characters: ["radio_enthusiast", "former_dj", "station_owner", "voice_from_beyond"]
            },
            {
                title: "The Collector",
                setting: "suburban_neighborhood",
                description: "Perfect families are disappearing from their homes, leaving no trace behind.",
                tone: "domestic_horror",
                characters: ["concerned_neighbor", "investigating_detective", "family_member", "the_collector"]
            }
        ]
    },

    // Adventure/Exploration
    adventure: {
        themes: [
            {
                title: "The Sunken Expedition",
                setting: "underwater_ruins",
                description: "An ancient civilization lies beneath the waves, holding secrets of a lost technology.",
                tone: "aquatic_adventure",
                characters: ["marine_archaeologist", "deep_sea_guide", "treasure_hunter", "guardian_creature"]
            },
            {
                title: "Sky Pirates of Aethros",
                setting: "floating_continents",
                description: "Airship pirates threaten the sky cities, but their motives aren't what they seem.",
                tone: "swashbuckling",
                characters: ["pirate_captain", "sky_merchant", "air_navy_commander", "wind_spirit"]
            },
            {
                title: "The Infinite Library",
                setting: "interdimensional_library",
                description: "You've discovered a library that contains every book that could ever exist.",
                tone: "philosophical_adventure",
                characters: ["head_librarian", "book_hunter", "reality_author", "knowledge_seeker"]
            }
        ]
    },

    // Romance/Drama
    romance: {
        themes: [
            {
                title: "Letters Across Time",
                setting: "historic_mansion",
                description: "You've found love letters that seem to respond when you write back to them.",
                tone: "time_spanning_romance",
                characters: ["past_lover", "current_descendant", "time_guardian", "rival_suitor"]
            },
            {
                title: "The Dance of Stars",
                setting: "space_cruise_ship",
                description: "A luxury space liner becomes the setting for unexpected romance among the stars.",
                tone: "space_romance",
                characters: ["mysterious_passenger", "ship_captain", "entertainment_director", "alien_diplomat"]
            },
            {
                title: "Second Chances",
                setting: "small_town",
                description: "Returning to your hometown, you reconnect with someone from your past.",
                tone: "contemporary_romance",
                characters: ["childhood_friend", "high_school_love", "town_newcomer", "local_business_owner"]
            }
        ]
    }
};

export const NarrativeStructures = {
    threePart: {
        act1: { percentage: 25, focus: "setup_and_hook" },
        act2: { percentage: 50, focus: "conflict_and_development" },
        act3: { percentage: 25, focus: "climax_and_resolution" }
    },

    heroJourney: {
        ordinary_world: { percentage: 10, focus: "establish_normalcy" },
        call_to_adventure: { percentage: 15, focus: "inciting_incident" },
        refusal_of_call: { percentage: 5, focus: "reluctance_and_doubt" },
        meeting_mentor: { percentage: 10, focus: "guidance_and_preparation" },
        crossing_threshold: { percentage: 15, focus: "entering_new_world" },
        tests_and_trials: { percentage: 25, focus: "challenges_and_growth" },
        ordeal: { percentage: 10, focus: "greatest_fear_or_challenge" },
        reward: { percentage: 5, focus: "gaining_treasure_or_knowledge" },
        road_back: { percentage: 5, focus: "return_journey_begins" }
    },

    mystery: {
        inciting_incident: { percentage: 15, focus: "crime_or_mystery_occurs" },
        investigation_begins: { percentage: 20, focus: "gathering_clues" },
        first_revelation: { percentage: 15, focus: "important_discovery" },
        complications: { percentage: 25, focus: "obstacles_and_red_herrings" },
        final_clue: { percentage: 10, focus: "breakthrough_moment" },
        confrontation: { percentage: 10, focus: "revealing_truth" },
        resolution: { percentage: 5, focus: "aftermath_and_justice" }
    }
};

export const CharacterArchetypes = {
    protagonist: [
        {
            name: "The Reluctant Hero",
            traits: ["brave", "self_doubting", "moral", "protective"],
            motivation: "Forced into action by circumstances",
            flaw: "Lacks confidence in their abilities"
        },
        {
            name: "The Seeker",
            traits: ["curious", "determined", "intelligent", "obsessive"],
            motivation: "Driven to uncover truth or knowledge",
            flaw: "Puts quest above relationships"
        },
        {
            name: "The Survivor",
            traits: ["resourceful", "pragmatic", "cautious", "experienced"],
            motivation: "Overcome past trauma or hardship",
            flaw: "Difficulty trusting others"
        }
    ],

    ally: [
        {
            name: "The Wise Mentor",
            traits: ["knowledgeable", "patient", "mysterious", "caring"],
            role: "Guides and teaches the protagonist",
            secrets: "Hidden connection to the main conflict"
        },
        {
            name: "The Loyal Companion",
            traits: ["faithful", "brave", "humorous", "supportive"],
            role: "Provides emotional support and practical help",
            secrets: "May have their own hidden agenda"
        },
        {
            name: "The Reformed Rival",
            traits: ["competitive", "skilled", "proud", "honorable"],
            role: "Starts as opposition, becomes valuable ally",
            secrets: "Shares common enemy with protagonist"
        }
    ],

    antagonist: [
        {
            name: "The Corrupted Idealist",
            traits: ["charismatic", "intelligent", "ruthless", "tragic"],
            motivation: "Believes their methods serve a greater good",
            weakness: "Blind to the harm they cause"
        },
        {
            name: "The Shadow Self",
            traits: ["similar_to_hero", "tempting", "knowledgeable", "dark"],
            motivation: "Represents what the hero could become",
            weakness: "Lacks the hero's moral foundation"
        },
        {
            name: "The Ancient Evil",
            traits: ["powerful", "patient", "manipulative", "timeless"],
            motivation: "Seeks to reclaim lost power or realm",
            weakness: "Doesn't understand the modern world"
        }
    ]
};

export const StoryMoods = {
    atmospheric: {
        descriptions: [
            "The air hangs heavy with unspoken secrets",
            "Shadows dance in the flickering candlelight",
            "A chill wind carries whispers of the past",
            "The silence is broken only by distant echoes"
        ],
        sensory_details: [
            "The scent of old parchment and forgotten dreams",
            "Cold stone beneath trembling fingertips",
            "The taste of copper and fear on the tongue",
            "Muffled sounds that seem to come from everywhere and nowhere"
        ]
    },

    action_packed: {
        descriptions: [
            "Time slows as adrenaline surges through your veins",
            "The ground shakes with the force of the impact",
            "Sparks fly as metal clashes against metal",
            "Your heart pounds as you leap into the fray"
        ],
        sensory_details: [
            "The sharp crack of breaking barriers",
            "Heat radiating from explosions all around",
            "The bitter taste of smoke and determination",
            "Blood rushing in your ears as you fight"
        ]
    },

    romantic: {
        descriptions: [
            "Your eyes meet across the crowded room",
            "A gentle touch that sends electricity through your soul",
            "Words left unspoken hang in the air between you",
            "The world fades away, leaving only this moment"
        ],
        sensory_details: [
            "The soft fragrance of blooming flowers",
            "Warmth spreading from intertwined fingers",
            "The sweet taste of anticipation",
            "A melody that speaks to your heart"
        ]
    },

    mysterious: {
        descriptions: [
            "Nothing is quite as it seems in this place",
            "Hidden doors reveal themselves to the observant",
            "Every answer leads to three new questions",
            "The truth lies buried beneath layers of deception"
        ],
        sensory_details: [
            "The musty smell of long-kept secrets",
            "Surfaces that feel different than they appear",
            "A metallic taste that hints at danger",
            "Sounds that don't match their apparent sources"
        ]
    }
};

export default { StoryTemplates, NarrativeStructures, CharacterArchetypes, StoryMoods };