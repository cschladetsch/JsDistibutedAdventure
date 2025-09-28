/**
 * DungeonMaster.js
 * Simulates a separate project that USES the StorySystem.
 * It's responsible for generating a story and then running a player through it
 * in an interactive console session.
 */
const readline = require('readline');
const StorySystem = require('./StorySystemModule');
const LLMStoryGenerator = require('./LLMStoryGenerator');

class DungeonMaster {
    constructor() {
        this.storySystem = new StorySystem();
        this.generator = new LLMStoryGenerator(this.storySystem);
        this.story = null;
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    async setupAdventure() {
        console.log("--- Project: Dungeon Master ---");
        console.log("DM: 'Alright, let's create a new adventure module.'");
        const highLevelPrompt = "A short, sharp, entertaining detective story in a cyberpunk setting.";
        this.story = await this.generator.generate(
            highLevelPrompt,
            "CyberpunkDetective_Ep1",
            "The Neon Dragon Case"
        );

        if (!this.story) {
            console.log("DM: 'Looks like the creative energies failed us. Can't generate a story.'");
            this.rl.close();
            return false;
        }

        console.log(`DM: 'Excellent. The module "${this.story.title}" is ready.'`);
        return true;
    }

    play() {
        if (!this.story) {
            console.error("No story has been generated to play.");
            this.rl.close();
            return;
        }

        console.log("\n--- Simulation: A Player starts the adventure ---");
        let currentPage = this.story.getPage(this.story.start_page_id);
        this.gameLoop(currentPage, 1);
    }

    gameLoop(currentPage, turn) {
        if (!currentPage || currentPage.prompts.length === 0) {
            if (currentPage) {
                console.log(`\n--- Turn ${turn} ---`);
                console.log(`DM (narrating): "${currentPage.text}"`);
            }
            console.log("\n--- END OF ADVENTURE ---");
            this.rl.close();
            return;
        }

        console.log(`\n--- Turn ${turn} ---`);
        console.log(`DM (narrating): "${currentPage.text}"`);
        console.log("DM: 'What do you do?'");

        currentPage.prompts.forEach((prompt, index) => {
            console.log(`[${index}] ${prompt.text}`);
        });

        this.rl.question('\nEnter the number of your choice: ', (answer) => {
            const choiceIndex = parseInt(answer, 10);

            if (isNaN(choiceIndex) || choiceIndex < 0 || choiceIndex >= currentPage.prompts.length) {
                console.log("\nDM: 'That's not a valid choice. Try again.'");
                this.gameLoop(currentPage, turn); // Ask again on the same turn
            } else {
                const playerChoice = currentPage.prompts[choiceIndex];
                console.log(`\nPlayer chooses: "${playerChoice.text}"`);
                const nextPage = this.story.getPage(playerChoice.target_id);
                this.gameLoop(nextPage, turn + 1); // Proceed to the next turn
            }
        });
    }
}

module.exports = DungeonMaster;