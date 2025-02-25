import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslations } from '../../hooks/useTranslations';

/**
 * A simplified version of the ConflictsTableTool component for Storybook
 * This avoids the complex hooks and API calls of the real component
 */
export const SimplifiedConflictsTableTool: React.FC<{ sheetId: string }> = ({
  sheetId,
}) => {
  const { t } = useTranslations();

  return (
    <div className="max-w-full overflow-x-auto p-4">
      <div className="rounded-lg bg-white p-6 shadow-md">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h1 className="text-xl font-bold">
            {t('app.title') || 'LARP Conflicts Table'}
          </h1>
          <div className="flex items-center gap-2">
            <span className="flex inline-block h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white">
              U1
            </span>
            <span className="flex inline-block h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white">
              U2
            </span>
          </div>
          <a
            href={`https://docs.google.com/spreadsheets/d/${sheetId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded bg-purple-500 px-4 py-2 whitespace-nowrap text-white hover:bg-purple-600"
          >
            Open in Sheets
          </a>
        </div>

        <div className="mb-4 flex gap-4">
          <button className="flex items-center gap-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
            Add Conflict
          </button>
          <button className="flex items-center gap-2 rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600">
            Add Role
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 bg-gray-100 p-2">
                  Conflicts / Roles
                </th>
                <th className="border border-gray-300 bg-gray-100 p-2">
                  Role 1
                </th>
                <th className="border border-gray-300 bg-gray-100 p-2">
                  Role 2
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th className="border border-gray-300 bg-gray-100 p-2">
                  Conflict 1
                </th>
                <td className="border border-gray-300 p-2">M1-1</td>
                <td className="border border-gray-300 p-2">M1-2</td>
              </tr>
              <tr>
                <th className="border border-gray-300 bg-gray-100 p-2">
                  Conflict 2
                </th>
                <td className="border border-gray-300 p-2">M2-1</td>
                <td className="border border-gray-300 p-2">M2-2</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/**
 * A simplified login screen component for Storybook
 */
export const LoginScreen: React.FC = () => {
  const { t } = useTranslations();
  const { login } = useAuth(); // Get the login function from auth context

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold">
          {t('app.title') || 'LARP Conflicts Table'}
        </h1>
        <p className="mb-6 text-center text-gray-600">
          {t('action.loginPrompt') || 'Please log in to access the application'}
        </p>
        <button
          className="flex w-full items-center justify-center gap-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          data-testid="login-button"
          onClick={login} // Add onClick handler
        >
          {t('action.login') || 'Login with Google'}
        </button>
      </div>
    </div>
  );
};

/**
 * A simplified error screen component for Storybook
 */
export const ErrorScreen: React.FC<{ errorMessage: string }> = ({
  errorMessage,
}) => {
  const { t } = useTranslations();
  const { login } = useAuth(); // Get the login function from auth context

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold text-red-600">
          {t('error.title') || 'Error'}
        </h1>
        <div className="mb-6 rounded-md border border-red-300 bg-red-100 p-4 text-red-700">
          {errorMessage}
        </div>
        <button
          className="flex w-full items-center justify-center gap-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          data-testid="login-button"
          onClick={login} // Add onClick handler
        >
          {t('action.tryAgain') || 'Try Again'}
        </button>
      </div>
    </div>
  );
};

/**
 * A simplified app component for Storybook that shows different screens based on auth state
 */
export const SimplifiedApp: React.FC = () => {
  const { access_token, isReady, error } = useAuth();

  if (error) {
    return <ErrorScreen errorMessage={error.message} />;
  }

  if (!access_token) {
    return <LoginScreen />;
  }

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-xl">Authenticating...</div>
      </div>
    );
  }

  return <SimplifiedConflictsTableTool sheetId="test-sheet-id" />;
};
