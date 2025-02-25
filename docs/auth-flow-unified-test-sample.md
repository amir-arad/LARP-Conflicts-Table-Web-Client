# Authentication Flow Unified Test Sample

This document provides a sample implementation of the unified authentication flow test file based on the recommendations in the analysis and consolidation plan. This sample demonstrates how to combine the strengths of both existing test approaches while adding tests for previously untested scenarios.

## Sample Implementation

```typescript
// src/test/integration/auth-flow.unified.test.tsx
import { screen, waitFor } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { renderWithEnhancedWrapper } from './enhanced-helpers';
import { authFixtures, sheetFixtures } from '../fixtures';
import { DatabaseReference } from 'firebase/database';

// Type for mock calls
type MockCall = [DatabaseReference, Record<string, unknown>];

describe('Authentication Flow', () => {
  // Setup and teardown
  beforeEach(() => {
    // Reset mocks and localStorage before each test
    localStorage.clear();
    vi.resetAllMocks();
  });

  afterEach(() => {
    // Clean up after each test
    vi.useRealTimers();
  });

  // Group 1: Basic Authentication Flow
  describe('Basic Authentication Flow', () => {
    test('completes authentication flow successfully using story', async () => {
      // This test uses the Storybook story approach
      const { runPlayFunction } = renderWithEnhancedWrapper({
        storyName: 'AuthenticationFlow',
      });

      await runPlayFunction();
    });

    test('completes authentication flow successfully using test wrapper', async () => {
      // This test uses the test wrapper approach
      const { testWrapper, login, waitForPresence, checkCoreUIElements } =
        renderWithEnhancedWrapper();

      // Set up mock data for Google Sheets
      await testWrapper.mockGoogleSheets.setTestData(sheetFixtures.basic);

      // Act
      await login();

      // Assert
      await waitForPresence();
      await checkCoreUIElements();

      // Verify presence was registered in Firebase
      const presenceRef = testWrapper.mockFirebase.api.getDatabaseRef(
        'sheets/test-sheet-id/presence/test-user-id'
      );
      const setFn = testWrapper.mockFirebase.api.set as unknown as {
        mock: { calls: MockCall[] };
      };

      expect(
        setFn.mock.calls.some(
          (call: MockCall) =>
            call[0].toString() === presenceRef.toString() &&
            call[1].name === 'Test User' &&
            call[1].photoUrl === 'test-photo-url' &&
            typeof call[1].updateType === 'string'
        )
      ).toBe(true);
    });

    test('displays appropriate UI elements when authenticated', async () => {
      // This test focuses on UI elements
      const { login, checkCoreUIElements } = renderWithEnhancedWrapper();

      // Act
      await login();

      // Assert
      await checkCoreUIElements();

      // Additional UI checks
      expect(
        screen.getByRole('list', { name: /active users/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: /open in sheets/i })
      ).toBeInTheDocument();
    });
  });

  // Group 2: Error Handling
  describe('Error Handling', () => {
    test('handles authentication errors gracefully', async () => {
      // This test combines approaches from both files
      const { testWrapper, user } = renderWithEnhancedWrapper();

      // Set up error state
      testWrapper.mockAuth.setState(authFixtures.initial);
      testWrapper.mockAuth.api.login.mockImplementationOnce(() => {
        testWrapper.mockAuth.setState(authFixtures.error);
      });

      // Act
      const loginButton = screen.getByTestId('login-button');
      await user.click(loginButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/authentication failed/i)).toBeInTheDocument();
      });

      // Check login button remains available
      expect(screen.getByTestId('login-button')).toBeInTheDocument();
    });

    test('handles network errors during authentication', async () => {
      // New test for network errors
      const { testWrapper, user } = renderWithEnhancedWrapper();

      // Set up network error
      testWrapper.mockAuth.setState(authFixtures.initial);
      testWrapper.mockAuth.api.login.mockImplementationOnce(() => {
        testWrapper.mockAuth.setState({
          ...authFixtures.error,
          error: new Error(
            'Network error: Failed to connect to authentication server'
          ),
        });
      });

      // Act
      const loginButton = screen.getByTestId('login-button');
      await user.click(loginButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });

      // Verify retry button is available
      expect(
        screen.getByRole('button', { name: /try again/i })
      ).toBeInTheDocument();
    });

    test('handles invalid tokens', async () => {
      // New test for invalid tokens
      const { testWrapper, simulateInvalidToken } = renderWithEnhancedWrapper();

      // Set up authenticated state with invalid token
      testWrapper.mockAuth.setState({
        ...authFixtures.authenticated,
        access_token: 'invalid-token',
      });

      // Simulate API call with invalid token
      await simulateInvalidToken();

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/invalid token/i)).toBeInTheDocument();
      });

      // Verify user is prompted to login again
      expect(screen.getByTestId('login-button')).toBeInTheDocument();
    });
  });

  // Group 3: Token Management
  describe('Token Management', () => {
    test('refreshes token when expired', async () => {
      // New test for token refresh
      const { testWrapper, simulateTokenExpiration, verifyTokenRefresh } =
        renderWithEnhancedWrapper();

      // Set up authenticated state
      await testWrapper.login();

      // Simulate token expiration
      await simulateTokenExpiration();

      // Verify token refresh occurred
      await verifyTokenRefresh();

      // Verify user remains authenticated
      expect(screen.queryByTestId('login-button')).not.toBeInTheDocument();
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    test('handles token revocation', async () => {
      // New test for token revocation
      const { testWrapper, simulateTokenRevocation } =
        renderWithEnhancedWrapper();

      // Set up authenticated state
      await testWrapper.login();

      // Simulate token revocation
      await simulateTokenRevocation();

      // Verify user is logged out and prompted to login again
      await waitFor(() => {
        expect(screen.getByTestId('login-button')).toBeInTheDocument();
      });

      // Verify appropriate error message
      expect(screen.getByText(/session expired/i)).toBeInTheDocument();
    });

    test('securely stores tokens', async () => {
      // New test for token storage security
      const { testWrapper, verifyTokenStorage } = renderWithEnhancedWrapper();

      // Set up authenticated state
      await testWrapper.login();

      // Verify token is stored securely
      const tokenStorageInfo = await verifyTokenStorage();

      // Assert token is stored with expiration
      expect(tokenStorageInfo.hasExpiration).toBe(true);
      expect(tokenStorageInfo.isHttpOnly).toBe(true);
    });
  });

  // Group 4: Session Management
  describe('Session Management', () => {
    test('maintains session across page reloads', async () => {
      // New test for session persistence
      const { testWrapper, simulatePageReload } = renderWithEnhancedWrapper();

      // Set up authenticated state
      await testWrapper.login();

      // Simulate page reload
      await simulatePageReload();

      // Verify user remains authenticated
      expect(screen.queryByTestId('login-button')).not.toBeInTheDocument();
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    test('handles concurrent sessions', async () => {
      // New test for concurrent sessions
      const { testWrapper, simulateConcurrentSession } =
        renderWithEnhancedWrapper();

      // Set up first session
      await testWrapper.login();

      // Simulate concurrent session
      const secondSession = await simulateConcurrentSession();

      // Verify both sessions are active
      expect(testWrapper.mockFirebase.api.set).toHaveBeenCalled();
      expect(secondSession.mockFirebase.api.set).toHaveBeenCalled();

      // Verify presence list shows both users
      const usersList = screen.getByRole('list', { name: /active users/i });
      expect(usersList.children.length).toBe(2);
    });

    test('handles session timeout', async () => {
      // New test for session timeout
      const { testWrapper, simulateSessionTimeout } =
        renderWithEnhancedWrapper();

      // Set up authenticated state
      await testWrapper.login();

      // Simulate session timeout
      await simulateSessionTimeout();

      // Verify user is prompted to login again
      await waitFor(() => {
        expect(screen.getByTestId('login-button')).toBeInTheDocument();
      });

      // Verify appropriate message
      expect(screen.getByText(/session timed out/i)).toBeInTheDocument();
    });
  });

  // Group 5: Network Resilience
  describe('Network Resilience', () => {
    test('handles network interruptions during authentication', async () => {
      // New test for network interruptions
      const { testWrapper, simulateNetworkInterruption } =
        renderWithEnhancedWrapper();

      // Start authentication
      const loginButton = screen.getByTestId('login-button');
      await userEvent.click(loginButton);

      // Simulate network interruption
      await simulateNetworkInterruption();

      // Verify appropriate error message
      await waitFor(() => {
        expect(
          screen.getByText(/network connection lost/i)
        ).toBeInTheDocument();
      });

      // Verify retry button is available
      expect(
        screen.getByRole('button', { name: /retry/i })
      ).toBeInTheDocument();
    });

    test('handles slow connections', async () => {
      // New test for slow connections
      const { testWrapper, simulateSlowConnection } =
        renderWithEnhancedWrapper();

      // Simulate slow connection
      await simulateSlowConnection();

      // Start authentication
      const loginButton = screen.getByTestId('login-button');
      await userEvent.click(loginButton);

      // Verify loading indicator is shown
      expect(screen.getByText(/connecting/i)).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();

      // Complete authentication (slow)
      await testWrapper.completeSlowAuthentication();

      // Verify authenticated state
      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
      });
    });

    test('handles offline mode', async () => {
      // New test for offline mode
      const { testWrapper, simulateOfflineMode } = renderWithEnhancedWrapper();

      // Set up authenticated state
      await testWrapper.login();

      // Simulate going offline
      await simulateOfflineMode();

      // Verify offline indicator is shown
      expect(screen.getByText(/offline mode/i)).toBeInTheDocument();

      // Verify limited functionality is available
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /add conflict/i })
      ).not.toBeInTheDocument();
    });
  });

  // Group 6: Security
  describe('Security', () => {
    test('handles permission changes', async () => {
      // New test for permission changes
      const { testWrapper, simulatePermissionChange } =
        renderWithEnhancedWrapper();

      // Set up authenticated state with read-only permissions
      await testWrapper.login({ permissions: ['read'] });

      // Verify read-only UI
      expect(
        screen.queryByRole('button', { name: /add conflict/i })
      ).not.toBeInTheDocument();
      expect(screen.getByRole('table')).toBeInTheDocument();

      // Simulate permission change to include write
      await simulatePermissionChange(['read', 'write']);

      // Verify UI updates to show write controls
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /add conflict/i })
        ).toBeInTheDocument();
      });
    });

    test('prevents authentication bypass attempts', async () => {
      // New test for authentication bypass
      const { testWrapper, simulateAuthBypassAttempt } =
        renderWithEnhancedWrapper();

      // Attempt to bypass authentication
      await simulateAuthBypassAttempt();

      // Verify user is still not authenticated
      expect(screen.getByTestId('login-button')).toBeInTheDocument();
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });

    test('handles token security issues', async () => {
      // New test for token security issues
      const { testWrapper, simulateTokenSecurity } =
        renderWithEnhancedWrapper();

      // Set up authenticated state
      await testWrapper.login();

      // Simulate token security issue (e.g., token leaked)
      await simulateTokenSecurity({ issue: 'leaked' });

      // Verify user is logged out and warned
      await waitFor(() => {
        expect(
          screen.getByText(/security issue detected/i)
        ).toBeInTheDocument();
      });
      expect(screen.getByTestId('login-button')).toBeInTheDocument();
    });
  });

  // Group 7: User Experience
  describe('User Experience', () => {
    test('displays appropriate loading states', async () => {
      // New test for loading states
      const { testWrapper, user } = renderWithEnhancedWrapper();

      // Start authentication
      const loginButton = screen.getByTestId('login-button');
      await user.click(loginButton);

      // Verify loading state
      expect(screen.getByText(/authenticating/i)).toBeInTheDocument();

      // Complete authentication
      testWrapper.mockAuth.setState(authFixtures.authenticated);

      // Verify authenticated state
      await waitFor(() => {
        expect(screen.queryByText(/authenticating/i)).not.toBeInTheDocument();
        expect(screen.getByRole('table')).toBeInTheDocument();
      });
    });

    test('provides clear error feedback', async () => {
      // New test for error feedback
      const { testWrapper, simulateSpecificError } =
        renderWithEnhancedWrapper();

      // Simulate specific error types and verify feedback
      await simulateSpecificError('network');
      expect(screen.getByText(/network connection issue/i)).toBeInTheDocument();
      expect(
        screen.getByText(/check your internet connection/i)
      ).toBeInTheDocument();

      await simulateSpecificError('permission');
      expect(screen.getByText(/permission denied/i)).toBeInTheDocument();
      expect(screen.getByText(/you don't have access/i)).toBeInTheDocument();

      await simulateSpecificError('server');
      expect(screen.getByText(/server error/i)).toBeInTheDocument();
      expect(screen.getByText(/please try again later/i)).toBeInTheDocument();
    });

    test('maintains accessibility during authentication', async () => {
      // New test for accessibility
      const { testWrapper, verifyAccessibility } = renderWithEnhancedWrapper();

      // Verify initial state accessibility
      await verifyAccessibility();

      // Start authentication
      const loginButton = screen.getByTestId('login-button');
      await userEvent.click(loginButton);

      // Verify loading state accessibility
      await verifyAccessibility();

      // Complete authentication
      testWrapper.mockAuth.setState(authFixtures.authenticated);

      // Verify authenticated state accessibility
      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
      });
      await verifyAccessibility();
    });
  });

  // Group 8: Presence Maintenance (from original test)
  describe('Presence Maintenance', () => {
    test('maintains presence while user is active', async () => {
      // This test is from the original auth-flow.test.tsx
      const { testWrapper, login, waitForPresence } =
        renderWithEnhancedWrapper();

      // Set up mock data for Google Sheets
      await testWrapper.mockGoogleSheets.setTestData(sheetFixtures.basic);

      // Mock timers for heartbeat testing
      vi.useFakeTimers();

      // Act
      await login();
      await waitForPresence();

      // Get initial presence call count
      const presenceRef = testWrapper.mockFirebase.api.getDatabaseRef(
        'sheets/test-sheet-id/presence/test-user-id'
      );
      const setFn = testWrapper.mockFirebase.api.set as unknown as {
        mock: { calls: MockCall[] };
      };

      const initialCallCount = setFn.mock.calls.filter(
        (call: MockCall) => call[0].toString() === presenceRef.toString()
      ).length;

      // Fast-forward time to trigger heartbeat
      vi.advanceTimersByTime(31000); // Just over the 30s heartbeat interval

      // Assert
      // Verify heartbeat was sent
      const newCallCount = setFn.mock.calls.filter(
        (call: MockCall) => call[0].toString() === presenceRef.toString()
      ).length;

      expect(newCallCount).toBeGreaterThan(initialCallCount);

      // Verify last call was a heartbeat
      const lastCalls = setFn.mock.calls.filter(
        (call: MockCall) => call[0].toString() === presenceRef.toString()
      );

      if (lastCalls.length > 0) {
        const lastCall = lastCalls[lastCalls.length - 1];
        expect(lastCall[1]).toMatchObject({
          updateType: 'heartbeat',
          name: 'Test User',
        });
      } else {
        // If no calls were made, the test should fail
        expect(lastCalls.length).toBeGreaterThan(0);
      }
    });
  });
});
```

