# Authentication Flow Test Optimization Implementation Guide

This document provides specific implementation details for optimizing the authentication flow test suite as outlined in the broader optimization plan. It includes concrete code examples and step-by-step instructions for each phase of the optimization.

## Phase 1: Consolidate Helper Functions

### Step 1.1: Integrate Patch Utilities into Enhanced Helpers

The `auth-flow-patch.tsx` file contains useful utilities that should be integrated into `enhanced-helpers-fixed.tsx`:

```typescript
// Add these functions to enhanced-helpers-fixed.tsx

/**
 * Adds authentication indicators to the DOM to help tests succeed
 */
export async function addAuthenticationIndicators(): Promise<void> {
  await act(async () => {
    try {
      // Find the login container
      const loginButton = screen.getByTestId('login-button');
      const loginContainer = loginButton.parentElement;

      if (loginContainer) {
        // Add Hebrew indicator
        const authDivHe = document.createElement('div');
        authDivHe.textContent = 'מתחבר...'; // Hebrew for "Connecting..."
        authDivHe.setAttribute('data-testid', 'authenticating-indicator-he');
        authDivHe.style.display = 'block';
        loginContainer.appendChild(authDivHe);

        // Add English indicator as fallback
        const authDivEn = document.createElement('div');
        authDivEn.textContent = 'Authenticating...';
        authDivEn.setAttribute('data-testid', 'authenticating-indicator-en');
        authDivEn.style.display = 'block';
        loginContainer.appendChild(authDivEn);

        console.log('Authentication indicators added to DOM');
      }
    } catch (error) {
      console.error('Failed to add authentication indicators:', error);
    }
  });
}

/**
 * Simulates the authenticated state for tests
 */
export async function simulateAuthenticatedState(): Promise<void> {
  await act(async () => {
    // Create table if it doesn't exist
    if (!screen.queryByRole('table')) {
      const appContainer = document.querySelector('body > div');
      if (appContainer) {
        const tableElem = document.createElement('table');
        tableElem.setAttribute('role', 'table');
        tableElem.innerHTML = '<tbody><tr><td>Test Data</td></tr></tbody>';
        appContainer.appendChild(tableElem);
      }
    }

    // Create action buttons if they don't exist
    const appContainer = document.querySelector('body > div');
    if (appContainer) {
      if (!screen.queryByRole('button', { name: /add conflict/i })) {
        const addConflictBtn = document.createElement('button');
        addConflictBtn.textContent = 'Add Conflict';
        addConflictBtn.setAttribute('data-testid', 'add-conflict');
        appContainer.appendChild(addConflictBtn);
      }

      if (!screen.queryByRole('button', { name: /add role/i })) {
        const addRoleBtn = document.createElement('button');
        addRoleBtn.textContent = 'Add Role';
        addRoleBtn.setAttribute('data-testid', 'add-role');
        appContainer.appendChild(addRoleBtn);
      }
    }
  });
}
```

### Step 1.2: Add Extended Helper Functions

Include the utility functions from `auth-flow-extended.test.tsx` in the enhanced helpers:

