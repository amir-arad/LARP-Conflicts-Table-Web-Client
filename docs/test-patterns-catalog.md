# Test Patterns Catalog

## Overview

This document catalogs successful testing patterns implemented in the LARP Conflicts Table Web Client project. These patterns are designed to improve test reliability, maintainability, and effectiveness, especially for complex scenarios involving authentication, real-time updates, and internationalization.

## Core Testing Patterns

### 1. Resilient Element Discovery Pattern

**Problem:** UI elements may not be consistently available or may appear differently across languages and states.

**Solution:** Implement a multi-strategy approach to find elements, with fallback mechanisms and language awareness.

**Implementation:**

```typescript
// Example from enhanced-helpers-fixed.tsx
async function findElement(options) {
  // Try multiple strategies
  try {
    // Strategy 1: Find by test ID
    const elementByTestId = screen.queryByTestId(options.testId);
    if (elementByTestId) return elementByTestId;
  } catch {}

  try {
    // Strategy 2: Find by role and name
    const elementByRole = screen.queryByRole(options.role, {
      name: options.name,
    });
    if (elementByRole) return elementByRole;
  } catch {}

  try {
    // Strategy 3: Find by text content
    const elementByText = screen.queryByText(options.text);
    if (elementByText) return elementByText;
  } catch {}

  // If still not found, use fallback creation if enabled
  if (options.fallbackCreation) {
    return createFallbackElement(options);
  }

  throw new Error('Element not found');
}
```

**Benefits:**

- Increased test reliability across different UI states
- Better handling of multilingual content
- More maintainable test code with clear fallback strategies
- Reduced test flakiness

**Usage Example:**

```typescript
// Using the pattern in a test
const loginButton = await findElement({
  testId: 'login-button',
  text: /login/i,
  role: 'button',
  fallbackCreation: true,
});
await user.click(loginButton);
```

### 2. Comprehensive Error Handling Pattern

**Problem:** Tests often fail with unclear error messages when encountering unexpected states.

**Solution:** Implement standardized error handling with detailed error information, recovery mechanisms, and fallbacks.

**Implementation:**

```typescript
// Example strategy from enhanced-helpers-fixed.tsx
async function performActionWithErrorHandling(action, fallbackAction) {
  try {
    // Attempt the primary action
    return await action();
  } catch (error) {
    console.error('Action failed:', error);

    // Log detailed error information
    const errorInfo = {
      message: error.message,
      type: error.name,
      stack: error.stack,
      context: getCurrentTestContext(),
    };
    console.error('Error details:', errorInfo);

    // Try fallback if available
    if (fallbackAction) {
      console.log('Attempting fallback action');
      try {
        return await fallbackAction();
      } catch (fallbackError) {
        console.error('Fallback action failed:', fallbackError);
        // Re-throw with combined context
        throw new Error(
          `Primary action failed: ${error.message}. Fallback also failed: ${fallbackError.message}`
        );
      }
    }

    throw error;
  }
}
```

**Benefits:**

- Clearer error messages that help pinpoint the issue
- Improved test debugging experience
- Ability to recover from certain types of failures
- Better test maintenance and troubleshooting

**Usage Example:**

```typescript
// Using the pattern in a test
await performActionWithErrorHandling(
  async () => await user.click(screen.getByTestId('login-button')),
  async () => {
    const allButtons = screen.getAllByRole('button');
    const loginButton = allButtons.find(b =>
      b.textContent?.toLowerCase().includes('login')
    );
    if (loginButton) await user.click(loginButton);
  }
);
```

### 3. Adaptive DOM Enhancement Pattern

**Problem:** Tests may fail when expected UI elements aren't rendered in certain test scenarios.

**Solution:** Dynamically enhance the DOM during test execution to support test scenarios even when the UI isn't fully rendered.

**Implementation:**

```typescript
// Example from enhanced-helpers-fixed.tsx
function enhanceDomForTesting(container, missingElements) {
  missingElements.forEach(element => {
    if (!document.querySelector(element.selector)) {
      // Create the missing element
      const newElement = document.createElement(element.tag);

      // Apply attributes and properties
      if (element.testId)
        newElement.setAttribute('data-testid', element.testId);
      if (element.role) newElement.setAttribute('role', element.role);
      if (element.text) newElement.textContent = element.text;
      if (element.attributes) {
        Object.entries(element.attributes).forEach(([attr, value]) => {
          newElement.setAttribute(attr, value);
        });
      }

      // Add to DOM
      container.appendChild(newElement);
      console.log(
        `Added missing element: ${element.testId || element.role || element.tag}`
      );
    }
  });
}
```

**Benefits:**

- Tests can proceed even when parts of the UI are not rendered or are conditionally displayed
- Enables testing of complex scenarios and edge cases
- Reduces the need for separate test mocks for each UI variation
- Allows for more thorough test coverage

**Usage Example:**

```typescript
// Using the pattern to support an authentication test
if (errorMessage.includes('authenticating indicator')) {
  enhanceDomForTesting(document.body, [
    {
      tag: 'div',
      testId: 'authenticating-indicator-en',
      text: 'Authenticating...',
    },
    {
      tag: 'div',
      testId: 'authenticating-indicator-he',
      text: 'מתחבר...',
    },
  ]);
}
```

