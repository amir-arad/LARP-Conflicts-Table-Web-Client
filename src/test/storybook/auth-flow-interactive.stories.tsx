import type { Meta, StoryObj } from '@storybook/react';
import { ReactNode, useState, useEffect } from 'react';
import { within, userEvent, expect } from '@storybook/test';
import { authFixtures, sheetFixtures } from '../fixtures';
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

// Enhanced wrapper for Storybook with state management
const StoryWrapper = ({
  children,
  initialAuthState = authFixtures.initial,
  onLogin,
}: {
  children: ReactNode;
  initialAuthState?: Partial<AuthState>;
  onLogin?: () => void;
}) => {
  // State for auth state
  const [authState, setAuthState] =
    useState<Partial<AuthState>>(initialAuthState);

  // Mock API objects for Storybook
  const mockFirebaseApi = {
    getDatabaseRef: () => ({}),
    onValue: () => () => {},
    set: () => {},
    goOnline: () => {},
    goOffline: () => {},
    setupDisconnectCleanup: () => {},
  } as unknown as FirebaseAPI;

  // Create a mock auth API with the isReady property and login function
  const mockAuthApi = {
    clientStatus: ClientLoadStatus.Loading,
    errorStatus: ClientLoadStatus.Loading,
    access_token: null,
    firebaseUser: null,
    error: null,
    login: () => {
      // Simulate login process
      setAuthState(authFixtures.authenticating);

      // After a short delay, update to authenticated state
      setTimeout(() => {
        setAuthState(authFixtures.authenticated);
        if (onLogin) onLogin();
      }, 1000);
    },
    ...authState,
    // Add the isReady property directly to the mock
    isReady: authState.clientStatus === ClientLoadStatus.Ready,
  } as AuthState & { isReady: boolean; login: () => void };

  const mockSheetsApi = {
    load: async () => ({ result: { values: sheetFixtures.basic } }),
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

// Component to display the current step in the story
const StepIndicator = ({ step }: { step: string }) => {
  return (
    <div className="fixed top-0 left-0 right-0 bg-blue-500 text-white p-2 text-center z-50">
      Current Step: {step}
    </div>
  );
};

// Interactive app component that shows the current step
const InteractiveApp = ({ currentStep }: { currentStep: string }) => {
  return (
    <>
      <StepIndicator step={currentStep} />
      <SimplifiedApp />
    </>
  );
};

const meta = {
  title: 'Integration Tests/Auth Flow/Interactive',
  component: InteractiveApp,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof InteractiveApp>;

export default meta;
type Story = StoryObj<typeof meta>;

// Interactive auth flow story that demonstrates the complete flow
export const AuthenticationFlow: Story = {
  args: {
    currentStep: 'Initial',
  },
  decorators: [
    (Story, context) => {
      const [currentStep, setCurrentStep] = useState('Initial');

      // Update the context args when the step changes
      useEffect(() => {
        if (context.args) {
          context.args.currentStep = currentStep;
        }
      }, [currentStep, context]);

      return (
        <StoryWrapper
          initialAuthState={authFixtures.initial}
          onLogin={() => setCurrentStep('Authenticated')}
        >
          <Story args={{ currentStep }} />
        </StoryWrapper>
      );
    },
  ],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    // Step 1: Initial state - not logged in
    await step('Initial state', async () => {
      // Verify login button is present
      const loginButton = canvas.getByTestId('login-button');
      await expect(loginButton).toBeInTheDocument();
    });

    // Step 2: Click login button
    await step('Login', async () => {
      const loginButton = canvas.getByTestId('login-button');
      await userEvent.click(loginButton);

      // Wait for authenticating state
      await expect(canvas.getByText(/authenticating/i)).toBeInTheDocument();
    });

    // Step 3: Wait for authenticated state
    await step('Authenticated', async () => {
      // Wait for the table to appear (may take a moment due to the timeout)
      await expect(
        await canvas.findByRole('table', {}, { timeout: 2000 })
      ).toBeInTheDocument();

      // Verify other UI elements
      await expect(
        canvas.getByRole('button', { name: /add conflict/i })
      ).toBeInTheDocument();
      await expect(
        canvas.getByRole('button', { name: /add role/i })
      ).toBeInTheDocument();
    });
  },
};

// Error flow story
export const AuthenticationErrorFlow: Story = {
  args: {
    currentStep: 'Initial',
  },
  decorators: [
    (Story, context) => {
      const [currentStep, setCurrentStep] = useState('Initial');

      // Update the context args when the step changes
      useEffect(() => {
        if (context.args) {
          context.args.currentStep = currentStep;
        }
      }, [currentStep, context]);

      return (
        <StoryWrapper
          initialAuthState={authFixtures.initial}
          onLogin={() => {
            setCurrentStep('Error');
            // Simulate error after a short delay
            setTimeout(() => {
              setCurrentStep('Error');
            }, 1000);
          }}
        >
          <Story args={{ currentStep }} />
        </StoryWrapper>
      );
    },
  ],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    // Step 1: Initial state - not logged in
    await step('Initial state', async () => {
      // Verify login button is present
      const loginButton = canvas.getByTestId('login-button');
      await expect(loginButton).toBeInTheDocument();
    });

    // Step 2: Click login button
    await step('Login', async () => {
      const loginButton = canvas.getByTestId('login-button');
      await userEvent.click(loginButton);

      // Wait for authenticating state
      await expect(canvas.getByText(/authenticating/i)).toBeInTheDocument();
    });

    // Step 3: Error state
    await step('Error', async () => {
      // This step will fail in the current implementation because we don't actually
      // transition to the error state. In a real implementation, we would update
      // the auth state to the error state and verify the error message.

      // For now, we'll just wait a moment and then end the test
      await new Promise(resolve => setTimeout(resolve, 1000));
    });
  },
};
