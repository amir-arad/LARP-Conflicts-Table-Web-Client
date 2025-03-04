# AuthContext Component

This document provides a detailed description of the `AuthContext` component (`src/contexts/AuthContext.tsx`).

## Overview

The `AuthContext` component manages user authentication and authorization for the application. It handles the Google Sign-In flow, Firebase authentication, and provides access to the user's authentication state.

## Responsibilities

- Managing the Google Sign-In flow using `@react-oauth/google`.
- Authenticating with Firebase using custom tokens after successful Google Sign-In.
- Providing the authentication state to other components via React Context.
- Handling loading and error states during the authentication process.
- Storing and retrieving the access token from local storage.
- Providing a `login` function to initiate the sign-in process.
- Exposing the user's Firebase `User` object.
- Tracking the client load status through various initialization stages.

## State

The `AuthContext` manages the following state variables:

- `clientStatus`: An enum representing the current state of the client initialization (Loading, Initializing, Ready, Error).
- `access_token`: The Google access token.
- `firebaseUser`: The Firebase User object.
- `error`: Any error that occurred during authentication.

## Hooks Used

- `useFirebase`: To access Firebase services.
- `useGoogleLogin`: From `@react-oauth/google` to handle the Google Sign-In flow.
- `useState`, `useEffect`, `useCallback`: Standard React hooks for managing state and side effects.

## Interactions with Other Components

- Provides the authentication state to all child components via React Context.
- Used by `ConflictsTableTool` to check if the user is logged in before accessing data.
- Used by `ConnectionStatusIndicator` to display the connection status.

## Implementation Details

- The component uses a multi-stage initialization process to load the necessary Google and Firebase libraries.
- It stores the Google access token in local storage to persist the user's session.
- It uses Firebase's `.info/connected` to detect connection status and automatically reconnect if necessary.
