/**
 * Test environment setup module
 *
 * This module will run before tests in the CI environment to bypass
 * environment variable checks by patching import.meta.env values
 */

// Conditionally patch environment variables in test environment
if (import.meta.env.NODE_ENV === 'test' || import.meta.env.VITE_CI) {
  console.log('Setting up test environment variables');

  // Create proxy for import.meta.env to provide default values for missing env vars
  const originalEnv = { ...import.meta.env };

  // List of required environment variables with default test values
  const testEnvDefaults = {
    VITE_FIREBASE_API_KEY: 'test-firebase-api-key',
    VITE_FIREBASE_AUTH_DOMAIN: 'test-project.firebaseapp.com',
    VITE_FIREBASE_DATABASE_URL: 'https://test-db.firebaseio.com',
    VITE_FIREBASE_PROJECT_ID: 'test-project',
    VITE_FIREBASE_STORAGE_BUCKET: 'test-project.appspot.com',
    VITE_FIREBASE_MESSAGING_SENDER_ID: '123456789012',
    VITE_FIREBASE_APP_ID: '1:123456789012:web:abcdef123456789012',
    VITE_FIREBASE_MEASUREMENT_ID: 'G-ABCDEF12345',
    VITE_GOOGLE_API_KEY: 'test-google-api-key',
    VITE_GOOGLE_CLIENT_ID: 'test-client-id.apps.googleusercontent.com',
    VITE_GOOGLE_SPREADSHEET_ID: 'test-spreadsheet-id',
    VITE_ROLES_CONFLICT_SHEET_ID: 'Sheet1',
  };

  // Apply default values for any missing environment variables
  Object.entries(testEnvDefaults).forEach(([key, defaultValue]) => {
    if (!originalEnv[key as keyof typeof originalEnv]) {
      console.log(`Setting default test value for ${key}`);
      // Use type assertion to safely set dynamic properties
      (originalEnv as Record<string, string>)[key] = defaultValue;
    }
  });
}
