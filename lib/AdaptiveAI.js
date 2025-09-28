/**
 * Adaptive AI System
 * Learns from player choices and adapts story generation for better experiences
 */

import Logger from './Logger.js';
import ConfigManager from './ConfigManager.js';
import ErrorHandler, { AIError } from './ErrorHandler.js';

export class PlayerProfile {
  constructor(playerId = 'default') {
    this.playerId = playerId;
    this.preferences = {
      storyTypes: new Map(), // genre -> preference score
      choicePatterns: new Map(), // choice type -> frequency
      difficultyPreference: 0.5, // 0 = easy, 1 = hard
      pacing: 0.5, // 0 = slow, 1 = fast
      violenceLevel: 0.5, // 0 = peaceful, 1 = violent
      complexityLevel: 0.5 // 0 = simple, 1 = complex
    };
    this.history = {
      storiesCompleted: 0,
      totalChoices: 0,
      combatWins: 0,
      combatLosses: 0,
      favoriteGenres: [],
      avgSessionLength: 0,
      lastPlayed: null
    };
    this.currentSession = {
      startTime: Date.now(),
      choices: [],
      currentStoryType: null,
      engagement: 0.5, // Measured by choice speed and patterns
      difficulty: 0.5
    };
  }

  recordChoice(choice, timeToDecide) {
    this.currentSession.choices.push({
      choice,
      timeToDecide,
      timestamp: Date.now()
    });

    this.history.totalChoices++;

    // Update choice patterns
    const choiceType = this.categorizeChoice(choice);
    const currentCount = this.preferences.choicePatterns.get(choiceType) || 0;
    this.preferences.choicePatterns.set(choiceType, currentCount + 1);

    // Update engagement based on decision speed
    this.updateEngagement(timeToDecide);

    Logger.userAction('Choice recorded', {
      playerId: this.playerId,
      choice: choice.text,
      choiceType,
      timeToDecide,
      engagement: this.currentSession.engagement
    });
  }

  categorizeChoice(choice) {
    const text = choice.text.toLowerCase();

    if (text.includes('attack') || text.includes('fight') || text.includes('combat')) {
      return 'aggressive';
    } else if (text.includes('talk') || text.includes('negotiate') || text.includes('peaceful')) {
      return 'diplomatic';
    } else if (text.includes('sneak') || text.includes('hide') || text.includes('avoid')) {
      return 'stealthy';
    } else if (text.includes('explore') || text.includes('investigate') || text.includes('search')) {
      return 'exploratory';
    } else if (text.includes('help') || text.includes('assist') || text.includes('aid')) {
      return 'helpful';
    } else if (text.includes('flee') || text.includes('escape') || text.includes('run')) {
      return 'cautious';
    } else {
      return 'neutral';
    }
  }

  updateEngagement(timeToDecide) {
    // Engagement decreases with very long decision times (player might be distracted)
    // Engagement increases with quick, confident decisions
    const optimalTime = 5000; // 5 seconds is considered optimal
    const engagementDelta = Math.max(0, 1 - (timeToDecide / optimalTime)) * 0.1;

    this.currentSession.engagement = Math.max(0, Math.min(1,
      this.currentSession.engagement + engagementDelta - 0.05
    ));
  }

  recordCombatResult(victory, difficulty) {
    if (victory) {
      this.history.combatWins++;
      // Player succeeded, they might prefer slightly harder combat
      this.preferences.difficultyPreference = Math.min(1,
        this.preferences.difficultyPreference + 0.05
      );
    } else {
      this.history.combatLosses++;
      // Player failed, they might prefer slightly easier combat
      this.preferences.difficultyPreference = Math.max(0,
        this.preferences.difficultyPreference - 0.1
      );
    }

    Logger.userAction('Combat result recorded', {
      playerId: this.playerId,
      victory,
      difficulty,
      newDifficultyPreference: this.preferences.difficultyPreference
    });
  }

  recordStoryCompletion(storyType, rating = null) {
    this.history.storiesCompleted++;
    this.currentSession.currentStoryType = storyType;

    // Update story type preferences
    if (rating !== null) {
      const currentScore = this.preferences.storyTypes.get(storyType) || 0;
      const newScore = (currentScore + rating) / 2; // Average with previous rating
      this.preferences.storyTypes.set(storyType, newScore);
    }

    Logger.userAction('Story completed', {
      playerId: this.playerId,
      storyType,
      rating,
      totalCompleted: this.history.storiesCompleted
    });
  }

