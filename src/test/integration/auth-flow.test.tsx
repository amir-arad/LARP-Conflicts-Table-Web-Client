import { screen, waitFor } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { renderWithTestWrapper } from './helpers';
import { authStates } from './config';
import { DatabaseReference } from 'firebase/database';

// Type for mock calls
type MockCall = [DatabaseReference, Record<string, unknown>];

describe.skip('Authentication Flow', () => {
  test('happy path: user logs in and establishes presence', async () => {
    // Arrange
    const { testWrapper, login, waitForPresence, checkCoreUIElements } =
      renderWithTestWrapper(null);

    // Set up mock data for Google Sheets
    await testWrapper.mockGoogleSheets.setTestData([
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

  test('handles login error gracefully', async () => {
    // Arrange
    const { testWrapper, user } = renderWithTestWrapper(null);

    // Set up error state
    testWrapper.mockAuth.setState(authStates.initial);
    testWrapper.mockAuth.api.login.mockImplementationOnce(() => {
      testWrapper.mockAuth.setState(authStates.error);
    });

    // Act
    const loginButton = screen.getByTestId('login-button');
    await user.click(loginButton);

    // Assert
    // Verify error message
    await waitFor(() => {
      expect(screen.getByText(/authentication failed/i)).toBeInTheDocument();
    });

    // Check login button remains available
    expect(screen.getByTestId('login-button')).toBeInTheDocument();
  });

  test('maintains presence while user is active', async () => {
    // Arrange
    const { testWrapper, login, waitForPresence } = renderWithTestWrapper(null);

    // Set up mock data for Google Sheets
    await testWrapper.mockGoogleSheets.setTestData([
      ['', 'Role 1'],
      ['Conflict 1', 'M1-1'],
    ]);

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

    // Clean up
    vi.useRealTimers();
  });
});
