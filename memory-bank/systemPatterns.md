## Extended Testing Methodology for Role Management

### Core Testing Patterns

1. **Resilient Async Handling**

   - Use `safeAct` for reliable async operations
   - Implement comprehensive error catching
   - Ensure consistent test behavior across different environments

2. **Mock-Driven Testing**

   - Create sophisticated mock drivers
   - Simulate complex scenarios
   - Validate system behavior under various conditions

3. **Event Sequence Simulation**
   - Accurately reproduce user interactions
   - Handle complex event chains
   - Verify proper state transitions

### Key Implementation Strategies

#### Async Operation Management

```typescript
async function safeAct(callback: () => Promise<void>) {
  try {
    await callback();
    await Promise.resolve(); // Ensure microtask queue is processed
  } catch (error) {
    // Centralized error handling
    console.error('Test action failed', error);
    throw error;
  }
}
```

#### Mock Configuration Pattern

```typescript
const createResilientMock = () => {
  const mock = vi
    .fn()
    .mockRejectedValueOnce(new Error('Initial error'))
    .mockResolvedValueOnce(undefined);
  return mock;
};
```

### Error Handling Principles

- Implement comprehensive error scenarios
- Validate recovery mechanisms
- Ensure system stability under failure conditions

### Collaborative Testing Approach

- Simulate multiple user sessions
- Verify concurrent operation handling
- Test race condition resilience

### Performance Considerations

- Minimize test execution time
- Use efficient mocking strategies
- Optimize async operation handling

### Continuous Improvement

- Regularly review and refactor test patterns
- Expand coverage incrementally
- Maintain test infrastructure flexibility
