/**
 * Auto Story Generator
 * Automatically generates new rich stories every 12 minutes
 */

const DynamicRichStoryEngine = require('./DynamicRichStoryEngine.js');

class AutoStoryGenerator {
    constructor() {
        this.engine = new DynamicRichStoryEngine();
        this.intervalMinutes = 12;
        this.isRunning = false;
    }

    start() {
        if (this.isRunning) {
            console.log('⚠️ Auto generator already running');
            return;
        }

        console.log(`🚀 Starting auto story generator - new stories every ${this.intervalMinutes} minutes`);

        // Generate first story immediately
        this.generateStory();

        // Set up interval for future stories
        this.interval = setInterval(() => {
            this.generateStory();
        }, this.intervalMinutes * 60 * 1000);

        this.isRunning = true;

        // Show next generation time
        const nextTime = new Date(Date.now() + this.intervalMinutes * 60 * 1000);
        console.log(`⏰ Next story will generate at: ${nextTime.toLocaleTimeString()}`);
    }

    generateStory() {
        console.log(`\n🎮 [${new Date().toLocaleTimeString()}] Generating new rich story...`);

        try {
            const storyPath = this.engine.generateAndSaveNewStory();
            console.log(`✅ New adventure ready!`);

            // Show next generation time
            const nextTime = new Date(Date.now() + this.intervalMinutes * 60 * 1000);
            console.log(`⏰ Next story at: ${nextTime.toLocaleTimeString()}`);

        } catch (error) {
            console.error(`❌ Error generating story:`, error.message);
        }
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.isRunning = false;
            console.log('🛑 Auto story generator stopped');
        }
    }

    // Generate story on demand (for testing)
    generateNow() {
        console.log('🎯 Generating story on demand...');
        this.generateStory();
    }
}

// If run directly, start the auto generator
if (require.main === module) {
    const generator = new AutoStoryGenerator();

    // Handle command line arguments
    const args = process.argv.slice(2);

    if (args.includes('--now')) {
        generator.generateNow();
    } else {
        generator.start();

        // Keep the process running
        console.log('Press Ctrl+C to stop the auto generator');
        process.on('SIGINT', () => {
            generator.stop();
            process.exit(0);
        });
    }
}

module.exports = AutoStoryGenerator;