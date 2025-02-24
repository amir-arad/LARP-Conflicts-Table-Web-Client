# Decision Log

This document tracks key architectural and implementation decisions made during the development of the LARP Conflicts Table Web Client.

## February 24, 2025 - Initial Architecture Review

**Context:** Comprehensive review of the existing architecture and implementation to understand the system design and collaboration features.

**Decisions Identified:**

### 1. Decentralized Architecture with Google Sheets + Firebase

**Context:** Need for persistent data storage with real-time collaboration capabilities.

**Decision:** Use Google Sheets as the source of truth for data persistence and Firebase Realtime Database for real-time collaboration features.

**Rationale:**

- Google Sheets provides familiar interface and built-in sharing/permissions
- Firebase RTDB offers real-time synchronization with minimal setup
- Decentralized approach avoids need for dedicated backend server
- Combination leverages strengths of both platforms

**Implementation:**

- GoogleSheetsContext for Sheets API interactions
- FirebaseContext for RTDB operations
- Clear separation of concerns between data persistence and real-time features

### 2. Optimistic UI Locking for Concurrency

**Context:** Need to prevent conflicts when multiple users edit the same content simultaneously.

**Decision:** Implement optimistic UI locking with visual indicators rather than pessimistic database locking.

**Rationale:**

- Simpler implementation than conflict resolution
- Better user experience with clear visual feedback
- Reduced backend complexity
- Social protocol (showing who is editing what) reduces conflict likelihood
- TTL-based expiration prevents permanent locks

**Implementation:**

- Lock state visualization in UI
- Firebase RTDB for lock tracking
- 30-second TTL for automatic lock expiration
- Clear user feedback on locked state

### 3. React Context for State Management

**Context:** Need for state management across components with different concerns.

**Decision:** Use React Context API for state management instead of Redux or other state management libraries.

**Rationale:**

- Appropriate complexity level for the application
- Natural fit for provider pattern used throughout the app
- Easier testing with context injection
- Reduced dependencies and bundle size
- Clear separation of concerns with multiple contexts

**Implementation:**

- AuthContext for authentication state
- FirebaseContext for Firebase operations
- GoogleSheetsContext for Sheets API
- LanguageContext for internationalization

### 4. Custom Hooks for Feature Encapsulation

**Context:** Need to encapsulate complex logic and make it reusable across components.

**Decision:** Implement custom hooks for specific features like table management, presence, and flags.

**Rationale:**

- Encapsulates complex logic in reusable units
- Separates concerns between UI and business logic
- Improves testability with mock implementations
- Provides clear API for components to consume

**Implementation:**

- useConflictsTable for table data management
- usePresence for user presence tracking
- useFlags for feature flags and filters
- useTranslations for internationalization

### 5. Internationalization Support

**Context:** Need to support multiple languages for the application.

**Decision:** Implement custom internationalization solution with context provider.

**Rationale:**

- Specific needs for LARP terminology translation
- Support for right-to-left languages (Hebrew)
- Lightweight implementation for the application's needs
- Easy integration with the existing context system

**Implementation:**

- LanguageContext for language selection
- I18nProvider for message loading
- useTranslations hook for component access
- RTL utilities for right-to-left support

## February 24, 2025 - Integration Testing Strategy

**Context:** Need to implement fast, reliable integration tests for the application to ensure it works correctly as a whole.

**Decisions:**

### 1. Vitest with JSDOM for Integration Tests

**Context:** Need to choose a testing approach that balances speed and realism for integration tests.

**Decision:** Use Vitest with JSDOM as the primary testing approach for integration tests.

**Rationale:**

- Integrates well with the existing Vite setup
- Provides fast test execution compared to browser-based alternatives
- Has a familiar API similar to Jest
- Supports TypeScript natively
- Allows for parallel test execution
- Provides good developer experience with watch mode

**Implementation:**

- Configure Vitest to use JSDOM environment
- Set up test helpers for rendering components with all required providers
- Create a consistent test structure using Arrange-Act-Assert pattern
- Use React Testing Library for component interactions

### 2. Mock External Dependencies

**Context:** Need to test the application without relying on external services.

**Decision:** Enhance existing mock drivers to better support integration testing.

**Rationale:**

- Makes tests faster and more reliable
- Avoids hitting real external services during tests
- Allows for precise control over test scenarios
- Leverages existing mock infrastructure
- Enables testing of error conditions and edge cases

**Implementation:**

- Enhance Auth API mock with support for simulating login, errors, and auth process
- Enhance Firebase API mock with support for presence, locking, and collaboration features
- Enhance Google Sheets API mock with support for data loading, updating, and error conditions
- Create helper functions for common testing tasks

### 3. Phased Implementation Approach

**Context:** Need to implement integration tests in a structured way that provides value incrementally.

**Decision:** Implement integration tests in phases, starting with the most critical user flows.

**Rationale:**

- Allows for incremental progress and feedback
- Focuses on the most critical parts of the application first
- Builds confidence in the testing approach
- Enables early detection of issues with the testing strategy
- Provides a clear roadmap for implementation

**Implementation:**

- Phase 1: Setup and Infrastructure (1-2 days)
- Phase 2: Auth Flow Tests (1-2 days)
- Phase 3: Table Operations Tests (2-3 days)
- Phase 4: Collaboration Tests (2-3 days)
- Phase 5: Error Handling and Edge Cases (1-2 days)
- Phase 6: Test Optimization and CI/CD Integration (1-2 days)

### 4. Test Organization by User Flows

**Context:** Need to organize tests in a way that reflects how users interact with the application.

**Decision:** Organize integration tests by user flows rather than by components or features.

**Rationale:**

- Aligns with how users actually use the application
- Ensures critical paths are tested end-to-end
- Makes tests more resilient to implementation changes
- Provides better documentation of expected behavior
- Focuses on user value rather than implementation details

**Implementation:**

- Auth Flow: Login, error handling, and presence management
- Table Operations: Adding, removing, and editing conflicts, roles, and motivations
- Collaboration: Presence visualization, cell locking, and multi-user interaction
- Error Handling: Network errors, API errors, and edge cases
