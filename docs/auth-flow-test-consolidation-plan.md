# Authentication Flow Test Consolidation Plan

## Overview

This document outlines a step-by-step plan for consolidating and improving the authentication flow tests in the LARP Conflicts Table Web Client project. The plan is based on the findings from the comprehensive analysis of the existing test files.

## Implementation Timeline

### Phase 1: Preparation (1-2 days)

1. **Create a Unified Test Helper Module**

   - Create a new file `src/test/integration/enhanced-helpers.tsx`
   - Combine functionality from `helpers.tsx` and `story-helpers.tsx`
   - Add new helper functions for untested scenarios

2. **Standardize Mock Implementations**

   - Create standardized mock factories in `src/test/mocks-drivers/standardized-mocks.ts`
   - Ensure consistent behavior across all tests
   - Add support for new test scenarios (token refresh, session persistence, etc.)

3. **Create Test Fixtures for New Scenarios**
   - Add new fixtures to `src/test/fixtures/auth-fixtures.ts`
   - Include fixtures for token expiration, permission changes, network errors, etc.

### Phase 2: Core Implementation (2-3 days)

1. **Create the Unified Test File**

   - Create `src/test/integration/auth-flow.unified.test.tsx`
   - Implement basic structure with test categories
   - Port existing tests from both files with standardized approach

2. **Implement Basic Authentication Flow Tests**

   - Port the successful login test from both files
   - Ensure consistent assertions and mocking
   - Verify both UI elements and API interactions

3. **Implement Error Handling Tests**
   - Port error handling tests from both files
   - Add new error scenarios (network errors, invalid tokens, etc.)
   - Ensure comprehensive error state verification

### Phase 3: Advanced Scenarios (2-3 days)

1. **Implement Token Management Tests**

   - Add tests for token refresh
   - Add tests for token expiration
   - Add tests for invalid tokens

2. **Implement Session Management Tests**

   - Add tests for session persistence
   - Add tests for concurrent sessions
   - Add tests for session timeout

3. **Implement Network Resilience Tests**
   - Add tests for network interruptions
   - Add tests for slow connections
   - Add tests for offline mode

### Phase 4: Security and Edge Cases (1-2 days)

1. **Implement Security-Focused Tests**

   - Add tests for permission changes
   - Add tests for token security
   - Add tests for authentication bypass attempts

2. **Implement User Experience Tests**
   - Add tests for loading states
   - Add tests for error feedback
   - Add tests for accessibility during authentication

### Phase 5: Cleanup and Documentation (1 day)

1. **Remove Redundant Test Files**

   - Deprecate `auth-flow.test.tsx` and `auth-flow-interactive.test.tsx`
   - Update imports in other files if necessary
   - Update CI/CD configuration if necessary

2. **Update Documentation**
   - Update test documentation
   - Add examples of how to use the new test helpers
   - Document known limitations and future improvements

## Implementation Details

### Enhanced Test Helpers

```typescript
// src/test/integration/enhanced-helpers.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createTestWrapper } from '../test-wrapper';
import { getStory } from '../storybook/vitest-adapter';
import { vi } from 'vitest';

export function renderWithEnhancedWrapper(options = {}) {
  const {
    component = null,
    storyName = null,
    mockConfig = {},
  } = options;

  // Create test wrapper with standardized mocks
  const testWrapper = createTestWrapper();
  const user = userEvent.setup();

  // Determine what to render
  let elementToRender;
  if (storyName) {
    const Story = getStory(storyName);
    if (!Story) {
      throw new Error(`Story "${storyName}" not found`);
    }
    elementToRender = <Story />;
  } else if (component) {
    elementToRender = component;
  } else {
    // Default test component
    elementToRender = <DefaultTestComponent />;
  }

  // Render with wrapper
  const result = render(elementToRender, { wrapper: testWrapper.Wrapper });

  // Return enhanced helpers
  return {
    ...result,
    user,
    testWrapper,
    // Authentication helpers
    async login(options = { success: true }) {
      // Implementation
    },
    async logout() {
      // Implementation
    },
    async refreshToken() {
      // Implementation
    },
    // Network condition helpers
    simulateOffline() {
      // Implementation
    },
    simulateOnline() {
      // Implementation
    },
    simulateSlowConnection() {
      // Implementation
    },
    // Session helpers
    simulateTokenExpiration() {
      // Implementation
    },
    simulatePermissionChange(newPermissions) {
      // Implementation
    },
    simulateConcurrentSession() {
      // Implementation
    },
    // Verification helpers
    async verifyAuthenticatedState() {
      // Implementation
    },
    async verifyErrorState(errorType) {
      // Implementation
    },
    async verifyLoadingState() {
      // Implementation
    },
    async verifyFirebasePresence() {
      // Implementation
    },
  };
}
```

