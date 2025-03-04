# Development Methodology

## Lean Software Development Guidelines

- **Value Interconnectedness**

  - Map dependencies between components before making changes
  - Consider ripple effects of modifications across the system
  - Document component relationships

- **Optimize Information Flow**

  - Use clear, consistent naming conventions
  - Document public APIs and interfaces
  - Provide context in commit messages and pull requests

- **Maintain Simplicity**

  - Implement the simplest solution that meets requirements
  - Avoid speculative features and premature optimization
  - Refactor regularly to reduce complexity

- **Build High Confidence**

  - Write comprehensive tests for critical paths
  - Use type checking and static analysis
  - Implement error boundaries and fallback mechanisms

- **Work in Short Iterations**

  - Break large tasks into smaller, manageable chunks
  - Commit and integrate changes frequently
  - Get feedback early and often

- **Perform Reality Checks**
  - Test with real users and real data
  - Validate assumptions with metrics
  - Adjust based on actual usage patterns

## Technical Debt Management Actions

- **Identify Technical Debt**

  - Look for code that's difficult to change
  - Monitor areas with frequent bugs
  - Track workarounds and temporary solutions

- **Make Small, Non-Breaking Changes**

  - Refactor in small, incremental steps
  - Maintain backward compatibility
  - Deploy changes frequently

- **Add Tests Before Refactoring**

  - Write tests that verify current behavior
  - Use these tests to ensure refactoring doesn't break functionality
  - Increase test coverage in high-risk areas

- **Prioritize High-Impact Areas**
  - Focus on code that changes frequently
  - Address bottlenecks that slow development
  - Fix issues that affect multiple developers

## Immediate Problem Solving Approach

- **Focus on Current Requirements**

  - Solve the specific problem at hand
  - Avoid building for hypothetical future needs
  - Implement only what's necessary now

- **Wait for Patterns to Emerge**

  - Implement similar solutions 2-3 times before abstracting
  - Look for actual, not anticipated, patterns
  - Create abstractions based on real use cases

- **Refine Iteratively**
  - Start with a simple solution
  - Improve based on feedback and usage
  - Evolve the solution as requirements become clearer

```typescript
// Initial implementation - solves the immediate need
function handleUserPresence(userId, status) {
  firebase.database().ref(`presence/${userId}`).set({
    status,
    lastSeen: Date.now(),
  });
}

// Later, after multiple similar use cases emerge:
class PresenceManager {
  updateStatus(userId, status) {
    return this.updatePresenceData(userId, { status });
  }

  updateActivity(userId, activity) {
    return this.updatePresenceData(userId, { activity });
  }

  private updatePresenceData(userId, data) {
    return firebase
      .database()
      .ref(`presence/${userId}`)
      .update({
        ...data,
        lastSeen: Date.now(),
      });
  }
}
```

## Refactoring Before Implementation

- **Restructure Code to Make Changes Easy**

  - Refactor before adding new features
  - Create clear boundaries between components
  - Extract reusable functions and components

- **Break Down Complex Systems**

  - Split large components into smaller, focused ones
  - Create clear interfaces between components
  - Use composition to manage complexity

- **Define Clear APIs**
  - Create well-defined interfaces for components
  - Use parameter objects for flexible function signatures
  - Document expected inputs and outputs

```typescript
// Before: Difficult to extend
function updateUserData(userId, name, email) {
  return firebase.database().ref(`users/${userId}`).update({
    name,
    email,
    updatedAt: Date.now(),
  });
}

// After: Refactored for flexibility
function updateUserData(userId, data) {
  return firebase
    .database()
    .ref(`users/${userId}`)
    .update({
      ...data,
      updatedAt: Date.now(),
    });
}
```

## Incremental Code Investment

- **Start with Experimental Implementations**

  - Begin with simple, focused solutions
  - Treat initial code as exploratory
  - Don't over-engineer first implementations

- **Add Tests and Refinements Incrementally**

  - Add tests as code proves valuable
  - Refactor as patterns emerge
  - Improve documentation as usage increases

- **Balance Short and Long-Term Needs**
  - For coding tasks: focus on immediate solutions
  - For architecture: consider longer-term implications
  - Refactor regularly to maintain balance

## Implementation Checklist

When implementing new features:

1. ✅ Identify the specific problem to solve
2. ✅ Implement the simplest solution that works
3. ✅ Add tests to verify behavior
4. ✅ Refactor to improve code quality
5. ✅ Get feedback from users and team members
6. ✅ Iterate based on feedback
7. ✅ Abstract only after seeing repeated patterns
