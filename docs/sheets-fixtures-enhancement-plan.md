# Google Sheets Fixtures Enhancement Plan

## Overview

This document outlines the plan for enhancing the sheet fixtures to support more comprehensive integration testing. These enhancements will provide a wider range of test scenarios for our LARP Conflicts Table Web Client integration tests.

## Current State

The current `sheet-fixtures.ts` file provides basic fixtures:

1. `basic`: Simple 2x2 conflict/role grid
2. `empty`: Empty sheet with a single cell
3. `withManyRoles`: Grid with 5 roles and 1 conflict
4. `withManyConflicts`: Grid with 2 roles and 5 conflicts

While these fixtures are useful for basic testing, they don't cover many real-world scenarios or edge cases that our integration tests need to handle.

## Enhanced Fixtures Plan

We will extend the sheet fixtures to include:

### 1. Realistic Data Scenarios

- **realWorldLarge**: A large dataset representing a real LARP scenario (25+ roles, 20+ conflicts)
- **unbalancedGrid**: A grid with varying numbers of motivations per conflict
- **withEmptyCells**: Grid with strategically placed empty cells to test sparse data handling
- **withSpecialCharacters**: Data containing special characters, Unicode, emojis, etc.
- **multilingualContent**: Grid with content in multiple languages (English, Hebrew, etc.)

### 2. Error Condition Fixtures

- **malformedGrid**: Grid with incorrectly structured data (missing headers, etc.)
- **withFormulas**: Cells containing formula strings to test formula handling
- **withExcessiveData**: Very large dataset to test performance boundaries
- **withDuplicateRoles**: Grid containing duplicate role names
- **withDuplicateConflicts**: Grid containing duplicate conflict names

### 3. State Transition Fixtures

- **beforeRoleAddition**: State before a role is added
- **afterRoleAddition**: State after a role is added
- **beforeRoleDeletion**: State before a role is deleted
- **afterRoleDeletion**: State after a role is deleted
- **beforeConflictAddition**: State before a conflict is added
- **afterConflictAddition**: State after a conflict is added
- **beforeConflictDeletion**: State before a conflict is deleted
- **afterConflictDeletion**: State after a conflict is deleted

### 4. Multi-User Collaboration Fixtures

- **userAView**: Sheet state as seen by User A during collaboration
- **userBView**: Sheet state as seen by User B during collaboration
- **conflictingEdits**: Sheet states representing conflicting edits
- **resolvedConflicts**: Sheet state after conflict resolution

### 5. Special Case Fixtures

- **withMetadata**: Sheet containing metadata rows/columns
- **withFormatting**: Sheet with complex formatting information
- **withMergedCells**: Sheet containing merged cells
- **withHiddenContent**: Sheet with hidden rows/columns
- **withFilteredView**: Sheet with filtered data view

## Implementation Approach

1. Create a new `enhanced-sheet-fixtures.ts` file to avoid disrupting existing tests
2. Implement fixtures in categories for better organization
3. Add documentation for each fixture explaining its purpose and use cases
4. Include helper functions for generating dynamic variations of fixtures
5. Ensure all fixtures are consistent with the application's data model

## Integration with Mock API

The enhanced fixtures will be integrated with both the Google Sheets mock API and the Firebase mock API to enable comprehensive integration testing:

1. Create helper functions to load specific fixtures into the mock API
2. Add functions to simulate specific state transitions
3. Implement utilities to verify sheet state against fixtures
4. Create combined fixtures for synchronized Google Sheets and Firebase state

## Usage Examples

Code examples demonstrating how to use these fixtures in integration tests:

```typescript
// Loading a fixture into the mock
const mockSheets = mockGoogleSheetsAPI();
await mockSheets.setTestData(enhancedSheetFixtures.realWorldLarge);

// Simulating a state transition
const initialState = enhancedSheetFixtures.beforeRoleAddition;
const expectedFinalState = enhancedSheetFixtures.afterRoleAddition;
await mockSheets.setTestData(initialState);

// Verification after operations
expect(mockSheets.api.getCurrentData()).toEqual(expectedFinalState);
```

## Timeline

1. **Day 3 Morning**: Implement realistic data scenarios and error condition fixtures
2. **Day 3 Afternoon**: Implement state transition fixtures and special case fixtures
3. **Day 4 Morning**: Implement multi-user collaboration fixtures
4. **Day 4 Afternoon**: Create helper functions and integration with mock APIs

By enhancing our fixtures in this way, we will be able to create much more comprehensive integration tests that cover a wide range of real-world scenarios and edge cases.