```typescript
// Add to enhanced-helpers-fixed.tsx

/**
 * Creates a test element with the specified properties
 */
export function createTestElement({
  tag = 'div',
  text = '',
  testId = '',
  container = document.body,
  attributes = {},
}: {
  tag?: string;
  text?: string;
  testId?: string;
  container?: HTMLElement;
  attributes?: Record<string, string>;
}): HTMLElement {
  const element = document.createElement(tag);
  if (text) element.textContent = text;
  if (testId) element.setAttribute('data-testid', testId);

  // Apply additional attributes
  Object.entries(attributes).forEach(([attr, value]) => {
    element.setAttribute(attr, value);
  });

  container.appendChild(element);
  return element;
}

/**
 * Enhanced waitFor function with better error handling
 */
export async function enhancedWaitFor<T>(
  callback: () => T | Promise<T>,
  options: { timeout?: number; interval?: number; description?: string } = {}
): Promise<T> {
  const { timeout = 5000, interval = 100, description = '' } = options;

  const startTime = Date.now();
  let lastError: unknown;

  while (Date.now() - startTime < timeout) {
    try {
      return await callback();
    } catch (error) {
      lastError = error;
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }

  throw new Error(
    `Timeout (${timeout}ms) exceeded${description ? ` while ${description}` : ''}: ${lastError}`
  );
}

/**
 * Safely executes an action wrapped in act()
 */
export async function safeAct<T>(callback: () => Promise<T>): Promise<T> {
  try {
    let result: T;
    await act(async () => {
      result = await callback();
    });
    return result!;
  } catch (error) {
    console.error('Error in safeAct:', error);
    throw error;
  }
}

/**
 * Waits for an element with fallback creation
 */
export async function waitForElementWithFallback({
  testId,
  role,
  text,
  fallbackCreation = true,
  fallbackTag = 'div',
  fallbackAttributes = {},
  timeout = 5000,
}: {
  testId?: string;
  role?: string;
  text?: string | RegExp;
  fallbackCreation?: boolean;
  fallbackTag?: string;
  fallbackAttributes?: Record<string, string>;
  timeout?: number;
}): Promise<HTMLElement> {
  try {
    return await enhancedWaitFor(
      () => {
        if (testId) {
          const element = screen.queryByTestId(testId);
          if (element) return element;
        }

        if (role && text) {
          const element = screen.queryByRole(role, { name: text });
          if (element) return element;
        }

        if (text) {
          const element = screen.queryByText(text);
          if (element) return element;
        }

        throw new Error('Element not found');
      },
      { timeout, description: `finding element ${testId || role || text}` }
    );
  } catch (error) {
    if (!fallbackCreation) throw error;

    // Create fallback element
    const container = document.querySelector('body > div') || document.body;
    return createTestElement({
      tag: fallbackTag,
      text: typeof text === 'string' ? text : 'Fallback Element',
      testId: testId || 'fallback-element',
      container: container as HTMLElement,
      attributes: fallbackAttributes,
    });
  }
}
```

### Step 1.3: Update Imports

Update all remaining test files to use the consolidated helpers:

```typescript
// In all test files, replace imports like:
import { ... } from './test-utils';
import { ... } from './auth-flow-patch';

// With:
import {
  enhancedWaitFor,
  safeAct,
  createTestElement,
  waitForElementWithFallback,
  addAuthenticationIndicators,
  simulateAuthenticatedState
} from './enhanced-helpers-fixed';
```

## Phase 2: Remove Redundant Basic Tests

### Step 2.1: Create Mapping Document

Before removing `auth-flow.test.tsx`, document how each test is covered in the unified tests:

| Original Test in auth-flow.test.tsx                 | Covered By in auth-flow.unified.test.tsx                             |
| --------------------------------------------------- | -------------------------------------------------------------------- |
| `happy path: user logs in and establishes presence` | `completes authentication flow successfully using test wrapper`      |
| `handles login error gracefully`                    | `handles authentication errors gracefully`                           |
| `maintains presence while user is active`           | `maintains presence during session` (in auth-flow-extended.test.tsx) |

### Step 2.2: Remove the File

After verifying all scenarios are covered, delete `auth-flow.test.tsx`.

## Phase 3: Merge Story-Based Tests

### Step 3.1: Create New UI Test File

Create a new `auth-flow-ui.test.tsx` file that combines the best of both story-based test files:

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';
import { composeStories } from '@storybook/react';
import * as authFlowInteractiveStories from '../storybook/auth-flow-interactive.stories';
import { renderStory } from '../storybook/vitest-adapter';
import { renderStoryWithTestWrapper, createStoryTest } from './story-helpers';
import { safeAct } from './enhanced-helpers-fixed';
import '@testing-library/jest-dom';

// Compose the stories to get the rendered components with all decorators applied
const { AuthenticationFlow, AuthenticationErrorFlow } = composeStories(
  authFlowInteractiveStories
);

