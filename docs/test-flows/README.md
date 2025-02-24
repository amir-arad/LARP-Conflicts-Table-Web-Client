# Test Flows

This document outlines the key test flows in the LARP Conflicts Table application. Each flow represents a critical user interaction path that is tested to ensure proper functionality.

## Authentication Flow

Tests the user authentication process and session management:

- **Happy Path**: User logs in and establishes presence

  - Login button appears and works
  - Authentication state transitions correctly
  - User appears in active users list
  - Core UI elements become available after login

- **Error Handling**:

  - Gracefully handles login failures
  - Shows appropriate error messages
  - Maintains login button for retry

- **Presence Management**:
  - Maintains user presence while active
  - Updates presence status in real-time

## Motivation Changes Flow

Tests the editing of motivation cells in the conflicts table:

- **Basic Editing**:

  - Users can select and edit motivation cells
  - Changes are saved and displayed correctly
  - Enter key submits changes

- **Concurrent Editing**:

  - Handles multiple users editing different cells
  - Shows cell locks when another user is editing
  - Prevents concurrent editing of the same cell

- **Real-time Updates**:

  - Changes from other users appear in real-time
  - Updates are reflected without page refresh
  - Maintains consistency across all users

- **Network Resilience**:
  - Preserves draft content during network issues
  - Handles reconnection gracefully
  - Successfully saves changes when connection restores

## Multi-user Awareness Flow

Tests the collaborative features and user presence:

- **User Presence**:

  - Shows active users in presence list
  - Displays user photos and names
  - Updates presence status in real-time

- **Editing Indicators**:

  - Shows which cells users are currently editing
  - Updates indicators in real-time as users move
  - Clears indicators when users finish editing

- **Concurrent Access**:

  - Prevents conflicts during concurrent editing
  - Shows clear lock indicators
  - Allows editing different cells simultaneously

- **Visual Feedback**:
  - Displays user indicators in correct locations
  - Shows role, conflict, and motivation editors distinctly
  - Updates indicators as users change focus

## Role Changes Flow

Tests the management of role names in the conflicts table:

- **Basic Editing**:

  - Users can edit role names
  - Changes save and display correctly
  - Enter key submits changes

- **Persistence**:

  - Role name changes persist across sessions
  - Changes survive page reloads
  - Updates appear for all users

- **UI Updates**:
  - Role name changes update all related UI elements
  - Updates buttons and labels using role names
  - Shows editing status with new role names

## Running the Tests

The test flows use Vitest and React Testing Library. To run the tests:

```bash
npm test
```

To run a specific flow:

```bash
npm test -- src/test/flows/[flow-name].test.tsx
```

## Test Structure

Each test flow follows a consistent pattern:

1. Setup test environment and mock data
2. Render component with test wrapper
3. Simulate user interactions
4. Verify expected outcomes
5. Test error cases and edge conditions

The test wrapper provides mock implementations for:

- Google Sheets API
- Firebase Realtime Database
- Authentication services
