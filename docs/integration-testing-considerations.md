# Integration Testing Considerations

## Overview

This document outlines key considerations, challenges, and trade-offs when implementing integration tests for the LARP Conflicts Table Web Client. It aims to provide guidance on making informed decisions about testing strategies.

## Testing Approaches Comparison

### Vitest with JSDOM (Recommended Approach)

**Pros:**

- **Speed**: Tests run very quickly since they use a simulated DOM
- **Integration with Vite**: Seamless integration with the existing Vite setup
- **Developer Experience**: Familiar API similar to Jest
- **Parallel Execution**: Can run tests in parallel for faster execution
- **TypeScript Support**: Native TypeScript support without transpilation
- **Watch Mode**: Fast watch mode for development

**Cons:**

- **Not a Real Browser**: JSDOM is not a complete browser implementation
- **Limited CSS Support**: Cannot test CSS rendering or complex layouts
- **No Visual Testing**: Cannot verify visual appearance

### Cypress Component Testing

**Pros:**

- **Real Browser**: Tests run in a real browser
- **Visual Testing**: Can verify visual appearance
- **Developer Experience**: Good developer experience with time-travel debugging
- **Snapshot Testing**: Can take snapshots of components

**Cons:**

- **Speed**: Slower than JSDOM-based tests
- **Setup Complexity**: More complex setup
- **Resource Intensive**: Requires more resources to run

### Playwright Component Testing

**Pros:**

- **Cross-Browser Testing**: Can test in multiple browsers
- **Modern API**: Modern and powerful API
- **Visual Testing**: Can verify visual appearance
- **Mobile Emulation**: Can emulate mobile devices

**Cons:**

- **Speed**: Slower than JSDOM-based tests
- **Learning Curve**: Steeper learning curve
- **Setup Complexity**: More complex setup

## Key Considerations for This Project

### 1. Test Speed vs. Realism

For this project, we're prioritizing test speed to enable fast feedback during development. The Vitest with JSDOM approach provides a good balance between speed and realism for testing the application logic and component interactions.

However, it's important to acknowledge that JSDOM has limitations:

- It doesn't fully simulate browser rendering
- It doesn't support all browser APIs
- It doesn't execute CSS

For critical visual or layout features, consider supplementing with a small number of Cypress or Playwright tests.

### 2. Mocking External Dependencies

The project relies heavily on external services:

- Google OAuth for authentication
- Firebase for real-time presence
- Google Sheets API for data storage

Our approach is to mock these dependencies to:

- Make tests faster and more reliable
- Avoid hitting real external services
- Control test scenarios more precisely

The challenge is creating mocks that accurately represent the behavior of these services without becoming too complex or brittle.

### 3. Testing Real-time Features

The application includes real-time collaboration features that are challenging to test:

- User presence
- Cell locking
- Concurrent editing

Our approach is to:

- Mock the Firebase real-time database
- Simulate presence events
- Test the application's reaction to these events

This requires careful design of the Firebase mock to accurately simulate real-time behavior.

### 4. Test Isolation vs. Integration

There's a trade-off between:

- **Isolated Tests**: Testing components in isolation with mocked dependencies
- **Integrated Tests**: Testing components working together with realistic data flow

Our approach is to:

- Use the test wrapper to provide a realistic context
- Mock external APIs but use real internal components
- Test user flows that span multiple components

This provides a good balance between isolation and integration.

## Recommended Testing Patterns

### 1. Arrange-Act-Assert Pattern

Structure tests using the Arrange-Act-Assert pattern:

```typescript
test('example test', async () => {
  // Arrange: Set up the test environment
  const { user, testWrapper } = renderWithTestWrapper(<App />);
  await testWrapper.mockGoogleSheets.setTestData([...]);

  // Act: Perform the action being tested
  await user.click(screen.getByRole('button', { name: /login/i }));

  // Assert: Verify the expected outcome
  expect(screen.getByText(/welcome/i)).toBeInTheDocument();
});
```

### 2. Page Object Pattern

For complex pages or components, consider using the Page Object pattern:

```typescript
class ConflictsTablePage {
  constructor(
    private screen: Screen,
    private user: UserEvent
  ) {}

  async addConflict(name: string) {
    await this.user.click(
      this.screen.getByRole('button', { name: /add conflict/i })
    );
    await this.user.type(this.screen.getByRole('textbox'), name);
    await this.user.click(this.screen.getByRole('button', { name: /save/i }));
  }

  getConflictNames() {
    return Array.from(this.screen.getAllByTestId('conflict-name')).map(
      el => el.textContent
    );
  }
}
```

### 3. Data Builders

Use data builders to create test data:

```typescript
function buildTestData(options = {}) {
  return [
    ['', 'Role 1', 'Role 2', ...(options.extraRoles || [])],
    ['Conflict 1', 'M1-1', 'M1-2', ...(options.extraMotivations1 || [])],
    ['Conflict 2', 'M2-1', 'M2-2', ...(options.extraMotivations2 || [])],
    ...(options.extraConflicts || []),
  ];
}
```

## Potential Challenges and Solutions

### 1. Test Flakiness

**Challenge**: Tests that sometimes pass and sometimes fail due to timing issues or race conditions.

**Solutions**:

- Use `waitFor` and `findBy*` queries instead of synchronous assertions
- Avoid fixed timeouts; use polling with reasonable timeouts instead
- Mock timers for predictable timing
- Ensure proper cleanup between tests

### 2. Slow Tests

**Challenge**: Tests that take too long to run, reducing developer productivity.

**Solutions**:

- Run tests in parallel
- Focus on critical paths
- Use faster mocks
- Optimize test setup and teardown
- Consider separating slow tests into a separate suite

### 3. Brittle Tests

**Challenge**: Tests that break easily when the implementation changes.

**Solutions**:

- Test behavior, not implementation
- Use semantic queries (e.g., `getByRole`) instead of implementation details
- Avoid testing component internals
- Focus on user-visible outcomes

### 4. Complex Test Setup

**Challenge**: Tests that require complex setup, making them hard to understand and maintain.

**Solutions**:

- Use helper functions and factories
- Create higher-level abstractions
- Document test setup clearly
- Keep tests focused on a single behavior

## Conclusion

Integration testing for the LARP Conflicts Table Web Client presents unique challenges due to its reliance on external services and real-time features. By using Vitest with JSDOM and carefully designed mocks, we can create fast, reliable tests that provide confidence in the application's behavior.

The key is to balance speed and realism, focusing on testing critical user flows while acknowledging the limitations of our testing approach. By following the recommended patterns and addressing potential challenges proactively, we can create a robust test suite that supports the ongoing development of the application.
