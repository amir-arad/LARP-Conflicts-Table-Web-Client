# Multi-user Awareness Flow

The multi-user awareness flow tests the collaborative features that help users work together effectively by showing who is active and what they're working on.

## Test Cases

### Active Users List

Tests displaying active users:

```typescript
test('shows active users in the presence list', async () => {
  // Set up mock presence data
  // Verify users appear in list
  // Check user details displayed
});
```

Key Verification Points:

- Shows all active users
- Displays user names
- Updates list in real-time

### Presence Indicators

Tests real-time presence updates:

```typescript
test('updates presence indicators in real-time', async () => {
  // Add user presence
  // Update user state
  // Verify indicator updates
});
```

Key Verification Points:

- Shows when users become active
- Updates when users change focus
- Clears when users become inactive

### Concurrent Editing

Tests handling multiple editors:

```typescript
test('handles concurrent editing states', async () => {
  // Set up other user editing
  // Try editing locked cell
  // Verify can edit different cell
});
```

Key Verification Points:

- Shows cell lock indicators
- Prevents editing locked cells
- Allows editing different cells

### User Location Indicators

Tests accurate user position display:

```typescript
test('shows user indicators in correct locations', async () => {
  // Set up users in different locations
  // Verify indicators in correct cells
  // Check aria labels
});
```

Key Verification Points:

- Shows role editors correctly
- Shows conflict editors correctly
- Shows motivation editors correctly
- Uses proper aria labels

## Implementation Notes

The multi-user awareness system uses:

- Firebase Realtime Database for presence
- Real-time position tracking
- Cell-level locking
- Accessibility attributes

## Test Setup

Tests utilize:

- Mock presence data
- Firebase test wrapper
- User event simulation
- Accessibility queries

## Common Patterns

1. Set Up Presence:

```typescript
const mockPresence = {
  'user-1': {
    name: 'User One',
    photoUrl: '',
    activeCell: null,
    lastActive: Date.now(),
  },
};
await testWrapper.mockFirebase.api.set(presenceRef, mockPresence);
```

2. Check User Display:

```typescript
expect(screen.getByText('User One')).toBeInTheDocument();
```

3. Verify Cell Lock:

```typescript
expect(screen.getByText(/cell is locked by other user/i)).toBeInTheDocument();
```

4. Check Position Indicators:

```typescript
expect(roleCell).toHaveAttribute(
  'aria-label',
  expect.stringContaining('Role Editor')
);
```

## Presence Data Structure

The presence system uses a structured format:

```typescript
interface UserPresence {
  name: string;
  photoUrl: string;
  activeCell: string | null; // 'cell-row-col' format
  lastActive: number; // timestamp
}
```

Key components:

- User identification
- Current cell position
- Activity timestamp
- Visual elements (photo)
