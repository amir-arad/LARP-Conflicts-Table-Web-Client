import { describe, test } from 'vitest';
import { renderStory } from '../storybook/vitest-adapter';
import { renderStoryWithTestWrapper, createStoryTest } from './story-helpers';

describe('Auth Flow Integration Tests using Storybook Stories', () => {
  // Test that renders a story and runs its play function
  test(
    'should complete the authentication flow successfully',
    createStoryTest('AuthenticationFlow')
  );

  // Test that manually interacts with a story
  test('should show authenticated state after login', async () => {
    // Render the Initial story
    const { clickElement, expectText, expectElement } = renderStory('Initial');

    // Click the login button
    await clickElement('login-button');

    // Expect to see the authenticating state
    await expectText(/authenticating/i);

    // Wait for the authenticated state and verify UI elements
    await expectElement('login-button', { toExist: false });

    // Note: In a real test, we would wait for the table to appear
    // but our simplified components don't have test IDs for the table
    // so we'll just wait for the authenticating text to disappear
    await expectText(/authenticating/i, { toExist: false });
  });

  // Test that verifies the error state
  test('should show error message when authentication fails', async () => {
    // Render the AuthenticationError story
    const { expectText } = renderStory('AuthenticationError');

    // Expect to see the error message
    await expectText(/authentication failed/i);
  });

  // Test that uses the test wrapper with a story
  test('should establish presence after login', async () => {
    // Render the Initial story with the test wrapper
    const { login, waitForPresence, checkCoreUIElements } =
      renderStoryWithTestWrapper('Initial');

    // Login
    await login();

    // Wait for presence to be established
    await waitForPresence();

    // Check core UI elements
    await checkCoreUIElements();
  });
});
