/**
 * Jest configuration for JavaScript Distributed Story System
 */

export default {
  // Test environment
  testEnvironment: 'node',

  // Module system
  preset: 'es-modules',
  extensionsToTreatAsEsm: ['.js'],
  globals: {
    'ts-jest': {
      useESM: true
    }
  },

  // Transform configuration
  transform: {
    '^.+\\.js$': 'babel-jest'
  },

  // Module name mapping
  moduleNameMapping: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },

  // Test file patterns
  testMatch: [
    '**/tests/**/*.test.js',
    '**/__tests__/**/*.js',
    '**/*.(test|spec).js'
  ],

  // Coverage configuration
  collectCoverage: true,
  collectCoverageFrom: [
    'lib/**/*.js',
    '*.js',
    '!lib/**/*.test.js',
    '!tests/**/*.js',
    '!node_modules/**',
    '!coverage/**',
    '!docs/**',
    '!stories/**',
    '!config/**'
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },

  // Coverage reporters
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json'
  ],

  // Coverage directory
  coverageDirectory: 'coverage',

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  // Test timeout
  testTimeout: 10000,

  // Verbose output
  verbose: true,

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks after each test
  restoreMocks: true,

  // Error on deprecated features
  errorOnDeprecated: true,

  // Force exit after tests complete
  forceExit: true,

  // Detect open handles
  detectOpenHandles: true,

  // Max worker processes
  maxWorkers: '50%',

  // Test result processor
  testResultsProcessor: undefined,

  // Watch plugins
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ],

  // Module directories
  moduleDirectories: [
    'node_modules',
    'lib',
    '<rootDir>'
  ],

  // Ignored patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
    '/docs/',
    '/stories/'
  ],

  // Mock patterns
  unmockedModulePathPatterns: [
    'node_modules'
  ],

  // Notification settings
  notify: false,
  notifyMode: 'failure-change',

  // Snapshot serializers
  snapshotSerializers: [],

  // Watch mode configuration
  watchman: true,

  // Global setup/teardown
  globalSetup: '<rootDir>/tests/globalSetup.js',
  globalTeardown: '<rootDir>/tests/globalTeardown.js',

  // Project configuration for multi-project setups
  projects: undefined,

  // Cache directory
  cacheDirectory: '<rootDir>/.jest-cache',

  // Bail configuration
  bail: 0,

  // Timezone
  timers: 'real'
};