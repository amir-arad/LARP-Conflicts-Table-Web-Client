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
