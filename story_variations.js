/**
 * Story Variations - Specific themed stories for different moods and preferences
 */

export const StoryVariations = {
    // Quick Adventure Stories (5-10 minutes)
    quickAdventures: [
        {
            title: "The Clockwork Heart",
            theme: "steampunk_romance",
            pages: {
                start: {
                    text: "In the brass-filled workshop, you discover a mechanical heart that beats with real emotion. Its creator, a brilliant inventor, watches you with hopeful eyes.",
                    background: "steampunk_workshop",
                    choices: [
                        { text: "Ask about the heart's purpose", target: "learn_purpose" },
                        { text: "Offer to help with the invention", target: "partnership" },
                        { text: "Question the ethics of artificial emotion", target: "moral_dilemma" }
                    ]
                },
                learn_purpose: {
                    text: "The inventor explains that the heart is meant to restore feeling to those who have lost the capacity to love. But the final test requires someone willing to trust completely.",
                    background: "workshop_explanation",
                    choices: [
                        { text: "Volunteer for the test", target: "brave_choice" },
                        { text: "Suggest finding another volunteer", target: "cautious_path" },
                        { text: "Propose alternative testing methods", target: "scientific_approach" }
                    ]
                },
                partnership: {
                    text: "Working together, your hands touch while adjusting delicate gears. The inventor's eyes meet yours, and you realize the heart isn't the only thing developing feelings.",
                    background: "romantic_workshop",
                    choices: [
                        { text: "Express your growing attraction", target: "confession" },
                        { text: "Focus on the work", target: "professional" },
                        { text: "Test the heart's effects on yourself", target: "self_experiment" }
                    ]
                },
                moral_dilemma: {
                    text: "Your questions spark a deep conversation about consciousness, free will, and the nature of love itself. The inventor's passion for their work is both admirable and concerning.",
                    background: "philosophical_debate",
                    choices: [
                        { text: "Support their vision", target: "support_innovation" },
                        { text: "Express your concerns", target: "voice_doubts" },
                        { text: "Suggest finding a compromise", target: "middle_ground" }
                    ]
                }
            }
        },
        {
            title: "Messages from the Deep",
            theme: "underwater_mystery",
            pages: {
                start: {
                    text: "Your deep-sea research station receives a transmission from the Mariana Trench - coordinates to something that shouldn't exist at that depth.",
                    background: "underwater_station",
                    choices: [
                        { text: "Launch immediate investigation", target: "dive_deep" },
                        { text: "Analyze the transmission first", target: "research_signal" },
                        { text: "Contact surface authorities", target: "call_backup" }
                    ]
                },
                dive_deep: {
                    text: "Descending into crushing darkness, your submersible's lights reveal structures that defy explanation - geometric patterns too perfect to be natural.",
                    background: "abyssal_discovery",
                    choices: [
                        { text: "Approach the structures", target: "investigate_ruins" },
                        { text: "Document from a distance", target: "careful_observation" },
                        { text: "Try to communicate", target: "attempt_contact" }
                    ]
                },
                research_signal: {
                    text: "The transmission contains mathematical sequences that spell out star maps - but these constellations won't be visible from Earth for thousands of years.",
                    background: "analysis_room",
                    choices: [
                        { text: "Search for the signal's origin", target: "trace_source" },
                        { text: "Decode more of the message", target: "deeper_analysis" },
                        { text: "Prepare for long-term monitoring", target: "establish_watch" }
                    ]
                }
            }
        }
    ],

    // Character-Driven Dramas (15-25 minutes)
    characterDramas: [
        {
            title: "The Memory Thief",
            theme: "psychological_scifi",
            pages: {
                start: {
                    text: "You wake up in a pristine white room with no memory of how you got there. A woman in a lab coat smiles sadly and says, 'I'm sorry, but we had to take them. Your memories were killing you.'",
                    background: "medical_facility",
                    choices: [
                        { text: "Demand your memories back", target: "angry_confrontation" },
                        { text: "Ask what memories were so dangerous", target: "seek_truth" },
                        { text: "Thank her for saving you", target: "grateful_acceptance" }
                    ]
                },
                seek_truth: {
                    text: "She shows you brain scans - dark spots spreading like cancer through your neural pathways. 'These traumatic memories were literally eating away at your mind. But removing them... changed who you are.'",
                    background: "brain_scan_room",
                    choices: [
                        { text: "Ask to see what was removed", target: "view_extraction" },
                        { text: "Question if you're still yourself", target: "identity_crisis" },
                        { text: "Inquire about reversing the process", target: "restoration_query" }
                    ]
                },
                identity_crisis: {
                    text: "Looking in the mirror, you see a stranger wearing your face. Every emotion feels muted, every reaction calculated. Are you still human without your pain?",
                    background: "reflection_chamber",
                    choices: [
                        { text: "Embrace this new, painless existence", target: "accept_change" },
                        { text: "Fight to reclaim your lost self", target: "struggle_for_identity" },
                        { text: "Search for a balance between versions", target: "find_middle_path" }
                    ]
                }
            }
        },
        {
            title: "The Last Letter",
            theme: "historical_romance",
            pages: {
                start: {
                    text: "While renovating your grandmother's attic, you discover a hidden compartment containing love letters from 1943. The last one is unfinished, ink still wet despite the decades.",
                    background: "dusty_attic",
                    choices: [
                        { text: "Read all the letters chronologically", target: "full_story" },
                        { text: "Focus on the unfinished letter", target: "mystery_letter" },
                        { text: "Research the letter's author", target: "investigate_writer" }
                    ]
                },
                full_story: {
                    text: "The letters tell of a passionate wartime romance between your grandmother and a soldier named James. Their love was forbidden, their meetings secret, their future uncertain.",
                    background: "letter_montage",
                    choices: [
                        { text: "Search for James or his family", target: "find_james" },
                        { text: "Confront your grandmother", target: "family_secrets" },
                        { text: "Complete the unfinished letter", target: "finish_story" }
                    ]
                },
                mystery_letter: {
                    text: "The unfinished letter speaks of a choice - between duty and love, between family honor and personal happiness. The pen lies beside it as if waiting for someone to complete it.",
                    background: "unfinished_letter_closeup",
                    choices: [
                        { text: "Complete the letter as you think it should end", target: "write_ending" },
                        { text: "Leave it unfinished as intended", target: "preserve_mystery" },
                        { text: "Ask your grandmother to finish it", target: "grandmother_completion" }
                    ]
                }
            }
        }
    ],

    // Epic Adventures (30+ minutes)
    epicAdventures: [
        {
            title: "Guardians of the Infinite Library",
            theme: "multiverse_fantasy",
            pages: {
                start: {
                    text: "You step through a shimmering portal and find yourself in an impossible library where every book that has been, is, or could be written exists on infinite shelves stretching beyond sight.",
                    background: "infinite_library",
                    choices: [
                        { text: "Seek the Head Librarian", target: "meet_librarian" },
                        { text: "Explore the nearest section", target: "browse_books" },
                        { text: "Look for books about yourself", target: "self_discovery" }
                    ]
                },
                meet_librarian: {
                    text: "The Head Librarian is an ancient being whose eyes hold the wisdom of countless stories. 'Welcome, new Guardian. The library is under siege by the Erasers - beings who seek to unmake stories themselves.'",
                    background: "librarian_chamber",
                    choices: [
                        { text: "Accept the role of Guardian", target: "accept_responsibility" },
                        { text: "Ask about the Erasers' motivation", target: "understand_enemy" },
                        { text: "Inquire about other Guardians", target: "meet_allies" }
                    ]
                },
                browse_books: {
                    text: "You discover books that shouldn't exist - the autobiography of a dragon, love poems by artificial intelligences, history books from timelines that never were. Each book pulses with its own reality.",
                    background: "magical_books",
                    choices: [
                        { text: "Open the dragon's autobiography", target: "dragon_story" },
                        { text: "Read the AI love poems", target: "artificial_emotions" },
                        { text: "Study the alternate histories", target: "parallel_worlds" }
                    ]
                },
                understand_enemy: {
                    text: "The Erasers believe that stories create chaos in reality - that infinite possibilities weaken the foundation of existence. They seek to reduce everything to a single, unchanging truth.",
                    background: "philosophy_of_stories",
                    choices: [
                        { text: "Argue for the value of stories", target: "defend_narrative" },
                        { text: "Consider their point of view", target: "question_stories" },
                        { text: "Seek a compromise solution", target: "find_balance" }
                    ]
                }
            }
        }
    ],

    // Horror Stories
    horrorStories: [
        {
            title: "The Smile Plague",
            theme: "psychological_horror",
            pages: {
                start: {
                    text: "It started with your neighbor. She smiled at you yesterday - but the smile never left her face. Now everyone who sees that smile starts smiling too, and they can't stop.",
                    background: "suburban_street",
                    choices: [
                        { text: "Avoid looking at any faces", target: "avoid_contact" },
                        { text: "Investigate the neighbor's house", target: "investigate_source" },
                        { text: "Warn the authorities", target: "call_help" }
                    ]
                },
                avoid_contact: {
                    text: "You navigate the world with your eyes down, but reflections betray you. In every window, every mirror, you catch glimpses of that terrible, never-ending smile spreading from person to person.",
                    background: "mirror_reflections",
                    choices: [
                        { text: "Break all reflective surfaces", target: "destroy_mirrors" },
                        { text: "Find others who are still unaffected", target: "find_survivors" },
                        { text: "Study the pattern of infection", target: "analyze_spread" }
                    ]
                },
                investigate_source: {
                    text: "Your neighbor's house is filled with family photos - but in every picture, every face wears that same impossible smile, even in photos taken decades ago.",
                    background: "photo_filled_house",
                    choices: [
                        { text: "Burn all the photographs", target: "destroy_images" },
                        { text: "Look for the oldest photo", target: "find_origin" },
                        { text: "Take the photos to an expert", target: "seek_analysis" }
                    ]
                }
            }
        }
    ],

    // Comedy Adventures
    comedyStories: [
        {
            title: "The Incompetent Superhero Academy",
            theme: "comedy_superhero",
            pages: {
                start: {
                    text: "Welcome to Hero University, where your superpower is the ability to make incredibly loud kazoo sounds with your mind. Your roommate can turn invisible, but only while sneezing.",
                    background: "quirky_dorm_room",
                    choices: [
                        { text: "Practice your kazoo powers", target: "power_practice" },
                        { text: "Help your roommate with stealth training", target: "teamwork" },
                        { text: "Skip class and explore the campus", target: "explore_campus" }
                    ]
                },
                power_practice: {
                    text: "Your kazoo concert shatters windows across campus and accidentally hypnotizes the Dean's pet hamster. The hamster now follows you everywhere, occasionally saluting.",
                    background: "kazoo_chaos",
                    choices: [
                        { text: "Train the hamster as your sidekick", target: "hamster_partner" },
                        { text: "Try to fix the hamster's condition", target: "cure_hamster" },
                        { text: "Hide from the Dean", target: "avoid_trouble" }
                    ]
                },
                teamwork: {
                    text: "Training together, you discover that your roommate's sneezing can be triggered by your kazoo sounds, creating the world's most ridiculous stealth technique.",
                    background: "training_ground",
                    choices: [
                        { text: "Perfect this combination attack", target: "combo_technique" },
                        { text: "Enter the campus talent show", target: "talent_show" },
                        { text: "Use it to solve actual crimes", target: "vigilante_activities" }
                    ]
                }
            }
        }
    ]
};

