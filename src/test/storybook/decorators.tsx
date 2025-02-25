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
  // Add users to presence
  Object.entries(presenceFixtures.multipleUsers).forEach(
    ([userId, userData]) => {
      const userRef = testWrapper.mockFirebase.api.getDatabaseRef(
        `sheets/test-sheet-id/presence/${userId}`
      );
      testWrapper.mockFirebase.api.set(userRef, userData);
    }
  );

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
  Object.entries(presenceFixtures.multipleUsers).forEach(
    ([userId, userData]) => {
      const userRef = testWrapper.mockFirebase.api.getDatabaseRef(
        `sheets/test-sheet-id/presence/${userId}`
      );
      testWrapper.mockFirebase.api.set(userRef, userData);
    }
  );

  return (
    <testWrapper.Wrapper>
      <Story />
    </testWrapper.Wrapper>
  );
};
