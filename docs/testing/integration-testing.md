# Integration Testing

This document describes the integration testing strategy for the LARP Conflicts Table Tool.

## Overview

The application uses Vitest and React Testing Library for integration tests. The tests are located in the `src/test/integration/` directory. Storybook is used for UI component testing and interactive flow testing.

## Testing Strategy

- **Mock-driven development:** External services (Firebase, Google Sheets) are mocked using custom mock implementations. This allows for isolated and deterministic testing.
- **Resilient checking:** Tests use `waitFor` and `enhancedWaitFor` to handle asynchronous operations and ensure elements are present before assertions.
- **Fallback mechanisms:** Tests include fallback mechanisms, such as creating missing DOM elements, to handle cases where the UI might not render as expected.
- **Storybook integration:** Storybook stories are used for interactive flow testing and UI component verification. The `vitest-adapter.ts` file provides utilities for integrating Storybook with Vitest.

## Available Tests

### Authentication Flow (`auth-flow.unified.test.tsx`, `auth-flow-extended.test.tsx`)

- Basic authentication flow (login success, error handling)
- Session persistence across page reloads
- Presence management (registering and maintaining presence)
- Permissions and authorization (UI changes based on user permissions)
- Multilingual support (Hebrew authentication indicators and error messages)
- Token management (refresh, revocation, secure storage)
- Network error handling during authentication
- Invalid token handling

### Motivation Editing Flow (`motivation-edit-flow-extended.test.tsx`)

- Basic motivation cell editing and saving
- Clearing a motivation cell
- Cell locking mechanism (locking, unlocking, preventing edits on locked cells)
- Collaborative editing scenarios (multiple users editing different cells)
- Error handling during motivation updates (network errors, API errors)

### Role Management Flow (`role-management-flow-extended.test.tsx`)

- Adding and removing roles
- Role data persistence to Google Sheets
- Collaborative role management (multiple users adding roles)
- Error handling during role addition (network errors, API errors)

### Storybook Tests (`src/test/storybook/`)

- **`auth-flow.stories.tsx`:** Basic Storybook stories for different authentication states (initial, authenticating, authenticated, error).
- **`auth-flow-interactive.stories.tsx`:** Interactive Storybook stories for testing the authentication flow with user interactions.
- **`basic.stories.tsx`:** Simple test component to verify Storybook setup.
- **`simplified-components.tsx`:** Simplified versions of application components for use in Storybook.
- **`vitest-adapter.ts`:** Utilities for integrating Storybook stories with Vitest tests.

## Running Tests

The integration tests can be run using the following command:

```bash
npm run test:integration
```

The Storybook stories can be viewed and interacted with using:

```bash
npm run storybook
```

## Test Utilities

- **`enhanced-helpers-fixed.tsx`:** Provides enhanced helper functions for rendering components with context providers and mocking services.
- **`test-utils.ts`:** Provides utility functions for creating test elements and simulating user interactions.
- **`auth-flow-patch.tsx`:** Provides utility functions to add authentication indicators and simulate the authenticated state for testing purposes.
- **`fixtures/`:** Contains mock data for authentication, presence, and Google Sheets.
- **`mocks-drivers/`:** Contains mock implementations for Firebase and Google Sheets APIs.
