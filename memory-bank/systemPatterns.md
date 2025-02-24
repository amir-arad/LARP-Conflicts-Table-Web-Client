# System Patterns

## Test Patterns

### Driver Pattern

The ConflictsTableTestDriver demonstrates several key patterns for test drivers:

1. Dependency Injection

   - Uses context providers for dependency injection
   - Accesses dependencies through interfaces, not implementation details
   - Makes testing more maintainable and less brittle

2. Mock Management

   - Mocks are defined at interface boundaries
   - Uses strongly typed mocks that match the interface
   - Centralizes mock setup and verification

3. Test Driver Structure

   - Encapsulates test setup and assertions
   - Provides a clean API for test cases
   - Handles async operations consistently
   - Maintains type safety throughout

4. State Management

   - Tracks component state through hook results
   - Provides methods to modify state
   - Includes utilities for waiting on state changes

5. API Verification
   - Verifies API calls through mock expectations
   - Checks both method calls and arguments
   - Supports different API operations (load, update, clear)

### Best Practices

1. Interface-Driven Design

   ```typescript
   interface GoogleSheetsAPI {
     load: () => Promise<Response<ValueRange>>;
     update: (range: string, values: any[][]) => Promise<Response>;
     clear: (range: string) => Promise<Response>;
     isLoading: boolean;
     error: string | null;
   }
   ```

   - Define clear interfaces for external dependencies
   - Use TypeScript for better type safety
   - Document interface contracts

2. Mock Implementation

   ```typescript
   const mockGoogleSheets = {
     load: vi.fn(),
     update: vi.fn(),
     clear: vi.fn(),
     error: null,
     isLoading: false,
   } satisfies GoogleSheetsAPI;
   ```

   - Mocks satisfy interface contracts
   - Use type assertions for verification
   - Keep mocks simple and focused

3. Context Provider Pattern

   ```typescript
   <GoogleSheetsProvider.Inject value={mockGoogleSheets}>
     {children}
   </GoogleSheetsProvider.Inject>
   ```

   - Use context for dependency injection
   - Provide test-specific implementations
   - Maintain component hierarchy

4. Test Driver Methods

   ```typescript
   async setTestData(values: string[][] | Promise<string[][]>) {
     mockGoogleSheets.load.mockResolvedValueOnce({
       result: { values: await Promise.resolve(values) }
     });
   }
   ```

   - Handle async operations properly
   - Provide clear method signatures
   - Include proper error handling

5. State Verification
   ```typescript
   waitForState(expected: ExpectedTableData) {
     return waitFor(() => {
       // Verify expected state
     });
   }
   ```
   - Use async utilities for state changes
   - Provide clear error messages
   - Support partial state verification

### Anti-patterns to Avoid

1. Direct API Mocking

   - ❌ Don't mock APIs directly
   - ✅ Mock through interfaces
   - ✅ Use dependency injection

2. Implementation Details

   - ❌ Don't couple tests to implementation
   - ✅ Test through public interfaces
   - ✅ Focus on behavior, not details

3. Global State

   - ❌ Don't rely on global state
   - ✅ Use proper dependency injection
   - ✅ Maintain test isolation

4. Complex Setup
   - ❌ Don't create complex test scenarios
   - ✅ Keep tests focused and simple
   - ✅ Use test drivers to manage complexity

### Testing Strategy

1. Unit Tests

   - Test components in isolation
   - Mock external dependencies
   - Focus on specific behaviors

2. Integration Tests

   - Test component interactions
   - Use real implementations where possible
   - Verify end-to-end flows

3. Test Organization
   - Group related tests
   - Use clear descriptions
   - Follow arrange-act-assert pattern
