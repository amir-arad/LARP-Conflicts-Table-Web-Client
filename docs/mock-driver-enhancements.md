# Mock Driver Enhancements for Integration Testing

## Overview

This document outlines the enhancements needed for the existing mock drivers to better support integration testing. The current mock drivers provide a good foundation, but some additional functionality is needed to fully support the integration tests described in the test plan.

## Current Mock Drivers

The project currently has the following mock drivers:

1. **Auth API Mock** (`src/test/mocks-drivers/auth-api.ts`)
2. **Firebase API Mock** (`src/test/mocks-drivers/firebase-api.ts`)
3. **Google Sheets API Mock** (`src/test/mocks-drivers/google-sheets-api.ts`)

And the following mock externals:

1. **Firebase Mock** (`src/test/mocks-externals/firebase.ts`)
2. **Google API Mock** (`src/test/mocks-externals/gapi.ts`)

## Required Enhancements

### 1. Auth API Mock Enhancements

The Auth API mock needs to be enhanced to better support testing the authentication flow:

```typescript
// src/test/mocks-drivers/auth-api.ts (additions)

export function mockAuthState() {
  return {
    // ... existing code

    // Add support for simulating login errors
    simulateLoginError(errorMessage: string) {
      this.api.login.mockImplementationOnce(() => {
        this.setState({
          clientStatus: ClientLoadStatus.Error,
          errorStatus: ClientLoadStatus.Initializing_firebase,
          error: new Error(errorMessage),
        });
      });
    },

    // Add support for simulating successful login
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

    // Add support for simulating the authentication process
    simulateAuthProcess() {
      // Initial state
      this.setState({
        clientStatus: ClientLoadStatus.Loading,
        errorStatus: ClientLoadStatus.Loading,
      });

      // Simulate the authentication process
      setTimeout(() => {
        this.setState({
          clientStatus: ClientLoadStatus.Initializing_gapi,
          errorStatus: ClientLoadStatus.Loading,
        });
      }, 10);

      setTimeout(() => {
        this.setState({
          clientStatus: ClientLoadStatus.Initializing_gapi_2,
          errorStatus: ClientLoadStatus.Initializing_gapi,
        });
      }, 20);

      setTimeout(() => {
        this.setState({
          clientStatus: ClientLoadStatus.Initializing_firebase,
          errorStatus: ClientLoadStatus.Initializing_gapi_2,
        });
      }, 30);

      setTimeout(() => {
        this.setState({
          clientStatus: ClientLoadStatus.Connecting,
          errorStatus: ClientLoadStatus.Initializing_firebase,
        });
      }, 40);

      setTimeout(() => {
        this.setState({
          clientStatus: ClientLoadStatus.Ready,
          errorStatus: ClientLoadStatus.Connecting,
          firebaseUser: {
            uid: 'test-user-id',
            displayName: 'Test User',
            photoURL: 'test-photo-url',
          },
        });
      }, 50);
    },
  };
}
```

### 2. Firebase API Mock Enhancements

The Firebase API mock needs to be enhanced to better support testing presence and collaboration features:

```typescript
// src/test/mocks-drivers/firebase-api.ts (additions)

export function mockFirebaseAPI() {
  // ... existing code

  return {
    // ... existing code

    // Add support for verifying presence updates
    getPresenceUpdates(userId: string) {
      const presencePath = `sheets/test-sheet-id/presence/${userId}`;
      const calls = this.api.set.mock.calls.filter(
        call => call[0].toString() === presencePath
      );
      return calls.map(call => call[1]);
    },

    // Add support for getting the last presence update
    getLastPresenceUpdate(userId: string) {
      const updates = this.getPresenceUpdates(userId);
      return updates[updates.length - 1];
    },

    // Add support for simulating presence events
    simulateUserJoined(userId: string, userName: string, photoUrl: string) {
      const presencePath = `sheets/test-sheet-id/presence/${userId}`;
      const presenceRef = this.api.getDatabaseRef(presencePath);
      const presenceData = {
        name: userName,
        photoUrl: photoUrl,
        lastActive: Date.now(),
        activeCell: null,
        updateType: 'state_change',
      };
      this.state.values.set(presencePath, presenceData);

      // Notify subscribers
      const subscribers = this.state.subscriptions.get(
        'sheets/test-sheet-id/presence'
      );
      if (subscribers) {
        const snapshot = createMockDataSnapshot(
          { [userId]: presenceData },
          'sheets/test-sheet-id/presence'
        );
        subscribers.forEach(callback => callback(snapshot));
      }
    },

    // Add support for simulating user left
    simulateUserLeft(userId: string) {
      const presencePath = `sheets/test-sheet-id/presence/${userId}`;
      this.state.values.delete(presencePath);

      // Notify subscribers
      const subscribers = this.state.subscriptions.get(
        'sheets/test-sheet-id/presence'
      );
      if (subscribers) {
        const snapshot = createMockDataSnapshot(
          this.state.values.get('sheets/test-sheet-id/presence') || {},
          'sheets/test-sheet-id/presence'
        );
        subscribers.forEach(callback => callback(snapshot));
      }
    },

    // Add support for simulating cell locking
    simulateCellLock(cellId: string, userId: string) {
      const lockPath = `sheets/test-sheet-id/locks/${cellId}`;
      const lockRef = this.api.getDatabaseRef(lockPath);
      const lockData = {
        userId: userId,
        acquired: Date.now(),
        expires: Date.now() + 30000, // 30s TTL
      };
      this.state.values.set(lockPath, lockData);

      // Notify subscribers
      const subscribers = this.state.subscriptions.get(
        'sheets/test-sheet-id/locks'
      );
      if (subscribers) {
        const snapshot = createMockDataSnapshot(
          { [cellId]: lockData },
          'sheets/test-sheet-id/locks'
        );
        subscribers.forEach(callback => callback(snapshot));
      }
    },

    // Add support for simulating cell unlock
    simulateCellUnlock(cellId: string) {
      const lockPath = `sheets/test-sheet-id/locks/${cellId}`;
      this.state.values.delete(lockPath);

      // Notify subscribers
      const subscribers = this.state.subscriptions.get(
        'sheets/test-sheet-id/locks'
      );
      if (subscribers) {
        const snapshot = createMockDataSnapshot(
          this.state.values.get('sheets/test-sheet-id/locks') || {},
          'sheets/test-sheet-id/locks'
        );
        subscribers.forEach(callback => callback(snapshot));
      }
    },
  };
}
```

