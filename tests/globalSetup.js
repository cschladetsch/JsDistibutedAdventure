/**
 * Global setup for Jest tests
 * Runs once before all tests
 */

export default async function globalSetup() {
  console.log('🧪 Setting up test environment...');

  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.LOG_LEVEL = 'error';
  process.env.VERBOSE_LOGGING = 'false';

  // Mock API keys for testing
  process.env.CLAUDE_API_KEY = 'test_claude_key_' + Date.now();
  process.env.DEEPSEEK_API_KEY = 'test_deepseek_key_' + Date.now();
  process.env.GROQ_API_KEY = 'test_groq_key_' + Date.now();

  // Test database setup
  process.env.DATABASE_URL = 'sqlite::memory:';

  // Disable real network requests in tests
  process.env.ENABLE_WEB_ENHANCEMENT = 'false';

  // Set test-specific configurations
  process.env.COMBAT_ANIMATION_SPEED = '1'; // Speed up animations for tests
  process.env.DEFAULT_STORY_LENGTH = '5'; // Shorter stories for tests
  process.env.MULTIPLAYER_SESSION_TIMEOUT = '30000'; // 30 seconds for tests

  // Create test directories if they don't exist
  const fs = await import('fs');
  const path = await import('path');

  const testDirs = [
    'test-output',
    'test-stories',
    'test-logs',
    'test-data'
  ];

  for (const dir of testDirs) {
    const dirPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  // Start test services if needed
  global.__TEST_DATABASE__ = await setupTestDatabase();
  global.__TEST_MULTIPLAYER_PORT__ = await findAvailablePort(3001);

  console.log('✅ Test environment setup complete');
}

async function setupTestDatabase() {
  // In-memory SQLite database for tests
  try {
    const Database = (await import('better-sqlite3')).default;
    const db = new Database(':memory:');

    // Create test tables
    db.exec(`
      CREATE TABLE IF NOT EXISTS test_stories (
        id TEXT PRIMARY KEY,
        title TEXT,
        content TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS test_players (
        id TEXT PRIMARY KEY,
        name TEXT,
        profile TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS test_sessions (
        id TEXT PRIMARY KEY,
        host_id TEXT,
        state TEXT,
        data TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('📊 Test database initialized');
    return db;
  } catch (error) {
    console.warn('⚠️ Could not initialize test database:', error.message);
    return null;
  }
}

async function findAvailablePort(startPort = 3001) {
  const net = await import('net');

  return new Promise((resolve) => {
    const server = net.createServer();

    server.listen(startPort, () => {
      const port = server.address().port;
      server.close(() => {
        resolve(port);
      });
    });

    server.on('error', () => {
      resolve(findAvailablePort(startPort + 1));
    });
  });
}