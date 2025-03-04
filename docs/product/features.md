# Feature Catalog

This document outlines the key features of the LARP Conflicts Table Tool.

## Core Features

- **[Conflicts Table](features/conflicts-table):** A central table to manage character conflicts and motivations.
- **[Real-time Collaboration](features/real-time-collaboration):** Multiple users can edit the table simultaneously.
  - **Presence Awareness:** Shows who is currently viewing the sheet (Implemented).
  - **Active Editing Indicators:** Shows which cells are being edited and by whom (Implemented).
  - **Edit Lock Mechanism:** Temporarily locks cells being edited to prevent conflicts (Implemented).
  - **Change Notifications:** Show notifications for important changes (Not Implemented).
  - **Conflict Resolution:** Handle simultaneous edits gracefully (Partially Implemented - Last-write-wins).
  - **History Trail:** Show recent changes and allow reverting (Not Implemented).
- **[Authentication](features/authentication):** User authentication via Google Sign-In.
- **[Internationalization](features/internationalization):** Support for English and Hebrew (RTL support).
- **Role Management:** Ability to add and remove roles.
- **Conflict Management:** Ability to add and remove conflicts.
- **Motivation Tracking:** Ability to define and update character motivations for each conflict/role pair.
