# Integration Tests Implementation Plan

## Overview

This document outlines the plan for implementing fast integration tests for the LARP Conflicts Table Web Client. The tests will cover the entire system except for drivers coupled with external APIs (Google, Auth, Firebase), which will be mocked.

## Test Environment

We'll use the following technologies for our integration tests:

- **Test Runner**: Vitest (already configured in the project)
- **DOM Environment**: JSDOM (already configured in Vitest)
- **Testing Library**: React Testing Library (already available in the project)
- **Mocking**: Existing mock drivers for Firebase, Google Auth, and Google Sheets

## Current Mocking Infrastructure

The project already has a solid foundation for mocking external dependencies:

1. **Mock Drivers**:

   - `auth-api.ts`: Mocks the authentication state
   - `firebase-api.ts`: Mocks Firebase database operations
   - `google-sheets-api.ts`: Mocks Google Sheets API

2. **Mock Externals**:

   - `firebase.ts`: Mocks Firebase database references and snapshots
   - `gapi.ts`: Mocks Google API client

3. **Test Wrapper**:
   - `test-wrapper.tsx`: Provides a wrapper component with all required providers and mock drivers

## Implementation Plan

### 1. Create Integration Test Setup

First, we'll create a dedicated setup for integration tests that builds on the existing test infrastructure:

```typescript
// src/test/integration/setup.ts
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach } from 'vitest';
import { mockFirebase } from '../mocks-externals/firebase';

// Global setup for integration tests
beforeEach(() => {
  // Reset all mocks before each test
  mockFirebase._reset();
  vi.clearAllMocks();
});

// Clean up after each test
afterEach(() => {
  cleanup();
});
```

### 2. Create Integration Test Helpers

We'll create helpers specifically for integration tests:

```typescript
// src/test/integration/helpers.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactElement } from 'react';
import { createTestWrapper } from '../test-wrapper';

// Enhanced render function for integration tests
export function renderApp(ui: ReactElement) {
  const testWrapper = createTestWrapper();
  const user = userEvent.setup();

  // Set up default authenticated state
  testWrapper.mockAuth.setState({
    clientStatus: ClientLoadStatus.Ready,
    firebaseUser: {
      uid: 'test-user-id',
      displayName: 'Test User',
      photoURL: 'test-photo-url',
    },
  });

  const result = render(ui, { wrapper: testWrapper.Wrapper });

  return {
    ...result,
    user,
    testWrapper,
    // Helper to simulate login
    async login() {
      const loginButton = screen.getByRole('button', { name: /login/i });
      await user.click(loginButton);
      await waitFor(() => {
        expect(screen.queryByText(/authenticating/i)).not.toBeInTheDocument();
      });
    },
    // Helper to wait for presence to be established
    async waitForPresence(userName = 'Test User') {
      const usersList = await screen.findByRole('list', {
        name: /active users/i,
      });
      await waitFor(() => {
        expect(usersList).toHaveTextContent(userName);
      });
    },
  };
}
```

### 3. Implement Auth Flow Tests

Now we'll implement the auth flow tests based on the test cases defined in auth-flow.md:

```typescript
// src/test/integration/auth-flow.test.tsx
import { screen, waitFor } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import App from '../../main';
import { ClientLoadStatus } from '../../contexts/AuthContext';
import { renderApp } from './helpers';

describe('Authentication Flow', () => {
  test('happy path: user logs in and establishes presence', async () => {
    const { user, testWrapper } = renderApp(<App />);

    // Click login button
    const loginButton = screen.getByRole('button', { name: /login/i });
    await user.click(loginButton);

    // Wait for authentication
    await waitFor(() => {
      expect(screen.queryByText(/authenticating/i)).not.toBeInTheDocument();
    });

    // Verify user appears in active users list
    const usersList = await screen.findByRole('list', { name: /active users/i });
    expect(usersList).toHaveTextContent('Test User');

    // Check core UI elements are available
    expect(screen.getByRole('button', { name: /add conflict/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add role/i })).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  test('handles login error gracefully', async () => {
    const { user, testWrapper } = renderApp(<App />);

    // Mock failed login
    testWrapper.mockAuth.api.login.mockImplementationOnce(() => {
      testWrapper.mockAuth.setState({
        clientStatus: ClientLoadStatus.Error,
        errorStatus: ClientLoadStatus.Initializing_firebase,
        error: new Error('Authentication failed'),
      });
    });

    // Attempt login
    const loginButton = screen.getByRole('button', { name: /login/i });
    await user.click(loginButton);

    // Verify error message
    await waitFor(() => {
      expect(screen.getByText(/authentication failed/i)).toBeInTheDocument();
    });

    // Check login button remains available
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('maintains presence while user is active', async () => {
    const { user, testWrapper } = renderApp(<App />);

    // Log in user
    const loginButton = screen.getByRole('button', { name: /login/i });
    await user.click(loginButton);

    // Verify initial presence
    const usersList = await screen.findByRole('list', { name: /active users/i });
    expect(usersList).toHaveTextContent('Test User');

    // Wait and check presence maintained
    // Simulate time passing (heartbeat interval)
    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify user still shown as active
    expect(usersList).toHaveTextContent('Test User');

    // Verify heartbeat was called
    const presenceRef = testWrapper.mockFirebase.api.getDatabaseRef('sheets/test-sheet-id/presence/test-user-id');
    expect(testWrapper.mockFirebase.api.set).toHaveBeenCalledWith(
      presenceRef,
      expect.objectContaining({
        updateType: 'heartbeat',
      })
    );
  });
});
```

