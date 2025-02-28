# ConflictsTableTool Component

This document provides a detailed description of the `ConflictsTableTool` component (`src/components/conflicts-table-tool.tsx`).

## Overview

The `ConflictsTableTool` is the main component of the application. It is responsible for rendering the conflicts table, handling user interactions, and managing the overall application state related to the table.

## Responsibilities

- Rendering the conflicts table UI.
- Handling user input for adding, editing, and deleting roles, conflicts, and motivations.
- Interacting with the `useConflictsTable` hook to fetch and update table data.
- Managing the active cell state.
- Displaying the presence of other active users.
- Handling cell locking and displaying lock indicators.
- Providing filtering functionality for roles and conflicts.
- Displaying alerts for errors and informational messages.
- Providing a link to open the Google Sheet in a new tab.

## Props

- `sheetId`: The ID of the Google Sheet to use as the data source.

## Hooks Used

- `useAuth`: To access the authentication state and check if the user is logged in.
- `usePresence`: To manage user presence and cell locking.
- `useFlags`: To manage filter states for roles and conflicts.
- `useConflictsTable`: To interact with the Google Sheets API and manage table data.
- `useTranslations`: To translate text for internationalization.

## Interactions with Other Components

- Uses `ActiveUsersList` to display active users.
- Uses `EditableTableCell` to render editable cells for role and conflict names.
- Uses `MotivationTableCell` to render editable cells for character motivations.
- Uses `LockIndicator` to display lock status for cells.
- Uses `Alert` and `Card` components from the UI library for layout and notifications.

## State Management

The component manages the following local state:

- `activeCell`: The ID of the currently active (focused) cell.
- `roleFilters`: An array of role cell references used for filtering.
- `conflictFilters`: An array of conflict cell references used for filtering.

The component relies on the `useConflictsTable` hook for managing the main table data (roles, conflicts, motivations).
