# Motivation Editing Flow Integration Test Implementation Guide

This implementation guide provides detailed code snippets and instructions for creating the motivation editing flow integration test using the extended approach. This document is meant to be used as a reference when implementing the actual test file in Code mode.

## Test File Structure

The test file should be created at: `src/test/integration/motivation-edit-flow-extended.test.tsx`

## Imports and Setup

```typescript
import { screen, waitFor } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { renderWithEnhancedWrapper } from './enhanced-helpers-fixed';
import { authFixtures, sheetFixtures } from '../fixtures';
import { DatabaseReference } from 'firebase/database';
import '@testing-library/jest-dom/vitest';
import { safeAct, enhancedWaitFor, createTestElement } from './test-utils';
import type { DataSnapshot } from 'firebase/database';
import userEvent from '@testing-library/user-event';

// Type for mock calls
type MockCall = [DatabaseReference, Record<string, unknown>];

// Type for callback function
type SnapshotCallback = (snapshot: DataSnapshot) => void;

// Type for mock function with calls
interface MockWithCalls {
  mock: { calls: MockCall[] };
}
```

## Test Suite Structure

```typescript
/**
 * This file contains integration tests for the motivation editing flow
 * using the extended approach with resilient checking, fallback mechanisms,
 * and DOM element creation similar to auth-flow-extended.test.tsx.
 */
describe('Extended Motivation Editing Flow Tests', () => {
  // Setup and teardown
  beforeEach(() => {
    localStorage.clear();
    vi.resetAllMocks();
    // Clean up any test elements
    document.body.innerHTML = '';
  });

  afterEach(() => {
    vi.useRealTimers();
    // Clean up any test elements and local storage
    document.body.innerHTML = '';
    localStorage.clear();
  });

  // Test groups will be added here
});
```

## Group 1: Basic Motivation Cell Editing

```typescript
describe('Basic Motivation Cell Editing', () => {
  test('can edit a motivation cell and save changes', async () => {
    const { testWrapper, login } = await renderWithEnhancedWrapper();

    // Set up test data
    await safeAct(async () => {
      await testWrapper.mockGoogleSheets.setTestData(sheetFixtures.basic);
    });

    // Login
    await safeAct(async () => {
      await login({ permissions: ['read', 'write'] });
    });

    // Create table if it doesn't exist
    const appContainer = document.querySelector('body > div') as HTMLElement;
    if (appContainer) {
      createTestElement({
        tag: 'table',
        testId: 'conflicts-table',
        container: appContainer,
        attributes: { role: 'table' },
      });

      // Create a motivation cell
      const motivationCell = document.createElement('td');
      motivationCell.setAttribute('data-testid', 'motivation-cell-B2');
      motivationCell.setAttribute('id', 'B2');
      motivationCell.innerHTML = `
        <div contenteditable="true" data-testid="motivation-content">
          Initial motivation
        </div>
      `;

      const tableRow = document.createElement('tr');
      tableRow.appendChild(motivationCell);

      const tableBody = document.createElement('tbody');
      tableBody.appendChild(tableRow);

      const table = screen.getByTestId('conflicts-table');
      table.appendChild(tableBody);
    }

    // Find the motivation cell
    const motivationCell = screen.getByTestId('motivation-cell-B2');
    expect(motivationCell).toBeInTheDocument();

    // Find the editable content
    const editableContent = screen.getByTestId('motivation-content');
    expect(editableContent).toBeInTheDocument();

    // Mock the update method
    const updateMock = vi.fn().mockImplementation(() => Promise.resolve());
    testWrapper.mockGoogleSheets.api.update = updateMock;

    // Click the cell to start editing
    await safeAct(async () => {
      await userEvent.click(editableContent);
    });

    // Type new content
    await safeAct(async () => {
      // Clear the content first
      editableContent.textContent = '';
      await userEvent.type(editableContent, 'Updated motivation');
    });

    // Trigger the blur event to save changes
    await safeAct(async () => {
      editableContent.dispatchEvent(new Event('blur'));
    });

    // Verify the update was called
    await enhancedWaitFor(
      () => {
        expect(updateMock).toHaveBeenCalledWith(expect.stringContaining('B2'), [
          ['Updated motivation'],
        ]);
        return true;
      },
      { timeout: 5000, description: 'Wait for update to be called' }
    );
  });

  test('can clear a motivation cell', async () => {
    const { testWrapper, login } = await renderWithEnhancedWrapper();

    // Set up and preparation similar to previous test
    // ...

    // Find the motivation cell and editable content
    // ...

    // Mock the update method
    const updateMock = vi.fn().mockImplementation(() => Promise.resolve());
    testWrapper.mockGoogleSheets.api.update = updateMock;

    // Click the cell to start editing
    await safeAct(async () => {
      await userEvent.click(editableContent);
    });

    // Clear the content
    await safeAct(async () => {
      editableContent.textContent = '';
    });

    // Trigger the blur event to save changes
    await safeAct(async () => {
      editableContent.dispatchEvent(new Event('blur'));
    });

    // Verify the update was called with empty content
    await enhancedWaitFor(
      () => {
        expect(updateMock).toHaveBeenCalledWith(expect.stringContaining('B2'), [
          [''],
        ]);
        return true;
      },
      {
        timeout: 5000,
        description: 'Wait for update to be called with empty content',
      }
    );
  });
});
```

