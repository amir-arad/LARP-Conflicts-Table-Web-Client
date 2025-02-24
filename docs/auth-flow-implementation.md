# Auth Flow Integration Test Implementation Guide

## Overview

This document provides a detailed implementation guide for the authentication flow integration test. It builds on the general integration tests plan and focuses specifically on implementing the auth flow test described in `docs/test-flows/auth-flow.md`.

## Test Structure

The auth flow test will be structured as follows:

1. **Setup**: Configure the test environment with mocked external dependencies
2. **Test Cases**: Implement the three test cases from auth-flow.md
3. **Helpers**: Create helper functions for common operations

## Implementation Details

### 1. Create Integration Test Directory Structure

```
src/
└── test/
    └── integration/
        ├── setup.ts           # Global setup for integration tests
        ├── helpers.tsx        # Helper functions for integration tests
        ├── config.ts          # Configuration for integration tests
        └── auth-flow.test.tsx # Auth flow integration test
```

### 2. Setup File Implementation

```typescript
// src/test/integration/setup.ts
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';
import { mockFirebase } from '../mocks-externals/firebase';

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
afterEach(() => {
  cleanup();
});
```

### 3. Config File Implementation

```typescript
// src/test/integration/config.ts
import { FirebaseOptions } from 'firebase/app';
import { ClientLoadStatus } from '../../contexts/AuthContext';

export const testConfig = {
  sheetId: 'test-sheet-id',
  clientId: 'test-client-id',
  firebaseConfig: {
    databaseURL: 'https://test-db.firebaseio.com',
    projectId: 'test-project',
  } as FirebaseOptions,
};

export const testUser = {
  uid: 'test-user-id',
  displayName: 'Test User',
  photoURL: 'test-photo-url',
};

export const authStates = {
  authenticated: {
    clientStatus: ClientLoadStatus.Ready,
    errorStatus: ClientLoadStatus.Ready,
    access_token: 'mock-access-token',
    firebaseUser: testUser,
    error: null,
  },
  authenticating: {
    clientStatus: ClientLoadStatus.Initializing_firebase,
    errorStatus: ClientLoadStatus.Ready,
    access_token: 'mock-access-token',
    firebaseUser: null,
    error: null,
  },
  error: {
    clientStatus: ClientLoadStatus.Error,
    errorStatus: ClientLoadStatus.Initializing_firebase,
    access_token: null,
    firebaseUser: null,
    error: new Error('Authentication failed'),
  },
  initial: {
    clientStatus: ClientLoadStatus.Loading,
    errorStatus: ClientLoadStatus.Loading,
    access_token: null,
    firebaseUser: null,
    error: null,
  },
};
```

### 4. Helpers Implementation

```typescript
// src/test/integration/helpers.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactElement } from 'react';
import { createTestWrapper } from '../test-wrapper';
import { ClientLoadStatus } from '../../contexts/AuthContext';
import { testConfig, authStates } from './config';
import { FirebaseProvider } from '../../contexts/FirebaseContext';
import { AuthProvider } from '../../contexts/AuthContext';
import { LanguageProvider } from '../../contexts/LanguageContext';
import { I18nProvider } from '../../i18n/I18nProvider';

// Create a test app component that mimics the structure of the real app
// but uses test configuration
export function TestApp({ children }: { children: ReactElement }) {
  return (
    <FirebaseProvider config={testConfig.firebaseConfig}>
      <AuthProvider clientId={testConfig.clientId}>
        <LanguageProvider>
          <I18nProvider>
            {children}
          </I18nProvider>
        </LanguageProvider>
      </AuthProvider>
    </FirebaseProvider>
  );
}

// Enhanced render function for integration tests
export function renderWithTestWrapper(ui: ReactElement) {
  const testWrapper = createTestWrapper();
  const user = userEvent.setup();

  const result = render(ui, { wrapper: testWrapper.Wrapper });

  return {
    ...result,
    user,
    testWrapper,
    // Helper to simulate login
    async login(options = { success: true }) {
      if (options.success) {
        testWrapper.mockAuth.setState(authStates.authenticated);
      } else {
        testWrapper.mockAuth.setState(authStates.error);
      }

      const loginButton = screen.getByRole('button', { name: /login/i });
      await user.click(loginButton);

      if (options.success) {
        await waitFor(() => {
          expect(screen.queryByText(/authenticating/i)).not.toBeInTheDocument();
        });
      } else {
        await waitFor(() => {
          expect(screen.getByText(/authentication failed/i)).toBeInTheDocument();
        });
      }
    },
    // Helper to wait for presence to be established
    async waitForPresence(userName = 'Test User') {
      const usersList = await screen.findByRole('list', { name: /active users/i });
      await waitFor(() => {
        expect(usersList).toHaveTextContent(userName);
      });
    },
    // Helper to check if core UI elements are available
    async checkCoreUIElements() {
      expect(screen.getByRole('button', { name: /add conflict/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add role/i })).toBeInTheDocument();
      expect(screen.getByRole('table')).toBeInTheDocument();
    },
  };
}
```

