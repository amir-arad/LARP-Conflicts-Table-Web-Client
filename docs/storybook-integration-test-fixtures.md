# Using Storybook for Integration Test Fixtures

## Overview

This document outlines a plan for implementing integration test fixtures using Storybook in the LARP Conflicts Table Web Client. This approach leverages the existing Storybook setup to create reusable test fixtures that can be used for both visual documentation and automated testing.

## Current State Analysis

### Integration Testing Setup

- Uses Vitest with JSDOM for fast tests
- Has a comprehensive mock system for external dependencies (Firebase, Google Auth, Google Sheets)
- Uses React Testing Library for component testing
- Has a test wrapper that provides all necessary context providers

### Storybook Implementation

- Storybook is already set up in the project (version 8.5.3)
- There's at least one component story (active-users-list.stories.tsx)
- The story includes mock implementations of hooks and state

### Integration Test Fixtures

- Currently, test fixtures are created programmatically in the test files
- Mock drivers are used to simulate external dependencies
- Test helpers provide common functionality

## Benefits of Using Storybook for Test Fixtures

1. **Visual Development and Debugging**:

   - Storybook provides a visual environment to develop and debug test fixtures
   - Makes it easier to understand complex component states and interactions
   - Allows manual testing of components before writing automated tests

2. **Reusability Between Tests and Documentation**:

   - The same fixtures can be used for both visual documentation and automated tests
   - Reduces duplication between test setup and Storybook stories
   - Ensures test scenarios are well-documented visually

3. **Consistent Test Data**:

   - Centralizes test fixture creation
   - Ensures consistent test data across different tests
   - Makes it easier to update test data when component requirements change

4. **Better Developer Experience**:
   - Provides a more intuitive way to create test scenarios
   - Makes it easier for new developers to understand test cases
   - Facilitates collaboration between developers and designers

## Implementation Plan

### 1. Create a Shared Fixtures Library

Create a shared fixtures library that can be used by both Storybook and integration tests:

```typescript
// src/test/fixtures/index.ts
export * from './auth-fixtures';
export * from './sheet-fixtures';
export * from './presence-fixtures';

// src/test/fixtures/auth-fixtures.ts
import { ClientLoadStatus } from '../../contexts/AuthContext';

export const authFixtures = {
  authenticated: {
    clientStatus: ClientLoadStatus.Ready,
    errorStatus: ClientLoadStatus.Ready,
    access_token: 'mock-access-token',
    firebaseUser: {
      uid: 'test-user-id',
      displayName: 'Test User',
      photoURL: 'test-photo-url',
    },
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

// src/test/fixtures/sheet-fixtures.ts
export const sheetFixtures = {
  basic: [
    ['', 'Role 1', 'Role 2'],
    ['Conflict 1', 'M1-1', 'M1-2'],
    ['Conflict 2', 'M2-1', 'M2-2'],
  ],
  empty: [['']],
  withManyRoles: [
    ['', 'Role 1', 'Role 2', 'Role 3', 'Role 4', 'Role 5'],
    ['Conflict 1', 'M1-1', 'M1-2', 'M1-3', 'M1-4', 'M1-5'],
  ],
  withManyConflicts: [
    ['', 'Role 1', 'Role 2'],
    ['Conflict 1', 'M1-1', 'M1-2'],
    ['Conflict 2', 'M2-1', 'M2-2'],
    ['Conflict 3', 'M3-1', 'M3-2'],
    ['Conflict 4', 'M4-1', 'M4-2'],
    ['Conflict 5', 'M5-1', 'M5-2'],
  ],
};

// src/test/fixtures/presence-fixtures.ts
import { PresenceState } from '../../lib/collaboration';

export const presenceFixtures = {
  singleUser: {
    user1: {
      name: 'Alice',
      photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
      activeCell: null,
      lastActive: Date.now(),
      updateType: 'state_change',
    },
  } as PresenceState,
  multipleUsers: {
    user1: {
      name: 'Alice',
      photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
      activeCell: 'A1',
      lastActive: Date.now(),
      updateType: 'state_change',
    },
    user2: {
      name: 'Bob',
      photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
      activeCell: 'B2',
      lastActive: Date.now(),
      updateType: 'state_change',
    },
    user3: {
      name: 'Charlie',
      photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie',
      activeCell: 'C3',
      lastActive: Date.now(),
      updateType: 'state_change',
    },
  } as PresenceState,
  empty: {} as PresenceState,
};
```

