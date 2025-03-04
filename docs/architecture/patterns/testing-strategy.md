# Testing Strategy

## Test-Driven Development Implementation

- **Start with In-Memory Implementations**

  - Create simple, in-memory versions of external dependencies
  - Focus on one problem at a time to reduce cognitive load
  - Implement the simplest solution that passes tests

- **Follow Red-Green-Refactor Cycle**

  - Write a failing test (Red)
  - Implement the simplest code to make it pass (Green)
  - Improve the code without changing behavior (Refactor)

- **Separate Test Concerns**
  - Test business logic independently from external services
  - Use dependency injection to swap implementations
  - Focus tests on behavior, not implementation details

```typescript
// TDD workflow example
// 1. Write test first
test('user presence is updated', async () => {
  // Use in-memory fake
  const presenceService = new PresenceServiceFake();
  const userId = 'user1';
  const status = 'online';

  await presenceService.updatePresence(userId, status);
  const result = await presenceService.getPresence(userId);

  expect(result.status).toBe(status);
});

// 2. Implement the simplest solution
class PresenceServiceFake implements PresenceService {
  private data: Record<string, PresenceData> = {};

  async updatePresence(userId: string, status: string): Promise<void> {
    this.data[userId] = { status };
  }

  async getPresence(userId: string): Promise<PresenceData> {
    return this.data[userId] || { status: 'offline' };
  }
}
```

## Fakes vs. Mocks Implementation

- **Use Fakes for Complex Behavior**

  - Implement interfaces with simplified but real behavior
  - Test effects and outcomes rather than implementation details
  - Create fakes that maintain internal state

- **Reserve Mocks for Simple Interactions**

  - Use mocks for simple, stateless interactions
  - Verify specific method calls when necessary
  - Avoid complex mock setups and expectations

- **Implement Fakes That Match Real Behavior**
  - Ensure fakes follow the same contract as real implementations
  - Simulate error conditions and edge cases
  - Make fakes deterministic for reliable testing

```typescript
// Fake implementation (preferred for complex behavior)
class FirebaseFake implements FirebasePort {
  private presenceData: Record<string, PresenceData> = {};
  private observers: ((data: Record<string, PresenceData>) => void)[] = [];

  async updatePresence(userId: string, status: string): Promise<void> {
    this.presenceData[userId] = { status };
    this.notifyObservers();
  }

  observePresence(
    callback: (data: Record<string, PresenceData>) => void
  ): () => void {
    this.observers.push(callback);
    callback(this.presenceData);
    return () => {
      this.observers = this.observers.filter(obs => obs !== callback);
    };
  }

  private notifyObservers(): void {
    this.observers.forEach(callback => callback(this.presenceData));
  }
}
```

## Contract Testing Implementation

- **Define Shared Test Suites**

  - Create test functions that can be reused across implementations
  - Test the same behavior against both fakes and real implementations
  - Verify that all implementations satisfy the same contract

- **Verify Interface Compliance**

  - Ensure all implementations follow the same interface
  - Test edge cases and error handling consistently
  - Validate that behavior matches across implementations

- **Run Contract Tests in CI**
  - Run tests against fakes in all environments
  - Run tests against real implementations in CI with proper credentials
  - Use feature flags to conditionally run tests against real services

```typescript
// Contract test example
function testPresenceContract(createService: () => PresenceService) {
  let service: PresenceService;

  beforeEach(() => {
    service = createService();
  });

  test('updates and retrieves presence', async () => {
    const userId = 'user1';
    const status = 'online';

    await service.updatePresence(userId, status);
    const result = await service.getPresence(userId);

    expect(result.status).toBe(status);
  });

  test('handles missing users', async () => {
    const result = await service.getPresence('nonexistent');
    expect(result.status).toBe('offline');
  });
}

// Run with fake
describe('PresenceServiceFake', () => {
  testPresenceContract(() => new PresenceServiceFake());
});

// Run with real implementation in CI
if (process.env.CI) {
  describe('RealPresenceService', () => {
    testPresenceContract(() => new RealPresenceService(config));
  });
}
```

## UI Testing with Storybook

- **Create Component Stories**

  - Document all component states and variations
  - Use args to make stories configurable
  - Include edge cases and error states

- **Implement Interactive Tests**

  - Use Storybook's play function for interaction testing
  - Test user flows within stories
  - Verify component behavior through assertions

- **Isolate Components for Testing**
  - Test components in isolation from application state
  - Mock external dependencies and context
  - Focus on component-specific behavior

```typescript
// Storybook example with play function
export const EditableCell: StoryObj<typeof TableCell> = {
  args: {
    value: 'Initial value',
    editable: true,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    // Verify initial state
    await step('Initial render', async () => {
      expect(canvas.getByText('Initial value')).toBeInTheDocument();
    });

    // Test interaction
    await step('Edit cell', async () => {
      await userEvent.click(canvas.getByText('Initial value'));
      const input = canvas.getByRole('textbox');
      await userEvent.clear(input);
      await userEvent.type(input, 'New value');
      await userEvent.keyboard('{Enter}');
    });

    // Verify result
    await step('Verify edit', async () => {
      expect(canvas.getByText('New value')).toBeInTheDocument();
    });
  },
};
```

## Testing Best Practices

- **Test Behavior, Not Implementation**

  - Focus on what the code does, not how it does it
  - Avoid testing private methods directly
  - Refactor tests when implementation changes

- **Write Deterministic Tests**

  - Avoid flaky tests that sometimes pass and sometimes fail
  - Control time-dependent behavior with mocks
  - Reset state between tests

- **Balance Test Coverage**

  - Focus on critical paths and business logic
  - Test edge cases and error handling
  - Don't aim for 100% coverage at the expense of value

- **Optimize Test Performance**
  - Keep tests fast to encourage frequent running
  - Use in-memory fakes instead of real services when possible
  - Run smaller test suites during development

## Implementation Checklist

When implementing tests:

1. ✅ Write tests before implementation (TDD)
2. ✅ Use fakes instead of mocks for complex behavior
3. ✅ Create contract tests for interfaces with multiple implementations
4. ✅ Test components in isolation with Storybook
5. ✅ Focus on behavior, not implementation details
6. ✅ Make tests deterministic and reliable
7. ✅ Balance coverage with development speed
