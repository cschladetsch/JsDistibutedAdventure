/**
 * StringManager.js
 * Centralized string management for the story system
 * Handles loading, formatting, and localization of all text strings
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class StringManager {
    constructor() {
        this.strings = {};
        this.configPath = path.join(__dirname, 'config');
        this.loadAllStrings();
    }

    /**
     * Load all string files from the config directory
     */
    loadAllStrings() {
        try {
            // Load combat strings
            this.strings.combat = this.loadStringFile('combat_strings.json');

            // Load story strings
            this.strings.story = this.loadStringFile('story_strings.json');

            // Load generation strings
            this.strings.generation = this.loadStringFile('generation_strings.json');

            console.log('📚 String Manager: All text strings loaded successfully');
        } catch (error) {
            console.error('❌ String Manager: Error loading strings:', error.message);
            // Fallback to empty objects to prevent crashes
            this.strings = {
                combat: { title: "Combat Strings (Failed to Load)" },
                story: { title: "Story Strings (Failed to Load)" },
                generation: { title: "Generation Strings (Failed to Load)" }
            };
        }
    }

    /**
     * Load a specific string file
     * @param {string} filename - Name of the JSON file to load
     * @returns {Object} Parsed JSON object
     */
    loadStringFile(filename) {
        const filePath = path.join(this.configPath, filename);
        if (!fs.existsSync(filePath)) {
            console.warn(`⚠️  String file not found: ${filename}`);
            return {};
        }

        const fileContent = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(fileContent);
    }

    /**
     * Get a string with optional parameter substitution
     * @param {string} category - Category (combat, story, generation)
     * @param {string} path - Dot-notation path to the string (e.g., "combat_encounter.header")
     * @param {Object} params - Parameters to substitute in the string
     * @returns {string} Formatted string
     */
    get(category, path, params = {}) {
        try {
            const pathParts = path.split('.');
            let current = this.strings[category];

            // Navigate through the object using the path
            for (const part of pathParts) {
                if (current && typeof current === 'object' && part in current) {
                    current = current[part];
                } else {
                    console.warn(`⚠️  String not found: ${category}.${path}`);
                    return `[MISSING: ${category}.${path}]`;
                }
            }

            // If we found a string, format it with parameters
            if (typeof current === 'string') {
                return this.formatString(current, params);
            } else {
                console.warn(`⚠️  String path leads to non-string: ${category}.${path}`);
                return `[INVALID: ${category}.${path}]`;
            }
        } catch (error) {
            console.error(`❌ Error getting string ${category}.${path}:`, error.message);
            return `[ERROR: ${category}.${path}]`;
        }
    }

    /**
     * Get an array of strings (for descriptions, lists, etc.)
     * @param {string} category - Category (combat, story, generation)
     * @param {string} path - Dot-notation path to the array
     * @returns {Array} Array of strings
     */
    getArray(category, path) {
        try {
            const pathParts = path.split('.');
            let current = this.strings[category];

            // Navigate through the object using the path
            for (const part of pathParts) {
                if (current && typeof current === 'object' && part in current) {
                    current = current[part];
                } else {
                    console.warn(`⚠️  String array not found: ${category}.${path}`);
                    return [`[MISSING ARRAY: ${category}.${path}]`];
                }
            }

            if (Array.isArray(current)) {
                return current;
            } else {
                console.warn(`⚠️  String path does not lead to array: ${category}.${path}`);
                return [`[NOT ARRAY: ${category}.${path}]`];
            }
        } catch (error) {
            console.error(`❌ Error getting string array ${category}.${path}:`, error.message);
            return [`[ERROR: ${category}.${path}]`];
        }
    }

    /**
     * Format a string by replacing {param} placeholders with values
     * @param {string} template - String template with {param} placeholders
     * @param {Object} params - Object containing parameter values
     * @returns {string} Formatted string
     */
    formatString(template, params) {
        if (!params || typeof params !== 'object') {
            return template;
        }

        return template.replace(/\{(\w+)\}/g, (match, key) => {
            if (key in params) {
                return String(params[key]);
            } else {
                console.warn(`⚠️  Missing parameter '${key}' for string template`);
                return match; // Return the placeholder if parameter not found
            }
        });
    }

    /**
     * Get all available string categories
     * @returns {Array} Array of category names
     */
    getCategories() {
        return Object.keys(this.strings);
    }

    /**
     * Get the title of a string category
     * @param {string} category - Category name
     * @returns {string} Category title
     */
    getCategoryTitle(category) {
        if (this.strings[category] && this.strings[category].title) {
            return this.strings[category].title;
        }
        return `Unknown Category: ${category}`;
    }

    /**
     * Reload all string files (useful for development)
     */
    reload() {
        console.log('🔄 String Manager: Reloading all strings...');
        this.loadAllStrings();
    }

    /**
     * Quick access methods for common string categories
     */

    // Combat strings
    combat(path, params = {}) {
        return this.get('combat', path, params);
    }

    // Story strings
    story(path, params = {}) {
        return this.get('story', path, params);
    }

    // Generation strings
    generation(path, params = {}) {
        return this.get('generation', path, params);
    }
}

// Export singleton instance
export default new StringManager();