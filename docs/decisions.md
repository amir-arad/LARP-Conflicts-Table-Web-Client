# Decision Records

This document records key architectural, implementation, and product decisions made during the development of the LARP Conflicts Table Tool.

## Backend Selection

- **Context:** Need for a data storage and real-time collaboration solution.
- **Options Considered:**
  - Custom backend with a database (e.g., PostgreSQL, MongoDB).
  - Firebase Realtime Database.
  - Google Sheets.
- **Decision:** Use Google Sheets for data storage and Firebase Realtime Database for real-time presence and locking.
- **Rationale:**
  - Google Sheets provides a familiar and user-friendly interface for managing data.
  - Firebase offers built-in real-time capabilities, including presence and data synchronization, simplifying the implementation of collaborative features.
  - This combination simplifies development and reduces infrastructure overhead.
- **Consequences:**
  - Simplified data management.
  - Real-time collaboration features.
  - Dependency on Google services.
- **Status:** Active.

## Authentication Approach

- **Context:** Need to authenticate users to enable collaboration and data security.
- **Options Considered:**
  - Custom authentication system.
  - Firebase Authentication.
  - Google Sign In.
- **Decision**: Use Google Sign-In.
- **Rationale**:
  - Simplifies implementation.
  - Provides a secure and familiar authentication flow for users.
  - Integrates well with Google Sheets.
- **Consequences**:
  - Dependency on Google services.
  - Users need a Google account.
- **Status**: Active.

## Concurrency Model

- **Context:** Need to manage concurrent edits to the conflicts table.
- **Options Considered:**
  - Pessimistic Locking (preventing concurrent edits entirely).
  - Optimistic Locking (allowing concurrent edits and handling conflicts on save).
  - Operational Transformation (complex algorithm to merge concurrent changes).
- **Decision:** Use Optimistic UI Locking.
- **Rationale:**
  - Provides a good balance between user experience and implementation complexity.
  - Allows for simultaneous editing of different cells.
  - Minimizes conflicts through UI-level locking.
  - Relies on social protocols and user awareness to avoid most conflicts.
- **Consequences:**
  - Simpler implementation compared to pessimistic locking or operational transformation.
  - Potential for data loss in rare cases of simultaneous edits to the same cell (last-write-wins).
- **Status:** Active.

## UI Framework Selection

- **Context:** Need to choose a UI framework for building the application.
- **Options Considered:**
  - Angular
  - Vue.js
  - React
- **Decision:** Use React.
- **Rationale:**
  - Large and active community.
  - Component-based architecture promotes code reusability.
  - Extensive ecosystem of libraries and tools.
  - Good performance with virtual DOM.
  - Familiarity for the development team.
- **Consequences:**
  - Need to manage component state and lifecycle.
  - Requires learning JSX syntax.
- **Status:** Active.

## Styling Approach

- **Context:** Need to choose a styling approach for the application.
- **Options Considered:**
  - Plain CSS
  - CSS Modules
  - Styled Components
  - Tailwind CSS
- **Decision:** Use Tailwind CSS.
- **Rationale:**
  - Utility-first approach promotes rapid development.
  - Provides a consistent design system.
  - Reduces the need to write custom CSS.
  - Good for maintainability and scalability.
- **Consequences:**
  - Can lead to verbose HTML class names.
  - Requires learning Tailwind's utility classes.
- **Status:** Active.

## State Management Approach

- **Context:** Need to manage application state, including user authentication, table data, and UI state.
- **Options Considered:**
  - React's built-in `useState` and `useReducer` hooks.
  - Redux.
  - Zustand.
  - Recoil.
  - MobX.
- **Decision:** Use React Context API and custom hooks.
- **Rationale:**
  - Sufficient for the application's complexity.
  - Avoids introducing external state management libraries.
  - Provides a simple and flexible way to manage global state.
  - Leverages React's built-in features.
- **Consequences:**
  - Requires careful organization of context providers and hooks.
  - May become less manageable for very large and complex applications.
- **Status:** Active.

## Collaboration Feature Implementation Priority

- **Context:** Need to prioritize implementation of real-time collaboration features.
- **Options Considered:**
  - Prioritize completing the lock mechanism.
  - Prioritize implementing live cursor indicators.
- **Decision:** Prioritize verifying and fixing lock visualization features, then complete the lock mechanism, and defer cursor tracking.
- **Rationale:**
  - Lock visualization is a prerequisite for a functional lock mechanism.
  - Lock mechanism is more critical for preventing data conflicts.
  - Cursor tracking is a less critical feature.
- **Consequences:**
  - Focus on ensuring a robust and user-friendly locking experience.
  - Delay of live cursor indicators.
- **Status:** Active.

## UI Testing Strategy

- **Context:** Need for an effective approach to testing UI components and flows.
- **Options Considered:**
  - Traditional integration tests.
  - Storybook-based testing.
- **Decision:** Use Storybook exclusively for all flow tests involving UI components.
- **Rationale:**
  - Storybook provides direct visual verification of UI components.
  - Interactive testing in Storybook allows for comprehensive user flow testing.
  - Storybook serves as self-documenting UI component library.
- **Consequences:**
  - Shift in testing approach, requiring creation of Storybook stories.
  - Potentially less reliance on traditional integration tests for UI.
- **Status:** Active.

## Lock Visualization Verification Approach

- **Context:** Lock visualization components were reportedly implemented but not functioning correctly.
- **Options Considered:**
  - Debugging existing implementation directly.
  - Test-first approach with Storybook.
- **Decision:** Adopt a test-first approach, creating comprehensive Storybook tests before fixing the issues.
- **Rationale:**
  - Tests establish clear verification criteria.
  - Visual testing in Storybook provides immediate feedback.
  - Tests can isolate rendering issues from data flow problems.
- **Consequences:**
  - Upfront investment in test creation.
  - More robust and maintainable solution.
- **Status:** Active.