  getPreferredChoiceTypes() {
    const sorted = Array.from(this.preferences.choicePatterns.entries())
      .sort((a, b) => b[1] - a[1]);
    return sorted.slice(0, 3).map(([type]) => type);
  }

  getAdaptedDifficulty() {
    const baseDifficulty = this.preferences.difficultyPreference;
    const engagementBonus = (this.currentSession.engagement - 0.5) * 0.2;
    const skillBonus = this.getSkillLevel() * 0.1;

    return Math.max(0, Math.min(1, baseDifficulty + engagementBonus + skillBonus));
  }

  getSkillLevel() {
    const winRate = this.history.combatWins / Math.max(1, this.history.combatWins + this.history.combatLosses);
    const experienceBonus = Math.min(0.3, this.history.storiesCompleted * 0.02);
    return Math.min(1, winRate + experienceBonus);
  }

  getPersonalityTraits() {
    const choices = this.preferences.choicePatterns;
    const total = Array.from(choices.values()).reduce((sum, count) => sum + count, 0);

    if (total === 0) return ['balanced'];

    const traits = [];
    const threshold = total * 0.3; // 30% threshold

    if ((choices.get('aggressive') || 0) > threshold) traits.push('aggressive');
    if ((choices.get('diplomatic') || 0) > threshold) traits.push('diplomatic');
    if ((choices.get('exploratory') || 0) > threshold) traits.push('curious');
    if ((choices.get('helpful') || 0) > threshold) traits.push('altruistic');
    if ((choices.get('cautious') || 0) > threshold) traits.push('cautious');

    return traits.length > 0 ? traits : ['balanced'];
  }

  exportProfile() {
    return {
      playerId: this.playerId,
      preferences: {
        storyTypes: Object.fromEntries(this.preferences.storyTypes),
        choicePatterns: Object.fromEntries(this.preferences.choicePatterns),
        difficultyPreference: this.preferences.difficultyPreference,
        pacing: this.preferences.pacing,
        violenceLevel: this.preferences.violenceLevel,
        complexityLevel: this.preferences.complexityLevel
      },
      history: this.history,
      lastUpdated: Date.now()
    };
  }

  static fromExportedData(data) {
    const profile = new PlayerProfile(data.playerId);
    profile.preferences.storyTypes = new Map(Object.entries(data.preferences.storyTypes));
    profile.preferences.choicePatterns = new Map(Object.entries(data.preferences.choicePatterns));
    profile.preferences.difficultyPreference = data.preferences.difficultyPreference;
    profile.preferences.pacing = data.preferences.pacing;
    profile.preferences.violenceLevel = data.preferences.violenceLevel;
    profile.preferences.complexityLevel = data.preferences.complexityLevel;
    profile.history = data.history;
    return profile;
  }
}

export class AdaptiveStoryGenerator {
  constructor(baseGenerator) {
    this.baseGenerator = baseGenerator;
    this.playerProfiles = new Map();
    this.storyTemplates = new Map();
    this.contentAdaptations = new Map();
    this.loadStoryTemplates();
  }

  loadStoryTemplates() {
    // Define story template patterns for different player types
    this.storyTemplates.set('aggressive', {
      themes: ['combat', 'conflict', 'power', 'victory'],
      pacing: 'fast',
      combatFrequency: 'high',
      choiceTypes: ['aggressive', 'direct'],
      complexity: 'medium'
    });

    this.storyTemplates.set('diplomatic', {
      themes: ['negotiation', 'politics', 'relationships', 'peace'],
      pacing: 'medium',
      combatFrequency: 'low',
      choiceTypes: ['diplomatic', 'social'],
      complexity: 'high'
    });

    this.storyTemplates.set('exploratory', {
      themes: ['discovery', 'mystery', 'adventure', 'knowledge'],
      pacing: 'variable',
      combatFrequency: 'medium',
      choiceTypes: ['exploratory', 'investigative'],
      complexity: 'high'
    });

    this.storyTemplates.set('cautious', {
      themes: ['survival', 'safety', 'preparation', 'wisdom'],
      pacing: 'slow',
      combatFrequency: 'low',
      choiceTypes: ['cautious', 'defensive'],
      complexity: 'medium'
    });

    this.storyTemplates.set('balanced', {
      themes: ['adventure', 'growth', 'choice', 'journey'],
      pacing: 'medium',
      combatFrequency: 'medium',
      choiceTypes: ['varied'],
      complexity: 'medium'
    });
  }

