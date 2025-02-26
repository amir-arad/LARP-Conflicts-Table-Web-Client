# Motivation Changes Flow

The motivation changes flow tests the editing functionality for motivation cells in the conflicts table, including real-time updates and concurrent editing handling.

## Test Cases

### Basic Cell Editing

Tests the core editing functionality:

```typescript
test('happy path: user edits motivation cell', async () => {
  // Find and click motivation cell
  // Enter new text
  // Submit change
  // Verify update
});
```

Key Verification Points:

- Cell is selectable and editable
- Changes are saved on Enter
- Updated content displays correctly

### Concurrent Editing

Tests handling multiple users editing simultaneously:

```typescript
test('handles concurrent editing', async () => {
  // Simulate other user editing
  // Try to edit same cell
  // Verify cell locked
});
```

Key Verification Points:

- Shows when cells are being edited by others
- Prevents concurrent editing of same cell
- Displays clear lock indicators

### Real-time Updates

Tests that changes appear in real-time:

```typescript
test('handles real-time updates', async () => {
  // Find motivation cell
  // Simulate update from another user
  // Verify cell updates immediately
});
```

Key Verification Points:

- Updates appear without refresh
- Changes from other users show immediately
- Maintains data consistency

### Network Resilience

Tests handling network interruptions:

```typescript
test('maintains cell state during editing', async () => {
  // Start editing cell
  // Simulate network drop
  // Verify draft preserved
  // Restore connection and save
});
```

Key Verification Points:

- Preserves draft content during network issues
- Handles reconnection gracefully
- Successfully saves changes after reconnection

## Implementation Notes

The motivation changes flow uses:

- Firebase Realtime Database for updates
- Optimistic UI updates
- Cell locking mechanism
- Draft state management

## Test Setup

Tests utilize:

- Mock Google Sheets data
- Firebase test wrapper
- User event simulation
- Network condition mocking

## Common Patterns

1. Select Cell:

```typescript
const motivationCell = screen.getByRole('cell', { name: /M1-1/i });
await user.click(motivationCell);
```

2. Edit Content:

```typescript
await user.keyboard('New motivation text');
await user.keyboard('{Enter}');
```

3. Verify Updates:

```typescript
expect(motivationCell).toHaveTextContent('New motivation text');
```

4. Check Lock State:

```typescript
expect(screen.getByText(/cell is locked by other user/i)).toBeInTheDocument();
```

## Test Data Structure

The tests use a default data structure:

```typescript
const defaultTestData = [
  ['', 'Role 1', 'Role 2', 'Role 3'],
  ['Conflict 1', 'M1-1', 'M1-2', 'M1-3'],
  ['Conflict 2', 'M2-1', 'M2-2', 'M2-3'],
  ['Conflict 3', 'M3-1', 'M3-2', 'M3-3'],
];
```

This structure represents:

- Header row with role names
- Conflict rows with motivations
- Cell format: M[conflict]-[role]