### 4. Enhance Existing Mock Drivers

We need to enhance the existing mock drivers to better support integration tests:

#### 4.1. Enhance Auth Mock Driver

```typescript
// src/test/mocks-drivers/auth-api.ts (additions)

// Add support for simulating login errors
export function mockAuthState() {
  return {
    // ... existing code

    simulateLoginError(errorMessage: string) {
      this.api.login.mockImplementationOnce(() => {
        this.setState({
          clientStatus: ClientLoadStatus.Error,
          errorStatus: ClientLoadStatus.Initializing_firebase,
          error: new Error(errorMessage),
        });
      });
    },

    simulateSuccessfulLogin() {
      this.api.login.mockImplementationOnce(() => {
        this.setState({
          clientStatus: ClientLoadStatus.Ready,
          firebaseUser: {
            uid: 'test-user-id',
            displayName: 'Test User',
            photoURL: 'test-photo-url',
          },
          access_token: 'mock-access-token',
        });
      });
    },
  };
}
```

#### 4.2. Enhance Firebase Mock Driver

```typescript
// src/test/mocks-drivers/firebase-api.ts (additions)

// Add support for verifying presence updates
export function mockFirebaseAPI() {
  // ... existing code

  return {
    // ... existing code

    getPresenceUpdates(userId: string) {
      const presencePath = `sheets/test-sheet-id/presence/${userId}`;
      const calls = this.api.set.mock.calls.filter(
        call => call[0].toString() === presencePath
      );
      return calls.map(call => call[1]);
    },

    getLastPresenceUpdate(userId: string) {
      const updates = this.getPresenceUpdates(userId);
      return updates[updates.length - 1];
    },
  };
}
```

### 5. Create Test Configuration

We'll create a dedicated configuration file for integration tests:

```typescript
// src/test/integration/config.ts
import { FirebaseOptions } from 'firebase/app';

export const testConfig = {
  sheetId: 'test-sheet-id',
  clientId: 'test-client-id',
  firebaseConfig: {
    databaseURL: 'https://test-db.firebaseio.com',
    projectId: 'test-project',
  } as FirebaseOptions,
};
```

### 6. Update Vitest Configuration

We'll update the Vitest configuration to support our integration tests:

```typescript
// vite.config.ts (additions)
test: {
  environment: 'jsdom',
  globals: true,
  setupFiles: ['src/test/integration/setup.ts'],
  include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  coverage: {
    reporter: ['text', 'json', 'html'],
    exclude: ['**/node_modules/**', '**/test/**'],
  },
},
```

## Implementation Considerations

### 1. Test Isolation

Each test should be isolated and not depend on the state of other tests. We'll use the existing mock reset functionality to ensure this.

### 2. Test Speed

To keep tests fast:

- Use JSDOM instead of a real browser
- Mock all external API calls
- Avoid unnecessary delays in tests
- Use the existing mock drivers which are already optimized for speed

### 3. Test Coverage

Focus on testing the critical user flows first:

1. Authentication and presence
2. Table interactions (add/remove/edit conflicts and roles)
3. Collaboration features (presence, locking)

### 4. Test Maintainability

- Use the existing test wrapper and mock drivers
- Create helper functions for common operations
- Use descriptive test names and comments
- Follow the AAA pattern (Arrange, Act, Assert)

## Next Steps

1. Implement the integration test setup and helpers
2. Implement the auth flow tests
3. Run the tests and verify they pass
4. Add more test flows as needed
5. Set up CI/CD to run the tests automatically

## Future Enhancements

1. Add visual regression testing
2. Add performance testing
3. Add accessibility testing
4. Add end-to-end testing with Playwright or Cypress
