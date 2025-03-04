# Documentation Guidelines

This document provides guidelines for documenting code in the LARP Conflicts Table Web Client project.

## JSDoc Comments

All components, hooks, contexts, and utility functions should be documented using JSDoc comments.

### Components

````typescript
/**
 * ComponentName
 *
 * @component
 * @description Brief description of the component
 *
 * @param {Type} propName - Description of the prop
 * @returns {JSX.Element} Component JSX
 *
 * @example
 * ```tsx
 * <ComponentName propName={value} />
 * ```
 */
````

Example:

````typescript
/**
 * ConflictsTableTool Component
 *
 * @component
 * @description A tool for managing LARP character conflicts and motivations
 *
 * @param {Object} props - Component props
 * @param {boolean} props.readOnly - Whether the table is read-only
 * @param {string} props.locale - The current locale
 * @returns {JSX.Element} ConflictsTableTool component
 *
 * @example
 * ```tsx
 * <ConflictsTableTool readOnly={false} locale="en" />
 * ```
 *
 * @remarks
 * This component is the main entry point for the conflicts table functionality.
 * It integrates with Firebase for real-time collaboration and Google Sheets for data storage.
 */
export const ConflictsTableTool: React.FC<ConflictsTableToolProps> = ({
  readOnly,
  locale,
}) => {
  // Component implementation
};
````

### Hooks

````typescript
/**
 * useHookName
 *
 * @hook
 * @description Brief description of the hook
 *
 * @param {Type} paramName - Description of the parameter
 * @returns {ReturnType} Description of the return value
 *
 * @example
 * ```tsx
 * const result = useHookName(param);
 * ```
 */
````

Example:

````typescript
/**
 * useConflictsTable Hook
 *
 * @hook
 * @description Hook for managing conflicts table data and operations
 *
 * @param {Object} options - Hook options
 * @param {string} options.sheetId - Google Sheet ID
 * @param {boolean} options.readOnly - Whether the table is read-only
 * @returns {Object} Conflicts table state and operations
 * @returns {Array} conflicts - Array of conflict objects
 * @returns {Function} addConflict - Function to add a new conflict
 * @returns {Function} updateConflict - Function to update an existing conflict
 * @returns {Function} removeConflict - Function to remove a conflict
 *
 * @example
 * ```tsx
 * const { conflicts, addConflict, updateConflict, removeConflict } = useConflictsTable({
 *   sheetId: 'abc123',
 *   readOnly: false
 * });
 * ```
 */
export const useConflictsTable = ({
  sheetId,
  readOnly,
}: ConflictsTableOptions) => {
  // Hook implementation
};
````

### Contexts

````typescript
/**
 * ContextName
 *
 * @context
 * @description Brief description of the context
 *
 * @example
 * ```tsx
 * <ContextProvider>
 *   <ChildComponent />
 * </ContextProvider>
 * ```
 */
````

Example:

````typescript
/**
 * FirebaseContext
 *
 * @context
 * @description Context for Firebase integration
 *
 * @example
 * ```tsx
 * <FirebaseProvider>
 *   <App />
 * </FirebaseProvider>
 * ```
 *
 * @remarks
 * This context provides access to Firebase services and handles authentication,
 * real-time database operations, and presence management.
 */
export const FirebaseContext = createContext<FirebaseContextType | null>(null);
````

### Utility Functions

````typescript
/**
 * functionName
 *
 * @function
 * @description Brief description of the function
 *
 * @param {Type} paramName - Description of the parameter
 * @returns {ReturnType} Description of the return value
 *
 * @example
 * ```ts
 * const result = functionName(param);
 * ```
 */
````

Example:

````typescript
/**
 * formatDate
 *
 * @function
 * @description Format a date string in the specified locale
 *
 * @param {Date} date - The date to format
 * @param {string} locale - The locale to use for formatting
 * @returns {string} The formatted date string
 *
 * @example
 * ```ts
 * const formattedDate = formatDate(new Date(), 'en');
 * // Returns: "February 28, 2025"
 * ```
 */
export const formatDate = (date: Date, locale: string): string => {
  // Function implementation
};
````

## Diagrams

Use PlantUML for creating architectural diagrams. Place diagram source files in the `docs/diagrams` directory.

### Component Diagrams

