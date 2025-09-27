/**
 * index.js
 * Main export file that re-exports all modules
 * This allows other projects to import everything from one place
 */
const StorySystem = require('./StorySystemModule');
const Story = require('./Story');
const Page = require('./Page');
const Prompt = require('./Prompt');
const LLMStoryGenerator = require('./LLMStoryGenerator');
const DungeonMaster = require('./DungeonMaster');

module.exports = {
    StorySystem,
    Story,
    Page,
    Prompt,
    LLMStoryGenerator,
    DungeonMaster
};