### 2. Create Storybook Decorators for Test Context

Create Storybook decorators that provide the same context as our test wrapper:

```typescript
// src/test/storybook/decorators.tsx
import { StoryFn } from '@storybook/react';
import { createTestWrapper } from '../test-wrapper';
import { authFixtures, sheetFixtures, presenceFixtures } from '../fixtures';

export const withTestWrapper = (Story: StoryFn) => {
  const testWrapper = createTestWrapper();
  return (
    <testWrapper.Wrapper>
      <Story />
    </testWrapper.Wrapper>
  );
};

export const withAuthenticatedUser = (Story: StoryFn) => {
  const testWrapper = createTestWrapper();
  testWrapper.mockAuth.setState(authFixtures.authenticated);
  return (
    <testWrapper.Wrapper>
      <Story />
    </testWrapper.Wrapper>
  );
};

export const withBasicSheetData = (Story: StoryFn) => {
  const testWrapper = createTestWrapper();
  testWrapper.mockGoogleSheets.setTestData(sheetFixtures.basic);
  return (
    <testWrapper.Wrapper>
      <Story />
    </testWrapper.Wrapper>
  );
};

export const withActiveUsers = (Story: StoryFn) => {
  const testWrapper = createTestWrapper();

  // Set up presence data
  const presenceRef = testWrapper.mockFirebase.api.getDatabaseRef(
    'sheets/test-sheet-id/presence'
  );

  // Add users to presence
  Object.entries(presenceFixtures.multipleUsers).forEach(([userId, userData]) => {
    const userRef = testWrapper.mockFirebase.api.getDatabaseRef(
      `sheets/test-sheet-id/presence/${userId}`
    );
    testWrapper.mockFirebase.api.set(userRef, userData);
  });

  return (
    <testWrapper.Wrapper>
      <Story />
    </testWrapper.Wrapper>
  );
};

// Combined decorator for full app state
export const withFullAppState = (Story: StoryFn) => {
  const testWrapper = createTestWrapper();

  // Set authenticated user
  testWrapper.mockAuth.setState(authFixtures.authenticated);

  // Set sheet data
  testWrapper.mockGoogleSheets.setTestData(sheetFixtures.basic);

  // Set up presence data
  Object.entries(presenceFixtures.multipleUsers).forEach(([userId, userData]) => {
    const userRef = testWrapper.mockFirebase.api.getDatabaseRef(
      `sheets/test-sheet-id/presence/${userId}`
    );
    testWrapper.mockFirebase.api.set(userRef, userData);
  });

  return (
    <testWrapper.Wrapper>
      <Story />
    </testWrapper.Wrapper>
  );
};
```

### 3. Create Integration Test Stories

Create stories that represent our integration test scenarios:

```typescript
// src/test/storybook/auth-flow.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { SimpleApp } from '../integration/helpers';
import {
  withTestWrapper,
  withAuthenticatedUser,
  withBasicSheetData
} from './decorators';
import { authFixtures } from '../fixtures';
import { createTestWrapper } from '../test-wrapper';

const meta = {
  title: 'Integration Tests/Auth Flow',
  component: SimpleApp,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof SimpleApp>;

export default meta;
type Story = StoryObj<typeof meta>;

// Initial state (not logged in)
export const Initial: Story = {
  decorators: [withTestWrapper],
};

// Authenticated state
export const Authenticated: Story = {
  decorators: [withAuthenticatedUser, withBasicSheetData],
};

// Error state
export const AuthenticationError: Story = {
  decorators: [(Story) => {
    const testWrapper = createTestWrapper();
    testWrapper.mockAuth.setState(authFixtures.error);
    return (
      <testWrapper.Wrapper>
        <Story />
      </testWrapper.Wrapper>
    );
  }],
};
```

### 4. Update Integration Tests to Use Storybook Fixtures

Update integration tests to use the same fixtures:

