# FirebaseContext Component

This document provides a detailed description of the `FirebaseContext` component (`src/contexts/FirebaseContext.tsx`).

## Overview

The `FirebaseContext` component provides access to Firebase services, specifically the Firebase Realtime Database, throughout the application. It handles initializing the Firebase app and provides utility functions for interacting with the database.

## Responsibilities

- Initializing the Firebase application with the provided configuration.
- Providing access to the Firebase Realtime Database instance.
- Providing utility functions for:
  - Getting database references (`getDatabaseRef`).
  - Setting up disconnect cleanup (`setupDisconnectCleanup`).
  - Subscribing to data changes (`onValue`).
  - Setting data (`set`).
  - Managing online/offline status (`goOnline`, `goOffline`).
- Managing subscriptions to prevent memory leaks.

## State

The `FirebaseContext` does not manage any significant local state. It primarily acts as a provider for Firebase services.

## Hooks Used

- `useCallback`, `useEffect`, `useMemo`, `useRef`, `useContext`: Standard React hooks for managing state, side effects, and memoization.

## Interactions with Other Components

- Provides Firebase services to all child components via React Context.
- Used by `AuthContext` for Firebase authentication.
- Used by `usePresence` for real-time presence and locking.
- Used by any component that needs to interact with the Firebase Realtime Database.

## Implementation Details

- The component initializes the Firebase app only once.
- It provides a `useFirebase` hook to access the Firebase API.
- It manages a list of active subscriptions and automatically unsubscribes them when the component unmounts.
- It handles potential errors during Firebase operations, such as subscription errors.