### 5. Auth Flow Test Implementation

```typescript
// src/test/integration/auth-flow.test.tsx
import { screen, waitFor } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import App from '../../App'; // This would be your main App component
import { renderWithTestWrapper, TestApp } from './helpers';
import { authStates } from './config';

describe('Authentication Flow', () => {
  test('happy path: user logs in and establishes presence', async () => {
    // Arrange
    const { user, testWrapper, login, waitForPresence, checkCoreUIElements } =
      renderWithTestWrapper(<TestApp><App /></TestApp>);

    // Set up mock data for Google Sheets
    testWrapper.mockGoogleSheets.setTestData([
      ['', 'Role 1', 'Role 2'],
      ['Conflict 1', 'M1-1', 'M1-2'],
      ['Conflict 2', 'M2-1', 'M2-2'],
    ]);

    // Act
    await login();

    // Assert
    // Verify user appears in active users list
    await waitForPresence();

    // Check core UI elements are available
    await checkCoreUIElements();

    // Verify presence was registered in Firebase
    const presenceRef = testWrapper.mockFirebase.api.getDatabaseRef('sheets/test-sheet-id/presence/test-user-id');
    expect(testWrapper.mockFirebase.api.set).toHaveBeenCalledWith(
      presenceRef,
      expect.objectContaining({
        name: 'Test User',
        photoUrl: 'test-photo-url',
        updateType: expect.any(String),
      })
    );
  });

  test('handles login error gracefully', async () => {
    // Arrange
    const { user, testWrapper } = renderWithTestWrapper(<TestApp><App /></TestApp>);

    // Set up error state
    testWrapper.mockAuth.setState(authStates.initial);
    testWrapper.mockAuth.api.login.mockImplementationOnce(() => {
      testWrapper.mockAuth.setState(authStates.error);
    });

    // Act
    const loginButton = screen.getByRole('button', { name: /login/i });
    await user.click(loginButton);

    // Assert
    // Verify error message
    await waitFor(() => {
      expect(screen.getByText(/authentication failed/i)).toBeInTheDocument();
    });

    // Check login button remains available
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('maintains presence while user is active', async () => {
    // Arrange
    const { user, testWrapper, login, waitForPresence } =
      renderWithTestWrapper(<TestApp><App /></TestApp>);

    // Set up mock data for Google Sheets
    testWrapper.mockGoogleSheets.setTestData([
      ['', 'Role 1'],
      ['Conflict 1', 'M1-1'],
    ]);

    // Mock timers for heartbeat testing
    vi.useFakeTimers();

    // Act
    await login();
    await waitForPresence();

    // Get initial presence call count
    const presenceRef = testWrapper.mockFirebase.api.getDatabaseRef('sheets/test-sheet-id/presence/test-user-id');
    const initialCallCount = testWrapper.mockFirebase.api.set.mock.calls.filter(
      call => call[0].toString() === presenceRef.toString()
    ).length;

    // Fast-forward time to trigger heartbeat
    vi.advanceTimersByTime(31000); // Just over the 30s heartbeat interval

    // Assert
    // Verify heartbeat was sent
    const newCallCount = testWrapper.mockFirebase.api.set.mock.calls.filter(
      call => call[0].toString() === presenceRef.toString()
    ).length;

    expect(newCallCount).toBeGreaterThan(initialCallCount);

    // Verify last call was a heartbeat
    const lastCall = testWrapper.mockFirebase.api.set.mock.calls
      .filter(call => call[0].toString() === presenceRef.toString())
      .pop();

    expect(lastCall[1]).toMatchObject({
      updateType: 'heartbeat',
      name: 'Test User',
    });

    // Clean up
    vi.useRealTimers();
  });
});
```

## Test Execution

To run the auth flow integration test:

```bash
npm test -- src/test/integration/auth-flow.test.tsx
```

## Debugging Tips

1. **Console Logs**: Add console.logs to the test to see what's happening
2. **Inspect Mock Calls**: Use `console.log(mockFunction.mock.calls)` to see what arguments were passed to a mocked function
3. **Debug Mode**: Run tests in debug mode with `npm test -- --debug`
4. **Pause Tests**: Use `await new Promise(r => setTimeout(r, 5000))` to pause the test for 5 seconds

## Common Issues and Solutions

1. **Test Timeouts**: If tests are timing out, check if you're waiting for an async operation that never resolves
2. **Mock Not Called**: If a mock isn't being called, check if you're mocking the correct function and if the function is being called with the expected arguments
3. **Element Not Found**: If an element isn't found, check if it's actually rendered and if you're using the correct query
4. **State Not Updated**: If state isn't updating as expected, check if you're waiting for the state to update with `waitFor`

## Next Steps

After implementing the auth flow test, consider adding tests for:

1. **Table Operations**: Add, remove, and edit conflicts and roles
2. **Collaboration Features**: Test presence and locking mechanisms
3. **Error Handling**: Test how the app handles various error scenarios
