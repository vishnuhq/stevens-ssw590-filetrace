import { beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connectToDb, closeConnection, getDb } from '../config/index.js';

let mongoServer;

// Warn if someone has MONGODB_URI set (we ignore it for safety)
if (process.env.MONGODB_URI) {
  console.warn(
    'WARNING: MONGODB_URI environment variable detected but ignored.',
    'Tests ALWAYS use MongoDB Memory Server for isolation and security.'
  );
}

/**
 * Mock AWS S3 operations for testing
 * This prevents actual S3 calls during tests
 */
vi.mock('../utils/s3.js', () => ({
  uploadToS3: vi.fn(async (buffer, userId, filename) => ({
    s3Key: `test/${userId}/${Date.now()}-${filename}`,
  })),
  getDownloadUrl: vi.fn(
    async (s3Key, filename) =>
      `https://mock-s3-url.com/${s3Key}?filename=${encodeURIComponent(
        filename
      )}`
  ),
  deleteFromS3: vi.fn(async () => {}),
}));

/**
 * Connect to test database before all tests
 * ALWAYS uses MongoDB Memory Server for isolation and security
 */
beforeAll(async () => {
  // Start in-memory MongoDB server (always used)
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();
  process.env.DB_NAME = 'filetrace-test';
  process.env.JWT_SECRET =
    'test-jwt-secret-for-unit-tests-only-do-not-use-in-production';
  console.log('Using MongoDB Memory Server (in-memory test database)');

  await connectToDb();
});

/**
 * Clean all collections before each test
 * This ensures test isolation
 */
beforeEach(async () => {
  const db = getDb();
  const collections = await db.listCollections().toArray();

  for (const collection of collections) {
    await db.collection(collection.name).deleteMany({});
  }
});

/**
 * Close database connection and stop in-memory server after all tests
 */
afterAll(async () => {
  await closeConnection();
  await mongoServer.stop();
  console.log('Stopped MongoDB Memory Server');
});
