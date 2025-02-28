# Conflicts Table Feature

This document details the core Conflicts Table feature of the LARP Conflicts Table Tool.

## Overview

The Conflicts Table is the central feature of the application, allowing users to manage character roles, conflicts, and motivations in a structured grid format.

## Implementation Details

- **Component:** The `ConflictsTableTool` component (`src/components/conflicts-table-tool.tsx`) renders the table and handles user interactions.
- **Data Source:** Google Sheets (`src/hooks/useGoogleSheet.ts`, `src/contexts/GoogleSheetsContext.tsx`).
- **Data Structure:** The table data is stored in a Google Sheet with a specific format:
  - The first row contains the role names.
  - The first column contains the conflict names.
  - The remaining cells contain the character motivations for each role-conflict pair.
- **Real-time Updates:** Changes made by other users are reflected in real-time via Firebase.
- **Hooks**: The `useConflictsTable` hook (`src/hooks/useConflictsTable.ts`) manages the table data, including loading, updating, adding, and removing roles and conflicts.
- **UI Components**:
  - `TableCell`: Represents an editable cell in the table.
  - `MotivationTableCell`: A specialized table cell for entering character motivations.

## Functionality

- **Adding Roles:** Users can add new roles to the table.
- **Adding Conflicts:** Users can add new conflicts to the table.
- **Editing Cells:** Users can edit the content of cells to define character motivations.
- **Deleting Roles/Conflicts:** Users can remove roles and conflicts from the table.
- **Filtering:** Users can filter the table by role and conflict.
- **Real-time Collaboration:** Multiple users can edit the table simultaneously, with changes reflected in real-time.
- **Locking:** Cells are automatically locked while being edited to prevent conflicts.
