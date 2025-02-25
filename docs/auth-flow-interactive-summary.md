# Auth Flow Interactive Story Issue Summary

## Issue Overview

The `auth-flow-interactive.stories.tsx` file has an issue where clicking on the `login-button` does not advance the flow. This prevents the interactive story from properly demonstrating the complete authentication flow.

## Root Cause Analysis

After examining the code, we've identified the root cause:

1. In `src/test/storybook/simplified-components.tsx`, the `LoginScreen` component renders a login button with a `data-testid="login-button"` attribute, but it doesn't have an `onClick` handler to call the `login` function from the auth context.

2. The `StoryWrapper` in `auth-flow-interactive.stories.tsx` correctly sets up a mock login function that should:

   - Update the auth state to "authenticating"
   - After a timeout, update to "authenticated"
   - Call the onLogin callback

3. However, this login function is never called when the login button is clicked because the button doesn't have an onClick handler.

## Detailed Documentation

We've created two detailed documents to address this issue:

1. **[auth-flow-interactive-fix.md](./auth-flow-interactive-fix.md)**: Contains a detailed analysis of the issue and a proposed solution with code examples.

2. **[auth-flow-interactive-test-plan.md](./auth-flow-interactive-test-plan.md)**: Outlines a test plan for verifying the fix, including automated tests that can help identify the exact issue without needing the browser UI.

## Recommended Approach

We recommend a hybrid approach to fixing this issue:

1. **Direct Fix**: Modify the `LoginScreen` and `ErrorScreen` components in `simplified-components.tsx` to add the missing `onClick` handlers that call the `login` function from the auth context.

2. **Automated Testing**: If the direct fix doesn't resolve the issue or if we want to better understand the problem, implement the automated test plan outlined in `auth-flow-interactive-test-plan.md`.

## Implementation Steps

1. Switch to Code mode to implement the fix (Architect mode is restricted to editing .md files only).

2. Modify the `LoginScreen` component to add the `onClick` handler:

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
             {t('action.loginPrompt') ||
               'Please log in to access the application'}
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

3. Similarly, modify the `ErrorScreen` component to add the `onClick` handler.

4. Test the fix by running the Storybook story and verifying that clicking the login button advances the flow.

5. If the direct fix doesn't work, implement the automated test plan to better understand the issue.

## Expected Outcome

After implementing the fix, the interactive auth flow story should work as expected:

1. The initial state should show the login button
2. Clicking the login button should transition to the "authenticating" state
3. After a short delay, it should transition to the "authenticated" state and show the table

This will provide a more comprehensive and interactive demonstration of the authentication flow, improving both the visual documentation and the test coverage.

## Next Steps

1. Switch to Code mode to implement the fix
2. Verify the fix works as expected
3. Update the Memory Bank with the results
4. Continue with the integration testing plan, focusing on the next priority areas
