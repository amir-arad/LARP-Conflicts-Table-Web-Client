# Firebase Integration

This document details the integration of Firebase services, specifically the Firebase Realtime Database, into the LARP Conflicts Table Tool.

## Overview

Firebase Realtime Database is used for two primary purposes:

1.  **Real-time Presence:** Tracking which users are currently active in the application.
2.  **Cell Locking:** Implementing a locking mechanism to prevent concurrent edits to the same cell.

## Data Structure

The Firebase Realtime Database uses the following structure (defined in `src/lib/collaboration.ts`):

```typescript
interface RealtimeState {
  sheets: {
    [sheetId: string]: {
      presence: {
        [userId: string]: {
          name: string;
          photoUrl: string;
          lastActive: timestamp;
          activeCell?: string;
        };
      };
      locks: {
        [cellId: string]: {
          userId: string;
          acquired: timestamp;
          expires: timestamp;
        };
      };
    };
  };
}
```

- `sheets`: The top-level key, containing data for all sheets.
- `[sheetId: string]`: A key representing the unique ID of a Google Sheet.
- `presence`: Contains presence information for each user active in the sheet.
  - `[userId: string]`: A unique user ID.
  - `name`: The user's display name.
  - `photoUrl`: The URL of the user's profile picture.
  - `lastActive`: A timestamp indicating the last time the user was active.
  - `activeCell`: (Optional) The ID of the cell the user is currently editing.
- `locks`: Contains information about cell locks.
  - `[cellId: string]`: The ID of the locked cell.
  - `userId`: The ID of the user who acquired the lock.
  - `acquired`: A timestamp indicating when the lock was acquired.
  - `expires`: A timestamp indicating when the lock will expire (used for automatic lock release).

## Implementation Details

- **`FirebaseContext`:** Provides access to Firebase services.
- **`usePresence` Hook:** Manages presence and locking logic.
- **Connection Lifecycle:**
  1.  When a user opens the application, a connection to Firebase Realtime Database is established.
  2.  The user's presence is registered in the database.
  3.  The application subscribes to presence and lock updates for the current sheet.
- **Presence Updates:**
  - A heartbeat mechanism updates the `lastActive` timestamp periodically.
  - When a user disconnects (or closes the application), their presence information is automatically removed from the database after a timeout (handled by Firebase).
- **Cell Locking:**
  - When a user starts editing a cell, the application attempts to acquire a lock for that cell in Firebase.
  - If the lock is acquired successfully, the user can edit the cell.
  - If the lock is already held by another user, the cell is displayed as locked.
  - Locks have a short Time-To-Live (TTL) and are automatically released after a period of inactivity.
- **Firebase Path Utilities:** The `src/lib/firebase.ts` file provides utility functions for constructing Firebase database paths.

## Security Rules

The security rules are implemented in `firebase/database.rules.json`. These rules ensure:

- Presence data is secured per user
- Lock management is accessible to all authenticated users
- Data validation for all fields
- Automatic lock expiration

## Environment Setup

1. Copy `.env.example` to `.env`
2. Fill in all Firebase-related environment variables:
   - VITE_FIREBASE_API_KEY
   - VITE_FIREBASE_AUTH_DOMAIN
   - VITE_FIREBASE_DATABASE_URL
   - VITE_FIREBASE_PROJECT_ID
   - VITE_FIREBASE_STORAGE_BUCKET
   - VITE_FIREBASE_MESSAGING_SENDER_ID
   - VITE_FIREBASE_APP_ID
