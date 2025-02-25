# Firebase and Google Sheets Integration Testing Strategy

## Overview

This document outlines our strategy for integrating the enhanced Firebase and Google Sheets mock implementations to enable realistic end-to-end testing scenarios for the LARP Conflicts Table Web Client. This integration is crucial for testing collaborative features and ensuring data consistency across both systems.

## Integration Architecture

### 1. Synchronized State Model

The integration testing framework will maintain synchronized state between Firebase and Google Sheets mocks:

```
┌────────────────────┐      ┌────────────────────┐
│                    │      │                    │
│   Firebase Mock    │◄────►│  Google Sheets Mock│
│                    │      │                    │
└────────────────────┘      └────────────────────┘
          ▲                           ▲
          │                           │
          ▼                           ▼
┌────────────────────────────────────────────────┐
│                                                │
│             LARP Conflicts Table               │
│                  Web Client                    │
│                                                │
└────────────────────────────────────────────────┘
```

### 2. Key Integration Points

1. **Cell Locking Mechanism**

   - Firebase locks must be reflected in the Sheets editing capabilities
   - Lock acquisition/release must trigger appropriate state changes in both systems

2. **Presence Awareness**

   - User presence data from Firebase should affect the Sheets mock behavior
   - Active cell highlighting should be consistent across both systems

3. **Change Propagation**

   - Changes in Sheets should be reflected in Firebase real-time database
   - Firebase updates should trigger appropriate Sheets state updates
   - Conflict resolution should be handled consistently

4. **Error Handling**
   - Errors in either system should propagate appropriately
   - Recovery mechanisms should restore consistent state

## Integration Implementation

### Combined Mock Factory

Create a combined mock factory that initializes both Firebase and Google Sheets mocks with synchronized state:

```typescript
interface IntegratedMockOptions {
  initialSheetData?: any[][];
  initialFirebaseData?: Record<string, any>;
  networkConditions?: {
    latencyMs: number;
    packetLoss: number;
    jitter: number;
  };
  errorScenarios?: {
    sheets?: ErrorSimulationOptions;
    firebase?: FirebaseErrorOptions;
  };
  userPresence?: Array<{
    userId: string;
    userName: string;
    photoUrl: string;
  }>;
}

/**
 * Create integrated Firebase and Google Sheets mocks
 */
function createIntegratedMocks(options: IntegratedMockOptions = {}) {
  // Create Firebase mock
  const firebaseMock = mockFirebaseAPI();

  // Create Sheets mock with Firebase integration
  const sheetsMock = SheetTestUtils.createFirebaseIntegratedMock(firebaseMock, {
    simulateConflicts:
      options.errorScenarios?.sheets?.simulateConflicts ?? false,
  });

  // Set initial data
  if (options.initialSheetData) {
    sheetsMock.setTestData(options.initialSheetData);
  }

  // Configure network conditions
  if (options.networkConditions) {
    firebaseMock.state.networkCondition = options.networkConditions;
  }

  // Set up error simulation
  if (options.errorScenarios?.sheets) {
    sheetsMock.api.simulateErrors(options.errorScenarios.sheets);
  }

  if (options.errorScenarios?.firebase) {
    // Apply Firebase error scenarios
    // Implementation depends on Firebase mock API
  }

  // Simulate user presence
  if (options.userPresence) {
    options.userPresence.forEach(user => {
      firebaseMock.simulateUserJoined(
        user.userId,
        user.userName,
        user.photoUrl
      );
    });
  }

  return {
    firebase: firebaseMock,
    sheets: sheetsMock,

    // Helper to reset both mocks
    reset() {
      firebaseMock.reset();
      sheetsMock.setState({ error: null, isLoading: false });
      if (options.initialSheetData) {
        sheetsMock.setTestData(options.initialSheetData);
      }
    },

    // Helper to simulate network disconnect
    simulateDisconnect() {
      firebaseMock.api.goOffline();
      sheetsMock.api.simulateErrors({ networkError: true });
    },

    // Helper to simulate network reconnect
    simulateReconnect() {
      firebaseMock.api.goOnline();
      sheetsMock.api.resetErrorSimulation();
    },
  };
}
```

### Change Propagation Mechanism

Implement a change propagation mechanism between Firebase and Google Sheets mocks:

```typescript
class ChangePropagatior {
  private firebaseMock: ReturnType<typeof mockFirebaseAPI>;
  private sheetsMock: ReturnType<typeof createStatefulSheetsAPI>;
  private sheetSubscriptions: Array<() => void> = [];
  private firebaseSubscriptions: Array<() => void> = [];

  constructor(
    firebaseMock: ReturnType<typeof mockFirebaseAPI>,
    sheetsMock: ReturnType<typeof createStatefulSheetsAPI>
  ) {
    this.firebaseMock = firebaseMock;
    this.sheetsMock = sheetsMock;
  }

  /**
   * Start monitoring for changes in both systems
   */
  startPropagation() {
    // Watch for sheet changes
    const sheetListener = (event: SheetEvent) => {
      if (event.type === 'rangeChanged' && event.range && event.newValues) {
        const { startRow, startCol } = A1Utils.parseRange(event.range);

        // Update Firebase values based on sheet changes
        // Implementation depends on specific data model
      }
    };

    this.sheetsMock.api.addEventListener('rangeChanged', sheetListener);
    this.sheetSubscriptions.push(() => {
      this.sheetsMock.api.removeEventListener('rangeChanged', sheetListener);
    });

    // Watch for Firebase changes
    // Implementation depends on Firebase mock API
  }

  /**
   * Stop change propagation
   */
  stopPropagation() {
    // Unsubscribe all listeners
    this.sheetSubscriptions.forEach(unsubscribe => unsubscribe());
    this.firebaseSubscriptions.forEach(unsubscribe => unsubscribe());
    this.sheetSubscriptions = [];
    this.firebaseSubscriptions = [];
  }
}
```

## Testing Patterns

### 1. Multi-User Collaboration Tests

```typescript
describe('Multi-user collaboration', () => {
  it('should allow multiple users to edit different cells simultaneously', async () => {
    // Create integrated mocks with multiple users
    const { firebase, sheets } = createIntegratedMocks({
      initialSheetData: sheetFixtures.basic,
      userPresence: [
        { userId: 'user1', userName: 'Alice', photoUrl: 'alice.jpg' },
        { userId: 'user2', userName: 'Bob', photoUrl: 'bob.jpg' },
      ],
    });

    // Set active cells for different users
    firebase.simulateUserActiveCell('user1', 'B2'); // Alice focuses on Role 1, Conflict 1
    firebase.simulateUserActiveCell('user2', 'C3'); // Bob focuses on Role 2, Conflict 2

    // Simulate lock acquisition
    firebase.simulateCellLock('B2', 'user1');
    firebase.simulateCellLock('C3', 'user2');

    // Simulate concurrent edits
    await sheets.api.update('B2', [['Alice Edit']]);
    await sheets.api.update('C3', [['Bob Edit']]);

    // Verify final state
    const finalData = await sheets.api.load();
    expect(finalData.result.values[1][1]).toBe('Alice Edit'); // B2
    expect(finalData.result.values[2][2]).toBe('Bob Edit'); // C3
  });

  it('should handle editing conflicts when users try to edit same cell', async () => {
    // Create integrated mocks with error scenarios
    const { firebase, sheets } = createIntegratedMocks({
      initialSheetData: sheetFixtures.basic,
      userPresence: [
        { userId: 'user1', userName: 'Alice', photoUrl: 'alice.jpg' },
        { userId: 'user2', userName: 'Bob', photoUrl: 'bob.jpg' },
      ],
      errorScenarios: {
        sheets: { simulateConflicts: true },
      },
    });

    // Alice locks a cell
    firebase.simulateUserActiveCell('user1', 'B2');
    firebase.simulateCellLock('B2', 'user1');

    // Bob tries to edit the same cell
    firebase.simulateUserActiveCell('user2', 'B2');

    // This should fail due to lock
    let errorOccurred = false;
    try {
      await firebase.simulateCellLock('B2', 'user2');
    } catch (error) {
      errorOccurred = true;
    }

    expect(errorOccurred).toBe(true);

    // Verify lock state
    const locks = firebase.getCurrentLocks();
    expect(locks['B2'].userId).toBe('user1');
  });
});
```

### 2. Network Resilience Tests

```typescript
describe('Network resilience', () => {
  it('should recover gracefully from network disconnection', async () => {
    // Create integrated mocks
    const { firebase, sheets, simulateDisconnect, simulateReconnect } =
      createIntegratedMocks({
        initialSheetData: sheetFixtures.basic,
        userPresence: [
          { userId: 'user1', userName: 'Alice', photoUrl: 'alice.jpg' },
        ],
      });

    // Make initial edit
    await sheets.api.update('B2', [['Before Disconnect']]);

    // Simulate network disconnection
    simulateDisconnect();

    // Try to make edit while disconnected
    let errorOccurred = false;
    try {
      await sheets.api.update('C2', [['During Disconnect']]);
    } catch (error) {
      errorOccurred = true;
    }

    expect(errorOccurred).toBe(true);

    // Simulate network reconnection
    simulateReconnect();

    // Make edit after reconnection
    await sheets.api.update('D2', [['After Reconnect']]);

    // Verify final state
    const finalData = await sheets.api.load();
    expect(finalData.result.values[1][1]).toBe('Before Disconnect'); // B2
    expect(finalData.result.values[1][3]).toBe('After Reconnect'); // D2
  });
});
```

