/**
 * Prompt.js
 * Represents a single choice the player can make.
 */
class Prompt {
    constructor(text, targetPageID, requirements = {}) {
        this.text = text;               // The text displayed on the choice button (e.g., "Open the door").
        this.target_id = targetPageID;  // The ID of the Page this choice leads to.
        this.requirements = requirements; // Optional: e.g., { "requiresItem": "axe", "flagNotSet": "scared_of_dark" }
        this.loop_type = null;          // null, "good", or "bad" - for loop tracking
        this.triggers_loop = false;     // Whether this choice triggers a new loop
    }
}

module.exports = Prompt;