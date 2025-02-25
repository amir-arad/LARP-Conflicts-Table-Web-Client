# Auth Flow Interactive Test Plan

## Automated Test Approach

To better understand and fix the issue with the interactive auth flow story, we can create an automated test that doesn't rely on the browser UI. This will allow us to:

1. Quickly identify exactly where the flow breaks down
2. Verify our fix works correctly
3. Provide a regression test for future changes

## Test Implementation Plan

### 1. Create a New Test File

Create a new test file at `src/test/integration/auth-flow-interactive.test.tsx` that will:

- Import the necessary testing utilities
- Import the interactive story component
- Set up the test environment

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { composeStories } from '@storybook/react';
import * as stories from '../storybook/auth-flow-interactive.stories';

// Compose the stories to get the rendered components with all decorators applied
const { AuthenticationFlow } = composeStories(stories);
```

### 2. Create a Test for the Login Button Click

```tsx
describe('Auth Flow Interactive Story', () => {
  test('login button click should advance the flow', async () => {
    // Arrange
    const user = userEvent.setup();
    const { container } = render(<AuthenticationFlow />);

    // Log initial state for debugging
    console.log('Initial state:', {
      buttonExists: screen.queryByTestId('login-button') !== null,
      authenticatingText: screen.queryByText(/authenticating/i) !== null,
      tableExists: screen.queryByRole('table') !== null,
    });

    // Act
    const loginButton = screen.getByTestId('login-button');

    // Log button properties
    console.log('Login button:', {
      hasOnClickHandler: loginButton.onclick !== null,
      attributes: Array.from(loginButton.attributes).map(
        attr => `${attr.name}=${attr.value}`
      ),
    });

    // Click the button
    await user.click(loginButton);

    // Log state after click
    console.log('After click:', {
      buttonExists: screen.queryByTestId('login-button') !== null,
      authenticatingText: screen.queryByText(/authenticating/i) !== null,
      tableExists: screen.queryByRole('table') !== null,
    });

    // Assert - should show authenticating state
    await waitFor(() => {
      expect(screen.getByText(/authenticating/i)).toBeInTheDocument();
    });

    // Wait for authenticated state
    await waitFor(
      () => {
        expect(screen.queryByText(/authenticating/i)).not.toBeInTheDocument();
        expect(screen.getByRole('table')).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });
});
```

### 3. Create a Test for the Error Flow

```tsx
test('error flow should show error message', async () => {
  // Arrange
  const user = userEvent.setup();
  const { container } = render(<stories.AuthenticationErrorFlow />);

  // Act
  const loginButton = screen.getByTestId('login-button');
  await user.click(loginButton);

  // Assert - should show authenticating state
  await waitFor(() => {
    expect(screen.getByText(/authenticating/i)).toBeInTheDocument();
  });

  // Wait for error state
  await waitFor(
    () => {
      expect(screen.queryByText(/authenticating/i)).not.toBeInTheDocument();
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    },
    { timeout: 2000 }
  );
});
```

### 4. Create a Test with Spy Functions

To better understand what's happening with the login function, we can use spy functions:

```tsx
test('login function should be called when button is clicked', async () => {
  // Arrange
  const user = userEvent.setup();

  // Create a spy for the login function
  const loginSpy = vi.fn();

  // Mock the useAuth hook to return our spy
  vi.mock('../../contexts/AuthContext', () => ({
    useAuth: () => ({
      access_token: null,
      isReady: false,
      error: null,
      login: loginSpy,
    }),
  }));

  // Render the component
  const { container } = render(<AuthenticationFlow />);

  // Act
  const loginButton = screen.getByTestId('login-button');
  await user.click(loginButton);

  // Assert
  expect(loginSpy).toHaveBeenCalled();
});
```

## Expected Results

If our analysis is correct, the test will fail because the login function is not being called when the login button is clicked. The logs will show that the button doesn't have an onClick handler.

After implementing the fix in `simplified-components.tsx`, the test should pass, confirming that:

1. The login button click triggers the login function
2. The auth state transitions from initial to authenticating
3. After a delay, the auth state transitions to authenticated
4. The table is displayed

## Benefits of This Approach

1. **Faster Iteration**: We can quickly test changes without needing to run Storybook
2. **Better Debugging**: The logs provide detailed information about what's happening
3. **Regression Prevention**: The test will catch if the issue reappears in the future
4. **Clearer Understanding**: We'll have a better understanding of the component's behavior

## Next Steps After Testing

1. If the test confirms our analysis, implement the fix in `simplified-components.tsx`
2. Run the test again to verify the fix works
3. Run the story in Storybook to confirm the fix works in the browser UI
4. Document the issue and solution for future reference
