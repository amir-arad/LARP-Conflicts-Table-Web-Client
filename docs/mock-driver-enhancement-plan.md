# Mock Driver Enhancement Plan for Integration Testing

## Overview

This document outlines a comprehensive plan for enhancing the existing mock drivers to support the integration testing needs identified in our analysis. These enhancements will enable more realistic testing of complex user flows while maintaining test performance and reliability.

## Current State Assessment

Our project currently has the following mock drivers:

1. **Auth API Mock** (`src/test/mocks-drivers/auth-api.ts`)

   - Provides basic authentication state simulation
   - Lacks support for complex auth scenarios and error conditions

2. **Firebase API Mock** (`src/test/mocks-drivers/firebase-api.ts`)

   - Simulates basic Firebase database operations
   - Insufficient for multi-user collaboration testing
   - Limited support for real-time events

3. **Google Sheets API Mock** (`src/test/mocks-drivers/google-sheets-api.ts`)
   - Simple test injection point
   - Lacks persistent state across operations
   - Insufficient for complex data manipulation scenarios

## Enhancement Requirements by Test Flow

### 1. Authentication Flow (Already Optimized)

While our authentication flow testing is now optimized, these enhancements will support the existing implementation:

- **Auth API Enhancements**:
  - Add simulation of the complete authentication process
  - Support for various error conditions
  - Better type definitions and error handling

### 2. Motivation Changes Flow (High Priority)

To support testing of motivation cell editing:

- **Google Sheets API Enhancements**:

  - Implement stateful mock with persistent in-memory representation
  - Support for cell-level operations (read/write/clear)
  - Maintain A1 notation in public API with internal translation
  - Add validation similar to the real API

- **Firebase API Enhancements**:
  - Add support for cell locking simulation
  - Implement real-time update notifications
  - Support concurrent user operations

### 3. Multi-user Awareness Flow (High Priority)

To support testing of collaboration features:

- **Firebase API Enhancements**:
  - Enhance presence tracking simulation
  - Support for multiple simulated users
  - Real-time event propagation
  - Visualization of user editing status

### 4. Role Changes Flow (Medium Priority)

To support testing of role management:

- **Google Sheets API Enhancements**:
  - Support for column operations
  - Persistent changes across operations
  - Row and column management

## Detailed Enhancement Plan

### 1. Firebase API Mock Enhancements

#### 1.1 Multi-user Presence Support

```typescript
// src/test/mocks-drivers/firebase-api.ts (additions)

export function mockFirebaseAPI() {
  // ... existing code

  return {
    // ... existing code

    /**
     * Simulates a new user joining the session
     */
    simulateUserJoined(userId: string, userName: string, photoURL: string) {
      const presencePath = `sheets/${this.sheetId}/presence/${userId}`;
      const presenceRef = this.api.getDatabaseRef(presencePath);
      const presenceData = {
        name: userName,
        photoUrl: photoURL,
        lastActive: Date.now(),
        activeCell: null,
        updateType: 'state_change',
      };

      // Update internal state
      this.state.values.set(presencePath, presenceData);

      // Notify subscribers
      this._notifySubscribers(`sheets/${this.sheetId}/presence`);

      return presenceData;
    },

    /**
     * Simulates a user leaving the session
     */
    simulateUserLeft(userId: string) {
      const presencePath = `sheets/${this.sheetId}/presence/${userId}`;

      // Update internal state
      this.state.values.delete(presencePath);

      // Notify subscribers
      this._notifySubscribers(`sheets/${this.sheetId}/presence`);
    },

    /**
     * Simulates a user changing their active cell
     */
    simulateUserActiveCell(userId: string, cellId: string) {
      const presencePath = `sheets/${this.sheetId}/presence/${userId}`;
      const presenceData = this.state.values.get(presencePath);

      if (presenceData) {
        const updatedData = {
          ...presenceData,
          activeCell: cellId,
          lastActive: Date.now(),
          updateType: 'cell_focus',
        };

        // Update internal state
        this.state.values.set(presencePath, updatedData);

        // Notify subscribers
        this._notifySubscribers(`sheets/${this.sheetId}/presence`);

        return updatedData;
      }

      return null;
    },

    /**
     * Gets all current users in the session
     */
    getCurrentUsers() {
      const presencePath = `sheets/${this.sheetId}/presence`;
      const presenceData = {};

      for (const [key, value] of this.state.values.entries()) {
        if (key.startsWith(presencePath)) {
          const userId = key.split('/').pop();
          presenceData[userId] = value;
        }
      }

      return presenceData;
    },

    /**
     * Helper to notify subscribers of changes
     */
    _notifySubscribers(path: string) {
      const subscribers = this.state.subscriptions.get(path);
      if (subscribers) {
        // Create data snapshot with current values
        const data = {};
        for (const [key, value] of this.state.values.entries()) {
          if (key.startsWith(path)) {
            const subPath = key.substring(path.length + 1);
            if (!subPath.includes('/')) {
              data[subPath] = value;
            }
          }
        }

        const snapshot = this._createMockDataSnapshot(data, path);
        subscribers.forEach(callback => callback(snapshot));
      }
    },
  };
}
```

