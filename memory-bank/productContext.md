# LARP Conflicts Table Web Client - Product Context

## Project Overview

A collaborative web application for managing LARP (Live Action Role Playing) conflicts tables. Built with React, TypeScript, and Vite, focusing on real-time collaboration and internationalization.

## Core Features

- Real-time collaborative editing
- Internationalization support (English and Hebrew)
- Google Sheets integration
- Firebase backend integration
- User presence and activity tracking
- Role-based conflict management
- Motivation tracking

## Technical Stack

- Frontend: React + TypeScript
- Build Tool: Vite
- State Management: React Context
- Real-time Database: Firebase
- External Integration: Google Sheets API
- Testing: Jest
- UI Development: Storybook
- Code Quality: ESLint + Prettier

## Project Structure

```
src/
├── components/     # React components
│   └── ui/        # Reusable UI components
├── contexts/      # React contexts
├── hooks/         # Custom React hooks
├── i18n/          # Internationalization
│   └── messages/  # Translation files
├── lib/           # Utility libraries
└── types/         # TypeScript type definitions
```

## Memory Bank Files

- **activeContext.md**: Tracks current session state and goals
- **productContext.md** (this file): Project overview and structure
- **progress.md**: Work completed and upcoming tasks
- **decisionLog.md**: Key architectural and technical decisions
- **systemPatterns.md**: Identified patterns and conventions

## Project Goals

1. Provide a seamless collaborative experience for LARP organizers
2. Support multilingual interfaces (English/Hebrew)
3. Maintain high code quality and test coverage
4. Enable efficient conflict and motivation management
5. Ensure real-time synchronization across users

## Technical Requirements

- Node.js 22 or higher
- Modern browser support
- Firebase project setup
- Google API credentials
- Stable internet connection for real-time features

## Code Quality Standards

- TypeScript for type safety
- ESLint for code linting
- Prettier for consistent formatting
- Jest for testing
- Storybook for component documentation
