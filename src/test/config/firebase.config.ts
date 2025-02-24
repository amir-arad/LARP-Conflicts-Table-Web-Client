import { FirebaseOptions } from 'firebase/app';

/**
 * Test-specific Firebase configuration
 */
export const testFirebaseConfig: FirebaseOptions = {
  databaseURL: 'https://test-db.firebaseio.com',
  projectId: 'test-project',
};

/**
 * Test paths for Firebase database operations
 */
export const TEST_PATHS = {
  INVALID_PATH: 'invalid/path',
  TEST_PATH: 'test/path',
  PRESENCE_PATH: 'presence/user1',
} as const;

/**
 * Test data for Firebase operations
 */
export const TEST_DATA = {
  INITIAL_PRESENCE: { status: 'online' },
  CLEANUP_PRESENCE: { status: 'offline' },
  TEST_VALUE: { key: 'value' },
} as const;