  getPlayerProfile(playerId = 'default') {
    if (!this.playerProfiles.has(playerId)) {
      this.playerProfiles.set(playerId, new PlayerProfile(playerId));
    }
    return this.playerProfiles.get(playerId);
  }

  async generateAdaptiveStory(basePrompt, playerId = 'default', options = {}) {
    const profile = this.getPlayerProfile(playerId);
    const adaptedPrompt = this.adaptPromptToPlayer(basePrompt, profile);
    const adaptedOptions = this.adaptOptionsToPlayer(options, profile);

    Logger.aiInteraction('Generating adaptive story', {
      playerId,
      originalPrompt: basePrompt,
      adaptedPrompt,
      difficulty: profile.getAdaptedDifficulty(),
      personality: profile.getPersonalityTraits()
    });

    try {
      return await this.baseGenerator.generate(adaptedPrompt, adaptedOptions);
    } catch (error) {
      Logger.errorWithContext(error, {
        operation: 'adaptive_story_generation',
        playerId,
        prompt: basePrompt
      });
      throw new AIError('Adaptive story generation failed', { playerId, originalError: error });
    }
  }

  adaptPromptToPlayer(basePrompt, profile) {
    const traits = profile.getPersonalityTraits();
    const difficulty = profile.getAdaptedDifficulty();
    const preferredChoices = profile.getPreferredChoiceTypes();

    let adaptedPrompt = basePrompt;

    // Add personality-based modifications
    if (traits.includes('aggressive')) {
      adaptedPrompt += ' Include more combat encounters and direct confrontations. ';
    }
    if (traits.includes('diplomatic')) {
      adaptedPrompt += ' Focus on dialogue, negotiation, and social interactions. ';
    }
    if (traits.includes('curious')) {
      adaptedPrompt += ' Include mysteries, puzzles, and exploration opportunities. ';
    }
    if (traits.includes('cautious')) {
      adaptedPrompt += ' Provide safe options and preparation opportunities. ';
    }

    // Adjust difficulty
    if (difficulty > 0.7) {
      adaptedPrompt += ' Make choices more challenging with complex consequences. ';
    } else if (difficulty < 0.3) {
      adaptedPrompt += ' Keep choices straightforward with clear outcomes. ';
    }

    // Include preferred choice types
    if (preferredChoices.length > 0) {
      adaptedPrompt += ` Emphasize ${preferredChoices.join(', ')} choice options. `;
    }

    return adaptedPrompt;
  }

  adaptOptionsToPlayer(options, profile) {
    const adaptedOptions = { ...options };

    // Adjust story length based on engagement patterns
    if (profile.currentSession.engagement > 0.7) {
      adaptedOptions.targetLength = Math.floor((options.targetLength || 20) * 1.2);
    } else if (profile.currentSession.engagement < 0.3) {
      adaptedOptions.targetLength = Math.floor((options.targetLength || 20) * 0.8);
    }

    // Adjust complexity
    adaptedOptions.complexity = profile.preferences.complexityLevel;

    // Adjust pacing
    adaptedOptions.pacing = profile.preferences.pacing;

    // Adjust violence level
    adaptedOptions.violenceLevel = profile.preferences.violenceLevel;

    return adaptedOptions;
  }

  async generateAdaptiveChoices(currentPage, profile) {
    const traits = profile.getPersonalityTraits();
    const preferredTypes = profile.getPreferredChoiceTypes();

    const adaptiveChoices = [];

    // Always include at least one choice matching player's preferred style
    for (const preferredType of preferredTypes.slice(0, 2)) {
      const choice = this.generateChoiceForType(preferredType, currentPage);
      if (choice) adaptiveChoices.push(choice);
    }

    // Add balanced choices to provide variety
    const balancedChoices = this.generateBalancedChoices(currentPage, traits);
    adaptiveChoices.push(...balancedChoices);

    // Ensure we have 2-4 choices total
    while (adaptiveChoices.length < 2) {
      adaptiveChoices.push(this.generateGenericChoice(currentPage));
    }

    return adaptiveChoices.slice(0, 4);
  }

