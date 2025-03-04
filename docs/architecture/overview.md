# System Architecture Overview

The LARP Conflicts Table Tool is a web application built with a **decentralized** architecture.

## Key Components

- **Client:** A React-based single-page application (SPA) built with TypeScript, Vite, and Tailwind CSS.
- **Backend:** A combination of Google Sheets (for data persistence) and Firebase (for real-time collaboration and presence).
- **Authentication:** Google Sign-In for user authentication.

See [Components](components) for more details.

## Data Flow

1.  The client interacts with the Google Sheets API to read and write data.
2.  Firebase Realtime Database is used to manage user presence, cell locking, and real-time updates.
3.  User authentication is handled via Google Sign-In.

See [Firebase Integration](firebase-integration) and [Google Sheets Integration](google-sheets-integration) for more details.

## Concurrency Model

The application uses **optimistic UI locking** to manage concurrent edits.

## Key Workflows

For detailed user workflows, see:

- [Authentication Flow](../product/ux/authentication-flow.md)
- [Table Interaction Flow](../product/ux/table-interaction.md)
