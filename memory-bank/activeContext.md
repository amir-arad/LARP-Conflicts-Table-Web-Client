# Active Context

## Current Task

Fixing the test 'should load initial data and correctly parse conflicts and roles' in useConflictsTable.test.ts

## Test Analysis

- Test is failing due to mocking strategy change from direct gapi mocking to GoogleSheetsDriver mock
- ConflictsTableTestDriver needs to be updated to use mockGoogleSheets instead of gapi mocks
- The test wrapper correctly injects mockGoogleSheets through GoogleSheetsProvider.Inject

## Implementation Plan

1. Update ConflictsTableTestDriver to use mockGoogleSheets for:
   - Setting test data
   - Verifying API calls
2. Remove direct gapi mocking code
3. Ensure proper typing with GoogleSheetsAPI interface

## Common Failure Patterns

- Direct API mocking instead of using dependency injection
- Tests tightly coupled to implementation details
- Missing interface-driven design

## Next Steps

Switch to TDD Code Architect mode to implement the changes to ConflictsTableTestDriver