## Enhanced Helpers Implementation

To support the unified test file, we would need to implement the enhanced helpers module. Here's a sample implementation of the key functions:

```typescript
// src/test/integration/enhanced-helpers.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createTestWrapper } from '../test-wrapper';
import { getStory } from '../storybook/vitest-adapter';
import { vi } from 'vitest';
import { authFixtures, sheetFixtures } from '../fixtures';
import { User } from 'firebase/auth';

/**
 * Enhanced render function that combines the test wrapper with Storybook stories
 */
export function renderWithEnhancedWrapper(options = {}) {
  const {
    component = null,
    storyName = null,
    mockConfig = {},
  } = options;

  // Create test wrapper with standardized mocks
  const testWrapper = createTestWrapper();
  const user = userEvent.setup();

  // Determine what to render
  let elementToRender;
  if (storyName) {
    const Story = getStory(storyName);
    if (!Story) {
      throw new Error(`Story "${storyName}" not found`);
    }
    elementToRender = <Story />;
  } else if (component) {
    elementToRender = component;
  } else {
    // Default test component
    elementToRender = <DefaultTestComponent />;
  }

  // Render with wrapper
  const result = render(elementToRender, { wrapper: testWrapper.Wrapper });

  // Return enhanced helpers
  return {
    ...result,
    user,
    testWrapper,

    // Authentication helpers
    async login(options = { success: true, permissions: [] }) {
      if (options.success) {
        const authState = {
          ...authFixtures.authenticated,
          firebaseUser: {
            ...authFixtures.authenticated.firebaseUser,
            permissions: options.permissions,
          } as unknown as User,
        };
        testWrapper.mockAuth.setState(authState);
      } else {
        testWrapper.mockAuth.setState(authFixtures.error);
      }

      const loginButton = screen.getByTestId('login-button');
      await user.click(loginButton);

      if (options.success) {
        await waitFor(() => {
          expect(screen.queryByText(/authenticating/i)).not.toBeInTheDocument();
        });
      } else {
        await waitFor(() => {
          expect(
            screen.getByText(/authentication failed/i)
          ).toBeInTheDocument();
        });
      }
    },

    // Story helpers
    async runPlayFunction() {
      if (!storyName) {
        throw new Error('No story name provided');
      }

      const Story = getStory(storyName);
      if (!Story || !Story.play) {
        throw new Error(`Story "${storyName}" not found or has no play function`);
      }

      // Create a step function for the play function
      const step = async (name, callback) => {
        console.log(`Step: ${name}`);
        await callback();
      };

      // Run the play function
      await Story.play({ canvasElement: result.container, step });
    },

    // Token management helpers
    async simulateTokenExpiration() {
      // Implementation
      localStorage.setItem('access_token_expires', (Date.now() - 1000).toString());

      // Trigger a state update to force re-render
      const currentState = testWrapper.mockAuth.api;
      testWrapper.mockAuth.setState({ ...currentState });
    },

    async simulateTokenRevocation() {
      // Implementation
      testWrapper.mockAuth.setState({
        ...authFixtures.error,
        error: new Error('Token revoked: Session expired'),
      });
    },

    async verifyTokenRefresh() {
      // Implementation
      await waitFor(() => {
        expect(testWrapper.mockAuth.api.login).toHaveBeenCalled();
      });

      // Verify new token is stored
      const expirationDate = Number(localStorage.getItem('access_token_expires'));
      expect(expirationDate).toBeGreaterThan(Date.now());
    },

    // Network condition helpers
    async simulateNetworkInterruption() {
      // Implementation
      testWrapper.mockFirebase.api.goOffline();

      // Trigger error in auth process
      testWrapper.mockAuth.setState({
        ...authFixtures.error,
        error: new Error('Network connection lost'),
      });
    },

    async simulateSlowConnection() {
      // Implementation
      // Mock slow responses
      testWrapper.mockAuth.api.login.mockImplementationOnce(() => {
        return new Promise(resolve => {
          setTimeout(() => {
            testWrapper.mockAuth.setState(authFixtures.authenticating);
            setTimeout(() => {
              testWrapper.mockAuth.setState(authFixtures.authenticated);
              resolve();
            }, 2000);
          }, 2000);
        });
      });
    },

    async completeSlowAuthentication() {
      // Implementation
      // This is called after simulateSlowConnection to complete the auth process
      await waitFor(() => {
        expect(screen.queryByText(/connecting/i)).not.toBeInTheDocument();
      }, { timeout: 5000 });
    },

    async simulateOfflineMode() {
      // Implementation
      testWrapper.mockFirebase.api.goOffline();

      // Trigger offline state in the app
      const connectedRef = testWrapper.mockFirebase.api.getDatabaseRef('.info/connected');
      testWrapper.mockFirebase.state.values.set(connectedRef.toString(), false);

      // Notify subscribers
      const subscribers = testWrapper.mockFirebase.state.subscriptions.get(connectedRef.toString());
      if (subscribers) {
        subscribers.forEach(callback => {
          callback({
            val: () => false,
            exists: () => true,
          });
        });
      }
    },

    // Session helpers
    async simulatePageReload() {
      // Implementation
      // Unmount and remount the component to simulate page reload
      result.unmount();

      // Re-render with the same wrapper
      render(elementToRender, { wrapper: testWrapper.Wrapper });
    },

    async simulateConcurrentSession() {
      // Implementation
      // Create a second test wrapper
      const secondWrapper = createTestWrapper();

      // Set up authenticated state with the same user ID but different device
      secondWrapper.mockAuth.setState({
        ...authFixtures.authenticated,
        firebaseUser: {
          ...authFixtures.authenticated.firebaseUser,
          deviceId: 'second-device',
        } as unknown as User,
      });

      // Return the second wrapper for assertions
      return secondWrapper;
    },

    async simulateSessionTimeout() {
      // Implementation
      testWrapper.mockAuth.setState({
        ...authFixtures.error,
        error: new Error('Session timed out'),
      });
    },

    // Security helpers
    async simulatePermissionChange(newPermissions) {
      // Implementation
      testWrapper.mockAuth.setState({
        ...testWrapper.mockAuth.api,
        firebaseUser: {
          ...testWrapper.mockAuth.api.firebaseUser,
          permissions: newPermissions,
        } as unknown as User,
      });
    },

    async simulateAuthBypassAttempt() {
      // Implementation
      // Attempt to directly set authenticated state without going through login
      try {
        // This should be blocked by the app's security measures
        localStorage.setItem('access_token', 'fake-token');
        localStorage.setItem('access_token_expires', (Date.now() + 3600000).toString());

        // Force re-render
        result.rerender(elementToRender);
      } catch (error) {
        // Expected to fail
      }
    },

    async simulateTokenSecurity({ issue }) {
      // Implementation
      switch (issue) {
        case 'leaked':
          testWrapper.mockAuth.setState({
            ...authFixtures.error,
            error: new Error('Security issue detected: Token may be compromised'),
          });
          break;
        // Other security issues
        default:
          break;
      }
    },

    // Error simulation helpers
    async simulateSpecificError(errorType) {
      // Implementation
      switch (errorType) {
        case 'network':
          testWrapper.mockAuth.setState({
            ...authFixtures.error,
            error: new Error('Network connection issue: check your internet connection'),
          });
          break;
        case 'permission':
          testWrapper.mockAuth.setState({
            ...authFixtures.error,
            error: new Error('Permission denied: you don\'t have access'),
          });
          break;
        case 'server':
          testWrapper.mockAuth.setState({
            ...authFixtures.error,
            error: new Error('Server error: please try again later'),
          });
          break;
        default:
          break;
      }
    },

    // Verification helpers
    async verifyAuthenticatedState() {
      // Implementation
      await waitFor(() => {
        expect(screen.queryByTestId('login-button')).not.toBeInTheDocument();
        expect(screen.getByRole('table')).toBeInTheDocument();
      });
    },

    async verifyErrorState(errorType) {
      // Implementation
      await waitFor(() => {
        expect(screen.getByTestId('login-button')).toBeInTheDocument();

        if (errorType) {
          expect(screen.getByText(new RegExp(errorType, 'i'))).toBeInTheDocument();
        } else {
          expect(screen.getByText(/error/i)).toBeInTheDocument();
        }
      });
    },

    async verifyLoadingState() {
      // Implementation
      expect(screen.getByText(/authenticating/i)).toBeInTheDocument();
    },

    async verifyFirebasePresence() {
      // Implementation
      const presenceRef = testWrapper.mockFirebase.api.getDatabaseRef(
        'sheets/test-sheet-id/presence/test-user-id'
      );
      const setFn = testWrapper.mockFirebase.api.set;

      expect(setFn).toHaveBeenCalledWith(
        presenceRef,
        expect.objectContaining({
          name: 'Test User',
          photoUrl: 'test-photo-url',
        })
      );
    },

    async verifyTokenStorage() {
      // Implementation
      const token = localStorage.getItem('access_token');
      const expires = localStorage.getItem('access_token_expires');

      return {
        hasToken: !!token,
        hasExpiration: !!expires,
        isHttpOnly: false, // In a real implementation, this would check if the token is stored in an HttpOnly cookie
      };
    },

    async verifyAccessibility() {
      // Implementation
      // In a real implementation, this would use axe or another accessibility testing library
      // For this sample, we'll just check for basic accessibility attributes

      // Check that all buttons have accessible names
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAccessibleName();
      });

      // Check that all images have alt text
      const images = screen.getAllByRole('img');
      images.forEach(img => {
        expect(img).toHaveAttribute('alt');
      });
    },

    // Additional helpers
    async waitForPresence(userName = 'Test User') {
      const usersList = await screen.findByRole('list', {
        name: /active users/i,
      });
      await waitFor(() => {
        expect(usersList).toHaveTextContent(userName);
      });
    },

    async checkCoreUIElements() {
      expect(
        screen.getByRole('button', { name: /add conflict/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /add role/i })
      ).toBeInTheDocument();
      expect(screen.getByRole('table')).toBeInTheDocument();
    },

    async simulateInvalidToken() {
      // Implementation
      // Mock API call that fails due to invalid token
      testWrapper.mockGoogleSheets.api.load.mockRejectedValueOnce(
        new Error('Invalid token')
      );

      // Trigger a load operation
      try {
        await testWrapper.mockGoogleSheets.api.load();
      } catch (error) {
        // Expected to fail
        testWrapper.mockAuth.setState({
          ...authFixtures.error,
          error: new Error('Invalid token'),
        });
      }
    },
  };
}
```

## Conclusion

This sample implementation demonstrates how to create a unified test file that combines the strengths of both existing approaches while adding tests for previously untested scenarios. The enhanced helpers module provides a comprehensive set of functions for testing various aspects of the authentication flow, including token management, session management, network resilience, security, and user experience.

By implementing this unified approach, the project can achieve better test coverage, improved maintainability, and enhanced security and user experience testing.
