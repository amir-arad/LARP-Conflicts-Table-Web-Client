# Role Management Test Implementation Guide

## Overview

This guide provides detailed implementation instructions for the role management integration tests, following the patterns established in our motivation editing tests.

## Test File Structure

### File Location

```typescript
// src/test/integration/role-management-flow-extended.test.tsx
```

### Required Imports

```typescript
import { screen } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { renderWithEnhancedWrapper } from './enhanced-helpers-fixed';
import { sheetFixtures } from '../fixtures';
import '@testing-library/jest-dom/vitest';
import { safeAct, enhancedWaitFor, createTestElement } from './test-utils';
import userEvent from '@testing-library/user-event';
```

## Test Groups Implementation

### 1. Basic Role Management Tests

```typescript
describe('Basic Role Management', () => {
  test('can add a new role', async () => {
    const { testWrapper, login } = await renderWithEnhancedWrapper();

    // Setup and login
    await safeAct(async () => {
      await testWrapper.mockGoogleSheets.setTestData(sheetFixtures.basic);
      await login({ permissions: ['read', 'write'] });
    });

    // Mock update method
    const updateMock = vi.fn().mockImplementation(() => Promise.resolve());
    testWrapper.mockGoogleSheets.api.update = updateMock;

    // Create test elements
    const appContainer = document.querySelector('body > div') as HTMLElement;
    if (appContainer) {
      createTestElement({
        tag: 'button',
        text: 'Add Role',
        testId: 'add-role-button',
        container: appContainer,
      });
    }

    // Click add role button
    await userEvent.click(screen.getByTestId('add-role-button'));

    // Type new role name
    const roleInput = screen.getByTestId('role-name-input');
    await userEvent.type(roleInput, 'New Test Role');
    await userEvent.keyboard('{Enter}');

    // Verify role was added
    expect(updateMock).toHaveBeenCalledWith(
      expect.stringContaining('A1'),
      expect.arrayContaining([['New Test Role']])
    );
  });

  test('can remove an existing role', async () => {
    // Similar structure with role removal logic
  });
});
```

### 2. Role Data Persistence Tests

```typescript
describe('Role Data Persistence', () => {
  test('saves role data to Google Sheets', async () => {
    // Implementation for saving role data
  });

  test('loads role data correctly', async () => {
    // Implementation for loading role data
  });
});
```

### 3. Collaborative Role Management Tests

```typescript
describe('Collaborative Role Management', () => {
  test('handles multiple users adding roles simultaneously', async () => {
    const { testWrapper, login, simulateConcurrentSession } =
      await renderWithEnhancedWrapper();

    // First user session setup
    await safeAct(async () => {
      await testWrapper.mockGoogleSheets.setTestData(sheetFixtures.basic);
      await login({ permissions: ['read', 'write'] });
    });

    // Second user session
    const secondWrapper = await simulateConcurrentSession();

    // Simulate concurrent role additions
    // Verify both changes are reflected
  });
});
```

### 4. Error Handling Tests

```typescript
describe('Error Handling in Role Management', () => {
  test('handles network errors during role addition', async () => {
    // Implementation for network error handling
  });

  test('recovers from API errors', async () => {
    // Implementation for API error recovery
  });
});
```

## Mock Setup Guidelines

### Google Sheets API Mocks

```typescript
const mockGoogleSheets = {
  update: vi.fn().mockImplementation(() => Promise.resolve()),
  load: vi.fn().mockImplementation(() =>
    Promise.resolve({
      result: { values: [['Role 1', 'Role 2']] },
    })
  ),
};
```

### Firebase Mocks

```typescript
const mockFirebase = {
  set: vi.fn().mockImplementation(() => Promise.resolve()),
  onValue: vi.fn().mockImplementation(() => () => {}),
};
```

## Helper Functions

### Test Element Creation

```typescript
function createRoleManagementElements(container: HTMLElement) {
  createTestElement({
    tag: 'button',
    text: 'Add Role',
    testId: 'add-role-button',
    container,
  });

  createTestElement({
    tag: 'input',
    testId: 'role-name-input',
    container,
    attributes: { type: 'text', placeholder: 'Enter role name' },
  });
}
```

### Event Simulation

```typescript
async function simulateRoleAddition(roleName: string) {
  await userEvent.click(screen.getByTestId('add-role-button'));
  const input = screen.getByTestId('role-name-input');
  await userEvent.type(input, roleName);
  await userEvent.keyboard('{Enter}');
}
```

## Best Practices

1. **Test Isolation**

   - Clear mocks in beforeEach
   - Reset DOM state between tests
   - Use unique test IDs

2. **Resilient Testing**

   - Use enhancedWaitFor for async operations
   - Implement fallback element creation
   - Handle edge cases gracefully

3. **Mock Management**

   - Set up mocks before actions
   - Verify mock calls after operations
   - Clean up mocks after tests

4. **Event Handling**
   - Use proper event sequences
   - Include necessary delays
   - Verify event effects

## Common Patterns

1. **Setup Pattern**

   ```typescript
   const { testWrapper, login } = await renderWithEnhancedWrapper();
   await safeAct(async () => {
     await testWrapper.mockGoogleSheets.setTestData(sheetFixtures.basic);
     await login({ permissions: ['read', 'write'] });
   });
   ```

2. **Verification Pattern**

   ```typescript
   await enhancedWaitFor(
     () => {
       expect(updateMock).toHaveBeenCalledWith(
         expect.stringContaining('A1'),
         expect.any(Array)
       );
       return true;
     },
     { timeout: 5000 }
   );
   ```

3. **Error Handling Pattern**
   ```typescript
   try {
     await safeAct(async () => {
       await operation();
     });
   } catch (error) {
     // Verify error handling
   }
   ```