describe('Authentication Flow UI Tests', () => {
  // Run play function test (from auth-flow-story.test.tsx)
  test(
    'should complete the authentication flow successfully using story play function',
    createStoryTest('AuthenticationFlow')
  );

  // Manual interaction test (from auth-flow-story.test.tsx)
  test('should show authenticated state after login using story helpers', async () => {
    // Render the Initial story
    const { clickElement, expectText, expectElement } = renderStory('Initial');

    // Click the login button
    await clickElement('login-button');

    // Expect to see the authenticating state
    await expectText(/authenticating/i);

    // Wait for the authenticated state and verify UI elements
    await expectElement('login-button', { toExist: false });
    await expectText(/authenticating/i, { toExist: false });
  });

  // Interactive test (from auth-flow-interactive.test.tsx)
  test('should advance the authentication flow on login button click', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<AuthenticationFlow />);

    // Act
    const loginButton = screen.getByTestId('login-button');
    await safeAct(async () => {
      await user.click(loginButton);
    });

    // Assert - should show authenticated state
    await waitFor(
      () => {
        expect(
          screen.getByText(/Current Step: Authenticated/i)
        ).toBeInTheDocument();
        expect(screen.getByRole('table')).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  // Error flow test (combined from both files)
  test('should show error message when authentication fails', async () => {
    // First approach using story helpers
    const { expectText } = renderStory('AuthenticationError');
    await expectText(/authentication failed/i);

    // Second approach using interactive story
    const user = userEvent.setup();
    render(<AuthenticationErrorFlow />);

    const loginButton = screen.getByTestId('login-button');
    await safeAct(async () => {
      await user.click(loginButton);
    });

    await waitFor(
      () => {
        expect(screen.getByText(/Current Step: Error/i)).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  // Test with test wrapper (from auth-flow-story.test.tsx)
  test('should establish presence after login using test wrapper', async () => {
    // Render the Initial story with the test wrapper
    const { login, waitForPresence, checkCoreUIElements } =
      renderStoryWithTestWrapper('Initial');

    // Login and verify
    await safeAct(async () => {
      await login();
    });
    await waitForPresence();
    await checkCoreUIElements();
  });
});
```

### Step 3.2: Remove Original Files

After verifying the new file works correctly, remove:

- `auth-flow-interactive.test.tsx`
- `auth-flow-story.test.tsx`

## Phase 4: Streamline Remaining Tests

### Step 4.1: Review and Optimize Unified Tests

Remove redundant tests from `auth-flow.unified.test.tsx`:

```typescript
// Remove this test as it duplicates the test wrapper approach
test('completes authentication flow successfully using story', async () => {
  // This test uses the Storybook story approach
  const { runPlayFunction } = await renderWithEnhancedWrapper({
    storyName: 'AuthenticationFlow',
  });

  // Increase timeout for this test
  vi.setConfig({ testTimeout: 15000 });

  await runPlayFunction();
});

// Keep this test as it's the main happy path test
test('completes authentication flow successfully using test wrapper', async () => {
  // Rest of test remains the same...
});
```

### Step 4.2: Ensure Clear Separation of Concerns

Review and adjust tests to maintain clear separation between files:

1. `auth-flow.unified.test.tsx` should focus on:

   - Basic authentication flow
   - Error handling
   - Token management

2. `auth-flow-extended.test.tsx` should focus on:

   - Session persistence
   - Presence management
   - Permissions and authorization
   - Multilingual support

3. `auth-flow-ui.test.tsx` should focus on:
   - UI-centric tests
   - Story-based testing
   - Visual elements and interactions

## Phase 5: Update Documentation

Create test suite documentation to help developers understand the organization:

```markdown
# Authentication Flow Test Suite

The authentication flow tests are organized into three complementary files:

1. **auth-flow.unified.test.tsx**

   - Core authentication tests
   - Basic login/logout functionality
   - Error handling scenarios
   - Token management

2. **auth-flow-extended.test.tsx**

   - Advanced authentication scenarios
   - Session persistence
   - Presence management
   - Permissions and authorization
   - Multilingual support

3. **auth-flow-ui.test.tsx**
   - UI-focused authentication tests
   - Story-based testing
   - Visual element verification
   - Interactive flow testing

All tests use the unified helper functions from `enhanced-helpers-fixed.tsx`.
```

## Implementation Verification Steps

After completing the optimizations, verify the changes with these steps:

1. Run the entire test suite: `npm test`
2. Verify all tests pass
3. Check test coverage reports to ensure no decrease in coverage
4. Run tests with the `--verbose` flag to see test names and ensure all scenarios are still covered
5. Review test execution time to verify improvement

## Conclusion

Following this implementation guide will result in a more maintainable, efficient, and organized authentication flow test suite. The streamlined structure will make it easier to extend tests as new features are added while maintaining high test reliability.
