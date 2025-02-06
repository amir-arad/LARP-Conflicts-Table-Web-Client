# Real-Time Collaboration Design

> Design for decentralized real-time collaboration using Google Sheets + Firebase RTDB.
> Focus on simplicity and optimistic locking through UI and social mechanisms.
> The application is already functional for a single user at a time, and working with google sheets correctly

## Architecture Summary

- **Source of Truth:** Google Sheets
- **Real-time Layer:** Firebase RTDB
- **Concurrency Model:** Optimistic UI locking
- **Architecture Style:** Decentralized
- **State Management:** Eventually consistent

## Data Structures

### Firebase RTDB Schema

```typescript
interface RealtimeState {
  sheets: {
    [sheetId: string]: {
      presence: {
        [userId: string]: {
          name: string,
          photoUrl: string,
          lastActive: timestamp,
          activeCell?: string
        }
      },
      locks: {
        [cellId: string]: {
          userId: string,
          acquired: timestamp,
          expires: timestamp + 30000  // 30s TTL
        }
      }
    }
  }
}
```

### Google Sheets Usage

- Standard grid layout
- No special metadata/formatting required
- Pure data storage

## Core Flows

### Connection Lifecycle

1. User opens sheet
2. Connect to Firebase RTDB (sheetId)
3. Register presence (auto-disconnect)
4. Load initial sheet data
5. Subscribe to presence & locks

### Edit Lifecycle

1. User selects cell
2. Check Firebase locks
3. If unlocked:
   - Acquire lock (30s TTL)
   - Show edit UI
   - Update cursor position
4. On completion:
   - Write to Google Sheets
   - Release lock
   - Clear cursor

### Presence Lifecycle

1. Firebase manages connection state
2. 30s heartbeat for lastActive
3. Cursor position updates
4. TTL-based cleanup

## UI Components

### Presence Display

- Active users list
- Real-time updates
- Auto-cleanup of disconnected users

### Cell Status Indicators

- Lock state (border color)
- Current editor (avatar)
- Editor name (tooltip)
- Auto-release (30s)

### Cursor Tracking

- User positions
- Avatar overlays
- Real-time updates

## Error Handling

### Network Resilience

- Firebase disconnect handling
- Automatic presence/lock expiry
- Google Sheets operation retry

### Conflict Strategy

- Trust UI locks (optimistic)
- Last-write-wins fallback
- No merge resolution needed

## Implementation Benefits

### Simplicity

- No dedicated server
- Avoid merge conflicts
- Clear ownership model

### Scalability

- Firebase handles real-time
- Google Sheets scales data
- Natural concurrency limits

### Maintainability

- Clear responsibilities
- Minimal components
- Standard patterns

### UX Quality

- Instant feedback
- Clear ownership
- Familiar patterns

## Dependencies

### Required APIs

- Google Sheets API v4
- Firebase RTDB
- Client Framework

## Implementation Files

### Core Files

- `src/contexts/CollaborationContext.tsx` (new)

  - Firebase connection state management
  - Collaboration state provider
  - Presence and lock state management
  - Real-time event subscriptions

- `src/lib/collaboration.ts` (new)

  - Collaboration types and interfaces
  - State management types
  - Real-time data structures

- `src/hooks/useConflictsTable.ts` (modify)
  - Integration with collaboration context
  - Optimistic updates
  - Sheet data synchronization

### Components

- `src/components/conflicts-table-tool.tsx` (modify)

  - Cell lock UI indicators
  - Presence avatars
  - Cursor position overlay

- `src/components/ui/table-cell.tsx` (modify)
  - Lock state visualization
  - Editor information
  - Real-time status indicators

### Configuration

- `src/config.tsx` (modify)
  - Firebase configuration
  - Real-time feature flags
  - Timing constants

### Utils

- `src/lib/firebase.ts` (new)
  - Firebase initialization
  - RTDB utilities
  - Connection helpers

## Implementation Strategy

1. Add Firebase configuration
2. Implement CollaborationContext
3. Create collaboration types and utilities
4. Modify existing table components
5. Integrate presence system
6. Add lock mechanism
7. Implement cursor tracking

### Implementation Phases

1. **Real-time Foundation**

   - Firebase setup
   - RTDB integration
   - Connection management

2. **Real-time Features**

   - Presence system
   - Lock mechanism
   - Cursor tracking

3. **UI Refinement**

   - Status indicators
   - Tooltips
   - Error states

4. **Performance**
   - Optimization
   - Error handling
   - Edge cases

## References

- [COLLABORATION-UX.md](./COLLABORATION-UX.md) - UX requirements
- Firebase RTDB docs
- Google Sheets API v4 docs

## Notes

- Design prioritizes simplicity over perfect consistency
- Relies on social protocols + UI locks
- Eventual consistency is acceptable
- No conflict resolution needed