```typescript
// src/test/integration/auth-flow.test.tsx (updated)
import { screen, waitFor } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { renderWithTestWrapper } from './helpers';
import { authFixtures, sheetFixtures } from '../fixtures';
import { DatabaseReference } from 'firebase/database';

// Type for mock calls
type MockCall = [DatabaseReference, Record<string, unknown>];

describe('Authentication Flow', () => {
  test('happy path: user logs in and establishes presence', async () => {
    // Arrange
    const { testWrapper, login, waitForPresence, checkCoreUIElements } =
      renderWithTestWrapper(null);

    // Set up mock data for Google Sheets
    await testWrapper.mockGoogleSheets.setTestData(sheetFixtures.basic);

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

  // Other tests remain the same but use fixtures
});
```

### 5. Create a Storybook Test Runner Configuration

Set up the Storybook test runner to run automated tests against our stories:

```javascript
// .storybook/test-runner.js
const { toMatchImageSnapshot } = require('jest-image-snapshot');

module.exports = {
  setup() {
    expect.extend({ toMatchImageSnapshot });
  },
  async postRender(page, context) {
    // If this is a visual test story
    if (context.parameters.visualTest) {
      const image = await page.screenshot();
      expect(image).toMatchImageSnapshot({
        customSnapshotsDir: `__image_snapshots__/${context.id}`,
        customDiffDir: `__image_snapshots__/__diff_output__/${context.id}`,
      });
    }

    // If this story has custom assertions
    if (context.parameters.assertions) {
      await context.parameters.assertions(page, context);
    }
  },
};
```

### 6. Create a Storybook Test Adapter for Vitest

Create an adapter that allows Vitest to use Storybook stories as test fixtures:

```typescript
// src/test/storybook/vitest-adapter.ts
import { render } from '@testing-library/react';
import { composeStories } from '@storybook/react';
import * as authFlowStories from './auth-flow.stories';

// Compose the stories to get the rendered components with all decorators applied
const composedAuthFlowStories = composeStories(authFlowStories);

// Export a function to render a story in a test
export function renderStory(storyName: keyof typeof composedAuthFlowStories) {
  const Story = composedAuthFlowStories[storyName];
  return render(<Story />);
}

// Export all composed stories
export const stories = {
  authFlow: composedAuthFlowStories,
};
```

## Integration with Existing Test Infrastructure

To make this approach work with the existing test infrastructure:

1. **Share Fixtures**: Ensure fixtures are shared between Storybook and tests
2. **Consistent Mocking**: Use the same mock implementations in both environments
3. **Test Helpers**: Create helpers that work in both contexts

## Implementation Timeline

### Phase 1: Setup (1-2 days)

1. Create the fixtures library
2. Create Storybook decorators
3. Update the test wrapper to use fixtures

### Phase 2: Story Creation (2-3 days)

1. Create stories for auth flow
2. Create stories for table interactions
3. Create stories for collaboration features

### Phase 3: Test Integration (2-3 days)

1. Update integration tests to use fixtures
2. Create the Vitest adapter
3. Run tests and verify they pass

### Phase 4: Documentation and Refinement (1-2 days)

1. Document the approach
2. Refine the implementation
3. Create examples for future test scenarios

## Advantages of This Approach

1. **Visual Development**: Develop test fixtures visually in Storybook
2. **Documentation**: Stories serve as living documentation of test scenarios
3. **Reusability**: Reuse fixtures across tests and stories
4. **Consistency**: Ensure consistent test data and scenarios
5. **Collaboration**: Easier collaboration between developers, designers, and QA

## Challenges and Considerations

1. **Complexity**: Adds some complexity to the test setup
2. **Maintenance**: Need to maintain both Storybook stories and tests
3. **Performance**: Storybook can be slower than direct tests
4. **Coverage**: Need to ensure all test scenarios are covered

## Conclusion

Implementing integration test fixtures using Storybook is not only feasible but could provide significant benefits for this project. The existing Storybook setup and mock infrastructure make this approach particularly well-suited for the LARP Conflicts Table Web Client.

By creating a shared fixtures library and Storybook decorators that mimic the test environment, we can create a powerful testing and documentation system that improves developer experience and ensures consistent test coverage.
