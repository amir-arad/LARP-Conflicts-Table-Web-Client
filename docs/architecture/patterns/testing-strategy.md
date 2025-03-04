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

### Component Testing

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

### System Integration testing

System Integration testing verifies that the entire system (excluding I/O ports) work together correctly.

- **Create System Integration Stories in Storybook**

  - Build stories that combine multiple components working together
  - Use story decorators to provide necessary context providers
  - Implement realistic data flows between components
  - Include edge cases and error states

- **Implement Play Functions for Interaction Testing**

  - Use Storybook's play function to simulate user interactions
  - Structure tests with clear steps for better debugging
  - Verify component interactions through assertions
  - Test complete user flows across component boundaries

- **Connect Stories to Automated Tests**

  - Use a test adapter to run story play functions in test suites
  - Maintain a single source of truth for both visual testing and automation
  - Enable debugging of integration tests through corresponding stories
  - Ensure tests can run in CI/CD pipeline

```typescript
// System integration story with play function
export const AuthenticationFlow: Story = {
  decorators: [
    Story => (
      <TestContextProvider>
        <Story />
      </TestContextProvider>
    ),
  ],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    // Step 1: Initial state verification
    await step('Initial state', async () => {
      const loginButton = canvas.getByTestId('login-button');
      await expect(loginButton).toBeInTheDocument();
    });

    // Step 2: Interaction across components
    await step('Login', async () => {
      const loginButton = canvas.getByTestId('login-button');
      await userEvent.click(loginButton);

      // Verify state changes across components
      await expect(
        canvas.getByTestId('authenticating-indicator')
      ).toBeInTheDocument();
    });

    // Step 3: Verify final state
    await step('Authenticated', async () => {
      // Wait for authenticated state
      await expect(
        await canvas.findByRole('table', {}, { timeout: 2000 })
      ).toBeInTheDocument();

      // Verify other UI elements
      await expect(
        canvas.getByRole('button', { name: /add conflict/i })
      ).toBeInTheDocument();
    });
  },
};

// Test adapter to run story in test suite
test('completes authentication flow successfully', async () => {
  const { runPlayFunction } = renderStory('AuthenticationFlow');
  await runPlayFunction();
});
```

### Acceptance Testing

Acceptance testing validates that the system meets business requirements from an end-user perspective ( = that a feature works).

- **Design Stories for Complete User Journeys**

  - Create Storybook stories that represent end-to-end user flows
  - Structure stories to demonstrate business requirements in action
  - Include all relevant UI components needed for the feature
  - Document acceptance criteria directly in story descriptions

- **Implement Interactive Demonstrations**

  - Use decorators to provide realistic application state
  - Add step indicators to clarify the flow being tested
  - Implement play functions that validate acceptance criteria
  - Create visual indicators for important state transitions

- **Connect to Automated Testing**

  - Run story play functions in automated test suites
  - Verify business requirements are met through assertions
  - Structure tests to mirror user behavior and expectations
  - Provide clear failure messages tied to business requirements

```typescript
// Acceptance test story for a complete feature
export const CompleteMotivationEditFlow: Story = {
  parameters: {
    docs: {
      description: {
        story: `
          # Motivation Edit Flow

          ## Acceptance Criteria:
          1. User can select a motivation cell
          2. User can edit the motivation text
          3. Changes are saved to the backend
          4. Other users see the changes in real-time
          5. Conflicts are prevented through locking
        `,
      },
    },
  },
  decorators: [
    Story => (
      <FeatureContextProvider initialState={featureFixtures.basic}>
        <Story />
      </FeatureContextProvider>
    ),
  ],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    // Step 1: Select a motivation cell
    await step('Select motivation cell', async () => {
      const cell = canvas.getByTestId('motivation-cell-A1');
      await userEvent.click(cell);
      await expect(canvas.getByTestId('cell-editor')).toBeInTheDocument();
    });

    // Step 2: Edit the motivation
    await step('Edit motivation', async () => {
      const editor = canvas.getByTestId('cell-editor');
      await userEvent.clear(editor);
      await userEvent.type(editor, 'New motivation text');
      await userEvent.keyboard('{Enter}');
    });

    // Step 3: Verify changes are saved
    await step('Verify changes saved', async () => {
      // Check cell shows new value
      const cell = canvas.getByTestId('motivation-cell-A1');
      await expect(cell).toHaveTextContent('New motivation text');

      // Check save indicator appears
      await expect(canvas.getByTestId('save-indicator')).toBeInTheDocument();
    });
  },
};

// Automated test that runs the story
test('motivation edit flow meets acceptance criteria', async () => {
  const { runPlayFunction } = renderStory('CompleteMotivationEditFlow');
  await runPlayFunction();
});
```

## Testing Best Practices

- **Always use Fake Port Adapters**

  - Employ Hexagonal Architecture to create a separation between the application core and external dependencies.
  - Replace IO-bound adapters (anything injected by Context API) with memory-bound doubles to enable fast acceptance testing.
  - Use contract tests to verify that both the fake and real implementations conform to the same interface.

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
3. ✅ Always use Fake Port Adapters
4. ✅ Create contract tests for interfaces with multiple implementations
5. ✅ Test components in isolation with Storybook
6. ✅ Focus on behavior, not implementation details
7. ✅ Make tests deterministic and reliable
8. ✅ Balance coverage with development speed
