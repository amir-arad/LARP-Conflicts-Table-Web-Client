import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';
import { mockFirebase } from '../mocks-externals/firebase';
import '@testing-library/jest-dom/vitest';
import { deleteApp, getApps } from 'firebase/app';

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
      load: vi.fn((lib, callback) => callback()),
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