#### 1.2 Cell Locking Mechanism

```typescript
// src/test/mocks-drivers/firebase-api.ts (additions)

export function mockFirebaseAPI() {
  // ... existing code

  return {
    // ... existing code

    /**
     * Simulates a user acquiring a lock on a cell
     */
    simulateCellLock(cellId: string, userId: string, ttlMs = 30000) {
      const lockPath = `sheets/${this.sheetId}/locks/${cellId}`;
      const lockRef = this.api.getDatabaseRef(lockPath);
      const now = Date.now();
      const lockData = {
        userId,
        acquired: now,
        expires: now + ttlMs,
      };

      // Update internal state
      this.state.values.set(lockPath, lockData);

      // Notify subscribers
      this._notifySubscribers(`sheets/${this.sheetId}/locks`);

      return lockData;
    },

    /**
     * Simulates a user releasing a lock on a cell
     */
    simulateCellUnlock(cellId: string) {
      const lockPath = `sheets/${this.sheetId}/locks/${cellId}`;

      // Update internal state
      this.state.values.delete(lockPath);

      // Notify subscribers
      this._notifySubscribers(`sheets/${this.sheetId}/locks`);
    },

    /**
     * Gets all current locks
     */
    getCurrentLocks() {
      const locksPath = `sheets/${this.sheetId}/locks`;
      const locksData = {};

      for (const [key, value] of this.state.values.entries()) {
        if (key.startsWith(locksPath)) {
          const cellId = key.split('/').pop();
          locksData[cellId] = value;
        }
      }

      return locksData;
    },

    /**
     * Simulates lock expiration
     */
    simulateLockExpiration(cellId: string) {
      const lockPath = `sheets/${this.sheetId}/locks/${cellId}`;
      const lockData = this.state.values.get(lockPath);

      if (lockData) {
        this.state.values.delete(lockPath);
        this._notifySubscribers(`sheets/${this.sheetId}/locks`);
      }
    },
  };
}
```

### 2. Google Sheets API Mock Enhancements

Based on the recommendation in the stateful-sheets-mock-analysis document, we'll implement a stateful mock that maintains A1 notation in the public API:

