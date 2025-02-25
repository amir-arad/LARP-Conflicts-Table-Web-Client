import { render, screen, waitFor } from '@testing-library/react';
import { composeStories } from '@storybook/react';
import userEvent from '@testing-library/user-event';
import { expect } from 'vitest';
import * as authFlowStories from './auth-flow.stories';
import * as authFlowInteractiveStories from './auth-flow-interactive.stories';
import type { StoryContext, ReactRenderer } from '@storybook/react';

// Compose the stories to get the rendered components with all decorators applied
const composedAuthFlowStories = composeStories(authFlowStories);
const composedAuthFlowInteractiveStories = composeStories(
  authFlowInteractiveStories
);

// Combine all stories
const allComposedStories = {
  ...composedAuthFlowStories,
  ...composedAuthFlowInteractiveStories,
};

// Type for all story names
export type StoryName = keyof typeof allComposedStories;

/**
 * Enhanced render function for stories in tests
 * Provides access to the story context, user events, and play function
 */
export function renderStory(storyName: StoryName) {
  const Story = allComposedStories[storyName];
  const user = userEvent.setup();

  // Render the story
  const result = render(Story());

  // Create a canvas element for play function
  const canvasElement = result.container;

  return {
    ...result,
    user,
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
 * Helper function to create a test that runs a story's play function
 */
export function createStoryTest(storyName: StoryName) {
  return async () => {
    const { runPlayFunction } = renderStory(storyName);
    await runPlayFunction();
  };
}

// Export all composed stories
export const stories = {
  authFlow: composedAuthFlowStories,
  authFlowInteractive: composedAuthFlowInteractiveStories,
};

// Export a function to get a story
export function getStory(storyName: StoryName) {
  return allComposedStories[storyName];
}

// Export a function to get all stories
export function getAllStories() {
  return allComposedStories;
}
