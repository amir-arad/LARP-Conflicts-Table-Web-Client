# Enhanced Helpers Improvement Plan

## Objective

Improve the test infrastructure in `enhanced-helpers.tsx` to create more resilient, flexible, and maintainable testing utilities.

## 1. Act() Wrapping Enhancements

### Current Challenges

- Inconsistent act() wrapping
- Potential race conditions in async operations
- Limited error handling during state updates

### Proposed Improvements

- Create a generic `safeAct()` wrapper that:
  - Provides consistent act() wrapping
  - Adds comprehensive error logging
  - Supports nested async operations
  - Allows custom timeout configuration

```typescript
async function safeAct<T>(
  callback: () => Promise<T>,
  options: {
    timeout?: number;
    errorHandler?: (error: Error) => void;
  } = {}
): Promise<T> {
  const { timeout = 5000, errorHandler = console.error } = options;

  try {
    return await act(async () => {
      const result = await Promise.race([
        callback(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Act timeout')), timeout)
        ),
      ]);
      return result;
    });
  } catch (error) {
    errorHandler(error as Error);
    throw error;
  }
}
```

## 2. Waitfor() Strategy Improvements

### Current Challenges

- Fixed timeout values
- Limited retry mechanisms
- Lack of comprehensive error reporting

### Proposed Improvements

- Develop an adaptive `enhancedWaitFor()` utility
  - Dynamic timeout calculation
  - Exponential backoff retry strategy
  - Detailed error context
  - Support for multiple matching strategies

```typescript
async function enhancedWaitFor<T>(
  assertion: () => T | Promise<T>,
  options: {
    timeout?: number;
    retries?: number;
    description?: string;
  } = {}
): Promise<T> {
  const {
    timeout = 5000,
    retries = 3,
    description = 'Unnamed wait operation',
  } = options;

  const baseDelay = 250;
  let currentRetry = 0;

  while (currentRetry < retries) {
    try {
      return await waitFor(assertion, { timeout });
    } catch (error) {
      if (currentRetry === retries - 1) {
        console.error(
          `${description} failed after ${retries} attempts:`,
          error
        );
        throw error;
      }

      // Exponential backoff
      await new Promise(resolve =>
        setTimeout(resolve, baseDelay * Math.pow(2, currentRetry))
      );
      currentRetry++;
    }
  }

  throw new Error(`${description} failed unexpectedly`);
}
```

## 3. Error Simulation and Logging

### Proposed Enhancements

- Create a centralized error simulation framework
- Add comprehensive logging for test scenarios
- Develop more granular error type definitions

```typescript
enum TestErrorType {
  Network = 'NETWORK_ERROR',
  Authentication = 'AUTH_ERROR',
  Timeout = 'TIMEOUT_ERROR',
  Permission = 'PERMISSION_ERROR',
}

interface TestErrorContext {
  type: TestErrorType;
  message: string;
  details?: Record<string, unknown>;
}

function logTestError(context: TestErrorContext) {
  console.error(
    `Test Error [${context.type}]: ${context.message}`,
    context.details || {}
  );
}
```

## 4. Multilingual Test Helpers

### Improvements

- Enhance element discovery with language-aware strategies
- Create flexible text matching utilities

```typescript
async function findElementByMultilingualText(
  textOptions: (string | RegExp)[],
  languages: string[] = ['en', 'he']
) {
  for (const text of textOptions) {
    try {
      return screen.getByText(text);
    } catch {}
  }
  throw new Error('No matching element found');
}
```

## Implementation Roadmap

1. Create utility functions in a new file: `src/test/integration/test-utils.ts`
2. Refactor `enhanced-helpers.tsx` to use new utilities
3. Update existing tests to leverage new helpers
4. Add comprehensive documentation
5. Create unit tests for new utility functions

## Continuous Improvement

- Regularly review and update test utilities
- Conduct team knowledge sharing sessions
- Maintain a living document of testing patterns and strategies
