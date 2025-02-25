import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';
import { mockFirebase } from '../mocks-externals/firebase';
import '@testing-library/jest-dom/vitest';
import { deleteApp, getApps } from 'firebase/app';

// Import test environment setup to ensure environment variables are properly set
import './env-setup';

// Log environment variables for debugging (exclude sensitive values)
console.log('Test Environment Setup:');
console.log(
  'VITE_FIREBASE_PROJECT_ID:',
  import.meta.env.VITE_FIREBASE_PROJECT_ID || 'not set'
);
console.log(
  'VITE_GOOGLE_CLIENT_ID exists:',
  Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID)
);
console.log(
  'VITE_GOOGLE_SPREADSHEET_ID exists:',
  Boolean(import.meta.env.VITE_GOOGLE_SPREADSHEET_ID)
);
console.log(
  'VITE_ROLES_CONFLICT_SHEET_ID:',
  import.meta.env.VITE_ROLES_CONFLICT_SHEET_ID || 'not set'
);
// Check for CI environment (using import.meta.env instead of process.env)
console.log(
  'Running in CI:',
  Boolean(import.meta.env.CI || import.meta.env.VITE_CI)
);

// Global setup for integration tests
beforeEach(() => {
  // Reset all mocks before each test
  mockFirebase._reset();
  vi.clearAllMocks();

  // Mock window.gapi
  if (!window.gapi) {
    window.gapi = {
      client: {
        sheets: {
          spreadsheets: {
            values: {
              get: vi.fn(),
              update: vi.fn(),
              clear: vi.fn(),
            },
          },
        },
        load: vi.fn().mockResolvedValue(undefined),
        init: vi.fn().mockResolvedValue(undefined),
        setToken: vi.fn(),
      },
      load: vi.fn((_lib, callback) => callback()),
      auth: {
        getToken: vi.fn().mockReturnValue(null),
        setToken: vi.fn(),
      },
      auth2: {
        init: vi.fn().mockResolvedValue(undefined),
        getAuthInstance: vi.fn().mockReturnValue(null),
      },
      signin2: {
        render: vi.fn(),
      },
    } as unknown as typeof gapi;
  }
});

// Clean up after each test
afterEach(async () => {
  cleanup();

  // Clean up any Firebase apps
  const apps = getApps();
  await Promise.all(apps.map(app => deleteApp(app).catch(() => {})));
});
