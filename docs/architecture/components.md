# Component Architecture

This document describes the internal structure and responsibilities of the main application components.

## Key Components

- **[`ConflictsTableTool`](components/conflicts-table-tool):** The main component that renders the conflicts table and handles user interactions.
- **[`AuthContext`](components/auth-context):** Manages user authentication and authorization.
- **[`FirebaseContext`](components/firebase-context):** Provides access to Firebase services (Realtime Database).
- **[`GoogleSheetsContext`](components/google-sheets-context):** Manages interaction with the Google Sheets API.
- **[`LanguageContext`](components/language-context):** Handles internationalization (i18n) and language switching.
- **`usePresence` Hook:** Manages real-time presence and cell locking using Firebase. (Covered in [Firebase Integration](firebase-integration))
- **UI Components:**
  - `ActiveUsersList`: Displays a list of currently active users.
  - `TableCell`: Represents an editable cell in the table.
  - `MotivationTableCell`: A specialized table cell for entering character motivations.
  - `LockIndicator`: Visual indicator for locked cells.
  - `ConnectionStatusIndicator`: Displays the connection status to the backend.
  - [`usePresence`](firebase-integration): Manages real-time presence and cell locking using Firebase.

## Component Interaction

The `ConflictsTableTool` component uses the context providers (`AuthContext`, `FirebaseContext`, `GoogleSheetsContext`, `LanguageContext`) and the `usePresence` hook to interact with the backend services and manage application state. It renders the table and handles user input, delegating data fetching, updates, presence, and locking to the appropriate contexts and hooks.