export const StoryMoments = {
    // Emotional beats that can be inserted into any story
    emotionalBeats: {
        triumph: [
            "Against all odds, your perseverance pays off in ways you never imagined.",
            "The moment of victory tastes sweeter because of all the struggles that led here.",
            "You realize that the real treasure was the strength you discovered within yourself."
        ],
        loss: [
            "Sometimes the hardest goodbyes are the ones we never get to say.",
            "In losing what you thought you needed, you discover what you truly value.",
            "The absence leaves a space that will always be shaped like what you've lost."
        ],
        wonder: [
            "The universe reveals a secret that makes you feel simultaneously tiny and infinite.",
            "Beauty strikes you speechless in a way that changes how you see everything.",
            "You witness something that reminds you why magic still exists in the world."
        ],
        connection: [
            "In this moment, you understand another soul completely.",
            "Two separate paths converge into something neither could have been alone.",
            "You realize that some bonds transcend words, time, and circumstance."
        ]
    },

    // Philosophical moments for deeper stories
    philosophicalMoments: {
        identity: [
            "If you could change everything about yourself, would you still be you?",
            "Are you the sum of your memories, your choices, or something deeper?",
            "When others define you, do you become their definition or resist it?"
        ],
        morality: [
            "Is doing the right thing still right if it leads to wrong outcomes?",
            "Can a lie told with love be more honest than a painful truth?",
            "Who decides what justice looks like when everyone has suffered?"
        ],
        purpose: [
            "Does meaning come from what we achieve or how we change others?",
            "If your impact outlasts your memory, which one truly matters?",
            "Are we writing our story, or discovering it as we go?"
        ]
    },

    // Relationship dynamics
    relationshipMoments: {
        trust: [
            "They offer their hand without knowing if you'll take it.",
            "In sharing their greatest fear, they give you power over them.",
            "The silence between you speaks louder than words ever could."
        ],
        conflict: [
            "You both want the same thing but see completely different paths to it.",
            "Their strength highlights your weakness, and vice versa.",
            "The distance between you isn't physical - it's philosophical."
        ],
        growth: [
            "Together, you become more than the sum of your individual selves.",
            "They see potential in you that you didn't know existed.",
            "Through their eyes, you learn to forgive your past self."
        ]
    }
};

export default { StoryVariations, StoryMoments };