Component diagrams should show the components in the application and their relationships. Use the following template:

```
@startuml
title Component Diagram
skinparam componentStyle rectangle

component "ComponentName" as ComponentName
component "AnotherComponent" as AnotherComponent

ComponentName --> AnotherComponent
@enduml
```

### Context Diagrams

Context diagrams should show the contexts in the application and their relationships. Use the following template:

```
@startuml
title Context Diagram
skinparam componentStyle rectangle

component "ContextName" as ContextName
component "AnotherContext" as AnotherContext

ContextName --> AnotherContext
@enduml
```

### Data Flow Diagrams

Data flow diagrams should show the data flow between components and external systems. Use the following template:

```
@startuml
title Data Flow Diagram
skinparam componentStyle rectangle

actor User
component "Component" as Component
database "Database" as Database

User -> Component: Input
Component -> Database: Store Data
Database -> Component: Retrieve Data
Component -> User: Display Data
@enduml
```

## Cross-References

Use relative paths for linking between documentation files. Don't include the `.md` extension in links.

Examples:

```markdown
See the [Authentication Flow](../product/ux/authentication-flow) for more information.

For more details on Firebase integration, see the [Firebase Integration](../architecture/firebase-integration) documentation.
```

## Documentation Structure

Follow the existing documentation structure:

- `/docs/product/` - Product documentation

  - `/docs/product/vision.md` - Product vision and goals
  - `/docs/product/features.md` - Feature overview
  - `/docs/product/features/` - Detailed feature documentation
  - `/docs/product/ux/` - User experience documentation

- `/docs/architecture/` - Architecture documentation

  - `/docs/architecture/overview.md` - Architecture overview
  - `/docs/architecture/components.md` - Component overview
  - `/docs/architecture/components/` - Detailed component documentation
  - `/docs/architecture/patterns.md` - Implementation patterns
  - `/docs/architecture/firebase-integration.md` - Firebase integration
  - `/docs/architecture/google-sheets-integration.md` - Google Sheets integration

- `/docs/testing/` - Testing documentation

  - `/docs/testing/integration-testing.md` - Integration testing strategy
  - `/docs/testing/google-oauth-testing.md` - Google OAuth testing

- `/docs/api/` - API documentation (generated)

  - `/docs/api/components/` - Component API documentation
  - `/docs/api/hooks/` - Hook API documentation
  - `/docs/api/contexts/` - Context API documentation
  - `/docs/api/utilities/` - Utility function API documentation

- `/docs/components/` - Component documentation (generated)

  - Detailed documentation for each component

- `/docs/diagrams/` - Architectural diagrams (generated)

  - Component diagrams
  - Context diagrams
  - Data flow diagrams
  - Dependency graphs
  - Module graphs

- `/docs/coverage/` - Code coverage reports (generated)
  - Line coverage
  - Branch coverage
  - Function coverage
  - Statement coverage

## Documentation Best Practices

1. **Keep It Current**: Update documentation with code changes.
2. **Make It Findable**: Use clear file names and maintain a logical structure.
3. **Keep It Useful**: Focus on practical information and include examples.
4. **Make It Clear**: Use simple language and break down complex topics.
5. **Include Context**: Explain why things work the way they do, not just how.
6. **Use Examples**: Provide examples to illustrate concepts.
7. **Cross-Reference**: Link related documentation to help users find relevant information.
8. **Use Diagrams**: Include diagrams to visualize complex concepts.
9. **Document Decisions**: Explain the rationale behind important decisions.
10. **Document Limitations**: Be honest about limitations and edge cases.

## Documentation Review Process

1. **Self-Review**: Review your own documentation for clarity, completeness, and accuracy.
2. **Peer Review**: Have a colleague review your documentation.
3. **Technical Review**: Have a technical expert review your documentation for accuracy.
4. **User Review**: If possible, have a potential user review your documentation for usability.
5. **Update**: Update documentation based on feedback.

## Documentation Maintenance

1. **Regular Review**: Review documentation regularly for accuracy and completeness.
2. **Update with Code Changes**: Update documentation when code changes.
3. **Archive Outdated Documentation**: Archive documentation that is no longer relevant.
4. **Track Changes**: Track changes to documentation to maintain a history.
5. **Versioning**: Version documentation to match code versions.
