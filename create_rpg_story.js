const fs = require('fs');
const { StorySystem } = require('./StorySystem.js');

function createRPGStory() {
    const storySystem = new StorySystem();
    const story = storySystem.createStory("rpg_adventure", "The Dragon's Lair Quest", "start");

    // Create RPG story data with full game state
    const storyData = {
        id: "rpg_adventure",
        title: "The Dragon's Lair Quest",
        start_page_id: "start",
        gameState: {
            playerStats: { health: 100, maxHealth: 100, attack: 10, defense: 5, gold: 0 },
            inventory: ["Basic Sword"],
            weapons: {
                "Basic Sword": { damage: 8, accuracy: 0.8 },
                "Iron Blade": { damage: 15, accuracy: 0.75 },
                "Mystic Staff": { damage: 12, accuracy: 0.9 },
                "Dragon Slayer": { damage: 25, accuracy: 0.95 }
            }
        },
        pages: {
            "start": {
                id: "start",
                text: "You stand at the edge of a dark forest, sword in hand. Ancient ruins beckon in the distance, promising treasure and danger. Your quest: find the legendary dragon's treasure!",
                background_id: "forest_clearing",
                prompts: [
                    { text: "Enter the forest cautiously", target_id: "forest_path" },
                    { text: "Head directly to the ruins", target_id: "ruins_entrance" },
                    { text: "Search the clearing for supplies", target_id: "treasure_find" }
                ]
            },
            "forest_path": {
                id: "forest_path",
                text: "The forest is thick and ominous. You hear rustling in the bushes ahead. Something is watching you from the shadows.",
                background_id: "dark_forest",
                prompts: [
                    { text: "Investigate the sound", target_id: "goblin_encounter" },
                    { text: "Sneak around quietly", target_id: "hidden_chest" },
                    { text: "Turn back to the clearing", target_id: "start" }
                ]
            },
            "goblin_encounter": {
                id: "goblin_encounter",
                text: "A snarling goblin jumps out with a rusty dagger! It blocks your path forward.",
                background_id: "forest_combat",
                combat: {
                    enemy: { name: "Forest Goblin", health: 25, maxHealth: 25, attack: 6, defense: 2 },
                    victory: "goblin_victory",
                    defeat: "player_defeat"
                },
                prompts: [
                    { text: "Fight the goblin!", target_id: "combat_timing" }
                ]
            },
            "goblin_victory": {
                id: "goblin_victory",
                text: "The goblin falls defeated! You find its small hoard hidden behind a tree - some gold coins and a shiny blade.",
                background_id: "victory",
                rewards: { gold: 15, items: ["Iron Blade"] },
                prompts: [
                    { text: "Continue deeper into forest", target_id: "deeper_forest" },
                    { text: "Return to clearing", target_id: "start" }
                ]
            },
            "hidden_chest": {
                id: "hidden_chest",
                text: "You discover a hidden chest containing a magical staff and gold! The chest seems to have been left by a previous adventurer.",
                background_id: "treasure_chest",
                rewards: { gold: 25, items: ["Mystic Staff"] },
                prompts: [
                    { text: "Continue exploring", target_id: "deeper_forest" },
                    { text: "Head to the ruins", target_id: "ruins_entrance" }
                ]
            },
            "deeper_forest": {
                id: "deeper_forest",
                text: "You venture deeper into the forest. The trees grow taller and the shadows darker. You find a wounded traveler by the path.",
                background_id: "deep_forest",
                prompts: [
                    { text: "Help the traveler", target_id: "helpful_reward" },
                    { text: "Ignore and continue", target_id: "ruins_entrance" },
                    { text: "Go back", target_id: "forest_path" }
                ]
            },
            "helpful_reward": {
                id: "helpful_reward",
                text: "The grateful traveler gives you a healing potion and directions to a secret entrance to the ruins!",
                background_id: "traveler_thanks",
                rewards: { healing: 25 },
                prompts: [
                    { text: "Take secret entrance to ruins", target_id: "secret_ruins" },
                    { text: "Take main entrance to ruins", target_id: "ruins_entrance" }
                ]
            },
            "ruins_entrance": {
                id: "ruins_entrance",
                text: "The ancient ruins loom before you. Stone gargoyles guard the entrance, and you can hear echoing footsteps within. This place feels dangerous but rewarding.",
                background_id: "ancient_ruins",
                prompts: [
                    { text: "Enter boldly through main door", target_id: "skeleton_encounter" },
                    { text: "Search around the perimeter", target_id: "ruins_treasure" },
                    { text: "Return to the forest", target_id: "forest_path" }
                ]
            },
            "secret_ruins": {
                id: "secret_ruins",
                text: "The secret entrance leads to a hidden chamber filled with treasure! But you hear heavy footsteps approaching...",
                background_id: "secret_chamber",
                rewards: { gold: 50 },
                prompts: [
                    { text: "Grab treasure and hide", target_id: "stealth_treasure" },
                    { text: "Prepare for battle", target_id: "skeleton_encounter" }
                ]
            },
            "skeleton_encounter": {
                id: "skeleton_encounter",
                text: "An ancient skeleton warrior emerges, wielding a bone sword! Its eyes glow with unholy fire.",
                background_id: "ruins_combat",
                combat: {
                    enemy: { name: "Skeleton Warrior", health: 40, maxHealth: 40, attack: 12, defense: 5 },
                    victory: "skeleton_victory",
                    defeat: "player_defeat"
                },
                prompts: [
                    { text: "Engage in combat!", target_id: "combat_timing" }
                ]
            },
            "skeleton_victory": {
                id: "skeleton_victory",
                text: "The skeleton crumbles to dust! You find ancient gold and a mysterious key that seems to pulse with power.",
                background_id: "victory",
                rewards: { gold: 30, items: ["Ancient Key"] },
                prompts: [
                    { text: "Explore deeper into ruins", target_id: "treasure_room" },
                    { text: "Exit and explore elsewhere", target_id: "start" }
                ]
            },
            "stealth_treasure": {
                id: "stealth_treasure",
                text: "You successfully avoid detection and claim additional treasure! Your stealth pays off.",
                background_id: "stealth_success",
                rewards: { gold: 20 },
                prompts: [
                    { text: "Sneak to the dragon's lair", target_id: "dragon_approach" },
                    { text: "Leave while you can", target_id: "start" }
                ]
            },
            "treasure_room": {
                id: "treasure_room",
                text: "You've found the treasure chamber! Golden artifacts fill the room, but a massive shadow moves in the darkness ahead. The dragon awaits!",
                background_id: "treasure_chamber",
                prompts: [
                    { text: "Approach the dragon boldly", target_id: "dragon_encounter" },
                    { text: "Try to sneak past", target_id: "dragon_approach" }
                ]
            },
            "dragon_approach": {
                id: "dragon_approach",
                text: "You attempt to approach quietly, but the ancient dragon senses your presence. Its massive eye opens and fixes upon you!",
                background_id: "dragon_awakening",
                prompts: [
                    { text: "Face the dragon!", target_id: "dragon_encounter" },
                    { text: "Try to negotiate", target_id: "dragon_talk" }
                ]
            },
            "dragon_talk": {
                id: "dragon_talk",
                text: "The dragon speaks in an ancient tongue: 'Brave adventurer, prove your worth in combat and claim the ultimate treasure!' There is no avoiding this battle.",
                background_id: "dragon_challenge",
                prompts: [
                    { text: "Accept the challenge!", target_id: "dragon_encounter" }
                ]
            },
            "dragon_encounter": {
                id: "dragon_encounter",
                text: "The mighty Ancient Dragon rises before you! Its scales gleam like armor and fire dances in its throat. This is the ultimate test!",
                background_id: "dragon_lair",
                combat: {
                    enemy: { name: "Ancient Dragon", health: 80, maxHealth: 80, attack: 20, defense: 10 },
                    victory: "dragon_victory",
                    defeat: "player_defeat"
                },
                prompts: [
                    { text: "Face the dragon in epic battle!", target_id: "combat_timing" }
                ]
            },
            "dragon_victory": {
                id: "dragon_victory",
                text: "INCREDIBLE! You have slain the legendary dragon! The treasure chamber is yours - mountains of gold and the legendary Dragon Slayer sword await. You are now a legend yourself!",
                background_id: "ultimate_victory",
                rewards: { gold: 500, items: ["Dragon Slayer"] },
                prompts: []
            },
            "player_defeat": {
                id: "player_defeat",
                text: "You have been defeated... but heroes don't stay down! You wake up back at the forest clearing, wounded but determined to try again.",
                background_id: "defeat",
                prompts: [
                    { text: "Try again with new knowledge", target_id: "start" }
                ]
            },
            "ruins_treasure": {
                id: "ruins_treasure",
                text: "Searching around the ruins, you find some abandoned supplies and a healing potion left by previous adventurers.",
                background_id: "ruins_exterior",
                rewards: { gold: 10, healing: 15 },
                prompts: [
                    { text: "Enter the ruins", target_id: "skeleton_encounter" },
                    { text: "Return to forest", target_id: "forest_path" }
                ]
            },
            "treasure_find": {
                id: "treasure_find",
                text: "Searching the clearing carefully, you find some supplies hidden under a fallen log - a few gold pieces and a health potion!",
                background_id: "clearing_search",
                rewards: { gold: 5, healing: 10 },
                prompts: [
                    { text: "Enter the forest", target_id: "forest_path" },
                    { text: "Head to ruins", target_id: "ruins_entrance" }
                ]
            }
        }
    };

    // Save the story
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const fileName = `RPG_Adventure_${timestamp}.json`;
    const filePath = `stories/${fileName}`;

    fs.writeFileSync(filePath, JSON.stringify(storyData, null, 2));
    console.log(`🎮 RPG Story created: ${filePath}`);
    console.log(`📄 Pages: ${Object.keys(storyData.pages).length}`);
    console.log(`⚔️  Combat encounters: ${Object.values(storyData.pages).filter(p => p.combat).length}`);
    console.log(`💰 Treasure locations: ${Object.values(storyData.pages).filter(p => p.rewards).length}`);

    return filePath;
}

createRPGStory();