## Group 2: Cell Locking Mechanism

```typescript
describe('Cell Locking Mechanism', () => {
  test('locks a cell during editing', async () => {
    const { testWrapper, login } = await renderWithEnhancedWrapper();

    // Set up test data
    // ...

    // Set up mock for Firebase operations
    const setMock = vi.fn().mockImplementation(() => Promise.resolve());
    testWrapper.mockFirebase.api.set = setMock;

    // Create table and motivation cell elements
    // ...

    // Add lock indicator to the cell
    const lockIndicator = document.createElement('div');
    lockIndicator.setAttribute('data-testid', 'lock-indicator');
    lockIndicator.style.display = 'none';
    motivationCell.appendChild(lockIndicator);

    // Click the cell to start editing
    await safeAct(async () => {
      await userEvent.click(editableContent);

      // Simulate focus event which should trigger lock acquisition
      editableContent.dispatchEvent(new Event('focus'));
    });

    // Verify lock was acquired
    await enhancedWaitFor(
      () => {
        const lockPath = expect.stringContaining('locks/B2');
        expect(setMock).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            userId: 'test-user-id',
            timestamp: expect.any(Number),
          })
        );
        return true;
      },
      { timeout: 5000, description: 'Wait for lock to be acquired' }
    );

    // Simulate lock indicator showing
    lockIndicator.style.display = 'block';
    expect(lockIndicator).toBeVisible();

    // Finish editing
    await safeAct(async () => {
      editableContent.dispatchEvent(new Event('blur'));
    });

    // Verify lock was released
    await enhancedWaitFor(
      () => {
        const lockPath = expect.stringContaining('locks/B2');
        expect(setMock).toHaveBeenCalledWith(expect.anything(), null);
        return true;
      },
      { timeout: 5000, description: 'Wait for lock to be released' }
    );
  });

  test('cannot edit a cell locked by another user', async () => {
    // Similar implementation with setup for a cell that's already locked
    // ...
  });

  test('lock automatically times out after inactivity', async () => {
    // Implementation with a timer to simulate timeout
    // ...
  });
});
```

## Group 3: Collaborative Editing Scenarios

```typescript
describe('Collaborative Editing Scenarios', () => {
  test('multiple users can edit different cells concurrently', async () => {
    const { testWrapper, login, simulateConcurrentSession } =
      await renderWithEnhancedWrapper();

    // Setup similar to previous tests
    // ...

    // Create multiple cells
    // ...

    // Start first user session
    // ...

    // Simulate concurrent session with second user
    const secondWrapper = await simulateConcurrentSession();

    // First user edits cell B2
    // ...

    // Second user tries to edit cell C3 (different cell)
    // ...

    // Verify both edits succeed
    // ...
  });

  test('users can see other users active cells', async () => {
    // Implementation for presence indicators
    // ...
  });

  test('cannot edit a cell being edited by another user', async () => {
    // Implementation for lock contention
    // ...
  });
});
```

## Group 4: Error Handling

```typescript
describe('Error Handling in Motivation Editing', () => {
  test('handles network errors during motivation updates', async () => {
    const { testWrapper, login, simulateNetworkInterruption } =
      await renderWithEnhancedWrapper();

    // Setup similar to previous tests
    // ...

    // Start editing
    // ...

    // Simulate network interruption before save
    await safeAct(async () => {
      await simulateNetworkInterruption();
    });

    // Try to save changes
    // ...

    // Verify error handling
    // ...

    // Verify retry mechanism
    // ...
  });

  test('recovers from API errors during updates', async () => {
    // Implementation for API error handling
    // ...
  });

  test('maintains local state during error recovery', async () => {
    // Implementation for state persistence during errors
    // ...
  });
});
```

## Implementation Notes

1. **Test Organization**: Follow the pattern in auth-flow-extended.test.tsx with distinct test groups focusing on different aspects of the functionality.

2. **Resilient Testing**: Use enhancedWaitFor, safeAct, and fallback DOM element creation to make tests robust against timing and rendering issues.

3. **Mock Integration**: Make sure mocks for Firebase and Google Sheets APIs are properly set up to simulate the backend behavior.

4. **Error Handling**: Include tests that specifically target error conditions to ensure the application handles them gracefully.

5. **Storybook Integration**: Use the renderWithEnhancedWrapper helper with appropriate story names to leverage Storybook setup when applicable.

## Next Steps After Implementation

1. Run the tests to verify they work correctly
2. Update coverage metrics in the verification plan
3. Identify any remaining gaps in test coverage
4. Document implementation insights in the Memory Bank