### Unified Test File Structure

```typescript
// src/test/integration/auth-flow.unified.test.tsx
import { screen, waitFor } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { renderWithEnhancedWrapper } from './enhanced-helpers';
import { authFixtures, sheetFixtures } from '../fixtures';

describe('Authentication Flow', () => {
  // Group 1: Basic Authentication Flow
  describe('Basic Authentication Flow', () => {
    test('completes authentication flow successfully', async () => {
      // Implementation
    });

    test('establishes presence after successful authentication', async () => {
      // Implementation
    });

    test('displays appropriate UI elements when authenticated', async () => {
      // Implementation
    });
  });

  // Group 2: Error Handling
  describe('Error Handling', () => {
    test('handles authentication errors gracefully', async () => {
      // Implementation
    });

    test('handles network errors during authentication', async () => {
      // Implementation
    });

    test('handles invalid tokens', async () => {
      // Implementation
    });
  });

  // Group 3: Token Management
  describe('Token Management', () => {
    test('refreshes token when expired', async () => {
      // Implementation
    });

    test('handles token revocation', async () => {
      // Implementation
    });

    test('securely stores tokens', async () => {
      // Implementation
    });
  });

  // Group 4: Session Management
  describe('Session Management', () => {
    test('maintains session across page reloads', async () => {
      // Implementation
    });

    test('handles concurrent sessions', async () => {
      // Implementation
    });

    test('handles session timeout', async () => {
      // Implementation
    });
  });

  // Group 5: Network Resilience
  describe('Network Resilience', () => {
    test('handles network interruptions during authentication', async () => {
      // Implementation
    });

    test('handles slow connections', async () => {
      // Implementation
    });

    test('handles offline mode', async () => {
      // Implementation
    });
  });

  // Group 6: Security
  describe('Security', () => {
    test('handles permission changes', async () => {
      // Implementation
    });

    test('prevents authentication bypass attempts', async () => {
      // Implementation
    });

    test('handles token security issues', async () => {
      // Implementation
    });
  });

  // Group 7: User Experience
  describe('User Experience', () => {
    test('displays appropriate loading states', async () => {
      // Implementation
    });

    test('provides clear error feedback', async () => {
      // Implementation
    });

    test('maintains accessibility during authentication', async () => {
      // Implementation
    });
  });
});
```

## Test Coverage Goals

The consolidated test suite should achieve the following coverage goals:

1. **Functional Coverage**:

   - 100% coverage of authentication flow states
   - 100% coverage of error scenarios
   - 100% coverage of token management scenarios

2. **Code Coverage**:

   - > 90% line coverage for `AuthContext.tsx`
   - > 90% line coverage for authentication-related components
   - > 80% branch coverage for authentication logic

3. **Scenario Coverage**:
   - All identified untested scenarios
   - Common user journeys
   - Edge cases and error conditions

## Success Criteria

The consolidation will be considered successful when:

1. All tests in the unified test suite pass consistently
2. The test coverage goals are met
3. The redundant test files can be safely removed
4. The test execution time is reduced or maintained
5. The test suite is well-documented and maintainable

## Risks and Mitigations

| Risk                             | Impact | Likelihood | Mitigation                                                  |
| -------------------------------- | ------ | ---------- | ----------------------------------------------------------- |
| Increased test complexity        | Medium | High       | Modularize test helpers and use clear naming conventions    |
| Test flakiness                   | High   | Medium     | Use robust waiting mechanisms and avoid timing dependencies |
| Missed edge cases                | Medium | Medium     | Conduct thorough code review and pair testing               |
| Performance degradation          | Low    | Low        | Monitor test execution time and optimize as needed          |
| Breaking changes in dependencies | High   | Low        | Pin dependency versions and use explicit imports            |

## Conclusion

This plan provides a structured approach to consolidating and improving the authentication flow tests in the LARP Conflicts Table Web Client project. By following this plan, the project will achieve better test coverage, improved maintainability, and enhanced security and user experience testing.

The implementation is divided into manageable phases with clear deliverables, allowing for incremental progress and early feedback. The end result will be a comprehensive, robust test suite that ensures the authentication flow works correctly in all scenarios.
