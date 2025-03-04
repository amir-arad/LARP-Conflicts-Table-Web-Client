# Implementation Patterns

This document describes common code patterns and conventions used throughout the application.

> **Note**: For detailed architectural principles and patterns, see:
>
> - [Architectural Patterns](patterns/architectural-patterns.md)
> - [Development Methodology](patterns/development-methodology.md)
> - [Testing Strategy](patterns/testing-strategy.md)

## Key Patterns

- **Context API:** React Context is used extensively for managing global state and providing access to services (Firebase, Google Sheets, Authentication, Language).
- **Hooks:** Custom hooks are used to encapsulate reusable logic, such as `useConflictsTable`, `usePresence`, `useTranslations`, `useGoogleSheet`.
- **Render Props:** Used in some components for flexible UI composition.
- **CSS Modules:** Tailwind CSS with `clsx` and `tailwind-merge` for utility-first styling and conflict resolution.
- **RTL Support:** The application supports right-to-left (RTL) layouts for Hebrew, using dynamic `dir` attributes and CSS adjustments.
- **Error Boundaries**: The `ErrorBoundary` component is used to catch and handle errors gracefully, preventing the entire application from crashing.
- **Optimistic UI Locking:** Used for real-time collaboration. When a user starts editing a cell, the application assumes the edit will succeed and immediately updates the UI. A temporary lock is acquired in Firebase to prevent concurrent edits. If another user tries to edit the same cell, they will see a lock indicator. See [Firebase Integration](firebase-integration) for more details.

## Naming Conventions

- Components: PascalCase (e.g., `ConflictsTableTool`)
- Hooks: `use` prefix followed by camelCase (e.g., `useConflictsTable`)
- Variables and functions: camelCase (e.g., `activeCell`)
- CSS classes: BEM-style with Tailwind utility classes (e.g., `table-cell`, `bg-blue-500`)

## Error Handling

Errors are handled using a combination of:

- Error boundaries to catch rendering errors.
- `try...catch` blocks for asynchronous operations.
- Error messages displayed to the user via alerts.

## Performance Optimizations

- `useCallback` and `useMemo` are used to prevent unnecessary re-renders.
- Data fetching is optimized to minimize API calls.
