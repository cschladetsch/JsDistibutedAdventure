/**
 * LLMStoryGenerator.js
 * Handles story generation using LLM integration
 */
const Page = require('./Page');

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
                            text: "You're a private investigator in a rain-slicked metropolis in 2077. A mysterious client has offered you a fortune to retrieve a stolen data chip. But there's something captivating about their eyes that makes you want to help them for more than just money.",
                            choices: [
                                { "text": "Head to the Neon Dragon nightclub to find your informant.", "target": "neon_dragon" },
                                { "text": "Break into the corporate archives where the chip was last seen.", "target": "archives_entry" },
                                { "text": "Ask your client more about themselves over dinner.", "target": "romantic_dinner" }
                            ]
                        },
                        "neon_dragon": {
                            background: "nightclub_interior_crowded",
                            text: "The Neon Dragon is a sensory overload of holographic ads and synth music. Your informant, a cyborg named Kai, is at the bar. He looks nervous but gives you a warm smile when he sees you.",
                            choices: [
                                { "text": "Subtly ask Kai about the chip.", "target": "kai_success" },
                                { "text": "Flirt with Kai while gathering information.", "target": "kai_romance" }
                            ]
                        },
                        "archives_entry": {
                            background: "corporate_lobby_sterile",
                            text: "The archives are housed in a sterile mega-corporation tower. The front desk is guarded by an attractive security officer who seems lonely on the night shift.",
                            choices: [
                                { "text": "Charm the guard to get access.", "target": "archives_romance" },
                                { "text": "Try to sneak past.", "target": "archives_fail" }
                            ]
                        },
                        "romantic_dinner": {
                            background: "upscale_restaurant",
                            text: "Over candlelit dinner, your client reveals they're not just after the chip - they're trying to save their missing partner. Their vulnerability touches your heart.",
                            choices: [
                                { "text": "Promise to help find their partner.", "target": "love_motivation" },
                                { "text": "Offer emotional support and comfort.", "target": "growing_bond" }
                            ]
                        },
                        "kai_romance": {
                            background: "nightclub_private_booth",
                            text: "Kai's cybernetic eyes light up as you lean closer. Between stolen glances and gentle touches, he reveals the chip's location. 'For you, anything,' he whispers.",
                            choices: [
                                { "text": "Thank him with a kiss.", "target": "kai_success_romance" }
                            ]
                        },
                        "archives_romance": {
                            background: "security_office_intimate",
                            text: "The guard melts under your charm. As you share stories through the night, they decide to help you, risking their job for a chance at love.",
                            choices: [
                                { "text": "Promise to take them away from this place.", "target": "archives_success_romance" }
                            ]
                        },
                        "love_motivation": {
                            background: "city_rooftop_sunset",
                            text: "With love as your driving force, you feel unstoppable. Your client's grateful kiss gives you strength for the challenges ahead.",
                            choices: [
                                { "text": "Begin the mission with renewed purpose.", "target": "powered_by_love" }
                            ]
                        },
                        "growing_bond": {
                            background: "quiet_apartment",
                            text: "In the quiet moments together, you realize this case has become something more. Two hearts finding each other in a dark world.",
                            choices: [
                                { "text": "Confess your feelings.", "target": "mutual_love" }
                            ]
                        },
                        "kai_success_romance": {
                            background: "nightclub_back_exit",
                            text: "With the keycard and a promise to meet again, you leave the club. Kai's kiss still tingles on your lips as you head toward your destiny.",
                            choices: []
                        },
                        "archives_success_romance": {
                            background: "vault_door_futuristic",
                            text: "Love has opened more than just vault doors. With your new partner by your side, you've found both the chip and something more valuable - true connection.",
                            choices: []
                        },
                        "powered_by_love": {
                            background: "mission_ready",
                            text: "Armed with love's power, you complete your mission flawlessly. Your client's joy and embrace make every risk worthwhile.",
                            choices: []
                        },
                        "mutual_love": {
                            background: "lovers_embrace",
                            text: "As you hold each other close, you realize the greatest treasure wasn't the chip - it was finding your soulmate in the neon-lit chaos of the city.",
                            choices: []
                        },
                        "office_fail": {
                            background: "detective_office_dark",
                            text: "You wait for hours, but no one calls. The trail goes cold, and you're left wondering what could have been if you'd chosen love over isolation.",
                            choices: []
                        },
                        "kai_success": {
                            background: "nightclub_bar_close_up",
                            text: "Kai discreetly slides a keycard across the bar. 'The chip is in a high-security vault. This will get you in,' he whispers, his hand briefly touching yours.",
                            choices: []
                        },
                        "archives_fail": {
                            background: "security_lasers_red",
                            text: "You slip into the shadows, but silent alarms trip instantly. Red lasers grid the hallway. Sometimes taking risks for love is the only way.",
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

module.exports = LLMStoryGenerator;