### 3. Google Sheets API Mock Enhancements

The Google Sheets API mock needs to be enhanced to better support testing the conflicts table:

```typescript
// src/test/mocks-drivers/google-sheets-api.ts (additions)

export function mockGoogleSheetsAPI() {
  return {
    // ... existing code

    // Add support for verifying API calls
    getApiCalls(method: 'load' | 'update' | 'clear') {
      return this.api[method].mock.calls;
    },

    // Add support for getting API calls for a specific range
    getApiCallsForRange(method: 'update' | 'clear', range: string) {
      return this.api[method].mock.calls.filter(call => call[0] === range);
    },

    // Add support for simulating API errors
    simulateApiError(
      method: 'load' | 'update' | 'clear',
      errorMessage: string
    ) {
      this.api[method].mockImplementationOnce(() => {
        this.setState({ error: errorMessage });
        return Promise.reject(new Error(errorMessage));
      });
    },

    // Add support for simulating API delays
    simulateApiDelay(method: 'load' | 'update' | 'clear', delayMs: number) {
      this.api[method].mockImplementationOnce(() => {
        this.setState({ isLoading: true });
        return new Promise(resolve => {
          setTimeout(() => {
            this.setState({ isLoading: false });
            resolve(undefined);
          }, delayMs);
        });
      });
    },
  };
}
```

### 4. Test Wrapper Enhancements

The test wrapper needs to be enhanced to better support integration testing:

```typescript
// src/test/test-wrapper.tsx (additions)

export function createTestWrapper() {
  // ... existing code

  return {
    // ... existing code

    // Add support for simulating user interactions
    simulateUserInteractions: {
      // Simulate user logging in
      async login(success = true) {
        if (success) {
          mockAuth.setState({
            clientStatus: ClientLoadStatus.Ready,
            firebaseUser: {
              uid: 'test-user-id',
              displayName: 'Test User',
              photoURL: 'test-photo-url',
            },
            access_token: 'mock-access-token',
          });
        } else {
          mockAuth.setState({
            clientStatus: ClientLoadStatus.Error,
            errorStatus: ClientLoadStatus.Initializing_firebase,
            error: new Error('Authentication failed'),
          });
        }
      },

      // Simulate user adding a conflict
      async addConflict(conflictName: string) {
        // Simulate the API call
        const newRowIndex =
          mockGoogleSheets.api.load.mock.results[0].value.result.values.length +
          1;
        const range = `${ROLES_CONFLICT_SHEET_ID}!A${newRowIndex}:D${newRowIndex}`;
        const values = [[conflictName, '', '', '']];

        await mockGoogleSheets.api.update.mockResolvedValueOnce({
          result: {
            updatedRange: range,
            updatedRows: 1,
            updatedColumns: values[0].length,
            updatedCells: values[0].length,
          },
        });
      },

      // Simulate user adding a role
      async addRole(roleName: string) {
        // Simulate the API call
        const newColIndex =
          mockGoogleSheets.api.load.mock.results[0].value.result.values[0]
            .length + 1;
        const colLetter = String.fromCharCode(64 + newColIndex); // A=65, B=66, etc.
        const range = `${ROLES_CONFLICT_SHEET_ID}!${colLetter}1:${colLetter}4`;
        const values = [[roleName], [''], [''], ['']];

        await mockGoogleSheets.api.update.mockResolvedValueOnce({
          result: {
            updatedRange: range,
            updatedRows: values.length,
            updatedColumns: 1,
            updatedCells: values.length,
          },
        });
      },

      // Simulate user updating a motivation
      async updateMotivation(
        conflictId: string,
        roleId: string,
        value: string
      ) {
        // Simulate the API call
        const range = `${ROLES_CONFLICT_SHEET_ID}!${roleId}${conflictId.substring(1)}`;
        const values = [[value]];

        await mockGoogleSheets.api.update.mockResolvedValueOnce({
          result: {
            updatedRange: range,
            updatedRows: 1,
            updatedColumns: 1,
            updatedCells: 1,
          },
        });
      },
    },
  };
}
```

## Implementation Strategy

1. **Incremental Approach**: Implement these enhancements incrementally, starting with the most critical ones for the auth flow test.
2. **Test-Driven Development**: Write tests for the enhanced mock drivers to ensure they work as expected.
3. **Documentation**: Update the documentation for the mock drivers to reflect the new functionality.
4. **Integration**: Ensure the enhanced mock drivers work well together in the integration tests.

## Conclusion

These enhancements to the mock drivers will provide a more robust foundation for integration testing. They will allow for more realistic simulation of the external dependencies and make it easier to write comprehensive integration tests.

The next step is to implement these enhancements and then use them to implement the auth flow integration test.
