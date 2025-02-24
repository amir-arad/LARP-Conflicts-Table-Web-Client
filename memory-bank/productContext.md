# LARP Conflicts Table Web Client - Product Context

## Project Overview

The LARP Conflicts Table Web Client is a collaborative web application designed for managing and editing conflict tables for Live Action Role-Playing (LARP) games. It enables multiple users to simultaneously view and edit a shared conflicts table with real-time collaboration features.

## Project Goals

1. Provide a user-friendly interface for managing LARP conflict tables
2. Enable real-time collaboration between multiple users
3. Maintain data consistency across all clients
4. Provide clear visual indicators for user presence and editing status
5. Support internationalization for multiple languages
6. Ensure responsive design for various device sizes

## Technical Constraints

1. Use Google Sheets as the source of truth for persistent data
2. Use Firebase Realtime Database for real-time collaboration features
3. Implement optimistic UI locking for concurrency control
4. Support modern browsers (Chrome, Firefox, Safari, Edge)
5. Maintain accessibility standards
6. Ensure performance on various network conditions

## Key Stakeholders

- LARP game masters and organizers
- LARP players and participants
- Game designers and content creators

## Memory Bank Structure

This Memory Bank contains the following core files:

1. **productContext.md** (this file): Project overview, goals, constraints, and memory bank structure
2. **activeContext.md**: Current session context, recent changes, and active goals
3. **progress.md**: Work completed and next steps
4. **decisionLog.md**: Key decisions and their rationale
5. **systemPatterns.md**: Identified patterns and architectural insights

Additional files may be created as needed to document specific aspects of the project.

## Key Features

### Core Functionality

- Editable conflicts table with roles, conflicts, and motivations
- Add/remove roles and conflicts
- Edit motivation cells
- Filter by roles and conflicts
- Open in Google Sheets option

### Collaboration Features

- User presence awareness
- Active editing indicators
- Cell locking mechanism
- Real-time updates
- Connection status indicators

### User Experience

- Responsive design
- Internationalization support
- Visual feedback for actions
- Error handling and recovery
- Accessibility features

## Technical Stack

- **Frontend Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Authentication**: Google OAuth
- **Data Storage**: Google Sheets API
- **Real-time Features**: Firebase Realtime Database
- **Internationalization**: Custom i18n implementation
- **Testing**: Vitest and React Testing Library

## Implementation Status

The project has implemented:

- Firebase infrastructure setup
- Basic collaboration context
- Presence system implementation
- Active users display
- Core table functionality

In progress or upcoming:

- Cell editing UI with lock visualization
- Live cursor indicators
- Error handling improvements
- Performance optimization
- Edge case handling