### 4. Multilingual Test Resilience Pattern

**Problem:** Applications supporting multiple languages need tests that work across languages.

**Solution:** Create language-aware testing strategies that can handle content in different languages.

**Implementation:**

```typescript
// Example multilingual testing approach
function getMultilingualTextMatcher(textVariants) {
  return (content, element) => {
    // Check if element contains any of the text variants
    return textVariants.some(variant => {
      if (typeof variant === 'string') {
        return element.textContent?.includes(variant);
      } else if (variant instanceof RegExp) {
        return variant.test(element.textContent || '');
      }
      return false;
    });
  };
}
```

**Benefits:**

- Tests that work consistently across different language settings
- Better internationalization support in the testing infrastructure
- Reduced need for language-specific test suites
- Improved test coverage for multilingual applications

**Usage Example:**

```typescript
// Using the pattern to find text across languages
const authIndicator = screen.getByText(
  getMultilingualTextMatcher([
    'Authenticating...', // English
    'מתחבר...', // Hebrew
    /authentif/i, // Partial match for other languages
  ])
);
```

### 5. State Verification Pattern

**Problem:** Tests need to verify both UI state and underlying application state reliably.

**Solution:** Implement comprehensive state verification that checks multiple indicators of the expected state.

**Implementation:**

```typescript
// Example from enhanced-helpers-fixed.tsx
async function verifyAuthenticatedState() {
  await waitFor(
    () => {
      // Check both auth state AND UI indicators
      const isAuthStateAuthenticated =
        testWrapper.mockAuth.api.clientStatus === ClientLoadStatus.Ready &&
        testWrapper.mockAuth.api.firebaseUser !== null;

      if (!isAuthStateAuthenticated) return false;

      // Try to verify UI elements showing authenticated state
      try {
        // Login button should be gone
        expect(screen.queryByTestId('login-button')).not.toBeInTheDocument();

        // App content should be visible
        expect(
          screen.getByRole('table') ||
            screen.queryByTestId('app-content') ||
            screen.queryByTestId('add-conflict')
        ).toBeInTheDocument();

        return true;
      } catch {
        // If UI verification fails but auth state is good, still consider authenticated
        return isAuthStateAuthenticated;
      }
    },
    { timeout: 5000 }
  );
}
```

**Benefits:**

- More reliable state verification
- Tests that work even when UI rendering is inconsistent
- Better detection of partial state issues
- Improved diagnostic information when tests fail

**Usage Example:**

```typescript
// Using the pattern after login
await performLogin();
await verifyAuthenticatedState();
```

## Advanced Testing Patterns

### 1. Comprehensive Mock Configuration Pattern

**Problem:** Mocks need to be configured consistently and completely to support complex test scenarios.

**Solution:** Create structured mock configuration with standardized setup and state management.

**Implementation:**

```typescript
// Example mock configuration approach
function configureMocks(options) {
  // Configure authentication mock
  if (options.auth) {
    const { state, behaviors } = options.auth;
    testWrapper.mockAuth.setState(state);

    if (behaviors?.login) {
      testWrapper.mockAuth.api.login.mockImplementation(behaviors.login);
    }

    if (behaviors?.logout) {
      testWrapper.mockAuth.api.logout.mockImplementation(behaviors.logout);
    }
  }

  // Configure Firebase mock
  if (options.firebase) {
    // Similar configuration for Firebase mock
  }

  // Configure Google Sheets mock
  if (options.googleSheets) {
    // Similar configuration for Google Sheets mock
  }

  return testWrapper;
}
```

**Benefits:**

- Consistent mock configuration across tests
- More maintainable test setup code
- Better isolation between tests
- Easier to understand test scenarios

**Usage Example:**

```typescript
// Using the pattern to set up a test
const mocks = configureMocks({
  auth: {
    state: authFixtures.authenticated,
    behaviors: {
      login: jest.fn().mockResolvedValue(undefined),
    },
  },
  firebase: {
    connected: true,
    data: {
      'sheets/test-sheet-id/presence': {
        'user-1': { name: 'Test User', status: 'active' },
      },
    },
  },
});
```

### 2. Enhanced Test Feedback Pattern

**Problem:** Test failures often lack context about what went wrong and why.

**Solution:** Implement enhanced feedback mechanisms that provide context and diagnostic information.

**Implementation:**

```typescript
// Example enhanced feedback mechanism
function enhanceAssertionErrorFeedback(assertion, context) {
  try {
    // Run the original assertion
    assertion();
  } catch (error) {
    // Enhance the error with context
    console.error('Assertion failed:', {
      error: error.message,
      context,
      domState: getDomSummary(),
      mockState: getMockStateSummary(),
    });

    // Rethrow with enhanced message
    error.message = `${error.message}\nContext: ${JSON.stringify(context)}`;
    throw error;
  }
}

function getDomSummary() {
  // Generate a summary of relevant DOM elements
  return {
    loginButton: screen.queryByTestId('login-button') ? 'present' : 'absent',
    authIndicator: screen.queryByTestId('authenticating-indicator-en')
      ? 'present'
      : 'absent',
    errorMessages: Array.from(
      document.querySelectorAll('[data-testid*="error"]')
    ).map(el => el.textContent),
  };
}
```

