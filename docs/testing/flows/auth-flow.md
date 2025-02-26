# Authentication Flow

The authentication flow handles user login, session management, and presence tracking. This is a critical flow that ensures users can access the application securely and maintain their presence status.

## Test Cases

### Happy Path: Login and Presence

Tests that users can successfully log in and establish their presence:

```typescript
test('happy path: user logs in and establishes presence', async () => {
  // Click login button
  // Wait for authentication
  // Verify user appears in active users list
  // Check core UI elements are available
});
```

Key Verification Points:

- Login button is present and clickable
- Authentication loading state clears
- User appears in active users list
- Core UI elements become available:
  - Conflicts table
  - Add conflict button
  - Add role button

### Error Handling

Tests graceful handling of login failures:

```typescript
test('handles login error gracefully', async () => {
  // Mock failed login
  // Attempt login
  // Verify error message
  // Check login button remains available
});
```

Key Verification Points:

- Failed login shows error message
- Login button remains available for retry
- Error state is clearly communicated

### Presence Management

Tests maintaining user presence while active:

```typescript
test('maintains presence while user is active', async () => {
  // Log in user
  // Verify initial presence
  // Wait and check presence maintained
  // Verify user still shown as active
});
```

Key Verification Points:

- User presence established after login
- Presence maintained over time
- Active status correctly reflected

## Implementation Notes

The authentication flow uses:

- Google OAuth for authentication
- Firebase Realtime Database for presence tracking
- React context for auth state management

## Test Setup

Tests use a custom wrapper that provides:

- Mocked Google auth API
- Mocked Firebase presence tracking
- Test utilities for auth state manipulation

## Common Patterns

1. User Login:

```typescript
const loginButton = screen.getByRole('button', { name: /login/i });
await user.click(loginButton);
```

2. Wait for Auth:

```typescript
await waitFor(() => {
  expect(screen.queryByText(/authenticating/i)).not.toBeInTheDocument();
});
```

3. Check Presence:

```typescript
const usersList = screen.getByRole('list', { name: /active users/i });
expect(usersList).toHaveTextContent('User Name');
```
