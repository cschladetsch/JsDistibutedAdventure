/**
 * Page.js
 * Represents a single scene or screen in the game.
 */
const Prompt = require('./Prompt');

class Page {
    constructor(id, text) {
        if (!id) throw new Error("Page must have a unique ID.");
        this.id = id;               // Unique identifier for this page (e.g., "substation_gate").
        this.text = text;           // The main descriptive text for the scene.
        this.background_id = null;  // An identifier for the background image (e.g., "wasteland_sunset").
        this.prompts = [];          // An array of Prompt objects representing player choices.
        this.page_number = null;    // Page number in the story sequence
        this.loop_number = null;    // Which loop this page belongs to (1-5)
        this.is_loop_decision = false; // Whether this page contains a choice that can change outcomes
    }

    /**
     * Sets the background identifier for this page.
     * @param {string} backgroundID The unique ID of the background image.
     */
    setBackground(backgroundID) {
        this.background_id = backgroundID;
    }

    /**
     * Adds a new choice to this page.
     * @param {string} text The text for the choice button.
     * @param {string} targetPageID The ID of the page this choice leads to.
     * @param {object} requirements Optional requirements to see or select this prompt.
     * @param {string} loopType Optional: "good" or "bad" for outcome tracking
     * @param {boolean} triggersLoop Whether this choice triggers a new loop
     */
    addPrompt(text, targetPageID, requirements = {}, loopType = null, triggersLoop = false) {
        const newPrompt = new Prompt(text, targetPageID, requirements);
        newPrompt.loop_type = loopType;
        newPrompt.triggers_loop = triggersLoop;
        this.prompts.push(newPrompt);
    }

    /**
     * Sets page numbering and loop information
     * @param {number} pageNum The page number in sequence
     * @param {number} loopNum Which loop (1-5) this page belongs to
     * @param {boolean} isDecision Whether this page has outcome-changing choices
     */
    setLoopInfo(pageNum, loopNum, isDecision = false) {
        this.page_number = pageNum;
        this.loop_number = loopNum;
        this.is_loop_decision = isDecision;
    }
}

module.exports = Page;