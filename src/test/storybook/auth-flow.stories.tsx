import type { Meta, StoryObj } from '@storybook/react';
import { ReactNode } from 'react';
import { authFixtures } from '../fixtures';
import { FirebaseProvider, FirebaseAPI } from '../../contexts/FirebaseContext';
import {
  AuthProvider,
  ClientLoadStatus,
  AuthState,
} from '../../contexts/AuthContext';
import { LanguageProvider } from '../../contexts/LanguageContext';
import { I18nProvider } from '../../i18n/I18nProvider';
import {
  GoogleSheetsProvider,
  GoogleSheetsAPI,
} from '../../contexts/GoogleSheetsContext';
import { SimplifiedApp } from './simplified-components';

// Simplified wrapper for Storybook
const StoryWrapper = ({
  children,
  authState = authFixtures.initial,
}: {
  children: ReactNode;
  authState?: Partial<AuthState>;
}) => {
  // Mock API objects for Storybook - using type assertions to bypass strict typing
  const mockFirebaseApi = {
    getDatabaseRef: () => ({}),
    onValue: () => () => {},
    set: () => {},
    goOnline: () => {},
    goOffline: () => {},
    setupDisconnectCleanup: () => {},
  } as unknown as FirebaseAPI;

  // Create a mock auth API with the isReady property
  const mockAuthApi = {
    clientStatus: ClientLoadStatus.Loading,
    errorStatus: ClientLoadStatus.Loading,
    access_token: null,
    firebaseUser: null,
    error: null,
    login: () => {},
    ...authState,
    // Add the isReady property directly to the mock
    isReady: authState.clientStatus === ClientLoadStatus.Ready,
  } as AuthState & { isReady: boolean };

  const mockSheetsApi = {
    load: async () => ({ result: { values: [] } }),
    update: async () => ({
      result: { updatedCells: 0, updatedRange: '', updatedRows: 0 },
    }),
    clear: async () => ({ result: { clearedRange: '' } }),
    error: null,
    isLoading: false,
  } as unknown as GoogleSheetsAPI;

  return (
    <FirebaseProvider.Inject value={mockFirebaseApi}>
      <AuthProvider.Inject value={mockAuthApi}>
        <GoogleSheetsProvider.Inject value={mockSheetsApi}>
          <LanguageProvider>
            <I18nProvider>{children}</I18nProvider>
          </LanguageProvider>
        </GoogleSheetsProvider.Inject>
      </AuthProvider.Inject>
    </FirebaseProvider.Inject>
  );
};

const meta = {
  title: 'Integration Tests/Auth Flow',
  component: SimplifiedApp,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof SimplifiedApp>;

export default meta;
type Story = StoryObj<typeof meta>;

// Initial state (not logged in)
export const Initial: Story = {
  decorators: [
    Story => (
      <StoryWrapper authState={authFixtures.initial}>
        <Story />
      </StoryWrapper>
    ),
  ],
};

// Authenticating state
export const Authenticating: Story = {
  decorators: [
    Story => (
      <StoryWrapper authState={authFixtures.authenticating}>
        <Story />
      </StoryWrapper>
    ),
  ],
};

// Authenticated state
export const Authenticated: Story = {
  decorators: [
    Story => (
      <StoryWrapper authState={authFixtures.authenticated}>
        <Story />
      </StoryWrapper>
    ),
  ],
};

// Error state
export const AuthenticationError: Story = {
  decorators: [
    Story => (
      <StoryWrapper authState={authFixtures.error}>
        <Story />
      </StoryWrapper>
    ),
  ],
};
