# Integration Testing Requirements

## Overview

This document defines the requirements for implementing comprehensive integration tests for the application. The tests must cover nearly the entire app while excluding the wiring code (e.g., `main.tsx`) and external data drivers (e.g., `AuthContext.tsx`, `LanguageContext.tsx`, `useGoogleSheet.ts`, `firebase.ts`). The goal is to simulate realistic user interactions using a fully mocked I/O environment.

## Objectives

- **Core Focus:** Test the complete application flow, excluding only the application bootstrapping and external I/O.
- **Mocking I/O:** Replace all external data interactions (Firebase, Google Sheets, authentication, language services) with controlled, predictable mocks.
- **User-Centric Testing:** Emulate user behavior using React Testing Library to ensure tests reflect real-world usage.

## Scope

- **Included:**
  - Integration tests for components and features.
  - Testing of UI interactions and component integrations.
- **Excluded:**
  - Application wiring code (e.g., `main.tsx`).
  - Dependency injection setup via React contexts for drivers.
  - Real implementations of drivers.

## Technical Requirements

### 1. Application Structure & Dependency Injection

- **Separation of Concerns:**
  - Isolate core application logic and UI components from wiring and external data drivers.
- **Context-Based Drivers:**
  - Refactor drivers (Firebase, Google Sheets, Auth, Language) into dedicated React contexts. Auth and Language have already been refactored.
  - Ensure that these contexts can be easily overridden with mock implementations in the test environment.
- **Modular Code Organization:**
  - Organize code by features or domains, not by technical layers, to simplify test boundaries.

### 2. Test Environment & Tools

- **Vitest:**
  - Use Vitest as the test runner to leverage its speed, modern features, and tight integration with Vite.
- **React Testing Library (RTL):**
  - Use RTL to simulate user interactions, querying elements by role, label, or text.
  - Ensure tests focus on behavior rather than implementation details.
- **Storybook Integration:**
  - Utilize Storybook for visual documentation and as a source for snapshot tests (using Storyshots).
  - Using Storybook stories as fixtures for integration tests allows us to leverage pre-configured component setups with realistic props and context providers. Since stories are essentially functions returning rendered components, they can be directly imported into tests and rendered using tools like React Testing Library. This ensures consistency between our UI documentation and test cases while reducing duplication. Additionally, Storybook's play() functions can simulate user interactions, making it easier to validate behavior in tests. By combining Vitest with Storybook's test-runner, we can automate UI consistency checks and accessibility testing, ensuring that components work as expected across different scenarios.
- **I/O Mocking Strategy:**
  - Do not rely on network interception tools (e.g., MSW). Instead, inject mocks/stubs for all I/O drivers via context providers.
  - Ensure mocks accurately simulate all possible states and responses of the real I/O drivers.

### 3. Implementation Guidelines

- **Test Isolation:**
  - Ensure tests run in a deterministic environment by fully controlling all external dependencies through mocks.
- **Maintainability:**
  - Keep mock implementations and test-specific code separate from production code.
  - Document context providers and mock interfaces to ensure clarity and ease of updates.
- **User Interaction Simulation:**
  - Write tests that simulate realistic user behavior rather than relying on implementation details.
  - Prefer queries that reflect accessibility best practices (e.g., by role, accessible name).

### 4. Mocking Strategy & Test Scope

- **Core Logic to Test (Not Mocked):**

  - Presence management logic (usePresence hook)
  - Real-time update handling
  - User interaction flows
  - State management and UI updates

- **External I/O to Mock:**

  - Low-level Firebase Database Operations:
    ```typescript
    interface FirebaseContext {
      getDatabaseRef: (path: string) => DatabaseReference;
      setupDisconnectCleanup: (
        ref: DatabaseReference,
        cleanup: unknown
      ) => Promise<void>;
      onValue: (
        ref: DatabaseReference,
        callback: (snapshot: DataSnapshot) => void
      ) => () => void;
      set: (ref: DatabaseReference, data: unknown) => Promise<void>;
    }
    ```
  - Google Sheets API calls
  - Authentication state

- **Minimal Mocking Approach:**
  - Mock only the essential external I/O operations
  - Maintain real business logic and component interactions
  - Focus on simulating the necessary responses for the happy flow

### 5. Happy Flow Test Scenario

The initial integration test will cover a basic user journey:

1. **User Authentication:**

   - User logs in
   - System establishes presence
   - Mock only the auth token generation and Firebase auth state

2. **Motivation Changes:**

   - User selects and modifies a motivation
   - Real presence logic tracks and broadcasts the change
   - Mock only the underlying Firebase database operations

3. **Role Name Changes:**

   - User updates a role name
   - System persists the change
   - Mock the Google Sheets API call while testing real update logic

4. **Multi-user Awareness:**
   - System shows another user's activity
   - Test real presence update handling
   - Mock only the incoming Firebase database events

Example Test Structure:

```typescript
test('happy flow user journey', async () => {
  // Setup minimal mocks for external I/O
  const mockFirebase = {
    getDatabaseRef: (path) => ({
      key: path,
      // Minimal DatabaseReference implementation
    }),
    onValue: (ref, callback) => {
      // Simulate real-time updates
      callback({
        val: () => ({ /* mock data */ })
      });
      return () => {};
    },
    // Other minimal Firebase operation mocks
  };

  render(
    <FirebaseProvider value={mockFirebase}>
      <GoogleSheetsProvider value={mockGoogleSheets}>
        <App />
      </GoogleSheetsProvider>
    </FirebaseProvider>
  );

  // Test real user interactions and presence logic
  await userEvent.click(screen.getByRole('button', { name: /login/i }));
  await userEvent.click(screen.getByRole('cell', { name: /motivation/i }));
  // ... additional interaction steps
});
```

## Deliverables

- A robust integration test suite that:
  - Covers the full application flow (excluding wiring and real I/O).
  - Uses dependency injection approach to seamlessly swap real drivers with mocks.
  - Simulates user interactions through RTL and validates UI behavior.
  - Incorporates Storybook (and optionally Storyshots/Chromatic) for visual consistency testing.
- Comprehensive documentation on test setup, mock implementations, and execution instructions.

## Conclusion

This integration testing strategy ensures a maintainable, realistic, and fast testing environment. By decoupling core logic from external I/O and utilizing modern testing tools (Vitest, RTL, Storybook), the test suite will validate the application's behavior in a manner that closely mirrors actual user interactions while ensuring external dependencies do not interfere with test outcomes.
