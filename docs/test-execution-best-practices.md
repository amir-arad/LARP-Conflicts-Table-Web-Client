# Test Execution Best Practices

## Overview

This document outlines best practices for executing tests in the LARP Conflicts Table Web Client project, with a focus on ensuring consistent behavior across different development environments.

## Core Principles

### 1. CLI Environment Independence

The CLI terminal changes between PowerShell, Bash, CMD, and other shells depending on the environment. It is error-prone to blindly send environment-specific or shell-specific CLI commands. Always prioritize using `npm` scripts or standardized tools.

### 2. Verify Through Execution

When assessing the state of the project with regards to correctness of tests or implementation, there is no substitute for actually running the tests. Code inspection alone cannot reliably determine if tests will pass.

## Environment Considerations

### Terminal Environment Variability

The CLI terminal can change between PowerShell, Bash, CMD, and other shells depending on:

- The developer's operating system (Windows, macOS, Linux)
- IDE settings and configurations
- Default system shells
- CI/CD environments

This variability makes it error-prone to rely on shell-specific commands or syntax when running tests or other development tasks.

## Best Practices

### 1. Always Use npm Scripts for Test Execution

**DO:**

```bash
npm test
npm run test:integration
npm run test:watch
```

**DON'T:**

```bash
vitest run
vitest integration
./node_modules/.bin/vitest
```

**Why:** npm scripts provide a consistent interface regardless of the underlying shell or operating system. They handle path differences, environment variables, and shell-specific syntax automatically.

### 2. Avoid Shell-Specific Commands Like `cd`

**DO:**

```json
{
  "scripts": {
    "test:specific": "vitest run src/test/specific-test.ts",
    "lint:fix": "eslint --fix ."
  }
}
```

**DON'T:**

```bash
cd src/test && vitest run
cd .. && eslint --fix .
```

**Why:** Commands like `cd` may behave differently across shells and can lead to inconsistent test execution. Instead, use absolute paths or configure tools to target specific directories.

### 3. Actually Run Tests to Verify Correctness

**DO:**

```bash
npm test
npm run test:specific
```

**DON'T:**

- Assume tests pass based on code inspection
- Assume fixes work without running the tests
- Make implementation changes without test verification

**Why:** Code inspection alone cannot reliably determine if tests will pass. Tests might fail due to timing issues, dependencies, or subtle interactions that aren't obvious from reading the code.

### 4. Verify Test Output, Not Just Return Codes

**DO:**

- Check the actual test summary output in the terminal
- Look for the number of passed/failed tests
- Examine detailed error messages when tests fail

**DON'T:**

- Rely solely on the process return code (0 for success, non-zero for failure)
- Assume tests passed just because the command completed without errors

**Why:** Return codes may sometimes be misleading (false positives). A test runner might exit with a success code even if some tests were skipped or had non-critical failures.

### 5. Use Cross-Platform Paths in Configuration

**DO:**

```javascript
// vite.config.ts
import { resolve } from 'path';

export default {
  test: {
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    environment: 'jsdom',
    setupFiles: resolve(__dirname, 'src/test/setup.ts'),
  },
};
```

**DON'T:**

```javascript
// vite.config.ts
export default {
  test: {
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    environment: 'jsdom',
    setupFiles: 'src/test/setup.ts', // Might fail on Windows
  },
};
```

**Why:** Using Node.js path utilities ensures paths work correctly across different operating systems, particularly Windows where path separators differ.

### 6. Use Portable Shell Commands in npm Scripts

**DO:**

```json
{
  "scripts": {
    "clean": "rimraf dist",
    "copy-assets": "copyfiles -u 1 src/assets/**/* dist"
  }
}
```

**DON'T:**

```json
{
  "scripts": {
    "clean": "rm -rf dist",
    "copy-assets": "cp -r src/assets/* dist"
  }
}
```

**Why:** Commands like `rm` and `cp` are not available in Windows Command Prompt or PowerShell by default. Using cross-platform npm packages (like rimraf, copyfiles) ensures scripts work everywhere.

### 7. Consider Environment Variables for Configuration

**DO:**

```json
{
  "scripts": {
    "test": "cross-env NODE_ENV=test vitest run"
  }
}
```

**DON'T:**

```json
{
  "scripts": {
    "test:unix": "NODE_ENV=test vitest run",
    "test:win": "set NODE_ENV=test && vitest run"
  }
}
```

**Why:** Using tools like `cross-env` ensures environment variables are set correctly regardless of platform.

### 8. Standardize Test Command Arguments

Document standard arguments that should be used with test commands:

```bash
# Run all tests
npm test

# Run with coverage report
npm test -- --coverage

# Run in watch mode
npm test -- --watch

# Run specific test file
npm test -- src/components/MyComponent.test.tsx

# Run tests matching a specific name
npm test -- -t "should render correctly"
```

### 9. Handle Long-Running Tests Appropriately

For tests that involve watching files or starting development servers:

**DO:**

- Provide clear start/stop instructions
- Use separate terminal sessions for long-running processes
- Document expected output or behavior

**DON'T:**

- Chain long-running commands with other commands using `&&`
- Start background processes without clear ways to terminate them

### 10. Create Dedicated Test Scripts for Complex Scenarios

**DO:**

```json
{
  "scripts": {
    "test:auth": "vitest run auth",
    "test:integration": "vitest run integration",
    "test:e2e": "playwright test"
  }
}
```

**DON'T:**

```bash
vitest run "src/**/auth*.test.ts"
cd integration && vitest run
```

**Why:** Dedicated npm scripts provide a consistent, documented way to run specific test scenarios, regardless of the environment.

## Common Issues and Solutions

### Issue: Tests Pass Locally But Fail in CI

**Potential Causes:**

- Different Node.js versions
- Different operating systems
- Timing issues
- Missing environment variables

**Solutions:**

- Specify exact Node.js version in package.json and CI configuration
- Use Docker containers to ensure consistent environments
- Add more robust waiting/polling in asynchronous tests
- Ensure all required environment variables are documented and provided

### Issue: Inconsistent Test Results

**Potential Causes:**

- Tests affecting each other (lack of isolation)
- Race conditions
- Random test order execution

**Solutions:**

- Ensure proper cleanup between tests
- Run tests serially when dealing with shared resources
- Use unique identifiers for test data
- Set a fixed seed for random operations during testing

### Issue: Difficulty Identifying Why Tests Failed

**Potential Causes:**

- Insufficient error messages
- Timing issues in async tests
- Hidden state differences

**Solutions:**

- Add more descriptive error messages
- Use proper act() wrapping for React components
- Add detailed logging of state transitions
- Use test-specific debugging helpers

## Conclusion

Following these best practices ensures that tests run consistently across different development environments, reducing frustration and improving productivity. By using npm scripts, actually running tests to verify correctness, checking test output thoroughly, and being mindful of cross-platform compatibility, we can maintain a reliable and robust testing process.
