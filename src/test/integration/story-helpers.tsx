import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect } from 'vitest';
import { createTestWrapper } from '../test-wrapper';
import { getStory, StoryName } from '../storybook/vitest-adapter';
import type { StoryContext, ReactRenderer } from '@storybook/react';
import { authFixtures } from '../fixtures';
import { User } from 'firebase/auth';

/**
 * Enhanced render function that combines the test wrapper with Storybook stories
 * This allows us to use Storybook stories in integration tests while still having
 * access to the test wrapper's mock APIs
 */
export function renderStoryWithTestWrapper(storyName: StoryName) {
  const testWrapper = createTestWrapper();
  const user = userEvent.setup();

  // Get the story component
  const Story = getStory(storyName);

  // If the story doesn't exist, throw an error
  if (!Story) {
    throw new Error(`Story "${storyName}" not found`);
  }

  // Render the story with the test wrapper
  const result = render(<Story />, { wrapper: testWrapper.Wrapper });

  // Create a canvas element for play function
  const canvasElement = result.container;

  return {
    ...result,
    user,
    testWrapper,
    canvasElement,
    // Helper to run the story's play function if it exists
    async runPlayFunction() {
      if (Story.play) {
        // Create a step function for the play function
        const step = async (name: string, callback: () => Promise<void>) => {
          // Add a comment to the test output
          console.log(`Step: ${name}`);
          await callback();
        };

        // Run the play function with a simplified context
        const context = {
          canvasElement,
          step,
        } as unknown as StoryContext<ReactRenderer>;

        await Story.play(context);
      }
    },
    // Helper to simulate login
    async login(options = { success: true }) {
      if (options.success) {
        testWrapper.mockAuth.setState({
          ...authFixtures.authenticated,
          firebaseUser: authFixtures.authenticated
            .firebaseUser as unknown as User,
        });
      } else {
        testWrapper.mockAuth.setState(authFixtures.error);
      }

      const loginButton = screen.getByTestId('login-button');
      await user.click(loginButton);

      if (options.success) {
        await waitFor(() => {
          expect(screen.queryByText(/authenticating/i)).not.toBeInTheDocument();
        });
      } else {
        await waitFor(() => {
          expect(
            screen.getByText(/authentication failed/i)
          ).toBeInTheDocument();
        });
      }
    },
    // Helper to wait for presence to be established
    async waitForPresence(userName = 'Test User') {
      const usersList = await screen.findByRole('list', {
        name: /active users/i,
      });
      await waitFor(() => {
        expect(usersList).toHaveTextContent(userName);
      });
    },
    // Helper to check if core UI elements are available
    async checkCoreUIElements() {
      expect(
        screen.getByRole('button', { name: /add conflict/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /add role/i })
      ).toBeInTheDocument();
      expect(screen.getByRole('table')).toBeInTheDocument();
    },
    // Helper to wait for an element to appear
    async waitForElement(testId: string) {
      return waitFor(() => {
        const element = screen.getByTestId(testId);
        expect(element).toBeInTheDocument();
        return element;
      });
    },
    // Helper to wait for text to appear
    async waitForText(text: string | RegExp) {
      return waitFor(() => {
        const element = screen.getByText(text);
        expect(element).toBeInTheDocument();
        return element;
      });
    },
    // Helper to click an element by test ID
    async clickElement(testId: string) {
      const element = await this.waitForElement(testId);
      await user.click(element);
      return element;
    },
    // Helper to type text into an element by test ID
    async typeIntoElement(testId: string, text: string) {
      const element = await this.waitForElement(testId);
      await user.type(element, text);
      return element;
    },
    // Helper to check if an element exists
    async expectElement(testId: string, options: { toExist?: boolean } = {}) {
      const { toExist = true } = options;
      if (toExist) {
        await this.waitForElement(testId);
      } else {
        await waitFor(() => {
          expect(screen.queryByTestId(testId)).not.toBeInTheDocument();
        });
      }
    },
    // Helper to check if text exists
    async expectText(
      text: string | RegExp,
      options: { toExist?: boolean } = {}
    ) {
      const { toExist = true } = options;
      if (toExist) {
        await this.waitForText(text);
      } else {
        await waitFor(() => {
          expect(screen.queryByText(text)).not.toBeInTheDocument();
        });
      }
    },
  };
}

/**
 * Helper function to create a test that uses a Storybook story with the test wrapper
 */
export function createStoryTest(storyName: StoryName) {
  return async () => {
    const { runPlayFunction } = renderStoryWithTestWrapper(storyName);
    await runPlayFunction();
  };
}
