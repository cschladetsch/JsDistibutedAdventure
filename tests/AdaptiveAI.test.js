/**
 * Test suite for Adaptive AI System
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import {
  PlayerProfile,
  AdaptiveStoryGenerator
} from '../lib/AdaptiveAI.js';

describe('PlayerProfile', () => {
  let profile;

  beforeEach(() => {
    profile = new PlayerProfile('test_player');
  });

  test('should create profile with default values', () => {
    expect(profile.playerId).toBe('test_player');
    expect(profile.preferences.difficultyPreference).toBe(0.5);
    expect(profile.history.storiesCompleted).toBe(0);
    expect(profile.currentSession.engagement).toBe(0.5);
  });

  test('should record choices and categorize them', () => {
    const choice = { text: 'Attack the enemy with your sword!' };
    const timeToDecide = 3000;

    profile.recordChoice(choice, timeToDecide);

    expect(profile.history.totalChoices).toBe(1);
    expect(profile.currentSession.choices).toHaveLength(1);
    expect(profile.preferences.choicePatterns.get('aggressive')).toBe(1);
  });

  test('should categorize different choice types correctly', () => {
    const choices = [
      { text: 'Attack immediately', expected: 'aggressive' },
      { text: 'Try to negotiate peacefully', expected: 'diplomatic' },
      { text: 'Sneak around quietly', expected: 'stealthy' },
      { text: 'Explore the area carefully', expected: 'exploratory' },
      { text: 'Help the injured person', expected: 'helpful' },
      { text: 'Flee from danger', expected: 'cautious' },
      { text: 'Continue forward', expected: 'neutral' }
    ];

    choices.forEach(({ text, expected }) => {
      const choiceType = profile.categorizeChoice({ text });
      expect(choiceType).toBe(expected);
    });
  });

  test('should update engagement based on decision time', () => {
    const initialEngagement = profile.currentSession.engagement;

    // Quick decision should increase engagement
    profile.updateEngagement(2000); // 2 seconds
    expect(profile.currentSession.engagement).toBeGreaterThan(initialEngagement);

    // Very slow decision should decrease engagement
    profile.updateEngagement(30000); // 30 seconds
    expect(profile.currentSession.engagement).toBeLessThan(initialEngagement);
  });

  test('should record combat results and adjust difficulty preference', () => {
    const initialDifficulty = profile.preferences.difficultyPreference;

    // Victory should increase difficulty preference
    profile.recordCombatResult(true, 0.6);
    expect(profile.preferences.difficultyPreference).toBeGreaterThan(initialDifficulty);
    expect(profile.history.combatWins).toBe(1);

    // Defeat should decrease difficulty preference
    const afterVictory = profile.preferences.difficultyPreference;
    profile.recordCombatResult(false, 0.8);
    expect(profile.preferences.difficultyPreference).toBeLessThan(afterVictory);
    expect(profile.history.combatLosses).toBe(1);
  });

  test('should record story completion and update preferences', () => {
    profile.recordStoryCompletion('fantasy', 4.5);

    expect(profile.history.storiesCompleted).toBe(1);
    expect(profile.preferences.storyTypes.get('fantasy')).toBe(4.5);

    // Second rating should be averaged
    profile.recordStoryCompletion('fantasy', 3.5);
    expect(profile.preferences.storyTypes.get('fantasy')).toBe(4.0);
  });

  test('should get preferred choice types', () => {
    // Simulate choice patterns
    profile.preferences.choicePatterns.set('aggressive', 10);
    profile.preferences.choicePatterns.set('diplomatic', 8);
    profile.preferences.choicePatterns.set('exploratory', 6);
    profile.preferences.choicePatterns.set('helpful', 2);

    const preferred = profile.getPreferredChoiceTypes();
    expect(preferred).toHaveLength(3);
    expect(preferred[0]).toBe('aggressive');
    expect(preferred[1]).toBe('diplomatic');
    expect(preferred[2]).toBe('exploratory');
  });

  test('should calculate adapted difficulty', () => {
    // Set up some history
    profile.history.combatWins = 7;
    profile.history.combatLosses = 3;
    profile.currentSession.engagement = 0.8;

    const difficulty = profile.getAdaptedDifficulty();
    expect(difficulty).toBeGreaterThan(0.5); // Should be above baseline
    expect(difficulty).toBeLessThanOrEqual(1.0);
  });

  test('should calculate skill level from combat history', () => {
    profile.history.combatWins = 8;
    profile.history.combatLosses = 2;
    profile.history.storiesCompleted = 5;

    const skillLevel = profile.getSkillLevel();
    expect(skillLevel).toBeGreaterThan(0.8); // High win rate + experience
  });

  test('should identify personality traits', () => {
    profile.preferences.choicePatterns.set('aggressive', 15);
    profile.preferences.choicePatterns.set('diplomatic', 20);
    profile.preferences.choicePatterns.set('helpful', 18);
    profile.preferences.choicePatterns.set('cautious', 5);

    const traits = profile.getPersonalityTraits();
    expect(traits).toContain('aggressive');
    expect(traits).toContain('diplomatic');
    expect(traits).toContain('altruistic');
    expect(traits).not.toContain('cautious');
  });

  test('should export and import profile data', () => {
    // Set up some data
    profile.recordChoice({ text: 'Attack!' }, 3000);
    profile.recordCombatResult(true, 0.6);
    profile.recordStoryCompletion('sci-fi', 4.0);

    const exported = profile.exportProfile();
    expect(exported.playerId).toBe('test_player');
    expect(exported.preferences.choicePatterns).toHaveProperty('aggressive');
    expect(exported.history.combatWins).toBe(1);

    const imported = PlayerProfile.fromExportedData(exported);
    expect(imported.playerId).toBe(profile.playerId);
    expect(imported.history.combatWins).toBe(profile.history.combatWins);
    expect(imported.preferences.choicePatterns.get('aggressive')).toBe(1);
  });
});

describe('AdaptiveStoryGenerator', () => {
  let generator;
  let mockBaseGenerator;

  beforeEach(() => {
    mockBaseGenerator = {
      generate: jest.fn().mockResolvedValue({
        id: 'test_story',
        title: 'Test Story',
        pages: {}
      })
    };

    generator = new AdaptiveStoryGenerator(mockBaseGenerator);
  });

  test('should create generator with base generator', () => {
    expect(generator.baseGenerator).toBe(mockBaseGenerator);
    expect(generator.playerProfiles).toBeInstanceOf(Map);
    expect(generator.storyTemplates).toBeInstanceOf(Map);
  });

  test('should load story templates', () => {
    expect(generator.storyTemplates.has('aggressive')).toBe(true);
    expect(generator.storyTemplates.has('diplomatic')).toBe(true);
    expect(generator.storyTemplates.has('exploratory')).toBe(true);
    expect(generator.storyTemplates.has('cautious')).toBe(true);
    expect(generator.storyTemplates.has('balanced')).toBe(true);
  });

  test('should get or create player profile', () => {
    const profile1 = generator.getPlayerProfile('player1');
    const profile2 = generator.getPlayerProfile('player1');

    expect(profile1).toBeInstanceOf(PlayerProfile);
    expect(profile1).toBe(profile2); // Should return same instance
    expect(profile1.playerId).toBe('player1');
  });

  test('should adapt prompt to player preferences', () => {
    const profile = generator.getPlayerProfile('test_player');
    profile.preferences.choicePatterns.set('aggressive', 20);
    profile.preferences.choicePatterns.set('diplomatic', 5);

    const basePrompt = 'A fantasy adventure';
    const adaptedPrompt = generator.adaptPromptToPlayer(basePrompt, profile);

    expect(adaptedPrompt).toContain(basePrompt);
    expect(adaptedPrompt).toContain('combat encounters');
    expect(adaptedPrompt).toContain('direct confrontations');
  });

  test('should adapt options to player preferences', () => {
    const profile = generator.getPlayerProfile('test_player');
    profile.currentSession.engagement = 0.8;
    profile.preferences.complexityLevel = 0.7;

    const baseOptions = { targetLength: 20 };
    const adaptedOptions = generator.adaptOptionsToPlayer(baseOptions, profile);

    expect(adaptedOptions.targetLength).toBeGreaterThan(20); // High engagement = longer story
    expect(adaptedOptions.complexity).toBe(0.7);
  });

  test('should generate adaptive story', async () => {
    const story = await generator.generateAdaptiveStory(
      'A space exploration story',
      'test_player'
    );

    expect(mockBaseGenerator.generate).toHaveBeenCalled();
    expect(story).toBeDefined();
  });

  test('should generate adaptive choices based on player preferences', async () => {
    const profile = generator.getPlayerProfile('test_player');
    profile.preferences.choicePatterns.set('aggressive', 10);
    profile.preferences.choicePatterns.set('diplomatic', 8);

    const currentPage = { id: 'test_page', text: 'You encounter a stranger' };
    const choices = await generator.generateAdaptiveChoices(currentPage, profile);

    expect(choices).toHaveLength(2); // Should have at least 2 choices
    expect(choices.some(choice => choice.type === 'aggressive')).toBe(true);
    expect(choices.some(choice => choice.type === 'diplomatic')).toBe(true);
  });

  test('should generate choice for specific type', () => {
    const currentPage = { id: 'test', text: 'Test scenario' };

    const aggressiveChoice = generator.generateChoiceForType('aggressive', currentPage);
    expect(aggressiveChoice.type).toBe('aggressive');
    expect(aggressiveChoice.text.toLowerCase()).toMatch(/attack|fight|combat|challenge/);

    const diplomaticChoice = generator.generateChoiceForType('diplomatic', currentPage);
    expect(diplomaticChoice.type).toBe('diplomatic');
    expect(diplomaticChoice.text.toLowerCase()).toMatch(/negotiate|peaceful|talk|help/);
  });

  test('should record player feedback and update preferences', () => {
    const profile = generator.getPlayerProfile('test_player');
    const initialComplexity = profile.preferences.complexityLevel;
    const initialDifficulty = profile.preferences.difficultyPreference;

    // Positive feedback with "too easy" flag
    generator.recordPlayerFeedback('test_player', 'story1', 4, { tooEasy: true });
    expect(profile.preferences.complexityLevel).toBeGreaterThan(initialComplexity);
    expect(profile.preferences.difficultyPreference).toBeGreaterThan(initialDifficulty);

    // Negative feedback with "too hard" flag
    generator.recordPlayerFeedback('test_player', 'story2', 2, { tooHard: true, tooComplex: true });
    expect(profile.preferences.difficultyPreference).toBeLessThan(initialDifficulty + 0.1);
    expect(profile.preferences.complexityLevel).toBeLessThan(initialComplexity + 0.1);
  });

  test('should get recommendations based on player traits', () => {
    const profile = generator.getPlayerProfile('test_player');
    profile.preferences.choicePatterns.set('aggressive', 20);
    profile.preferences.choicePatterns.set('exploratory', 15);

    const recommendations = generator.getRecommendations('test_player');

    expect(recommendations.storyTypes).toContain('action');
    expect(recommendations.storyTypes).toContain('combat');
    expect(recommendations.storyTypes).toContain('exploration');
    expect(recommendations.difficulty).toBeGreaterThan(0);
    expect(recommendations.estimatedEngagement).toBe(0.5);
  });

  test('should export and import player data', () => {
    const profile = generator.getPlayerProfile('test_player');
    profile.recordChoice({ text: 'Explore the cave' }, 4000);

    const exported = generator.exportPlayerData('test_player');
    expect(exported.playerId).toBe('test_player');

    generator.playerProfiles.delete('test_player'); // Remove original

    const imported = generator.importPlayerData(exported);
    expect(imported.playerId).toBe('test_player');
    expect(generator.playerProfiles.has('test_player')).toBe(true);
  });
});

describe('Integration Tests', () => {
  test('should simulate complete adaptive story generation workflow', async () => {
    const mockBaseGenerator = {
      generate: jest.fn().mockResolvedValue({
        id: 'adaptive_story',
        title: 'Adaptive Adventure',
        pages: {
          start: {
            id: 'start',
            text: 'Your adventure begins...',
            prompts: [
              { text: 'Go north', target: 'north' },
              { text: 'Go south', target: 'south' }
            ]
          }
        }
      })
    };

    const generator = new AdaptiveStoryGenerator(mockBaseGenerator);
    const playerId = 'integration_test_player';

    // Build up player profile through gameplay
    const profile = generator.getPlayerProfile(playerId);

    // Simulate some choices
    profile.recordChoice({ text: 'Attack the monster!' }, 2000);
    profile.recordChoice({ text: 'Charge into battle!' }, 1500);
    profile.recordChoice({ text: 'Fight with honor!' }, 3000);

    // Simulate combat results
    profile.recordCombatResult(true, 0.6);
    profile.recordCombatResult(true, 0.7);

    // Generate adaptive story
    const story = await generator.generateAdaptiveStory(
      'An epic fantasy adventure',
      playerId
    );

    expect(story).toBeDefined();
    expect(mockBaseGenerator.generate).toHaveBeenCalled();

    const callArgs = mockBaseGenerator.generate.mock.calls[0];
    const adaptedPrompt = callArgs[0];

    // Should include adaptations for aggressive player
    expect(adaptedPrompt).toContain('combat encounters');
    expect(adaptedPrompt).toContain('direct confrontations');
  });

  test('should handle player with mixed preferences', () => {
    const generator = new AdaptiveStoryGenerator({
      generate: jest.fn().mockResolvedValue({})
    });

    const profile = generator.getPlayerProfile('mixed_player');

    // Simulate mixed choice patterns
    profile.preferences.choicePatterns.set('aggressive', 10);
    profile.preferences.choicePatterns.set('diplomatic', 12);
    profile.preferences.choicePatterns.set('exploratory', 8);

    const traits = profile.getPersonalityTraits();
    expect(traits).toContain('aggressive');
    expect(traits).toContain('diplomatic');

    const basePrompt = 'A mysterious story';
    const adaptedPrompt = generator.adaptPromptToPlayer(basePrompt, profile);

    expect(adaptedPrompt).toContain('combat encounters');
    expect(adaptedPrompt).toContain('dialogue');
    expect(adaptedPrompt).toContain('negotiation');
  });
});