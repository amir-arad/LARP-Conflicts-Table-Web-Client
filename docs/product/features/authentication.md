# Authentication Feature

This document details the authentication feature of the LARP Conflicts Table Tool.

## Overview

The application uses Google Sign-In for user authentication. This allows users to securely access the application using their existing Google accounts.

## Implementation Details

- **Authentication Provider:** Google OAuth 2.0 via the `@react-oauth/google` library.
- **Firebase Integration:** After successful Google Sign-In, the user is also signed in to Firebase using a custom token. This enables real-time features and data synchronization.
- **Context:** The `AuthContext` (`src/contexts/AuthContext.tsx`) manages the authentication state and provides access to the user's information and authentication methods.
- **Client ID:** The Google Cloud project client ID is configured in `src/config.tsx`.
- **API Key:** The Google API key is configured in `src/config.tsx`.

## User Flow

1.  The user clicks the "Log In" button.
2.  The application redirects the user to the Google Sign-In page.
3.  The user selects their Google account and grants permission to the application.
4.  Google redirects the user back to the application with an authorization code.
5.  The application exchanges the authorization code for an access token.
6.  The application uses the access token to authenticate with Firebase.
7.  The user is now logged in and can access the application's features.

## Security Considerations

- The application uses HTTPS for all communication.
- Access tokens are stored securely in local storage and have a limited lifespan.
- Firebase security rules are used to protect user data.
