/**
 * Configuration management system
 * Handles loading and managing configuration from multiple sources
 */

import config from 'config';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

class ConfigManager {
  constructor() {
    this.loadEnvironment();
    this.validateConfig();
  }

  loadEnvironment() {
    // Load environment variables from .env file
    dotenv.config();
  }

  validateConfig() {
    const required = [
      'app.name',
      'app.version',
      'story.defaultLength',
      'combat.animationSpeed'
    ];

    for (const key of required) {
      if (!config.has(key)) {
        throw new Error(`Required configuration missing: ${key}`);
      }
    }
  }

  // App configuration
  get app() {
    return {
      name: config.get('app.name'),
      version: config.get('app.version'),
      port: process.env.PORT || config.get('app.port'),
      host: process.env.HOST || config.get('app.host'),
      nodeEnv: process.env.NODE_ENV || 'development'
    };
  }

  // Story generation settings
  get story() {
    return {
      defaultLength: parseInt(process.env.DEFAULT_STORY_LENGTH) || config.get('story.defaultLength'),
      maxLength: parseInt(process.env.MAX_STORY_LENGTH) || config.get('story.maxLength'),
      contentRating: process.env.CONTENT_RATING || config.get('story.contentRating'),
      enableWebEnhancement: process.env.ENABLE_WEB_ENHANCEMENT === 'true' || config.get('story.enableWebEnhancement'),
      enableXRatedContent: process.env.ENABLE_X_RATED_CONTENT === 'true' || config.get('story.enableXRatedContent'),
      autoSaveInterval: parseInt(process.env.AUTO_SAVE_INTERVAL) || config.get('story.autoSaveInterval'),
      backupCount: config.get('story.backupCount')
    };
  }

  // Combat system settings
  get combat() {
    return {
      animationSpeed: parseInt(process.env.COMBAT_ANIMATION_SPEED) || config.get('combat.animationSpeed'),
      timingBarDifficulty: process.env.TIMING_BAR_DIFFICULTY || config.get('combat.timingBarDifficulty'),
      enableSoundEffects: process.env.ENABLE_SOUND_EFFECTS === 'true' || config.get('combat.enableSoundEffects'),
      criticalHitChance: parseFloat(config.get('combat.criticalHitChance')),
      magicSystemEnabled: config.get('combat.magicSystemEnabled')
    };
  }

  // AI configuration
  get ai() {
    return {
      claudeApiKey: process.env.CLAUDE_API_KEY,
      deepseekApiKey: process.env.DEEPSEEK_API_KEY,
      groqApiKey: process.env.GROQ_API_KEY,
      googleApiKey: process.env.GOOGLE_API_KEY,
      claudeModel: config.get('ai.claudeModel'),
      deepseekModel: config.get('ai.deepseekModel'),
      maxRetries: config.get('ai.maxRetries'),
      requestTimeout: config.get('ai.requestTimeout'),
      rateLimitDelay: config.get('ai.rateLimitDelay'),
      enableAdaptiveDifficulty: config.get('ai.enableAdaptiveDifficulty')
    };
  }

  // UI settings
  get ui() {
    return {
      colorTheme: config.get('ui.colorTheme'),
      animationEnabled: config.get('ui.animationEnabled'),
      soundEnabled: config.get('ui.soundEnabled'),
      autoComplete: config.get('ui.autoComplete'),
      instantKeySelection: config.get('ui.instantKeySelection'),
      asciiArtEnabled: config.get('ui.asciiArtEnabled')
    };
  }

  // Logging configuration
  get logging() {
    return {
      level: process.env.LOG_LEVEL || config.get('logging.level'),
      enableConsole: config.get('logging.enableConsole'),
      enableFile: config.get('logging.enableFile'),
      maxFiles: config.get('logging.maxFiles'),
      maxSize: config.get('logging.maxSize')
    };
  }

  // Database settings
  get database() {
    return {
      url: process.env.DATABASE_URL || config.get('database.path'),
      type: config.get('database.type'),
      enableBackups: config.get('database.enableBackups')
    };
  }

  // Multiplayer settings
  get multiplayer() {
    return {
      enabled: config.get('multiplayer.enabled'),
      maxPlayers: config.get('multiplayer.maxPlayers'),
      sessionTimeout: config.get('multiplayer.sessionTimeout'),
      enableVoting: config.get('multiplayer.enableVoting')
    };
  }

  // Security settings
  get security() {
    return {
      enableApiKeyValidation: config.get('security.enableApiKeyValidation'),
      enableRateLimit: config.get('security.enableRateLimit'),
      maxRequestsPerMinute: config.get('security.maxRequestsPerMinute')
    };
  }

  // Development settings
  get development() {
    return {
      debugMode: process.env.DEBUG_MODE === 'true',
      verboseLogging: process.env.VERBOSE_LOGGING === 'true',
      isProduction: this.app.nodeEnv === 'production',
      isDevelopment: this.app.nodeEnv === 'development'
    };
  }

  // Check if API keys are configured
  hasApiKey(service) {
    const keys = {
      claude: this.ai.claudeApiKey,
      deepseek: this.ai.deepseekApiKey,
      groq: this.ai.groqApiKey,
      google: this.ai.googleApiKey
    };

    return !!(keys[service] && keys[service].length > 0);
  }

  // Get all configured API services
  getConfiguredServices() {
    const services = [];
    if (this.hasApiKey('claude')) services.push('claude');
    if (this.hasApiKey('deepseek')) services.push('deepseek');
    if (this.hasApiKey('groq')) services.push('groq');
    if (this.hasApiKey('google')) services.push('google');
    return services;
  }

  // Update configuration at runtime
  updateConfig(path, value) {
    try {
      // Note: config library doesn't support runtime updates
      // This is a placeholder for future implementation
      console.warn(`Runtime config updates not supported for: ${path}`);
      return false;
    } catch (error) {
      console.error('Failed to update configuration:', error);
      return false;
    }
  }

  // Get configuration summary for debugging
  getSummary() {
    return {
      app: {
        name: this.app.name,
        version: this.app.version,
        environment: this.app.nodeEnv
      },
      services: {
        configured: this.getConfiguredServices(),
        webEnhancement: this.story.enableWebEnhancement,
        multiplayer: this.multiplayer.enabled
      },
      features: {
        combat: this.combat.magicSystemEnabled,
        adaptiveAI: this.ai.enableAdaptiveDifficulty,
        asciiArt: this.ui.asciiArtEnabled
      }
    };
  }
}

// Export singleton instance
export default new ConfigManager();