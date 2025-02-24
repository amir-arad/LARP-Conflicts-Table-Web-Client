# LARP Conflicts Table Web Client - Architecture Overview

## Project Summary

The LARP Conflicts Table Web Client is a collaborative web application designed for managing and editing conflict tables for Live Action Role-Playing (LARP) games. It allows multiple users to simultaneously view and edit a shared conflicts table, with real-time collaboration features including presence awareness, cell locking, and concurrent editing.

## Core Architecture

The application follows a modern React architecture with the following key characteristics:

1. **Source of Truth**: Google Sheets (persistent data storage)
2. **Real-time Layer**: Firebase Realtime Database (collaboration features)
3. **Concurrency Model**: Optimistic UI locking
4. **Architecture Style**: Decentralized
5. **State Management**: Eventually consistent

## Key Technologies

- **Frontend Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Authentication**: Google OAuth
- **Data Storage**: Google Sheets API
- **Real-time Features**: Firebase Realtime Database
- **Internationalization**: Custom i18n implementation
- **Testing**: Vitest and React Testing Library

## System Components

### 1. Authentication System

- Uses Google OAuth for authentication
- Integrates with Firebase Authentication
- Manages user sessions and presence
- Provides connection status indicators

### 2. Data Management

- Google Sheets API for persistent data storage
- CRUD operations for conflicts, roles, and motivations
- Optimistic updates for better user experience
- Data synchronization between clients

### 3. Real-time Collaboration

- User presence tracking
- Cell-level locking mechanism
- Active users display
- Concurrent editing prevention
- Real-time updates across clients

### 4. User Interface

- Responsive table layout
- Editable cells for conflicts, roles, and motivations
- Visual indicators for locks and user presence
- Filtering capabilities for roles and conflicts
- Internationalization support

## Core Data Structures

### Conflicts Table Structure

The application manages a table with the following structure:

- Header row with role names
- First column with conflict names
- Cells containing motivations for each role-conflict pair

### Firebase Schema

```typescript
interface RealtimeState {
  sheets: {
    [sheetId: string]: {
      presence: {
        [userId: string]: {
          name: string,
          photoUrl: string,
          lastActive: timestamp,
          activeCell?: string
        }
      },
      locks: {
        [cellId: string]: {
          userId: string,
          acquired: timestamp,
          expires: timestamp + 30000  // 30s TTL
        }
      }
    }
  }
}
```

## Key Workflows

### Authentication Flow

1. User clicks login button
2. Google OAuth authentication occurs
3. Firebase authentication is established
4. User presence is registered
5. UI updates to show authenticated state

### Editing Flow

1. User selects a cell
2. System checks if cell is locked
3. If unlocked, system acquires lock and shows edit UI
4. User makes changes
5. On completion, changes are saved to Google Sheets
6. Lock is released
7. Updates propagate to other users

### Presence Management

1. User logs in and establishes presence
2. Heartbeat mechanism maintains presence status
3. User appears in active users list
4. When user focuses on a cell, position is broadcast
5. On disconnect, presence is automatically cleared

## Implementation Details

### Context Providers

The application uses React Context for state management:

- `AuthContext`: Manages authentication state
- `FirebaseContext`: Provides Firebase database access
- `GoogleSheetsContext`: Handles Google Sheets API interactions
- `LanguageContext`: Manages internationalization

### Key Hooks

- `useConflictsTable`: Manages the conflicts table data
- `usePresence`: Handles user presence and cell locking
- `useFlags`: Manages feature flags and filters
- `useTranslations`: Provides internationalized text

### Components

- `ConflictsTableTool`: Main table component
- `EditableTableCell`: Editable cell component
- `MotivationTableCell`: Specialized cell for motivations
- `ActiveUsersList`: Shows currently active users
- `LockIndicator`: Displays cell lock status
- `ConnectionStatusIndicator`: Shows connection status

## Collaboration Features

### Presence Awareness

- Shows who is currently viewing the sheet
- Displays user avatars and names
- Indicates when users join or leave
- Shows which cells users are currently editing

### Edit Lock Mechanism

- When a user starts editing a cell, it's temporarily locked
- Visual indicators show locked cells
- Locks auto-release after inactivity (30s)
- Prevents concurrent editing conflicts

### Real-time Updates

- Changes from other users appear immediately
- No page refresh required
- Maintains data consistency across clients

## Current Implementation Status

Based on the `collab-tasks.todo` file, the project has completed:

- Firebase infrastructure setup
- Basic collaboration context
- Presence system implementation
- Active users display

In progress or upcoming tasks include:

- Cell editing UI with lock visualization
- Live cursor indicators
- Error handling improvements
- Performance optimization
- Edge case handling

## Testing Strategy

The application includes comprehensive test flows for:

- Authentication flow
- Motivation changes flow
- Multi-user awareness flow
- Role changes flow

Tests use Vitest and React Testing Library with mock implementations for:

- Google Sheets API
- Firebase Realtime Database
- Authentication services

## Future Enhancements

Potential future enhancements based on the documentation:

- History trail for recent changes
- Smart batching of updates
- Collaborative filtering
- Session management features
- Conflict resolution for simultaneous edits
