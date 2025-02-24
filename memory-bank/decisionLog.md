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
