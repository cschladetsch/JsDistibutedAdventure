/**
 * Story.js
 * Represents an entire Story, which is a collection of interconnected Pages.
 */
class Story {
    constructor(id, title, startPageID) {
        if (!id || !title || !startPageID) {
            throw new Error("Story must have an ID, Title, and a starting Page ID.");
        }
        this.id = id;                 // Unique ID for the story (e.g., "TheDustPilgrimage").
        this.title = title;           // The display title of the story.
        this.start_page_id = startPageID; // The entry point of the story.
        this.pages = {};              // An object to store all pages, indexed by their ID for fast lookups.
    }

    /**
     * Adds a Page object to the story's collection.
     * @param {Page} page The Page object to add.
     */
    addPage(page) {
        if (this.pages[page.id]) {
            console.warn(`Warning: Overwriting page with existing ID: ${page.id}`);
        }
        this.pages[page.id] = page;
    }

    /**
     * Retrieves a page by its ID.
     * @param {string} pageID The ID of the page to retrieve.
     * @returns {Page|null} The Page object or null if not found.
     */
    getPage(pageID) {
        return this.pages[pageID] || null;
    }

    /**
     * Serializes the entire story into a clean JSON string.
     * @returns {string} A JSON string representing the story.
     */
    toJSON() {
        return JSON.stringify({
            id: this.id,
            title: this.title,
            start_page_id: this.start_page_id,
            pages: this.pages
        }, null, 2); // The '2' makes the JSON output nicely formatted.
    }

    /**
     * Creates a Story instance from a JSON string or object.
     * @param {string|object} jsonData The story data.
     * @returns {Story} A new Story instance.
     */
    static fromJSON(jsonData) {
        const data = (typeof jsonData === 'string') ? JSON.parse(jsonData) : jsonData;
        const story = new Story(data.id, data.title, data.start_page_id);
        story.pages = data.pages; // Directly assign the pages object.
        return story;
    }
}

module.exports = Story;