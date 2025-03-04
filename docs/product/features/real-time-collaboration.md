# Real-time Collaboration Feature

This document details the real-time collaboration features of the LARP Conflicts Table Tool.

## Overview

The application supports real-time collaboration, allowing multiple users to view and edit the conflicts table simultaneously.

## Implementation Details

- **Technology:** Firebase Realtime Database is used to manage presence, cell locking, and real-time updates.
- **Presence:** The `usePresence` hook (`src/hooks/usePresence.tsx`) tracks which users are currently active in the application. Active users are displayed in the `ActiveUsersList` component.
- **Locking:** When a user starts editing a cell, a temporary lock is acquired in Firebase. This prevents other users from editing the same cell simultaneously. The `LockIndicator` component displays the lock status.
- **Real-time Updates:** Changes made by one user are immediately reflected in the UI of all other users viewing the same sheet.
- **Optimistic UI:** The application uses an optimistic UI approach. Changes are applied immediately to the local UI, and then synchronized with the backend.
- **Conflict Resolution:** In the rare case of simultaneous edits to the same cell, a "last-write-wins" strategy is used.
- **Data Structures:** The `src/lib/collaboration.ts` file defines the data structures used for presence and locking.

## User Experience

- **Presence Awareness:** Users can see who else is currently viewing the sheet through the `ActiveUsersList` component.
- **Active Editing Indicators:** A colored border and the user's avatar indicate which cells are being actively edited.
- **Lock Indicators:** A lock icon indicates when a cell is locked by another user.
- **Real-time Updates:** Changes made by other users appear in real-time without requiring a page refresh.

## Implementation Strategy

The implementation of real-time collaboration features was planned in the following phases:

1.  **Real-time Foundation:**

    - Firebase setup
    - RTDB integration
    - Connection management

2.  **Real-time Features:**

    - Presence system
    - Lock mechanism
    - Cursor tracking (deferred)

3.  **UI Refinement:**

    - Status indicators
    - Tooltips
    - Error states

4.  **Performance:**
    - Optimization
    - Error handling
    - Edge cases