  generateChoiceForType(choiceType, currentPage) {
    const templates = {
      aggressive: [
        'Attack immediately',
        'Challenge them to combat',
        'Take what you want by force',
        'Intimidate them into submission'
      ],
      diplomatic: [
        'Try to negotiate',
        'Propose a peaceful solution',
        'Ask about their motivations',
        'Offer to help them'
      ],
      stealthy: [
        'Sneak around them',
        'Hide and observe',
        'Set a trap',
        'Move silently past'
      ],
      exploratory: [
        'Investigate further',
        'Search for more information',
        'Ask detailed questions',
        'Examine the area carefully'
      ],
      cautious: [
        'Proceed carefully',
        'Prepare for the worst',
        'Look for escape routes',
        'Test the situation first'
      ]
    };

    const options = templates[choiceType] || templates.neutral;
    const randomChoice = options[Math.floor(Math.random() * options.length)];

    return {
      text: randomChoice,
      type: choiceType,
      target: 'adaptive_generated_page'
    };
  }

  generateBalancedChoices(currentPage, traits) {
    // Generate 1-2 choices that complement the player's style
    const choices = [];

    if (!traits.includes('aggressive')) {
      choices.push(this.generateChoiceForType('aggressive', currentPage));
    }
    if (!traits.includes('diplomatic')) {
      choices.push(this.generateChoiceForType('diplomatic', currentPage));
    }

    return choices.filter(Boolean).slice(0, 2);
  }

  generateGenericChoice(currentPage) {
    const genericOptions = [
      'Continue forward',
      'Wait and see what happens',
      'Think about your options',
      'Look around for alternatives'
    ];

    return {
      text: genericOptions[Math.floor(Math.random() * genericOptions.length)],
      type: 'neutral',
      target: 'adaptive_generated_page'
    };
  }

  recordPlayerFeedback(playerId, storyId, rating, feedback = {}) {
    const profile = this.getPlayerProfile(playerId);

    // Update preferences based on feedback
    if (rating > 3) { // Positive feedback
      profile.preferences.complexityLevel = Math.min(1, profile.preferences.complexityLevel + 0.1);
      if (feedback.tooEasy) {
        profile.preferences.difficultyPreference = Math.min(1, profile.preferences.difficultyPreference + 0.1);
      }
    } else if (rating < 3) { // Negative feedback
      if (feedback.tooHard) {
        profile.preferences.difficultyPreference = Math.max(0, profile.preferences.difficultyPreference - 0.1);
      }
      if (feedback.tooComplex) {
        profile.preferences.complexityLevel = Math.max(0, profile.preferences.complexityLevel - 0.1);
      }
    }

    Logger.userAction('Player feedback recorded', {
      playerId,
      storyId,
      rating,
      feedback,
      updatedPreferences: profile.preferences
    });
  }

  getRecommendations(playerId) {
    const profile = this.getPlayerProfile(playerId);
    const traits = profile.getPersonalityTraits();

    const recommendations = {
      storyTypes: [],
      difficulty: profile.getAdaptedDifficulty(),
      estimatedEngagement: profile.currentSession.engagement
    };

    // Recommend story types based on player traits
    if (traits.includes('aggressive')) {
      recommendations.storyTypes.push('action', 'combat', 'conquest');
    }
    if (traits.includes('diplomatic')) {
      recommendations.storyTypes.push('political', 'social', 'mystery');
    }
    if (traits.includes('curious')) {
      recommendations.storyTypes.push('exploration', 'discovery', 'puzzle');
    }
    if (traits.includes('cautious')) {
      recommendations.storyTypes.push('survival', 'strategy', 'preparation');
    }

    return recommendations;
  }

  exportPlayerData(playerId) {
    const profile = this.getPlayerProfile(playerId);
    return profile.exportProfile();
  }

  importPlayerData(data) {
    const profile = PlayerProfile.fromExportedData(data);
    this.playerProfiles.set(profile.playerId, profile);
    return profile;
  }
}

export default AdaptiveStoryGenerator;