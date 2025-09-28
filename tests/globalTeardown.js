/**
 * Global teardown for Jest tests
 * Runs once after all tests complete
 */

export default async function globalTeardown() {
  console.log('🧹 Cleaning up test environment...');

  // Close test database
  if (global.__TEST_DATABASE__) {
    try {
      global.__TEST_DATABASE__.close();
      console.log('📊 Test database closed');
    } catch (error) {
      console.warn('⚠️ Error closing test database:', error.message);
    }
  }

  // Clean up test files
  await cleanupTestFiles();

  // Clear test environment variables
  delete process.env.CLAUDE_API_KEY;
  delete process.env.DEEPSEEK_API_KEY;
  delete process.env.GROQ_API_KEY;

  console.log('✅ Test environment cleanup complete');
}

async function cleanupTestFiles() {
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

    try {
      if (fs.existsSync(dirPath)) {
        fs.rmSync(dirPath, { recursive: true, force: true });
        console.log(`🗑️ Cleaned up ${dir}`);
      }
    } catch (error) {
      console.warn(`⚠️ Could not clean up ${dir}:`, error.message);
    }
  }
}