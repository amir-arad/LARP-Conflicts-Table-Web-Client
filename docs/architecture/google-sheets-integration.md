# Google Sheets Integration

This document details the integration of Google Sheets as the data backend for the LARP Conflicts Table Tool.

## Overview

Google Sheets is used as the primary data store for the application. It stores the roles, conflicts, and motivations data in a structured format.

## Data Format

The Google Sheet is structured as a simple table:

- **First Row:** Contains the names of the roles.
- **First Column:** Contains the names of the conflicts.
- **Remaining Cells:** Contain the character motivations for each role-conflict pair. Empty cells indicate no motivation.

## API Interaction

- The application uses the Google Sheets API v4 to interact with the Google Sheet.
- The `GoogleSheetsContext` (`src/contexts/GoogleSheetsContext.tsx`) provides functions for reading, updating, and clearing data in the sheet.
- The `useGoogleSheet` hook (`src/hooks/useGoogleSheet.ts`) encapsulates the API interaction logic.
- The `useConflictsTable` hook (`src/hooks/useConflictsTable.ts`) uses `useGoogleSheet` to manage the table data.

## Authentication and Authorization

- Users authenticate with their Google accounts using Google Sign-In.
- The application requests the necessary scopes to access and modify Google Sheets.
- An access token is obtained after successful authentication and is used to authorize API requests.

## Operations

- **Loading Data:** The application loads the entire sheet data on initial load.
- **Updating Data:** Changes made by users (adding, editing, or deleting roles, conflicts, or motivations) are immediately written to the Google Sheet.
- **Clearing Data:** The application uses the `clear` API method to remove roles or conflicts.

## Configuration

- The Google Sheet ID (`sheetId`), roles conflict sheet ID (`ROLES_CONFLICT_SHEET_ID`), client ID (`clientId`), and API key (`apiKey`) are configured in `src/config.tsx`.
- The `ROLES_CONFLICT_SHEET_ID` constant is used to specify the name of the sheet.

## Error Handling

- The `GoogleSheetsContext` handles errors during API calls and sets an error state.
- Error messages are displayed to the user.

## Google Cloud Project Management

- **Main Dashboard:** [console.cloud.google.com](https://console.cloud.google.com)
- **API Library:** [console.cloud.google.com/apis/library](https://console.cloud.google.com/apis/library)
- **Credentials Page:** [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)
- **Quotas & Usage:** [console.cloud.google.com/apis/quotas](https://console.cloud.google.com/apis/quotas)

### Managing API Keys

1.  Go to [Credentials](https://console.cloud.google.com/apis/credentials&project=larp-conflicts-table)
2.  Click "Create Credentials" → "API Key"
3.  Set restrictions (IP, HTTP referrer, API access)

### Checking Usage & Quotas

1.  Visit [Quotas](https://console.cloud.google.com/apis/quotas&project=larp-conflicts-table)
2.  Select your API
3.  View daily usage and limits

### Enabling/Disabling APIs

1.  Open [API Library](https://console.cloud.google.com/apis/library&project=larp-conflicts-table)
2.  Search for API
3.  Click "Enable" or "Disable"
