/**
 * StorySystemModule.js
 * Main system class for managing stories.
 */
const Story = require('./Story');

class StorySystem {
    constructor() {
        this.stories = {}; // A collection of all stories, indexed by their ID.
    }

    /**
     * Creates and adds a new story to the system.
     * @param {string} id The unique ID for the new story.
     * @param {string} title The display title.
     * @param {string} startPageID The ID of the entry page.
     * @returns {Story} The newly created Story object.
     */
    createStory(id, title, startPageID) {
        const story = new Story(id, title, startPageID);
        this.stories[id] = story;
        return story;
    }

    getStory(id) {
        return this.stories[id] || null;
    }
}

module.exports = StorySystem;