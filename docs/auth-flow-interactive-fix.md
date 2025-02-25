# Auth Flow Interactive Story Fix

## Issue Identified

The `auth-flow-interactive.stories.tsx` file has an issue where clicking on the `login-button` does not advance the flow. After analyzing the code, I've identified the root cause:

In `src/test/storybook/simplified-components.tsx`, the `LoginScreen` component renders a login button with a `data-testid="login-button"` attribute, but it doesn't have an `onClick` handler to call the `login` function from the auth context.

```tsx
// Current implementation in simplified-components.tsx
export const LoginScreen: React.FC = () => {
  const { t } = useTranslations();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">
          {t('app.title') || 'LARP Conflicts Table'}
        </h1>
        <p className="mb-6 text-center text-gray-600">
          {t('action.loginPrompt') || 'Please log in to access the application'}
        </p>
        <button
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          data-testid="login-button"
        >
          {t('action.login') || 'Login with Google'}
        </button>
      </div>
    </div>
  );
};
```

## Proposed Solution

The `LoginScreen` component needs to be modified to:

1. Import the `useAuth` hook
2. Extract the `login` function from the auth context
3. Add an `onClick` handler to the login button that calls this function

Here's the proposed fix:

```tsx
export const LoginScreen: React.FC = () => {
  const { t } = useTranslations();
  const { login } = useAuth(); // Get the login function from auth context

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">
          {t('app.title') || 'LARP Conflicts Table'}
        </h1>
        <p className="mb-6 text-center text-gray-600">
          {t('action.loginPrompt') || 'Please log in to access the application'}
        </p>
        <button
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          data-testid="login-button"
          onClick={login} // Add onClick handler
        >
          {t('action.login') || 'Login with Google'}
        </button>
      </div>
    </div>
  );
};
```

Similarly, the `ErrorScreen` component should also have an `onClick` handler for its "Try Again" button:

```tsx
export const ErrorScreen: React.FC<{ errorMessage: string }> = ({
  errorMessage,
}) => {
  const { t } = useTranslations();
  const { login } = useAuth(); // Get the login function from auth context

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-red-600">
          {t('error.title') || 'Error'}
        </h1>
        <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-md text-red-700">
          {errorMessage}
        </div>
        <button
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          data-testid="login-button"
          onClick={login} // Add onClick handler
        >
          {t('action.tryAgain') || 'Try Again'}
        </button>
      </div>
    </div>
  );
};
```

## Implementation Steps

1. Modify the `LoginScreen` component to add the `onClick` handler
2. Modify the `ErrorScreen` component to add the `onClick` handler
3. Test the fix by running the Storybook story and verifying that clicking the login button advances the flow

## Verification

After implementing these changes, the interactive auth flow story should work as expected:

1. The initial state should show the login button
2. Clicking the login button should transition to the "authenticating" state
3. After a short delay, it should transition to the "authenticated" state and show the table

## Alternative Testing Approach

If the direct fix doesn't resolve the issue or if we want to better understand the problem, we could create an automatic test that:

1. Renders the interactive story
2. Attempts to click the login button
3. Logs detailed information about what's happening
4. Verifies whether the auth state changes as expected

This would help pinpoint exactly where the flow breaks down without needing the browser UI.