```typescript
// src/test/mocks-drivers/stateful-sheets-api.ts

import { GoogleSheetsContext } from '../../contexts/GoogleSheetsContext';

interface SheetState {
  values: string[][];
  metaData: {
    title: string;
    sheetId: string;
  };
}

export class StatefulSheetsAPI {
  private sheets: Map<string, SheetState> = new Map();
  private isLoading = false;
  private error: string | null = null;

  constructor(initialSheets?: Record<string, SheetState>) {
    if (initialSheets) {
      Object.entries(initialSheets).forEach(([sheetId, state]) => {
        this.sheets.set(sheetId, state);
      });
    }
  }

  /**
   * Converts A1 notation to [row, col] array indices
   * e.g., "B3" -> [2, 1] (0-indexed)
   */
  private a1ToIndices(a1: string): [number, number] {
    const match = a1.match(/([A-Z]+)([0-9]+)/);
    if (!match) {
      throw new Error(`Invalid A1 notation: ${a1}`);
    }

    const [, colStr, rowStr] = match;
    const row = parseInt(rowStr, 10) - 1; // Convert to 0-indexed

    // Convert column letters to 0-indexed number
    let col = 0;
    for (let i = 0; i < colStr.length; i++) {
      col = col * 26 + (colStr.charCodeAt(i) - 64);
    }
    col -= 1; // Convert to 0-indexed

    return [row, col];
  }

  /**
   * Parses a range in A1 notation (e.g., "A1:B3")
   * Returns top-left and bottom-right indices
   */
  private parseRange(range: string): {
    sheetId: string;
    startRow: number;
    startCol: number;
    endRow: number;
    endCol: number;
  } {
    // Split sheet ID from range
    const [sheetId, rangeStr] = range.split('!');

    // Parse range with or without end cell
    const rangeParts = rangeStr.split(':');
    const [startCell, endCell = startCell] = rangeParts;

    const [startRow, startCol] = this.a1ToIndices(startCell);
    const [endRow, endCol] = this.a1ToIndices(endCell);

    return {
      sheetId,
      startRow,
      startCol,
      endRow,
      endCol,
    };
  }

  /**
   * Ensures a sheet exists and has enough rows/columns
   */
  private ensureSheetDimensions(sheetId: string, rows: number, cols: number) {
    if (!this.sheets.has(sheetId)) {
      this.sheets.set(sheetId, {
        values: [],
        metaData: {
          title: sheetId,
          sheetId,
        },
      });
    }

    const sheet = this.sheets.get(sheetId);

    // Ensure enough rows
    while (sheet.values.length <= rows) {
      sheet.values.push([]);
    }

    // Ensure enough columns in each row
    for (let i = 0; i <= rows; i++) {
      while (sheet.values[i].length <= cols) {
        sheet.values[i].push('');
      }
    }
  }

  /**
   * Loads data from a sheet range
   */
  async load(range: string) {
    this.isLoading = true;

    try {
      const { sheetId, startRow, startCol, endRow, endCol } =
        this.parseRange(range);

      // Check if sheet exists
      if (!this.sheets.has(sheetId)) {
        throw new Error(`Sheet not found: ${sheetId}`);
      }

      const sheet = this.sheets.get(sheetId);

      // Extract values from sheet
      const values = [];
      for (let r = startRow; r <= endRow; r++) {
        const row = [];
        for (let c = startCol; c <= endCol; c++) {
          const value =
            r < sheet.values.length && c < sheet.values[r].length
              ? sheet.values[r][c]
              : '';
          row.push(value);
        }
        values.push(row);
      }

      this.isLoading = false;
      return {
        result: {
          values,
          range,
          sheetId,
        },
      };
    } catch (error) {
      this.isLoading = false;
      this.error = error.message;
      throw error;
    }
  }

  /**
   * Updates values in a sheet range
   */
  async update(range: string, values: string[][]) {
    this.isLoading = true;

    try {
      const { sheetId, startRow, startCol, endRow, endCol } =
        this.parseRange(range);

      // Ensure sheet has enough dimensions
      const maxRow = startRow + values.length - 1;
      const maxCol = startCol + Math.max(...values.map(row => row.length)) - 1;
      this.ensureSheetDimensions(sheetId, maxRow, maxCol);

      const sheet = this.sheets.get(sheetId);

      // Update values
      for (let r = 0; r < values.length; r++) {
        const row = values[r];
        for (let c = 0; c < row.length; c++) {
          sheet.values[startRow + r][startCol + c] = row[c];
        }
      }

      this.isLoading = false;
      return {
        result: {
          updatedRange: range,
          updatedRows: values.length,
          updatedColumns: Math.max(...values.map(row => row.length)),
          updatedCells: values.reduce((sum, row) => sum + row.length, 0),
        },
      };
    } catch (error) {
      this.isLoading = false;
      this.error = error.message;
      throw error;
    }
  }

  /**
   * Clears values in a sheet range
   */
  async clear(range: string) {
    this.isLoading = true;

    try {
      const { sheetId, startRow, startCol, endRow, endCol } =
        this.parseRange(range);

      // Check if sheet exists
      if (!this.sheets.has(sheetId)) {
        throw new Error(`Sheet not found: ${sheetId}`);
      }

      const sheet = this.sheets.get(sheetId);

      // Clear values
      for (let r = startRow; r <= endRow; r++) {
        if (r < sheet.values.length) {
          for (let c = startCol; c <= endCol; c++) {
            if (c < sheet.values[r].length) {
              sheet.values[r][c] = '';
            }
          }
        }
      }

      this.isLoading = false;
      return {
        result: {
          clearedRange: range,
          clearedRows: endRow - startRow + 1,
          clearedColumns: endCol - startCol + 1,
        },
      };
    } catch (error) {
      this.isLoading = false;
      this.error = error.message;
      throw error;
    }
  }

  /**
   * Gets the current state for test verification
   */
  getState() {
    return {
      isLoading: this.isLoading,
      error: this.error,
      sheets: Object.fromEntries(this.sheets),
    };
  }

  /**
   * Helper to create a mock API object for the Google Sheets context
   */
  createMockApi(): Partial<GoogleSheetsContext> {
    const self = this;

    return {
      isLoading: this.isLoading,
      error: this.error,
      client: {
        load: range => self.load(range),
        update: (range, values) => self.update(range, values),
        clear: range => self.clear(range),
      },
    };
  }

  /**
   * Creates test fixture data
   */
  static createTestFixture() {
    const api = new StatefulSheetsAPI({
      'test-sheet-id': {
        values: [
          ['', 'Role 1', 'Role 2', 'Role 3'],
          ['Conflict 1', '', '', ''],
          ['Conflict 2', '', '', ''],
          ['Conflict 3', '', '', ''],
        ],
        metaData: {
          title: 'Test Sheet',
          sheetId: 'test-sheet-id',
        },
      },
    });

    return api;
  }
}
```

