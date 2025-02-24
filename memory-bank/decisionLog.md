# TDD Decision Log

## 2024-02-22: Refactoring ConflictsTableTestDriver for Better DI

### Context

- Moving from direct gapi mocking to proper dependency injection through GoogleSheetsContext
- Test 'should load initial data and correctly parse conflicts and roles' is failing
- Need to align test driver with interface-driven design principles

### Design Decisions

#### RED Phase

1. Current Implementation Issues:

   - Direct gapi mocking violates dependency injection principles
   - Test driver tightly coupled to implementation details
   - Brittle test setup that may affect multiple tests

2. Required Changes:

   - Remove direct gapi mocking from ConflictsTableTestDriver
   - Use mockGoogleSheets through GoogleSheetsContext.Provider
   - Update test methods to work with GoogleSheetsAPI interface:
     ```typescript
     interface GoogleSheetsAPI {
       load: () => Promise<Response<ValueRange>>;
       update: (range: string, values: any[][]) => Promise<Response>;
       clear: (range: string) => Promise<Response>;
       isLoading: boolean;
       error: string | null;
     }
     ```

3. Implementation Plan:
   - Update setTestData() to use mockGoogleSheets.load
   - Update expectGoogleSheetsApiCall() to verify mockGoogleSheets method calls
   - Remove gapi-specific mocking code
   - Ensure proper typing with GoogleSheetsAPI interface

### Benefits

1. Better Separation of Concerns:

   - Tests depend on interfaces, not implementation details
   - Easier to maintain and update tests
   - More reliable test suite

2. Improved Test Design:
   - Clear contract through GoogleSheetsAPI interface
   - Consistent mocking strategy across tests
   - Better alignment with dependency injection principles

### Next Steps

1. Switch to appropriate mode for implementation
2. Update ConflictsTableTestDriver implementation
3. Verify test passes with new implementation
4. Document patterns for future test implementations

### Testing Strategy

1. Focus on interface compliance
2. Verify each method independently
3. Ensure proper error handling
4. Maintain existing test coverage

### Patterns to Follow

1. Always use dependency injection
2. Mock at interface boundaries
3. Keep tests focused on behavior, not implementation
4. Use clear, consistent naming conventions
