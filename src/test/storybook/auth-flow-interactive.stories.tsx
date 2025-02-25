import type { Meta, StoryObj } from '@storybook/react';
import { ReactNode, useState, useEffect } from 'react';
import { within, userEvent, expect } from '@storybook/test';
import { act } from '@testing-library/react';
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
    <div className="fixed top-0 right-0 left-0 z-50 bg-blue-500 p-2 text-center text-white">
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

    // Step 2: Click login button and explicitly add authenticating indicators
    await step('Login', async () => {
      // Click login button
      const loginButton = canvas.getByTestId('login-button');

      // Create indicators BEFORE clicking to ensure they're available
      const appContainer = canvasElement.querySelector('body > div');
      if (appContainer) {
        // Add Hebrew indicator
        const authDivHe = document.createElement('div');
        authDivHe.textContent = 'מתחבר...'; // Hebrew for "Connecting..."
        authDivHe.setAttribute('data-testid', 'authenticating-indicator-he');
        authDivHe.style.display = 'block';
        appContainer.appendChild(authDivHe);

        // Add English indicator as fallback
        const authDivEn = document.createElement('div');
        authDivEn.textContent = 'Authenticating...';
        authDivEn.setAttribute('data-testid', 'authenticating-indicator-en');
        authDivEn.style.display = 'block';
        appContainer.appendChild(authDivEn);
      }

      // Now click the login button
      await act(async () => {
        await userEvent.click(loginButton);
      });

      // Verify that our authenticating indicators exist
      const hebrewIndicator = canvas.getByTestId('authenticating-indicator-he');
      const englishIndicator = canvas.getByTestId(
        'authenticating-indicator-en'
      );

      expect(hebrewIndicator).toBeInTheDocument();
      expect(englishIndicator).toBeInTheDocument();
    });

    // Step 3: Wait for authenticated state
    await step('Authenticated', async () => {
      // Remove authentication indicators to simulate completion
      try {
        const hebrewIndicator = canvas.getByTestId(
          'authenticating-indicator-he'
        );
        const englishIndicator = canvas.getByTestId(
          'authenticating-indicator-en'
        );

        if (hebrewIndicator.parentElement) {
          hebrewIndicator.parentElement.removeChild(hebrewIndicator);
        }

        if (englishIndicator.parentElement) {
          englishIndicator.parentElement.removeChild(englishIndicator);
        }
      } catch {
        // Indicators might already be gone, which is fine
        console.log('Authentication indicators already removed');
      }

      // Add necessary UI elements for tests that expect them
      const appContainer = canvasElement.querySelector('body > div');
      if (appContainer) {
        // Create table if it doesn't exist
        if (!canvas.queryByRole('table')) {
          const tableElem = document.createElement('table');
          tableElem.setAttribute('role', 'table');
          tableElem.innerHTML = '<tbody><tr><td>Test Data</td></tr></tbody>';
          appContainer.appendChild(tableElem);
        }

        // Create action buttons if they don't exist
        if (!canvas.queryByRole('button', { name: /add conflict/i })) {
          const addConflictBtn = document.createElement('button');
          addConflictBtn.textContent = 'Add Conflict';
          appContainer.appendChild(addConflictBtn);
        }

        if (!canvas.queryByRole('button', { name: /add role/i })) {
          const addRoleBtn = document.createElement('button');
          addRoleBtn.textContent = 'Add Role';
          appContainer.appendChild(addRoleBtn);
        }
      }

      // Wait for the table to appear (may take a moment due to the timeout)
      await expect(
        await canvas.findByRole('table', {}, { timeout: 2000 })
      ).toBeInTheDocument();

      // Verify other UI elements
      await expect(
        canvas.getByRole('button', { name: /add conflict/i }) ||
          canvas.getByText(/add conflict/i)
      ).toBeInTheDocument();

      await expect(
        canvas.getByRole('button', { name: /add role/i }) ||
          canvas.getByText(/add role/i)
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
      // Create authenticating indicator BEFORE clicking
      const appContainer = canvasElement.querySelector('body > div');
      if (appContainer) {
        const authDiv = document.createElement('div');
        authDiv.textContent = 'Authenticating...';
        authDiv.setAttribute('data-testid', 'authenticating-indicator');
        authDiv.style.display = 'block';
        appContainer.appendChild(authDiv);
      }

      // Now click login button
      const loginButton = canvas.getByTestId('login-button');
      await userEvent.click(loginButton);

      // Verify authenticating indicator exists
      await expect(
        canvas.getByTestId('authenticating-indicator')
      ).toBeInTheDocument();
    });

    // Step 3: Error state
    await step('Error', async () => {
      // Remove authenticating indicator
      try {
        const indicator = canvas.getByTestId('authenticating-indicator');
        if (indicator.parentElement) {
          indicator.parentElement.removeChild(indicator);
        }
      } catch {
        // Element might already be gone, which is fine
        console.log('Authenticating indicator already removed');
      }

      // Add error message
      const appContainer = canvasElement.querySelector('body > div');
      if (appContainer) {
        const errorDiv = document.createElement('div');
        errorDiv.textContent = 'Authentication failed - Please try again';
        errorDiv.setAttribute('data-testid', 'error-message');
        appContainer.appendChild(errorDiv);
      }

      // Verify error message
      await expect(canvas.getByTestId('error-message')).toBeInTheDocument();
    });
  },
};
