# GAPI Mock Refactoring Plan

## Current Issues

1. Higher-order function pattern is less idiomatic for React testing
2. Manual cleanup management could lead to memory leaks
3. Limited error handling and type safety
4. No clear separation between setup and teardown phases

## Proposed Solution

Convert to a custom React hook that leverages React's lifecycle methods for better test integration.

### New Hook Design: `useMockGapi`

```typescript
function useMockGapi(config: MockGapiConfig): void {
  useEffect(() => {
    const originalGapi = window.gapi;
    window.gapi = createMockGapi(config);

    return () => {
      window.gapi = originalGapi;
    };
  }, [config]);
}
```

### Benefits

1. **Automatic Cleanup**: Uses React's useEffect cleanup function
2. **Better Integration**: More idiomatic with React Testing Library
3. **Improved Type Safety**: Better TypeScript integration
4. **Simpler Testing Pattern**: More straightforward test setup
5. **Error Handling**: Better error boundary support

### Migration Path

1. Create new hook implementation
2. Update existing tests to use new pattern
3. Deprecate old HOF pattern
4. Remove old implementation after migration

### Example Usage

```typescript
test('example test', async () => {
  const { result } = renderHook(() => {
    useMockGapi({
      sheets: {
        get: () => Promise.resolve(mockData),
      },
    });
    return useGoogleSheets();
  });

  // Test implementation
});
```

## Implementation Steps

1. Create new hook implementation
2. Add comprehensive error handling
3. Update test utilities
4. Migrate existing tests
5. Add documentation
6. Remove old implementation

## Error Handling Improvements

1. Add validation for config object
2. Handle edge cases (undefined window.gapi)
3. Add proper error boundaries
4. Improve error messages

## Type Safety Improvements

1. Strengthen MockGapiConfig types
2. Add proper return type annotations
3. Improve generic type constraints
4. Add runtime type checking

## Documentation Updates

1. Add JSDoc comments
2. Update README
3. Add migration guide
4. Document best practices