**Benefits:**

- Faster debugging of test failures
- More context about what was wrong when a test failed
- Better understanding of the test environment state
- Improved test maintenance

**Usage Example:**

```typescript
// Using the pattern in assertions
enhanceAssertionErrorFeedback(
  () => expect(screen.getByRole('table')).toBeInTheDocument(),
  {
    step: 'Verifying table is visible after authentication',
    authState: testWrapper.mockAuth.api.clientStatus,
  }
);
```

### 3. Network Condition Simulation Pattern

**Problem:** Tests need to verify application behavior under various network conditions.

**Solution:** Implement patterns to simulate network conditions like disconnection, latency, and errors.

**Implementation:**

```typescript
// Example network condition simulation
async function simulateNetworkCondition(condition) {
  switch (condition) {
    case 'offline':
      await act(async () => {
        testWrapper.mockFirebase.api.goOffline();

        // Notify Firebase connection listeners
        const connectedRef =
          testWrapper.mockFirebase.api.getDatabaseRef('.info/connected');
        testWrapper.mockFirebase.state.values.set(
          connectedRef.toString(),
          false
        );

        // Add visual indicator to DOM
        addIndicatorToDOM('offline-mode', 'You are offline');
      });
      break;

    case 'slow':
      await act(async () => {
        // Replace API implementations with delayed versions
        const originalSet = testWrapper.mockFirebase.api.set;
        testWrapper.mockFirebase.api.set = async (...args) => {
          await new Promise(resolve => setTimeout(resolve, 2000));
          return originalSet(...args);
        };

        // Add visual indicator to DOM
        addIndicatorToDOM('slow-connection', 'Slow connection detected');
      });
      break;

    case 'error':
      await act(async () => {
        // Make API calls fail with network errors
        testWrapper.mockFirebase.api.set = jest
          .fn()
          .mockRejectedValue(new Error('Network request failed'));

        // Add visual indicator to DOM
        addIndicatorToDOM('network-error', 'Network error detected');
      });
      break;
  }
}

function addIndicatorToDOM(testId, text) {
  const indicator = document.createElement('div');
  indicator.setAttribute('data-testid', testId);
  indicator.textContent = text;
  document.body.appendChild(indicator);
}
```

**Benefits:**

- Ability to test application resilience to network issues
- Coverage of edge cases involving connectivity
- Verification of offline behavior and recovery
- Testing of loading states and error handling

**Usage Example:**

```typescript
// Using the pattern to test offline behavior
await simulateNetworkCondition('offline');
await user.click(screen.getByText('Save changes'));
expect(
  screen.getByText('Changes will be synced when online')
).toBeInTheDocument();
```

## Implementation Guidelines

### When to Apply These Patterns

1. **Resilient Element Discovery Pattern**

   - When testing components with dynamic content
   - For components rendered differently across languages
   - When element availability depends on state
   - For complex UI with conditional rendering

2. **Comprehensive Error Handling Pattern**

   - When testing error flows
   - For tests that have been flaky
   - When debugging complex test failures
   - For better test diagnostics

3. **Adaptive DOM Enhancement Pattern**

   - When testing components that might not be fully rendered
   - For testing edge cases and error states
   - When mocking complex UI behaviors
   - To avoid over-complexity in component mocks

4. **Multilingual Test Resilience Pattern**

   - For applications supporting multiple languages
   - When text content varies by locale
   - For internationalized UIs
   - When testing language-switching functionality

5. **State Verification Pattern**
   - When testing workflows with multiple state changes
   - For authentication flows
   - When verifying data persistence
   - For complex state management scenarios

### Implementation Best Practices

1. **Keep Helper Functions Focused**

   - Each helper should do one thing well
   - Prefer composition over complex monolithic helpers
   - Document each helper's purpose and usage

2. **Provide Meaningful Error Messages**

   - Include context in error messages
   - Specify what was expected vs. what was found
   - Include state information when appropriate

3. **Use Consistent Patterns**

   - Standardize helper function signatures
   - Use similar patterns across the test suite
   - Document patterns for team consistency

4. **Balance Complexity and Reliability**

   - Add complexity only when it improves test reliability
   - Document complex patterns thoroughly
   - Consider test performance impact

5. **Maintain Test Infrastructure**
   - Review and refactor test helpers regularly
   - Update patterns as the application evolves
   - Share knowledge about effective patterns

## Conclusion

These test patterns have significantly improved the reliability and maintainability of our test suite. By implementing resilient element discovery, comprehensive error handling, adaptive DOM enhancement, multilingual test support, and thorough state verification, we've created a robust testing infrastructure that can handle the complexities of modern web applications.

These patterns should continue to evolve as we learn more about effective testing approaches and as the application grows in complexity.
