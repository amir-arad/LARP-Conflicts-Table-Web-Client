# System Patterns

This document captures the key architectural and design patterns identified in the LARP Conflicts Table Web Client.

## Architectural Patterns

### 1. Provider Pattern

The application extensively uses the Provider Pattern through React Context to make services and state available throughout the component tree.

**Implementation:**

- `AuthProvider`: Authentication state and operations
- `FirebaseProvider`: Firebase database access
- `GoogleSheetsProvider`: Google Sheets API access
- `LanguageProvider`: Language selection and translation
- `I18nProvider`: Internationalization messages

**Benefits:**

- Avoids prop drilling
- Centralizes state management
- Enables dependency injection for testing
- Provides clear service boundaries

### 2. Hooks Pattern

Custom hooks encapsulate complex logic and make it reusable across components.

**Implementation:**

- `useConflictsTable`: Table data management
- `usePresence`: User presence tracking
- `useFlags`: Feature flags and filters
- `useTranslations`: Internationalization access
- `useRtlUtils`: Right-to-left language support

**Benefits:**

- Separates concerns between UI and business logic
- Enables composition of behavior
- Improves testability
- Provides clear API for components

### 3. Optimistic UI Pattern

The application updates the UI immediately before confirming changes with the backend, providing a responsive user experience.

**Implementation:**

- Immediate UI updates when editing cells
- Lock acquisition before confirmation
- Local state updates before API calls

**Benefits:**

- Improved perceived performance
- Better user experience
- Reduced waiting time
- Graceful handling of network delays

### 4. Event-Driven Architecture

Firebase Realtime Database enables an event-driven architecture where changes trigger updates across clients.

**Implementation:**

- Subscription to presence changes
- Subscription to lock state changes
- Real-time updates based on database events

**Benefits:**

- Decoupled components
- Real-time responsiveness
- Scalable communication model
- Natural fit for collaboration features

## Design Patterns

### 1. Adapter Pattern

The application uses adapters to normalize external APIs and provide a consistent interface.

**Implementation:**

- `GoogleSheetsContext`: Adapts Google Sheets API
- `FirebaseContext`: Adapts Firebase RTDB API
- Test drivers and mocks

**Benefits:**

- Isolates external dependencies
- Simplifies testing with mock implementations
- Provides consistent interface for components
- Reduces impact of API changes

### 2. Composite Pattern

The table structure uses a composite pattern to represent the hierarchy of roles, conflicts, and motivations.

**Implementation:**

- `CellNode` as the base interface
- `RoleData`, `ConflictData`, and `MotivationData` as specialized types
- Nested structure with parent-child relationships

**Benefits:**

- Unified treatment of different cell types
- Natural representation of the table structure
- Simplified traversal and manipulation
- Clear relationships between entities

### 3. Observer Pattern

The application uses the observer pattern for real-time updates and state synchronization.

**Implementation:**

- Firebase `onValue` subscriptions
- React state updates based on observed changes
- Presence and lock state observations

**Benefits:**

- Real-time updates across clients
- Decoupled state management
- Reactive UI updates
- Simplified state synchronization

### 4. Strategy Pattern

Different strategies are used for different types of cells and operations.

**Implementation:**

- Different cell rendering strategies based on type
- Different update strategies for roles, conflicts, and motivations
- Different lock handling strategies based on cell state

**Benefits:**

- Encapsulates variation in behavior
- Simplifies conditional logic
- Enables extension without modification
- Improves code organization

## UI Patterns

### 1. Compound Components

The table uses compound components to create a cohesive UI while separating concerns.

**Implementation:**

- `ConflictsTableTool` as the container
- `EditableTableCell` for general cells
- `MotivationTableCell` for motivation cells
- `LockIndicator` for lock visualization

**Benefits:**

- Clear separation of concerns
- Reusable components
- Consistent styling and behavior
- Simplified parent component

### 2. Controlled Components

Form elements are implemented as controlled components with React state.

**Implementation:**

- Cell editing with controlled input
- Form validation and submission
- State management for edits

**Benefits:**

- Predictable behavior
- Centralized state management
- Simplified validation
- Controlled updates

### 3. Responsive Design

The UI adapts to different screen sizes and orientations.

**Implementation:**

- Tailwind CSS responsive classes
- Flexible layouts
- Overflow handling for tables
- Mobile-friendly controls

**Benefits:**

- Works across devices
- Consistent user experience
- Accessible on various screen sizes
- Future-proof design

### 4. Visual Feedback

The application provides clear visual feedback for user actions and system state.

**Implementation:**

- Lock indicators
- Active user avatars
- Connection status indicator
- Loading and error states

**Benefits:**

- Improved user experience
- Clear communication of system state
- Reduced user confusion
- Accessible design

## Testing Patterns

### 1. Mock Driver Pattern

The application uses mock drivers to simulate external dependencies in tests.

**Implementation:**

