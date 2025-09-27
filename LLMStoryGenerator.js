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
                            text: "You're a private investigator in a rain-slicked metropolis in 2077. A mysterious client has offered you a fortune to retrieve a stolen data chip. You're at a crossroads.",
                            choices: [
                                { "text": "Head to the Neon Dragon nightclub to find your informant.", "target": "neon_dragon" },
                                { "text": "Break into the corporate archives where the chip was last seen.", "target": "archives_entry" },
                                { "text": "Wait in your office for more information.", "target": "office_fail" }
                            ]
                        },
                        "neon_dragon": {
                            background: "nightclub_interior_crowded",
                            text: "The Neon Dragon is a sensory overload of holographic ads and synth music. Your informant, a cyborg named Kai, is at the bar. He looks nervous.",
                            choices: [
                                { "text": "Subtly ask Kai about the chip.", "target": "kai_success" },
                                { "text": "Loudly demand information.", "target": "kai_fail" }
                            ]
                        },
                        "archives_entry": {
                            background: "corporate_lobby_sterile",
                            text: "The archives are housed in a sterile mega-corporation tower. The front desk is guarded by an imposing security cyborg.",
                            choices: [
                                { "text": "Bribe the guard.", "target": "archives_success" },
                                { "text": "Try to sneak past.", "target": "archives_fail" }
                            ]
                        },
                        "office_fail": {
                            background: "detective_office_dark",
                            text: "You wait for hours, but no one calls. The trail goes cold. Your career fizzles out in this lonely, rain-streaked office. A pathetic end.",
                            choices: []
                        },
                        "kai_success": {
                            background: "nightclub_bar_close_up",
                            text: "Kai discreetly slides a keycard across the bar. 'The chip is in a high-security vault. This will get you in,' he whispers. 'Now get out of here.' You have what you need.",
                            choices: []
                        },
                        "kai_fail": {
                            background: "nightclub_brawl",
                            text: "Your loud demands attract the attention of corporate enforcers. A brutal fight breaks out. You're no match for their augmented muscle.",
                            choices: []
                        },
                        "archives_success": {
                            background: "vault_door_futuristic",
                            text: "The guard's optical sensors whir as he scans the credits. He nods, disabling the security lasers for 60 seconds. You stride towards the vault, the mission a success.",
                            choices: []
                        },
                        "archives_fail": {
                            background: "security_lasers_red",
                            text: "You slip into the shadows, but silent alarms trip instantly. Red lasers grid the hallway. There is no escape.",
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