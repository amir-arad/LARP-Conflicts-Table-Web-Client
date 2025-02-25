import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';
import { composeStories } from '@storybook/react';
import * as authFlowInteractiveStories from '../storybook/auth-flow-interactive.stories';
import '@testing-library/jest-dom';

// Compose the stories to get the rendered components with all decorators applied
const { AuthenticationFlow, AuthenticationErrorFlow } = composeStories(
  authFlowInteractiveStories
);

describe('Auth Flow Interactive Story', () => {
  test('login button click should advance the flow', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<AuthenticationFlow />);

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

    // Assert - should show authenticated state directly
    // The component transitions quickly to authenticated state
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

  test('error flow should show error message', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<AuthenticationErrorFlow />);

    // Act
    const loginButton = screen.getByTestId('login-button');
    await user.click(loginButton);

    // Assert - should show error state directly
    // The component transitions quickly to error state
    await waitFor(
      () => {
        expect(screen.getByText(/Current Step: Error/i)).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });
});
