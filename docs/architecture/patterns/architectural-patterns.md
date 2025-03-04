# Architectural Patterns

## Hexagonal Architecture Implementation

- **Separate Domain Logic from External Adapters**

  - Keep business logic independent of UI and external services
  - Use interfaces (ports) to define interactions with external systems
  - Implement adapters that conform to these interfaces

- **Context API as Dependency Injection**

  - Use React Context providers as adapters for external services
  - Inject dependencies through context rather than direct imports
  - Example: `FirebaseContext`, `GoogleSheetsContext`, `AuthContext`

- **Interface-First Development**
  - Define interfaces before implementations
  - Create in-memory implementations for testing
  - Implement real adapters that conform to the same interfaces

```typescript
// Port (Interface)
interface DataStoragePort {
  getData(): Promise<Data>;
  saveData(data: Data): Promise<void>;
}

// Adapter Implementation
export const StorageProvider: React.FC = ({ children }) => {
  // Implementation details...
  const value: DataStoragePort = {
    getData,
    saveData,
  };

  return (
    <StorageContext.Provider value={value}>
      {children}
    </StorageContext.Provider>
  );
};
```

## Component Architecture Guidelines

- **Single Responsibility Components**

  - Each component should do one thing well
  - Split complex components into smaller, focused ones
  - Use composition to build complex UIs

- **Container/Presentation Pattern**

  - Separate data fetching (containers) from rendering (presentation)
  - Containers handle state, data fetching, and business logic
  - Presentation components are pure and focused on rendering

- **Component Composition Over Inheritance**
  - Use composition to share functionality between components
  - Pass components as props for flexible UI composition
  - Use higher-order components and hooks for cross-cutting concerns

## State Management Principles

- **Appropriate State Location**

  - Local component state for UI-only concerns
  - Context API for shared state across components
  - External services for persistent state

- **Immutable State Updates**

  - Always update state immutably
  - Use spread operators, map, filter, and reduce for updates
  - Leverage React's useState and useReducer for complex state

- **Minimize State**
  - Only store necessary data in state
  - Derive values when possible instead of storing them
  - Use memoization for expensive calculations

## Implementation Checklist

When implementing new features:

1. ✅ Define interfaces for external dependencies
2. ✅ Create in-memory implementations for testing
3. ✅ Implement domain logic independent of external services
4. ✅ Create adapters for external services
5. ✅ Use dependency injection via Context API
6. ✅ Split UI into container and presentation components
7. ✅ Place state at the appropriate level
