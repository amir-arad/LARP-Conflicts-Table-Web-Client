# GoogleSheetsContext Component

This document provides a detailed description of the `GoogleSheetsContext` component (`src/contexts/GoogleSheetsContext.tsx`).

## Overview

The `GoogleSheetsContext` component manages interaction with the Google Sheets API. It provides functions for loading, updating, and clearing data in the connected Google Sheet.

## Responsibilities

- Providing an API for interacting with Google Sheets:
  - `load`: Loads data from the sheet.
  - `update`: Updates data in the sheet.
  - `clear`: Clears data in the sheet.
- Managing loading and error states during API calls.
- Ensuring that the Google Sheets API is loaded and initialized before making API calls.

## State

The `GoogleSheetsContext` manages the following state variables:

- `isLoading`: A boolean indicating whether an API call is in progress.
- `error`: A string containing any error message that occurred during API calls.

## Hooks Used

- `useCallback`, `useContext`, `useMemo`, `useState`: Standard React hooks for managing state, side effects, and memoization.

## Interactions with Other Components

- Provides Google Sheets API access to all child components via React Context.
- Used by `useConflictsTable` to load and update table data.

## Implementation Details

- The component uses the `gapi.client.sheets` API to interact with Google Sheets.
- It ensures that the `gapi.client.sheets` library is loaded before making any API calls.
- It uses the provided `sheetId` and `token` (from `AuthContext`) to authenticate and authorize API requests.
- It handles errors during API calls and sets the `error` state accordingly.
- It uses the `ROLES_CONFLICT_SHEET_ID` constant from `src/config.tsx` to specify the sheet range.