### 3. Cell Locking Life Cycle Tests

```typescript
describe('Cell locking lifecycle', () => {
  it('should handle the complete lock lifecycle', async () => {
    // Create integrated mocks
    const { firebase, sheets } = createIntegratedMocks({
      initialSheetData: sheetFixtures.basic,
      userPresence: [
        { userId: 'user1', userName: 'Alice', photoUrl: 'alice.jpg' },
      ],
    });

    // 1. User focuses on cell
    firebase.simulateUserActiveCell('user1', 'B2');

    // 2. User acquires lock
    firebase.simulateCellLock('B2', 'user1');

    // 3. User edits cell
    await sheets.api.update('B2', [['Edited Value']]);

    // 4. User releases lock
    firebase.simulateCellUnlock('B2');

    // 5. User moves focus away
    firebase.simulateUserActiveCell('user1', null);

    // Verify final state
    const finalData = await sheets.api.load();
    expect(finalData.result.values[1][1]).toBe('Edited Value');

    // Verify locks were released
    const locks = firebase.getCurrentLocks();
    expect(locks['B2']).toBeUndefined();
  });

  it('should handle lock expiration gracefully', async () => {
    // Create integrated mocks
    const { firebase, sheets } = createIntegratedMocks({
      initialSheetData: sheetFixtures.basic,
      userPresence: [
        { userId: 'user1', userName: 'Alice', photoUrl: 'alice.jpg' },
        { userId: 'user2', userName: 'Bob', photoUrl: 'bob.jpg' },
      ],
    });

    // 1. User 1 locks a cell
    firebase.simulateUserActiveCell('user1', 'B2');
    firebase.simulateCellLock('B2', 'user1');

    // 2. User 1's lock expires
    firebase.simulateLockExpiration('B2');

    // 3. User 2 should now be able to lock and edit the cell
    firebase.simulateUserActiveCell('user2', 'B2');
    firebase.simulateCellLock('B2', 'user2');
    await sheets.api.update('B2', [['User 2 Edit']]);

    // Verify final state
    const finalData = await sheets.api.load();
    expect(finalData.result.values[1][1]).toBe('User 2 Edit');

    // Verify lock ownership
    const locks = firebase.getCurrentLocks();
    expect(locks['B2'].userId).toBe('user2');
  });
});
```

## Common Integration Testing Scenarios

The following scenarios should be covered by integration tests:

### Basic Functionality Tests

1. **Single User Edit Flow**

   - User joins, focuses on cell, locks cell, edits, unlocks, moves focus away

2. **Data Loading**

   - Load initial data from Google Sheets
   - Verify correct rendering with Firebase presence

3. **Sheet Structure Modifications**
   - Add/remove roles and conflicts
   - Verify Firebase and Sheets state consistency

### Multi-User Tests

4. **Concurrent Editing**

   - Multiple users editing different cells simultaneously
   - Verify correct data propagation

5. **Editing Conflicts**

   - Multiple users attempting to edit the same cell
   - Verify lock contention handling

6. **Presence Awareness**
   - Multiple users joining and leaving
   - Verify correct presence indicators

### Error Handling Tests

7. **Network Disconnection**

   - Simulate network failures
   - Verify recovery behavior

8. **API Errors**

   - Simulate API rate limiting, quota errors
   - Verify appropriate error handling

9. **Permission Errors**
   - Simulate permission denied scenarios
   - Verify user feedback

### Advanced Scenarios

10. **Undo/Redo Operations**

    - Test history-based operations
    - Verify state consistency

11. **Bulk Updates**

    - Test updating multiple cells at once
    - Verify performance and consistency

12. **Lock Expiration**
    - Test automatic lock expiration
    - Verify graceful handling

## Success Metrics

Integration tests will be considered successful when:

1. All functional test cases pass consistently
2. Data remains consistent between Firebase and Google Sheets mocks
3. Error scenarios are handled gracefully with appropriate recovery
4. Edge cases around locking and presence are handled correctly
5. Multi-user scenarios demonstrate correct collaborative behavior

These metrics will ensure that our integration testing approach provides comprehensive coverage of the LARP Conflicts Table Web Client's collaborative features.
