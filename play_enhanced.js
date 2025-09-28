#!/usr/bin/env node

/**
 * Enhanced Story Game Runner (ES6 Module)
 * Main entry point for the enhanced JavaScript Distributed Story System
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Enhanced UI and color support
const Colors = {
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  magenta: (text) => `\x1b[35m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  white: (text) => `\x1b[37m${text}\x1b[0m`,
  bright: (text) => `\x1b[1m${text}\x1b[0m`,
  bgBlue: (text = ' ') => `\x1b[44m${text}\x1b[0m`,
  bgGreen: (text = ' ') => `\x1b[42m${text}\x1b[0m`,
  bgRed: (text = ' ') => `\x1b[41m${text}\x1b[0m`,
  bgYellow: (text = ' ') => `\x1b[43m${text}\x1b[0m`,
  rainbow: (text) => `\x1b[35m${text}\x1b[0m` // Simple rainbow effect
};

class EnhancedStoryRunner {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    this.currentStory = null;
    this.currentPage = null;
    this.playerStats = {
      health: 100,
      maxHealth: 100,
      mana: 50,
      maxMana: 50,
      level: 1,
      experience: 0,
      gold: 25,
      attack: 10,
      defense: 5
    };

    this.inventory = [
      { name: 'Basic Weapon', damage: 5, type: 'weapon' },
      { name: 'Simple Armor', defense: 3, type: 'armor' },
      { name: 'Healing Potion', healing: 25, type: 'consumable' }
    ];

    this.gameMode = 'story'; // story, combat, inventory, stats
  }

  async initialize() {
    this.showTitleScreen();
    await this.selectStory();
    await this.startGame();
  }

  showTitleScreen() {
    console.clear();
    console.log(Colors.rainbow(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║     🎮 JavaScript Distributed Story System v2.0 🎮          ║
║                                                              ║
║        ⚔️  Enhanced RPG Adventure System  ⚔️                 ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝`));

    console.log(Colors.cyan('\n' + '═'.repeat(70)));
    console.log(Colors.yellow('        🌟 Welcome to Interactive Adventures! 🌟'));
    console.log(Colors.cyan('═'.repeat(70)));

    console.log(Colors.white(`
🎯 Features Available:
  • Rich Interactive Stories with Branching Narratives
  • Advanced Combat System with Timing Mechanics
  • Character Progression & Equipment Management
  • Multiple Story Types (Fantasy, Sci-Fi, Horror, Romance)
  • Real-time Combat with Visual Feedback

🎮 Controls:
  • Use number keys (1-9) to make choices
  • Press 'v' to view inventory
  • Press 's' to view player stats
  • Press 'h' for help
  • Press 'q' to quit`));
  }

  async selectStory() {
    console.log(Colors.cyan('\n📚 Available Stories:\n'));

    const storiesDir = path.join(__dirname, 'stories');
    const storyFiles = fs.readdirSync(storiesDir)
      .filter(file => file.endsWith('.json'))
      .slice(0, 10); // Show latest 10 stories

    if (storyFiles.length === 0) {
      console.log(Colors.red('❌ No stories found! Please generate a story first.'));
      console.log(Colors.yellow('💡 Try running: npm run generate'));
      process.exit(1);
    }

    storyFiles.forEach((file, index) => {
      const name = file.replace(/\.json$/, '').replace(/_/g, ' ');
      console.log(Colors.white(`[${index + 1}] ${name}`));
    });

    console.log(Colors.green(`\n[${storyFiles.length + 1}] 🎲 Random Story`));
    console.log(Colors.magenta(`[${storyFiles.length + 2}] 🆕 Generate New Story`));

    const choice = await this.promptUser(
      Colors.cyan('\n🎯 Choose a story (1-' + (storyFiles.length + 2) + '): ')
    );

    const choiceNum = parseInt(choice);

    if (choiceNum === storyFiles.length + 1) {
      // Random story
      const randomIndex = Math.floor(Math.random() * storyFiles.length);
      this.loadStory(path.join(storiesDir, storyFiles[randomIndex]));
    } else if (choiceNum === storyFiles.length + 2) {
      // Generate new story
      console.log(Colors.yellow('🔄 Generating new story...'));
      await this.generateNewStory();
    } else if (choiceNum >= 1 && choiceNum <= storyFiles.length) {
      // Selected story
      this.loadStory(path.join(storiesDir, storyFiles[choiceNum - 1]));
    } else {
      console.log(Colors.red('❌ Invalid choice. Using first available story.'));
      this.loadStory(path.join(storiesDir, storyFiles[0]));
    }
  }

  loadStory(storyPath) {
    try {
      console.log(Colors.yellow('📖 Loading story...'));
      const storyData = JSON.parse(fs.readFileSync(storyPath, 'utf8'));
      this.currentStory = storyData;
      this.currentPage = storyData.pages[storyData.start_page_id];

      console.log(Colors.green(`✅ Loaded: ${Colors.bright(storyData.title)}`));
    } catch (error) {
      console.log(Colors.red('❌ Error loading story:', error.message));
      process.exit(1);
    }
  }

  async generateNewStory() {
    console.log(Colors.magenta('🎭 Story Generation Options:'));
    console.log('[1] 🏰 Fantasy Adventure');
    console.log('[2] 🚀 Sci-Fi Exploration');
    console.log('[3] 👻 Horror Mystery');
    console.log('[4] 💕 Romantic Drama');
    console.log('[5] 🕵️ Detective Story');

    const choice = await this.promptUser(Colors.cyan('Choose story type (1-5): '));

    const themes = {
      '1': 'fantasy adventure with magic and dragons',
      '2': 'science fiction space exploration story',
      '3': 'horror mystery with supernatural elements',
      '4': 'romantic drama with meaningful relationships',
      '5': 'detective story with puzzles and investigation'
    };

    const theme = themes[choice] || themes['1'];

    // Create a simple generated story structure
    const generatedStory = {
      id: `generated_${Date.now()}`,
      title: `Generated ${theme.split(' ')[0]} Adventure`,
      start_page_id: 'start',
      pages: {
        start: {
          text: `You begin your ${theme}. The world is full of possibilities, and your choices will shape your destiny.`,
          choices: [
            { text: 'Explore the mysterious location', target: 'explore' },
            { text: 'Seek out helpful companions', target: 'companions' },
            { text: 'Investigate the main quest', target: 'quest' }
          ]
        },
        explore: {
          text: 'Your exploration reveals hidden secrets and new opportunities. You discover something that changes everything.',
          choices: [
            { text: 'Continue deeper', target: 'deeper' },
            { text: 'Return with your discovery', target: 'return' }
          ]
        },
        companions: {
          text: 'You meet interesting characters who offer to join your adventure. Together, you are stronger.',
          choices: [
            { text: 'Accept their help', target: 'team' },
            { text: 'Go it alone', target: 'solo' }
          ]
        },
        quest: {
          text: 'The main quest reveals a greater purpose to your journey. Ancient forces are at work.',
          choices: [
            { text: 'Face the challenge head-on', target: 'challenge' },
            { text: 'Prepare carefully first', target: 'prepare' }
          ]
        },
        deeper: {
          text: 'Going deeper, you uncover the truth and gain great power, but also face great danger.',
          choices: []
        },
        return: {
          text: 'You return as a hero, using your discovery to help others and change the world.',
          choices: []
        },
        team: {
          text: 'With your companions, you achieve victory through friendship and cooperation.',
          choices: []
        },
        solo: {
          text: 'Your solo journey proves your strength and determination. You succeed through pure will.',
          choices: []
        },
        challenge: {
          text: 'Your direct approach leads to an epic confrontation. Through courage, you prevail.',
          choices: []
        },
        prepare: {
          text: 'Your careful preparation pays off magnificently. Wisdom triumphs over haste.',
          choices: []
        }
      }
    };

    // Convert choices to proper format
    Object.values(generatedStory.pages).forEach(page => {
      if (page.choices) {
        page.prompts = page.choices.map(choice => ({
          text: choice.text,
          target_id: choice.target
        }));
        delete page.choices;
      } else {
        page.prompts = [];
      }
    });

    this.currentStory = generatedStory;
    this.currentPage = generatedStory.pages[generatedStory.start_page_id];

    console.log(Colors.green('✨ Generated new story successfully!'));
  }

  async startGame() {
    console.log(Colors.cyan('\n🎬 Starting your adventure...\n'));
    await this.gameLoop();
  }

  async gameLoop() {
    while (this.currentPage) {
      this.displayPage();
      this.displayStats();

      if (this.currentPage.prompts && this.currentPage.prompts.length > 0) {
        await this.handleChoices();
      } else {
        // Story ended
        this.showEndScreen();
        break;
      }
    }
  }

  displayPage() {
    console.log(Colors.cyan('\n' + '═'.repeat(80)));
    console.log(Colors.white(this.currentPage.text));
    console.log(Colors.cyan('═'.repeat(80)));
  }

  displayStats() {
    const healthBar = this.createBar(this.playerStats.health, this.playerStats.maxHealth, 20, '❤️');
    const manaBar = this.createBar(this.playerStats.mana, this.playerStats.maxMana, 20, '💙');

    console.log(Colors.yellow('\n📊 PLAYER STATUS:'));
    console.log(`❤️  Health: [${healthBar}] ${this.playerStats.health}/${this.playerStats.maxHealth}`);
    console.log(`💙 Mana:   [${manaBar}] ${this.playerStats.mana}/${this.playerStats.maxMana}`);
    console.log(`🏆 Level: ${this.playerStats.level} | 💰 Gold: ${this.playerStats.gold} | ⚔️ Attack: ${this.playerStats.attack} | 🛡️ Defense: ${this.playerStats.defense}`);
  }

  createBar(current, max, width, color) {
    const percentage = current / max;
    const filled = Math.floor(percentage * width);
    const empty = width - filled;

    if (percentage > 0.6) {
      return Colors.green('█'.repeat(filled)) + Colors.white('░'.repeat(empty));
    } else if (percentage > 0.3) {
      return Colors.yellow('█'.repeat(filled)) + Colors.white('░'.repeat(empty));
    } else {
      return Colors.red('█'.repeat(filled)) + Colors.white('░'.repeat(empty));
    }
  }

  async handleChoices() {
    console.log(Colors.yellow('\n🎯 What do you do?'));

    this.currentPage.prompts.forEach((prompt, index) => {
      console.log(Colors.cyan(`[${index + 1}]`) + ' ' + Colors.white(prompt.text));
    });

    console.log(Colors.magenta(`\n[v] 🎒 View Inventory | [s] 📊 Stats | [h] ❓ Help | [q] 🚪 Quit`));

    const choice = await this.promptUser(Colors.green('\n⚡ Enter your choice: '));

    // Handle special commands
    if (choice.toLowerCase() === 'v') {
      this.showInventory();
      return this.handleChoices();
    } else if (choice.toLowerCase() === 's') {
      this.showDetailedStats();
      return this.handleChoices();
    } else if (choice.toLowerCase() === 'h') {
      this.showHelp();
      return this.handleChoices();
    } else if (choice.toLowerCase() === 'q') {
      this.quit();
      return;
    }

    const choiceNum = parseInt(choice);

    if (choiceNum >= 1 && choiceNum <= this.currentPage.prompts.length) {
      const selectedPrompt = this.currentPage.prompts[choiceNum - 1];
      console.log(Colors.green(`\n⚡ You chose: "${selectedPrompt.text}"`));

      // Random chance for combat or events
      if (Math.random() < 0.3 && selectedPrompt.text.toLowerCase().includes('attack')) {
        await this.triggerCombat();
      }

      // Navigate to next page
      const nextPage = this.currentStory.pages[selectedPrompt.target_id];
      if (nextPage) {
        this.currentPage = nextPage;
      } else {
        console.log(Colors.red('⚠️ Page not found, ending story.'));
        this.currentPage = null;
      }
    } else {
      console.log(Colors.red('❌ Invalid choice. Please try again.'));
      return this.handleChoices();
    }
  }

  async triggerCombat() {
    console.log(Colors.red('\n⚔️ COMBAT ENCOUNTER! ⚔️'));
    console.log(Colors.yellow('A fierce enemy appears!'));

    const enemy = {
      name: 'Shadow Beast',
      health: 40,
      maxHealth: 40,
      attack: 8
    };

    let playerHealth = this.playerStats.health;
    let enemyHealth = enemy.health;

    while (playerHealth > 0 && enemyHealth > 0) {
      console.log(Colors.cyan('\n--- Combat Round ---'));
      console.log(`You: ${playerHealth}/${this.playerStats.maxHealth} HP`);
      console.log(`${enemy.name}: ${enemyHealth}/${enemy.maxHealth} HP`);

      console.log('\n[1] ⚔️ Attack');
      console.log('[2] 🛡️ Defend');
      console.log('[3] 🏃 Flee');

      const action = await this.promptUser(Colors.yellow('Choose action: '));

      switch (action) {
        case '1':
          // Attack with timing mini-game
          const damage = await this.timingAttack();
          enemyHealth -= damage;
          console.log(Colors.green(`💥 You deal ${damage} damage!`));
          break;

        case '2':
          // Defend
          console.log(Colors.blue('🛡️ You raise your guard!'));
          break;

        case '3':
          // Flee
          if (Math.random() < 0.7) {
            console.log(Colors.yellow('🏃 You successfully escape!'));
            return;
          } else {
            console.log(Colors.red('❌ You cannot escape!'));
          }
          break;
      }

      if (enemyHealth > 0) {
        // Enemy attacks
        let enemyDamage = enemy.attack + Math.floor(Math.random() * 5);
        if (action === '2') enemyDamage = Math.floor(enemyDamage / 2); // Defend reduces damage

        playerHealth -= enemyDamage;
        console.log(Colors.red(`💀 ${enemy.name} deals ${enemyDamage} damage!`));
      }
    }

    if (playerHealth <= 0) {
      console.log(Colors.red('\n💀 You have been defeated...'));
      console.log(Colors.yellow('🏥 But you are rescued and healed!'));
      this.playerStats.health = Math.floor(this.playerStats.maxHealth / 2);
    } else {
      console.log(Colors.green('\n🎉 Victory! You have defeated the enemy!'));
      const goldGained = 10 + Math.floor(Math.random() * 15);
      const expGained = 25 + Math.floor(Math.random() * 25);

      this.playerStats.gold += goldGained;
      this.playerStats.experience += expGained;
      this.playerStats.health = playerHealth;

      console.log(Colors.yellow(`💰 Gained ${goldGained} gold!`));
      console.log(Colors.cyan(`✨ Gained ${expGained} experience!`));

      // Level up check
      const expNeeded = this.playerStats.level * 100;
      if (this.playerStats.experience >= expNeeded) {
        this.levelUp();
      }
    }

    await this.promptUser(Colors.cyan('Press Enter to continue...'));
  }

  async timingAttack() {
    console.log(Colors.yellow('\n🎯 TIMING ATTACK! Hit ENTER when the marker is in the BLUE zone!'));

    const zones = {
      perfect: { start: 21, end: 29, color: 'blue', damage: 20 },
      good: { start: 5, end: 20, color: 'green', damage: 15 },
      okay: { start: 30, end: 45, color: 'yellow', damage: 10 },
      miss: { damage: 5 }
    };

    let position = 0;
    let direction = 1;
    const barWidth = 50;

    return new Promise((resolve) => {
      let inputReceived = false;

      const timer = setInterval(() => {
        if (inputReceived) return;

        // Move marker
        position += direction * 2;
        if (position >= barWidth) {
          direction = -1;
          position = barWidth;
        } else if (position <= 0) {
          direction = 1;
          position = 0;
        }

        // Create visual bar
        let bar = '';
        for (let i = 0; i < barWidth; i++) {
          if (i === Math.floor(position)) {
            bar += Colors.bright('█');
          } else if (i >= zones.perfect.start && i <= zones.perfect.end) {
            bar += Colors.bgBlue(' ');
          } else if (i >= zones.good.start && i <= zones.good.end) {
            bar += Colors.bgGreen(' ');
          } else if (i >= zones.okay.start && i <= zones.okay.end) {
            bar += Colors.bgYellow(' ');
          } else {
            bar += '-';
          }
        }

        process.stdout.write(`\r🎯 [${bar}]`);
      }, 100);

      // Wait for user input
      this.rl.once('line', () => {
        if (inputReceived) return;
        inputReceived = true;
        clearInterval(timer);

        console.log(''); // New line

        // Determine damage based on position
        let damage = zones.miss.damage;
        let result = 'MISS';

        if (position >= zones.perfect.start && position <= zones.perfect.end) {
          damage = zones.perfect.damage;
          result = Colors.blue('PERFECT HIT! 💥');
        } else if (position >= zones.good.start && position <= zones.good.end) {
          damage = zones.good.damage;
          result = Colors.green('GOOD HIT! ⚔️');
        } else if (position >= zones.okay.start && position <= zones.okay.end) {
          damage = zones.okay.damage;
          result = Colors.yellow('OKAY HIT! 🗡️');
        } else {
          result = Colors.red('MISS! 💨');
        }

        console.log(result);
        resolve(damage);
      });

      // Auto-resolve after 5 seconds
      setTimeout(() => {
        if (!inputReceived) {
          inputReceived = true;
          clearInterval(timer);
          console.log(Colors.red('\n⏰ Too slow! Attack missed!'));
          resolve(zones.miss.damage);
        }
      }, 5000);
    });
  }

  levelUp() {
    this.playerStats.level++;
    this.playerStats.maxHealth += 10;
    this.playerStats.health = this.playerStats.maxHealth; // Full heal on level up
    this.playerStats.maxMana += 5;
    this.playerStats.mana = this.playerStats.maxMana;
    this.playerStats.attack += 2;
    this.playerStats.defense += 1;
    this.playerStats.experience = 0;

    console.log(Colors.rainbow('\n🎉 LEVEL UP! 🎉'));
    console.log(Colors.green(`🏆 You are now level ${this.playerStats.level}!`));
    console.log(Colors.cyan('📈 All stats increased!'));
  }

  showInventory() {
    console.log(Colors.cyan('\n📦 INVENTORY:'));
    console.log('┌' + '─'.repeat(48) + '┐');

    this.inventory.forEach((item, index) => {
      const line = `│ ${index + 1}. ${item.name}`.padEnd(49) + '│';
      console.log(Colors.white(line));
    });

    console.log('└' + '─'.repeat(48) + '┘');
    console.log(Colors.yellow(`💰 Gold: ${this.playerStats.gold}`));
  }

  showDetailedStats() {
    console.log(Colors.cyan('\n📊 DETAILED STATS:'));
    console.log('┌' + '─'.repeat(40) + '┐');
    console.log(`│ 🏆 Level: ${this.playerStats.level}`.padEnd(41) + '│');
    console.log(`│ ❤️  Health: ${this.playerStats.health}/${this.playerStats.maxHealth}`.padEnd(41) + '│');
    console.log(`│ 💙 Mana: ${this.playerStats.mana}/${this.playerStats.maxMana}`.padEnd(41) + '│');
    console.log(`│ ⚔️  Attack: ${this.playerStats.attack}`.padEnd(41) + '│');
    console.log(`│ 🛡️  Defense: ${this.playerStats.defense}`.padEnd(41) + '│');
    console.log(`│ ✨ Experience: ${this.playerStats.experience}`.padEnd(41) + '│');
    console.log(`│ 💰 Gold: ${this.playerStats.gold}`.padEnd(41) + '│');
    console.log('└' + '─'.repeat(40) + '┘');
  }

  showHelp() {
    console.log(Colors.cyan('\n❓ HELP:'));
    console.log(Colors.white(`
🎮 How to Play:
  • Use number keys (1-9) to select choices
  • Type 'v' to view your inventory
  • Type 's' to view detailed stats
  • Type 'h' to show this help
  • Type 'q' to quit the game

⚔️ Combat System:
  • Choose Attack, Defend, or Flee
  • Perfect timing in blue zone = maximum damage
  • Defending reduces incoming damage by half
  • Gain gold and experience from victories

🏆 Character Progression:
  • Gain experience from combat and story choices
  • Level up increases all your stats
  • Find better equipment in your adventures
  • Manage health and mana carefully

💡 Tips:
  • Read the story carefully for clues
  • Combat timing takes practice
  • Explore different story paths
  • Save gold for important purchases
`));
  }

  showEndScreen() {
    console.log(Colors.rainbow('\n🎊 ADVENTURE COMPLETE! 🎊'));
    console.log(Colors.yellow('Thank you for playing!'));

    console.log(Colors.cyan('\n📊 Final Statistics:'));
    console.log(`🏆 Final Level: ${this.playerStats.level}`);
    console.log(`💰 Gold Earned: ${this.playerStats.gold}`);
    console.log(`✨ Experience: ${this.playerStats.experience}`);

    console.log(Colors.magenta('\n🎮 Want to play again? Run the game again!'));
  }

  async promptUser(question) {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer.trim());
      });
    });
  }

  quit() {
    console.log(Colors.yellow('\n👋 Thanks for playing! See you next time!'));
    this.rl.close();
    process.exit(0);
  }
}

// Start the enhanced game
async function main() {
  try {
    const game = new EnhancedStoryRunner();
    await game.initialize();
  } catch (error) {
    console.error(Colors.red('❌ Game Error:', error.message));
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log(Colors.yellow('\n\n👋 Game interrupted. Goodbye!'));
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log(Colors.yellow('\n\n👋 Game terminated. Goodbye!'));
  process.exit(0);
});

// Start the game
main();