# Authentication Flow Test Action Plan

This document provides a step-by-step action plan for fixing the failing tests in the unified authentication flow test file.

## Step 1: Examine Enhanced Helpers

First, we need to understand how the test environment is set up:

1. Review `src/test/integration/enhanced-helpers.tsx`
2. Review `src/test/integration/helpers.tsx`
3. Identify any issues with act() wrapping, async operations, or state management
4. Document the patterns found in helper implementation

## Step 2: Fix Act() Wrapping Issues

Implement proper act() wrapping for all async operations:

1. Update `renderWithEnhancedWrapper` to ensure all state changes are wrapped
2. Fix any nested async operations in helper functions
3. Ensure Firebase and Google Sheets operations are properly wrapped
4. Address any act() warnings in the test output

## Step 3: Enhance Waitfor() Usage

Improve waitFor() usage throughout the tests:

1. Standardize waitFor() timeout values based on operation complexity
2. Add retry logic for flaky operations
3. Implement consistent waitFor() patterns for all async assertions
4. Create helper functions for common wait patterns

## Step 4: Make Element Assertions More Resilient

Improve the resilience of element assertions:

1. Implement try/catch blocks for all element queries
2. Use flexible text matching with regular expressions
3. Add fallback assertions for different UI states
4. Create helper functions for resilient assertions

## Step 5: Improve Mock Implementations

Enhance mock implementations to better simulate real behavior:

1. Update mock auth API to handle all auth scenarios
2. Enhance Firebase mock to better support presence testing
3. Improve Google Sheets mock for complex operations
4. Add better error simulation capabilities

## Step 6: Refactor Presence Maintenance Test

Rewrite the presence maintenance test to be more reliable:

1. Consider alternatives to fake timers
2. Implement more robust presence verification
3. Add more detailed assertions to isolate issues
4. Increase timeout values if needed

## Step 7: Implement and Test Fixes

Apply fixes systematically:

1. Start with fixing the simplest tests first
2. Run tests after each fix to verify improvement
3. Document successful patterns
4. Address one test group at a time

## Step 8: Verify and Finalize

Verify that all tests are passing:

1. Run the complete test suite
2. Verify that all 22 tests pass
3. Check for any new warnings or issues
4. Document any remaining concerns

## Step 9: Clean Up

Once all tests pass:

1. Remove redundant test files (auth-flow.test.tsx and auth-flow-interactive.test.tsx)
2. Update test documentation
3. Update auth-flow-test-implementation-history.md with lessons learned
4. Optimize test performance if needed

## Step 10: Integration with Broader Testing Plan

Integrate with the broader integration testing plan:

1. Apply lessons learned to other test files
2. Update integration testing plan as needed
3. Prioritize next test implementation based on findings
4. Document best practices for future test development

## Specific Test Fixes

Below are specific fixes for each failing test group:

### Basic Authentication Flow Tests

- Fix `completes authentication flow successfully using story`

  - Ensure story play function is properly wrapped in act()
  - Add proper error handling to the play function

- Fix `completes authentication flow successfully using test wrapper`
  - Ensure all Firebase operations are properly wrapped
  - Add waitFor() for presence registration

### Error Handling Tests

- Fix `handles authentication errors gracefully`
  - Improve error state verification
  - Add more flexible error message matching

### Token Management Tests

- Fix `refreshes token when expired`
  - Ensure token refresh operation is properly wrapped
  - Add waitFor() for token refresh completion

### Session Management Tests

- Fix `maintains session across page reloads`
  - Enhance page reload simulation
  - Improve session persistence verification

### Network Resilience Tests

- Fix `handles offline mode`
  - Improve offline mode simulation
  - Add better verification of offline status

### Security Tests

- Fix `handles permission changes`
  - Enhance permission change simulation
  - Improve verification of UI updates

### User Experience Tests

- Fix `displays appropriate loading states`
  - Improve loading state verification
  - Add waitFor() for state transitions

### Presence Maintenance Test

- Fix `maintains presence while user is active`
  - Rewrite test to avoid timing issues
  - Consider alternatives to fake timers
  - Add more detailed verification steps