### 3. Auth API Mock Enhancements

```typescript
// src/test/mocks-drivers/auth-api.ts (additions)

import { ClientLoadStatus } from '../../contexts/AuthContext';

export function mockAuthState() {
  // ... existing code

  return {
    // ... existing code

    /**
     * Simulates a full authentication process with events
     */
    simulateFullAuthProcess(
      options: {
        success?: boolean;
        delayMs?: number;
        userData?: {
          uid: string;
          displayName: string;
          photoURL: string;
        };
      } = {}
    ) {
      const {
        success = true,
        delayMs = 50,
        userData = {
          uid: 'test-user-id',
          displayName: 'Test User',
          photoURL: 'test-photo-url',
        },
      } = options;

      const events = [
        {
          state: {
            clientStatus: ClientLoadStatus.Loading,
            errorStatus: ClientLoadStatus.Loading,
          },
          delay: 0,
        },
        {
          state: {
            clientStatus: ClientLoadStatus.Initializing_gapi,
            errorStatus: ClientLoadStatus.Loading,
          },
          delay: delayMs * 0.2,
        },
        {
          state: {
            clientStatus: ClientLoadStatus.Initializing_gapi_2,
            errorStatus: ClientLoadStatus.Initializing_gapi,
          },
          delay: delayMs * 0.4,
        },
        {
          state: {
            clientStatus: ClientLoadStatus.Initializing_firebase,
            errorStatus: ClientLoadStatus.Initializing_gapi_2,
          },
          delay: delayMs * 0.6,
        },
        {
          state: {
            clientStatus: ClientLoadStatus.Connecting,
            errorStatus: ClientLoadStatus.Initializing_firebase,
          },
          delay: delayMs * 0.8,
        },
      ];

      // Final state depends on success/failure
      if (success) {
        events.push({
          state: {
            clientStatus: ClientLoadStatus.Ready,
            errorStatus: ClientLoadStatus.Connecting,
            firebaseUser: userData,
            access_token: 'mock-access-token',
          },
          delay: delayMs,
        });
      } else {
        events.push({
          state: {
            clientStatus: ClientLoadStatus.Error,
            errorStatus: ClientLoadStatus.Connecting,
            error: new Error('Authentication failed'),
          },
          delay: delayMs,
        });
      }

      // Apply each state change with the specified delay
      events.forEach(event => {
        setTimeout(() => {
          this.setState(event.state);
        }, event.delay);
      });

      return events;
    },

    /**
     * Simulates user logout
     */
    simulateLogout() {
      this.setState({
        clientStatus: ClientLoadStatus.Ready,
        firebaseUser: null,
        access_token: null,
      });
    },

    /**
     * Simulates token expiration
     */
    simulateTokenExpiration() {
      this.api.login.mockImplementationOnce(() => {
        this.setState({
          clientStatus: ClientLoadStatus.Error,
          errorStatus: ClientLoadStatus.Connecting,
          error: new Error('Token expired'),
        });
      });
    },
  };
}
```

## Integration Test Helper Functions

To leverage these enhanced mock drivers, we'll create specialized helper functions:

