/**
 * Enhanced UI System
 * Rich console interface with ASCII art, animations, and visual effects
 */

import chalk from 'chalk';
import figlet from 'figlet';
import gradient from 'gradient-string';
import ora from 'ora';
import cliProgress from 'cli-progress';
import blessed from 'blessed';
import Logger from './Logger.js';
import ConfigManager from './ConfigManager.js';

export class ASCIIArt {
  static titleScreen() {
    return figlet.textSync('STORY QUEST', {
      font: 'ANSI Shadow',
      horizontalLayout: 'default',
      verticalLayout: 'default'
    });
  }

  static combatHeader() {
    return `
⚔️ ═══════════════════════════════════════════════════════════════ ⚔️
                            COMBAT ENGAGED
⚔️ ═══════════════════════════════════════════════════════════════ ⚔️`;
  }

  static healthBar(current, max, width = 20) {
    const percentage = current / max;
    const filled = Math.floor(percentage * width);
    const empty = width - filled;

    let color = chalk.green;
    if (percentage < 0.3) color = chalk.red;
    else if (percentage < 0.6) color = chalk.yellow;

    return color('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));
  }

  static manaBar(current, max, width = 20) {
    const percentage = current / max;
    const filled = Math.floor(percentage * width);
    const empty = width - filled;

    return chalk.blue('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));
  }

  static experienceBar(current, required, width = 30) {
    const percentage = current / required;
    const filled = Math.floor(percentage * width);
    const empty = width - filled;

    return chalk.cyan('▓'.repeat(filled)) + chalk.gray('░'.repeat(empty));
  }

  static inventoryFrame(items) {
    const maxWidth = 50;
    let content = `┌${'─'.repeat(maxWidth - 2)}┐\n`;
    content += `│${' '.repeat(Math.floor((maxWidth - 12) / 2))}📦 INVENTORY${' '.repeat(Math.ceil((maxWidth - 12) / 2))}│\n`;
    content += `├${'─'.repeat(maxWidth - 2)}┤\n`;

    items.forEach((item, index) => {
      const line = `│ ${index + 1}. ${item.name}${' '.repeat(maxWidth - item.name.length - 6)}│`;
      content += line + '\n';
    });

    content += `└${'─'.repeat(maxWidth - 2)}┘`;
    return content;
  }

  static questLog(quests) {
    let content = `
📋 ═══════════════════════════════════════════════════════════════
                             QUEST LOG
═══════════════════════════════════════════════════════════════\n`;

    quests.forEach(quest => {
      const status = quest.completed ? '✅' : '🔄';
      content += `${status} ${quest.title}\n`;
      content += `   ${quest.description}\n`;
      if (quest.progress) {
        const progressBar = this.experienceBar(quest.progress.current, quest.progress.required, 20);
        content += `   Progress: [${progressBar}] ${quest.progress.current}/${quest.progress.required}\n`;
      }
      content += '\n';
    });

    return content;
  }

  static combatTimingBar(position, zones, width = 60) {
    let bar = '';
    for (let i = 0; i < width; i++) {
      if (i === Math.floor(position)) {
        bar += chalk.whiteBright.bgBlack('█');
      } else if (i >= zones.perfect.start && i <= zones.perfect.end) {
        bar += chalk.bgBlue(' ');
      } else if (i >= zones.good.start && i <= zones.good.end) {
        bar += chalk.bgGreen(' ');
      } else if (i >= zones.okay.start && i <= zones.okay.end) {
        bar += chalk.bgYellow(' ');
      } else {
        bar += chalk.bgRed(' ');
      }
    }
    return bar;
  }

  static damageNumbers(damage, type = 'normal') {
    switch (type) {
      case 'critical':
        return chalk.red.bold(`💥 ${damage} CRITICAL!`);
      case 'heal':
        return chalk.green(`💚 +${damage} HP`);
      case 'magic':
        return chalk.magenta(`✨ ${damage} MAGIC`);
      case 'miss':
        return chalk.gray('💨 MISS');
      default:
        return chalk.white(`⚔️ ${damage}`);
    }
  }

  static statusEffects(effects) {
    return effects.map(effect => {
      switch (effect.type) {
        case 'poison': return '☠️ Poisoned';
        case 'burn': return '🔥 Burning';
        case 'freeze': return '❄️ Frozen';
        case 'shield': return '🛡️ Shielded';
        case 'blessed': return '✨ Blessed';
        case 'cursed': return '😈 Cursed';
        default: return `🔮 ${effect.type}`;
      }
    }).join(' ');
  }

  static levelUpAnimation() {
    return gradient.rainbow(`
🎉 ═══════════════════════════════════════════════════════════════ 🎉
                             LEVEL UP!
🎉 ═══════════════════════════════════════════════════════════════ 🎉
`);
  }

  static gameOverScreen(victory = false) {
    if (victory) {
      return gradient.rainbow(figlet.textSync('VICTORY!', { font: 'Big' }));
    } else {
      return chalk.red(figlet.textSync('GAME OVER', { font: 'Big' }));
    }
  }
}

export class SoundEffects {
  static play(effect) {
    if (!ConfigManager.ui.soundEnabled) return;

    // In a real implementation, this would play actual sound files
    // For now, we'll use visual sound indicators
    switch (effect) {
      case 'sword_hit':
        console.log(chalk.yellow('⚔️ *CLANG*'));
        break;
      case 'magic_cast':
        console.log(chalk.magenta('✨ *WHOOSH*'));
        break;
      case 'level_up':
        console.log(chalk.rainbow('🎵 *LEVEL UP JINGLE*'));
        break;
      case 'critical_hit':
        console.log(chalk.red('💥 *CRITICAL HIT*'));
        break;
      case 'heal':
        console.log(chalk.green('💚 *HEALING CHIME*'));
        break;
      case 'enemy_death':
        console.log(chalk.gray('💀 *DEATH RATTLE*'));
        break;
      case 'treasure':
        console.log(chalk.yellow('💰 *COIN JINGLE*'));
        break;
      case 'footsteps':
        console.log(chalk.gray('👣 *step step*'));
        break;
    }
  }
}

export class AnimatedUI {
  constructor() {
    this.spinner = null;
    this.progressBar = null;
  }

  showLoadingSpinner(text = 'Loading...') {
    this.spinner = ora({
      text: chalk.cyan(text),
      spinner: 'dots12',
      color: 'cyan'
    }).start();
  }

  stopLoadingSpinner(message = null) {
    if (this.spinner) {
      if (message) {
        this.spinner.succeed(chalk.green(message));
      } else {
        this.spinner.stop();
      }
      this.spinner = null;
    }
  }

  createProgressBar(total, label = 'Progress') {
    this.progressBar = new cliProgress.SingleBar({
      format: `${chalk.cyan(label)} |{bar}| {percentage}% | {value}/{total}`,
      barCompleteChar: '█',
      barIncompleteChar: '░',
      hideCursor: true
    });
    this.progressBar.start(total, 0);
    return this.progressBar;
  }

  typewriterEffect(text, delay = 50) {
    return new Promise(resolve => {
      let i = 0;
      const timer = setInterval(() => {
        process.stdout.write(text.charAt(i));
        i++;
        if (i >= text.length) {
          clearInterval(timer);
          console.log(); // New line
          resolve();
        }
      }, delay);
    });
  }

  async animateHealthChange(oldHealth, newHealth, maxHealth) {
    const steps = 10;
    const healthDiff = newHealth - oldHealth;
    const stepSize = healthDiff / steps;

    for (let i = 0; i <= steps; i++) {
      const currentHealth = oldHealth + (stepSize * i);
      const bar = ASCIIArt.healthBar(Math.floor(currentHealth), maxHealth);
      process.stdout.write(`\r❤️  Health: [${bar}] ${Math.floor(currentHealth)}/${maxHealth}`);
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    console.log();
  }

  async combatDamageAnimation(attacker, defender, damage, type = 'normal') {
    // Show attacker animation
    console.log(chalk.cyan(`${attacker} attacks!`));
    await new Promise(resolve => setTimeout(resolve, 300));

    // Show damage numbers with animation
    const damageText = ASCIIArt.damageNumbers(damage, type);
    console.log(`                    ${damageText}`);
    SoundEffects.play(type === 'critical' ? 'critical_hit' : 'sword_hit');

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  async spellCastAnimation(caster, spell, target = null) {
    console.log(chalk.magenta(`✨ ${caster} begins casting ${spell}...`));
    await new Promise(resolve => setTimeout(resolve, 800));

    console.log(chalk.magenta('🌟 ═══ MAGIC ENERGY BUILDS ═══ 🌟'));
    SoundEffects.play('magic_cast');

    await new Promise(resolve => setTimeout(resolve, 600));

    if (target) {
      console.log(chalk.magenta(`💥 ${spell} hits ${target}!`));
    } else {
      console.log(chalk.magenta(`✨ ${spell} takes effect!`));
    }
  }
}

export class TerminalUI {
  constructor() {
    this.screen = null;
    this.boxes = {};
    this.setupTerminalUI();
  }

  setupTerminalUI() {
    if (!process.stdout.isTTY) return;

    this.screen = blessed.screen({
      smartCSR: true,
      title: 'Story Quest RPG'
    });

    // Main story box
    this.boxes.story = blessed.box({
      top: 0,
      left: 0,
      width: '70%',
      height: '60%',
      content: '',
      tags: true,
      border: {
        type: 'line'
      },
      style: {
        fg: 'white',
        bg: 'black',
        border: {
          fg: 'cyan'
        }
      },
      scrollable: true,
      alwaysScroll: true,
      scrollbar: {
        ch: ' ',
        track: {
          bg: 'cyan'
        },
        style: {
          inverse: true
        }
      }
    });

    // Player stats box
    this.boxes.stats = blessed.box({
      top: 0,
      left: '70%',
      width: '30%',
      height: '60%',
      content: '',
      tags: true,
      border: {
        type: 'line'
      },
      style: {
        fg: 'white',
        bg: 'black',
        border: {
          fg: 'green'
        }
      },
      label: ' Player Stats '
    });

    // Combat log box
    this.boxes.combat = blessed.box({
      top: '60%',
      left: 0,
      width: '100%',
      height: '25%',
      content: '',
      tags: true,
      border: {
        type: 'line'
      },
      style: {
        fg: 'white',
        bg: 'black',
        border: {
          fg: 'red'
        }
      },
      label: ' Combat Log ',
      scrollable: true
    });

    // Input box
    this.boxes.input = blessed.textbox({
      bottom: 0,
      left: 0,
      width: '100%',
      height: 3,
      content: '',
      tags: true,
      border: {
        type: 'line'
      },
      style: {
        fg: 'white',
        bg: 'black',
        border: {
          fg: 'yellow'
        }
      },
      label: ' Input ',
      inputOnFocus: true
    });

    // Add all boxes to screen
    Object.values(this.boxes).forEach(box => this.screen.append(box));

    // Key bindings
    this.screen.key(['escape', 'q', 'C-c'], () => {
      return process.exit(0);
    });

    this.screen.render();
  }

  updateStoryText(text) {
    if (this.boxes.story) {
      this.boxes.story.setContent(text);
      this.screen.render();
    }
  }

  updatePlayerStats(stats) {
    if (this.boxes.stats) {
      const healthBar = ASCIIArt.healthBar(stats.health, stats.maxHealth, 15);
      const manaBar = ASCIIArt.manaBar(stats.mana || 0, stats.maxMana || 100, 15);

      const content = `
{bold}❤️  Health:{/bold}
[${healthBar}]
${stats.health}/${stats.maxHealth}

{bold}💙 Mana:{/bold}
[${manaBar}]
${stats.mana || 0}/${stats.maxMana || 100}

{bold}⚔️  Attack:{/bold} ${stats.attack}
{bold}🛡️  Defense:{/bold} ${stats.defense}
{bold}🏆 Level:{/bold} ${stats.level}
{bold}💰 Gold:{/bold} ${stats.gold}

{bold}📊 Status:{/bold}
${stats.statusEffects || 'Normal'}
`;

      this.boxes.stats.setContent(content);
      this.screen.render();
    }
  }

  addCombatLog(message) {
    if (this.boxes.combat) {
      const current = this.boxes.combat.getContent();
      this.boxes.combat.setContent(current + message + '\n');
      this.boxes.combat.scroll(1);
      this.screen.render();
    }
  }

  clearCombatLog() {
    if (this.boxes.combat) {
      this.boxes.combat.setContent('');
      this.screen.render();
    }
  }

  getInput(prompt) {
    return new Promise(resolve => {
      if (this.boxes.input) {
        this.boxes.input.setValue('');
        this.boxes.input.focus();
        this.boxes.input.on('submit', value => {
          resolve(value);
        });
      } else {
        resolve('');
      }
    });
  }

  destroy() {
    if (this.screen) {
      this.screen.destroy();
    }
  }
}

export class EnhancedUI {
  constructor() {
    this.animator = new AnimatedUI();
    this.terminal = null;
    this.currentTheme = ConfigManager.ui.colorTheme;

    if (ConfigManager.ui.asciiArtEnabled && process.stdout.isTTY) {
      this.terminal = new TerminalUI();
    }
  }

  showTitleScreen() {
    console.clear();
    const title = ASCIIArt.titleScreen();
    console.log(gradient.rainbow(title));
    console.log(chalk.cyan('\n' + '═'.repeat(60)));
    console.log(chalk.yellow('        🎮 Interactive RPG Adventure System 🎮'));
    console.log(chalk.cyan('═'.repeat(60) + '\n'));
  }

  showStoryPage(page, playerStats) {
    if (this.terminal) {
      this.terminal.updateStoryText(page.text);
      this.terminal.updatePlayerStats(playerStats);
    } else {
      console.log(chalk.cyan('\n' + '═'.repeat(80)));
      console.log(chalk.white(page.text));
      console.log(chalk.cyan('═'.repeat(80)));
    }
  }

  showChoices(choices) {
    console.log(chalk.yellow('\n📋 What do you do?'));
    choices.forEach((choice, index) => {
      const number = chalk.cyan(`[${index + 1}]`);
      const text = chalk.white(choice.text);
      console.log(`${number} ${text}`);
    });
  }

  showPlayerStats(stats) {
    const healthBar = ASCIIArt.healthBar(stats.health, stats.maxHealth);
    const manaBar = ASCIIArt.manaBar(stats.mana || 0, stats.maxMana || 100);

    console.log(chalk.cyan('\n📊 PLAYER STATS:'));
    console.log(`❤️  Health: [${healthBar}] ${stats.health}/${stats.maxHealth}`);
    if (stats.mana !== undefined) {
      console.log(`💙 Mana: [${manaBar}] ${stats.mana}/${stats.maxMana}`);
    }
    console.log(`⚔️  Attack: ${stats.attack} | 🛡️  Defense: ${stats.defense}`);
    console.log(`🏆 Level: ${stats.level} | 💰 Gold: ${stats.gold}`);

    if (stats.statusEffects && stats.statusEffects.length > 0) {
      console.log(`🔮 Effects: ${ASCIIArt.statusEffects(stats.statusEffects)}`);
    }
  }

  showInventory(items) {
    console.log(ASCIIArt.inventoryFrame(items));
  }

  showQuestLog(quests) {
    console.log(ASCIIArt.questLog(quests));
  }

  showCombatHeader(playerName, enemyName) {
    console.log(ASCIIArt.combatHeader());
    console.log(chalk.green(`${playerName}`) + chalk.white(' VS ') + chalk.red(`${enemyName}`));
  }

  async showDamageAnimation(attacker, defender, damage, type = 'normal') {
    await this.animator.combatDamageAnimation(attacker, defender, damage, type);
  }

  async showSpellAnimation(caster, spell, target = null) {
    await this.animator.spellCastAnimation(caster, spell, target);
  }

  async showHealthChange(oldHealth, newHealth, maxHealth) {
    await this.animator.animateHealthChange(oldHealth, newHealth, maxHealth);
  }

  showTimingBar(position, zones, width = 60) {
    const bar = ASCIIArt.combatTimingBar(position, zones, width);
    process.stdout.write(`\rTiming: [${bar}]`);
  }

  showLevelUp(newLevel, statsGained) {
    console.log(ASCIIArt.levelUpAnimation());
    console.log(chalk.yellow(`🎉 Congratulations! You reached level ${newLevel}!`));

    if (statsGained) {
      Object.entries(statsGained).forEach(([stat, gain]) => {
        console.log(chalk.green(`📈 ${stat.toUpperCase()}: +${gain}`));
      });
    }

    SoundEffects.play('level_up');
  }

  showGameOver(victory = false, stats = {}) {
    console.clear();
    console.log(ASCIIArt.gameOverScreen(victory));

    if (victory) {
      console.log(chalk.green('\n🎉 Congratulations! You have completed your adventure!'));
      SoundEffects.play('level_up');
    } else {
      console.log(chalk.red('\n💀 Your adventure has come to an end...'));
      SoundEffects.play('enemy_death');
    }

    if (stats.level) {
      console.log(chalk.cyan('\n📊 Final Statistics:'));
      console.log(`🏆 Level Reached: ${stats.level}`);
      console.log(`💰 Gold Collected: ${stats.gold}`);
      console.log(`⚔️  Battles Won: ${stats.battlesWon || 0}`);
      console.log(`🗡️  Enemies Defeated: ${stats.enemiesDefeated || 0}`);
      console.log(`📚 Stories Completed: ${stats.storiesCompleted || 1}`);
    }
  }

  async typeText(text, delay = 30) {
    if (ConfigManager.ui.animationEnabled) {
      await this.animator.typewriterEffect(text, delay);
    } else {
      console.log(text);
    }
  }

  showLoadingSpinner(text) {
    this.animator.showLoadingSpinner(text);
  }

  hideLoadingSpinner(message) {
    this.animator.stopLoadingSpinner(message);
  }

  createProgressBar(total, label) {
    return this.animator.createProgressBar(total, label);
  }

  playSound(effect) {
    SoundEffects.play(effect);
  }

  cleanup() {
    if (this.terminal) {
      this.terminal.destroy();
    }
  }
}

export default EnhancedUI;