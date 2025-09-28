/**
 * Generate Rich Dynamic Story
 * Creates a new rich, interesting story based on current time phase
 */

const DynamicRichStoryEngine = require('./DynamicRichStoryEngine.js');

console.log('🎮 Generating Rich Dynamic Story...');

const engine = new DynamicRichStoryEngine();
const storyPath = engine.generateAndSaveNewStory();

console.log(`✅ Rich story generated and saved!`);
console.log(`📁 Path: ${storyPath}`);
console.log(`🚀 Run the game to experience the new adventure!`);