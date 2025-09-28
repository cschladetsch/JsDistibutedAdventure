/**
 * Jest test setup configuration
 * Runs before each test file
 */

import { jest } from '@jest/globals';

// Global test configuration
global.console = {
  ...console,
  // Suppress console.log in tests unless explicitly needed
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error';
process.env.CLAUDE_API_KEY = 'test_claude_key';
process.env.DEEPSEEK_API_KEY = 'test_deepseek_key';

// Global test utilities
global.createMockSocket = () => ({
  readyState: 1, // WebSocket.OPEN
  send: jest.fn(),
  close: jest.fn(),
  on: jest.fn(),
  emit: jest.fn(),
  messages: []
});

global.createMockPlayer = (id = 'test_player', name = 'TestPlayer') => ({
  id,
  name,
  isHost: false,
  isReady: false,
  connected: true,
  vote: null,
  stats: {
    health: 100,
    maxHealth: 100,
    mana: 50,
    maxMana: 50,
    level: 1,
    gold: 0
  },
  lastActivity: Date.now()
});

global.createMockStory = (id = 'test_story') => ({
  id,
  title: 'Test Story',
  start_page_id: 'start',
  pages: {
    start: {
      id: 'start',
      text: 'Your adventure begins...',
      prompts: [
        { text: 'Go north', target_id: 'north' },
        { text: 'Go south', target_id: 'south' }
      ]
    },
    north: {
      id: 'north',
      text: 'You head north into the forest.',
      prompts: []
    },
    south: {
      id: 'south',
      text: 'You head south toward the village.',
      prompts: []
    }
  },
  getPage: function(pageId) {
    return this.pages[pageId] || null;
  }
});

// Mock timers by default
jest.useFakeTimers();

// Cleanup after each test
afterEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
});

// Global error handler for unhandled promise rejections in tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Extend Jest matchers
expect.extend({
  toBeValidChoice(received) {
    const pass = received &&
                 typeof received.text === 'string' &&
                 typeof received.target_id === 'string';

    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid choice`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid choice with text and target_id`,
        pass: false,
      };
    }
  },

  toBeValidPlayer(received) {
    const pass = received &&
                 typeof received.id === 'string' &&
                 typeof received.name === 'string' &&
                 typeof received.connected === 'boolean';

    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid player`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid player with id, name, and connected status`,
        pass: false,
      };
    }
  },

  toBeValidCombatResult(received) {
    const validTypes = ['hit', 'critical', 'miss', 'defend', 'flee'];
    const pass = received &&
                 validTypes.includes(received.type) &&
                 typeof received.damage === 'number';

    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid combat result`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid combat result with type and damage`,
        pass: false,
      };
    }
  }
});

// Test database setup (if needed)
global.setupTestDatabase = () => {
  // Mock database operations for testing
  return {
    connect: jest.fn().mockResolvedValue(true),
    disconnect: jest.fn().mockResolvedValue(true),
    clear: jest.fn().mockResolvedValue(true),
    insert: jest.fn().mockResolvedValue({ id: 'mock_id' }),
    update: jest.fn().mockResolvedValue(true),
    delete: jest.fn().mockResolvedValue(true),
    find: jest.fn().mockResolvedValue([])
  };
};

// Performance testing utilities
global.measurePerformance = (fn) => {
  const start = performance.now();
  const result = fn();
  const end = performance.now();

  return {
    result,
    duration: end - start
  };
};

global.measureAsyncPerformance = async (fn) => {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();

  return {
    result,
    duration: end - start
  };
};

// Mock WebSocket server for multiplayer tests
global.createMockWebSocketServer = () => ({
  on: jest.fn(),
  close: jest.fn(),
  clients: new Set(),
  emit: jest.fn(),
  address: jest.fn().mockReturnValue({ port: 3000 })
});

// Mock file system operations
global.mockFileSystem = {
  readFile: jest.fn(),
  writeFile: jest.fn(),
  exists: jest.fn(),
  mkdir: jest.fn(),
  readdir: jest.fn()
};

// Helper for testing event emitters
global.waitForEvent = (emitter, event, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Event '${event}' not emitted within ${timeout}ms`));
    }, timeout);

    emitter.once(event, (...args) => {
      clearTimeout(timer);
      resolve(args);
    });
  });
};

// Helper for testing async operations with timeout
global.withTimeout = (promise, timeout = 5000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Operation timed out after ${timeout}ms`)), timeout)
    )
  ]);
};