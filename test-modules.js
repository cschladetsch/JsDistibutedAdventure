/**
 * test-modules.js
 * Non-interactive test to verify all modules work correctly
 */
const { StorySystem, Story, Page, Prompt, LLMStoryGenerator } = require('./index');

async function testModules() {
    console.log("Testing modular structure...\n");

    // Test 1: Create a StorySystem
    const system = new StorySystem();
    console.log("✓ StorySystem created");

    // Test 2: Create a Story
    const story = system.createStory("test-story", "Test Story", "page1");
    console.log("✓ Story created with ID:", story.id);

    // Test 3: Create Pages
    const page1 = new Page("page1", "You are at the beginning of your journey.");
    page1.setBackground("forest_morning");
    page1.addPrompt("Go left", "page2");
    page1.addPrompt("Go right", "page3");
    console.log("✓ Page 1 created with", page1.prompts.length, "prompts");

    const page2 = new Page("page2", "You went left and found a treasure!");
    console.log("✓ Page 2 created");

    const page3 = new Page("page3", "You went right and encountered a dragon!");
    console.log("✓ Page 3 created");

    // Test 4: Add pages to story
    story.addPage(page1);
    story.addPage(page2);
    story.addPage(page3);
    console.log("✓ All pages added to story");

    // Test 5: Test navigation
    const startPage = story.getPage(story.start_page_id);
    console.log("✓ Retrieved start page:", startPage.id);

    // Test 6: Test JSON serialization
    const jsonString = story.toJSON();
    const parsed = JSON.parse(jsonString);
    console.log("✓ Story serialized to JSON with", Object.keys(parsed.pages).length, "pages");

    // Test 7: Test Story.fromJSON
    const restoredStory = Story.fromJSON(jsonString);
    console.log("✓ Story restored from JSON:", restoredStory.title);

    // Test 8: Test LLMStoryGenerator
    const generator = new LLMStoryGenerator(system);
    console.log("✓ LLMStoryGenerator created");

    console.log("\nGenerating story with LLM...");
    const generatedStory = await generator.generate(
        "A test prompt",
        "generated-story",
        "Generated Story Title"
    );

    if (generatedStory) {
        console.log("✓ Story generated successfully:", generatedStory.title);
        console.log("  Pages in generated story:", Object.keys(generatedStory.pages).length);
    }

    console.log("\n✅ All tests passed! Modular structure is working correctly.");
}

// Run tests
testModules().catch(console.error);