```typescript
// src/test/integration/enhanced-helpers.tsx

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactElement } from 'react';
import { createTestWrapper } from '../test-wrapper';
import { StatefulSheetsAPI } from '../mocks-drivers/stateful-sheets-api';

/**
 * Enhanced render function with multi-user support
 */
export function renderWithMultiUserSupport(ui: ReactElement) {
  const user = userEvent.setup();
  const testWrapper = createTestWrapper();
  const mockFirebase = testWrapper.mockFirebase;
  const mockAuth = testWrapper.mockAuth;
  const mockSheets = new StatefulSheetsAPI.createTestFixture();

  // Replace the default Google Sheets mock with our stateful implementation
  testWrapper.mockGoogleSheets = mockSheets.createMockApi();

  const result = render(ui, { wrapper: testWrapper.Wrapper });

  return {
    ...result,
    user,
    testWrapper,
    mockFirebase,
    mockAuth,
    mockSheets,

    // Helper to log in current user
    async loginCurrentUser() {
      mockAuth.simulateFullAuthProcess({ success: true });

      await waitFor(() => {
        expect(screen.queryByText(/authenticating/i)).not.toBeInTheDocument();
      });

      // Wait for presence to be established
      await this.waitForPresence('Test User');
    },

    // Helper to add a simulated user
    async addSimulatedUser(
      userId: string,
      userName: string,
      photoURL = 'test-photo-url'
    ) {
      mockFirebase.simulateUserJoined(userId, userName, photoURL);

      await waitFor(() => {
        const usersList = screen.getByRole('list', { name: /active users/i });
        expect(usersList).toHaveTextContent(userName);
      });

      return { userId, userName, photoURL };
    },

    // Helper to simulate a user focusing on a cell
    async simulateUserFocusingCell(userId: string, cellId: string) {
      mockFirebase.simulateUserActiveCell(userId, cellId);

      // Wait for the UI to update
      await waitFor(() => {
        const cell = screen.getByTestId(`cell-${cellId}`);
        expect(cell).toHaveAttribute('data-active-user', userId);
      });
    },

    // Helper to simulate a user locking a cell
    async simulateUserLockingCell(userId: string, cellId: string) {
      mockFirebase.simulateCellLock(cellId, userId);

      // Wait for the UI to update
      await waitFor(() => {
        const cell = screen.getByTestId(`cell-${cellId}`);
        expect(cell).toHaveAttribute('data-locked-by', userId);
      });
    },

    // Helper to wait for presence
    async waitForPresence(userName: string) {
      await waitFor(() => {
        const usersList = screen.getByRole('list', { name: /active users/i });
        expect(usersList).toHaveTextContent(userName);
      });
    },

    // Helper to edit a motivation cell
    async editMotivationCell(cellId: string, newText: string) {
      // Find and click the cell
      const cell = screen.getByTestId(`cell-${cellId}`);
      await user.click(cell);

      // Wait for edit mode
      const input = await screen.findByRole('textbox');

      // Type new text
      await user.clear(input);
      await user.type(input, newText);

      // Submit changes
      await user.keyboard('{Enter}');

      // Wait for the change to be applied
      await waitFor(() => {
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
        expect(cell).toHaveTextContent(newText);
      });
    },
  };
}
```

## Implementation Timeline

### Phase 1: Core Mock Enhancements (3-5 days)

1. **Day 1-2: Firebase Mock Enhancements**

   - Implement multi-user presence features
   - Add cell locking mechanisms
   - Add notification system for real-time updates

2. **Day 3-4: Google Sheets Mock Enhancements**

   - Implement stateful Google Sheets mock
   - Add range operations and coordinate translation
   - Create test fixtures and validation

3. **Day 5: Auth Mock Enhancements**
   - Add detailed authentication process simulation
   - Implement error conditions and token handling
   - Create comprehensive auth state helpers

### Phase 2: Integration Test Helpers (2-3 days)

1. **Day 1: Enhanced Helper Functions**

   - Create multi-user support helpers
   - Add cell editing and locking helpers
   - Implement presence verification utilities

2. **Day 2-3: Test Fixtures and Utilities**
   - Create standard test fixtures for common scenarios
   - Implement verification utilities for test assertions
   - Add documentation and usage examples

### Phase 3: Validation and Refinement (2-3 days)

1. **Day 1-2: Test Implementation**

   - Implement initial tests using enhanced mocks
   - Validate mock behavior against requirements
   - Refine mock implementations based on findings

2. **Day 3: Documentation and Guidelines**
   - Create comprehensive documentation
   - Establish best practices and patterns
   - Provide example usage for all mock features

## Validation Approach

To ensure our enhanced mock drivers work correctly, we'll:

1. **Create Unit Tests for Mock Drivers**

   - Test each mock driver implementation separately
   - Verify state management works correctly
   - Ensure events propagate as expected

2. **Implement Simple Integration Tests**

   - Create basic integration tests using enhanced mocks
   - Verify behavior matches expectations
   - Document any issues or refinements needed

3. **Validate Against Real APIs**
   - Compare mock behavior with real API behavior
   - Document any divergences for test authors
   - Adjust mock implementation to match critical behaviors

## Success Criteria

The mock driver enhancements will be considered successful when:

1. All identified high-priority test flows can be effectively tested
2. Mock behaviors adequately simulate real API behaviors
3. Tests run reliably and with consistent results
4. Test implementation is straightforward and well-documented
5. Performance remains acceptable for development workflow

## Next Steps

1. Begin implementation of Phase 1 (Firebase Mock Enhancements)
2. Review implementation with team for feedback
3. Continue with remaining phases as planned
4. Update test documentation and guidelines accordingly