- `mockAuthState`: Simulates authentication state
- `mockFirebaseAPI`: Simulates Firebase database operations
- `mockGoogleSheetsAPI`: Simulates Google Sheets API
- Enhanced mock drivers for integration tests

**Benefits:**

- Isolates tests from external dependencies
- Enables precise control over test scenarios
- Makes tests faster and more reliable
- Allows testing of error conditions and edge cases

### 2. Test Wrapper Pattern

A test wrapper provides all required providers and context for component testing.

**Implementation:**

- `createTestWrapper`: Creates a wrapper with all providers
- Injection of mock implementations
- State management for test scenarios
- Helper functions for common operations

**Benefits:**

- Simplifies test setup
- Ensures consistent test environment
- Enables realistic component testing
- Reduces boilerplate in tests

### 3. Arrange-Act-Assert Pattern

Tests are structured with clear setup, action, and verification phases.

**Implementation:**

- Arrange: Set up test environment and data
- Act: Perform the action being tested
- Assert: Verify the expected outcome

**Benefits:**

- Clear test structure
- Improved readability
- Easier debugging
- Consistent test approach

### 4. User Flow Testing Pattern

Integration tests are organized by user flows rather than by components or features.

**Implementation:**

- Auth Flow: Login, error handling, and presence management
- Table Operations: Adding, removing, and editing conflicts, roles, and motivations
- Collaboration: Presence visualization, cell locking, and multi-user interaction

**Benefits:**

- Aligns with how users actually use the application
- Ensures critical paths are tested end-to-end
- Makes tests more resilient to implementation changes
- Focuses on user value rather than implementation details

### 5. Page Object Pattern

Complex pages or components are encapsulated in page objects for testing.

**Implementation:**

- `ConflictsTablePage`: Encapsulates table interactions
- Methods for common operations (add conflict, add role, etc.)
- Accessors for page state and elements

**Benefits:**

- Encapsulates page structure and behavior
- Reduces duplication in tests
- Improves test maintainability
- Provides clear API for tests

### 6. Data Builder Pattern

Test data is created using builder functions for flexibility and reuse.

**Implementation:**

- Functions to build test data with default values
- Options to customize specific aspects of the data
- Consistent data structure across tests

**Benefits:**

- Reduces duplication in test data setup
- Makes tests more readable
- Ensures consistent test data
- Simplifies test maintenance

### 7. Storybook Integration Test Fixtures Pattern

Using Storybook stories as fixtures for integration tests, combining visual documentation with automated testing.

**Implementation:**

- Shared fixtures library for auth, sheet data, and presence state
- Storybook decorators that provide the same context as the test wrapper
- Stories that represent integration test scenarios
- Vitest adapter to use Storybook stories as test fixtures
- Storybook test runner for automated testing of stories

**Benefits:**

- Visual development and debugging of test fixtures
- Reusability between tests and documentation
- Consistent test data across different tests
- Better developer experience and collaboration
- Living documentation of test scenarios
- Easier maintenance of test fixtures
- Improved test coverage and quality

### 8. Stateful Mock Pattern

Creating stateful mocks that maintain in-memory state across multiple operations to simulate complex external dependencies.

**Implementation:**

- `StatefulSheetsAPI`: Stateful mock for Google Sheets API
- In-memory storage using data structures that match the external service
- Translation layer between API notation and internal representation
- Support for complex operations like range updates and error simulation
- Helper methods for test setup and verification

**Benefits:**

- Enables testing of complex user flows that involve multiple operations
- Provides higher fidelity simulation of external services
- Maintains state consistency across test steps
- Reduces test brittleness and setup complexity
- Allows testing of edge cases and error conditions
- Complements the Storybook integration test fixtures approach

### 9. Simplified Component Pattern for Storybook

Creating simplified versions of complex components specifically for Storybook to focus on the essential aspects of the component without the complexity of the full implementation.

**Implementation:**

- `SimplifiedApp`: Simplified version of the main application component
- `SimplifiedConflictsTableTool`: Simplified version of the conflicts table tool
- `LoginScreen`: Simplified login screen component
- `ErrorScreen`: Simplified error screen component
- Focused on visual representation rather than full functionality

**Benefits:**

- Reduces complexity in Storybook stories
- Focuses on the essential aspects of the component
- Makes it easier to understand the component's behavior
- Improves story maintainability
- Enables faster story development
- Provides clearer visual documentation

### 10. State-Based Story Pattern

Creating Storybook stories based on different states of a component or application, using fixtures to simulate these states.

**Implementation:**

- Auth Flow Stories: Initial, Authenticating, Authenticated, Error states
- Using auth fixtures to simulate different authentication states
- Story decorators that provide the necessary context for each state
- Simplified components that respond to the state

**Benefits:**

- Clearly demonstrates different component states
- Makes it easy to understand state transitions
- Provides visual documentation of different states
- Enables testing of state-specific behavior
- Improves test coverage by ensuring all states are tested
- Serves as both documentation and test fixtures
