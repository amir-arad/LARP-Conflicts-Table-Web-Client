import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactElement } from 'react';
import { createTestWrapper } from '../test-wrapper';
import { testConfig, authStates } from './config';
import { FirebaseProvider } from '../../contexts/FirebaseContext';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';
import { LanguageProvider } from '../../contexts/LanguageContext';
import { I18nProvider } from '../../i18n/I18nProvider';
import { expect } from 'vitest';
import { User } from 'firebase/auth';
import ConflictsTableTool from '../../components/conflicts-table-tool';
import { useTranslations } from '../../hooks/useTranslations';

// Create a test app component that mimics the structure of the real app
// but uses test configuration
export function TestApp({ children }: { children: ReactElement }) {
  return (
    <FirebaseProvider config={testConfig.firebaseConfig}>
      <AuthProvider clientId={testConfig.clientId}>
        <LanguageProvider>
          <I18nProvider>{children}</I18nProvider>
        </LanguageProvider>
      </AuthProvider>
    </FirebaseProvider>
  );
}

// Simplified App component for testing
export function SimpleApp() {
  const { t } = useTranslations();
  const { access_token, login, isReady } = useAuth();

  if (!access_token) {
    return (
      <button
        onClick={login}
        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        data-testid="login-button"
      >
        {t('action.login')}
      </button>
    );
  }

  if (!isReady) {
    return <div>{t('action.authenticating')}</div>;
  }

  return <ConflictsTableTool sheetId="test-sheet-id" />;
}

// Default test component for auth flow tests
export function DefaultTestComponent() {
  return <SimpleApp />;
}

// Enhanced render function for integration tests
export function renderWithTestWrapper(ui: ReactElement | null) {
  const testWrapper = createTestWrapper();
  const user = userEvent.setup();

  // If no UI is provided, use the default test component
  const componentToRender = ui || <DefaultTestComponent />;

  const result = render(componentToRender, { wrapper: testWrapper.Wrapper });

  return {
    ...result,
    user,
    testWrapper,
    // Helper to simulate login
    async login(options = { success: true }) {
      if (options.success) {
        testWrapper.mockAuth.setState({
          ...authStates.authenticated,
          firebaseUser: authStates.authenticated
            .firebaseUser as unknown as User,
        });
      } else {
        testWrapper.mockAuth.setState(authStates.error);
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
  };
}
