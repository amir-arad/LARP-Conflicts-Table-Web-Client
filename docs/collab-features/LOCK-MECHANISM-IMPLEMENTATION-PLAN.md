# Lock Mechanism Implementation Plan

## Overview

This document outlines the implementation plan for completing the cell locking mechanism in the real-time collaboration system. The lock mechanism is a critical component that prevents edit conflicts by ensuring only one user can edit a cell at a time.

## Current Status

- ✅ Firebase infrastructure is fully set up
- ✅ Presence system is implemented and operational
- ✅ Lock state visualization UI components are in place
- ✅ Lock tooltip UI components are implemented
- ❌ Lock validation utilities (pending)
- ❌ Lock acquisition logic (pending)
- ❌ TTL-based lock expiration (pending)
- ❌ Lock release mechanisms (pending)

## Implementation Plan

### 1. Create Lock Utilities (src/lib/lockUtils.ts)

Create a new utility file with functions to handle lock validation, acquisition, and release:

```typescript
// src/lib/lockUtils.ts
import { LockInfo, timestamp } from './collaboration';

export const DEFAULT_LOCK_TTL = 30000; // 30 seconds in milliseconds

/**
 * Validates if a lock is still active based on its expiration time
 */
export function isLockActive(lock: LockInfo | undefined | null): boolean {
  if (!lock) return false;
  return Date.now() < lock.expires;
}

/**
 * Checks if the current user owns the lock
 */
export function isLockOwner(
  lock: LockInfo | undefined | null,
  currentUserId: string | undefined
): boolean {
  if (!lock || !currentUserId) return false;
  return lock.userId === currentUserId && isLockActive(lock);
}

/**
 * Creates a new lock object with the specified TTL
 */
export function createLock(
  userId: string,
  ttl: number = DEFAULT_LOCK_TTL
): LockInfo {
  const now = Date.now();
  return {
    userId,
    acquired: now,
    expires: now + ttl,
  };
}
```

### 2. Extend usePresence Hook with Lock Management (src/hooks/usePresence.tsx)

Add lock management methods to the existing `usePresence` hook:

```typescript
// Additional methods for usePresence.tsx

// Add these imports
import { createLock, isLockActive, isLockOwner } from '../lib/lockUtils';

// Add these methods to the hook
const acquireLock = useCallback(
  async (cellId: string, ttl?: number): Promise<boolean> => {
    if (!namespace || !userId || !isReady) {
      console.error('Cannot acquire lock without namespace and auth');
      return false;
    }

    const lockRef = firebase.getDatabaseRef(
      `sheets/${namespace}/locks/${cellId}`
    );

    // Check if lock exists and is valid
    const snapshot = await firebase.get(lockRef);
    const existingLock = snapshot.val() as LockInfo | null;

    if (existingLock && isLockActive(existingLock)) {
      // Someone else has a valid lock
      if (existingLock.userId !== userId) {
        return false;
      }
      // We already own the lock, extend it
    }

    // Create new lock
    const lock = createLock(userId, ttl);

    // Set up auto-expiry cleanup
    firebase.setupDisconnectCleanup(lockRef, null);

    // Set the lock
    await firebase.set(lockRef, lock);

    return true;
  },
  [namespace, userId, isReady, firebase]
);

const releaseLock = useCallback(
  async (cellId: string): Promise<boolean> => {
    if (!namespace || !userId || !isReady) {
      console.error('Cannot release lock without namespace and auth');
      return false;
    }

    const lockRef = firebase.getDatabaseRef(
      `sheets/${namespace}/locks/${cellId}`
    );

    // Check if we own the lock
    const snapshot = await firebase.get(lockRef);
    const existingLock = snapshot.val() as LockInfo | null;

    if (existingLock && existingLock.userId !== userId) {
      console.warn('Cannot release a lock owned by another user');
      return false;
    }

    // Release the lock
    await firebase.set(lockRef, null);
    return true;
  },
  [namespace, userId, isReady, firebase]
);

const checkLock = useCallback(
  async (
    cellId: string
  ): Promise<{
    isLocked: boolean;
    isOwner: boolean;
    lockInfo: LockInfo | null;
  }> => {
    if (!namespace || !isReady) {
      console.error('Cannot check lock without namespace');
      return { isLocked: false, isOwner: false, lockInfo: null };
    }

    const lockRef = firebase.getDatabaseRef(
      `sheets/${namespace}/locks/${cellId}`
    );

    const snapshot = await firebase.get(lockRef);
    const lock = snapshot.val() as LockInfo | null;

    const isLocked = isLockActive(lock);
    const isOwner = isLockOwner(lock, userId);

    // If lock exists but is expired, clean it up
    if (lock && !isLocked) {
      await firebase.set(lockRef, null);
      return { isLocked: false, isOwner: false, lockInfo: null };
    }

    return { isLocked, isOwner, lockInfo: isLocked ? lock : null };
  },
  [namespace, userId, isReady, firebase]
);

// Include these methods in the return value
const returnValue = useMemo(
  () => ({
    presence,
    locks,
    registerPresence,
    unregisterPresence,
    acquireLock, // New method
    releaseLock, // New method
    checkLock, // New method
  }),
  [
    presence,
    locks,
    registerPresence,
    unregisterPresence,
    acquireLock,
    releaseLock,
    checkLock,
  ]
);
```

### 3. Create useLock Custom Hook (src/hooks/useLock.tsx)

Create a dedicated hook for lock management to simplify implementation in components:

```typescript
// src/hooks/useLock.tsx
import { useCallback, useEffect, useState } from 'react';
import { LockInfo } from '../lib/collaboration';
import { usePresence } from './usePresence';

interface UseLockOptions {
  autoRenew?: boolean;
  ttl?: number;
  onLockFailed?: (reason: string) => void;
}

export function useLock(namespace: string, options: UseLockOptions = {}) {
  const { autoRenew = true, ttl, onLockFailed } = options;
  const { acquireLock, releaseLock, checkLock, locks } = usePresence(namespace);
  const [activeLock, setActiveLock] = useState<string | null>(null);
  const [renewalInterval, setRenewalInterval] = useState<NodeJS.Timeout | null>(
    null
  );

  // Clean up renewal interval on unmount
  useEffect(() => {
    return () => {
      if (renewalInterval) {
        clearInterval(renewalInterval);
      }

      // Release any active locks on unmount
      if (activeLock) {
        releaseLock(activeLock).catch(console.error);
      }
    };
  }, [renewalInterval, activeLock, releaseLock]);

  const lockCell = useCallback(
    async (cellId: string): Promise<boolean> => {
      try {
        const success = await acquireLock(cellId, ttl);

        if (!success) {
          onLockFailed?.('Cell is currently being edited by another user');
          return false;
        }

        setActiveLock(cellId);

        // Set up auto-renewal if enabled
        if (autoRenew) {
          if (renewalInterval) {
            clearInterval(renewalInterval);
          }

          // Renew every 10 seconds (before 30s TTL expires)
          const interval = setInterval(() => {
            acquireLock(cellId, ttl).catch(console.error);
          }, 10000);

          setRenewalInterval(interval);
        }

        return true;
      } catch (error) {
        console.error('Failed to lock cell', error);
        onLockFailed?.('Failed to lock cell due to technical error');
        return false;
      }
    },
    [acquireLock, ttl, autoRenew, renewalInterval, onLockFailed]
  );

  const unlockCell = useCallback(async (): Promise<boolean> => {
    if (!activeLock) return true;

    try {
      // Clear renewal interval
      if (renewalInterval) {
        clearInterval(renewalInterval);
        setRenewalInterval(null);
      }

      const success = await releaseLock(activeLock);
      if (success) {
        setActiveLock(null);
      }
      return success;
    } catch (error) {
      console.error('Failed to unlock cell', error);
      return false;
    }
  }, [activeLock, releaseLock, renewalInterval]);

  const getCellLockStatus = useCallback(
    async (cellId: string) => {
      return checkLock(cellId);
    },
    [checkLock]
  );

  return {
    lockCell,
    unlockCell,
    getCellLockStatus,
    activeLock,
    allLocks: locks,
  };
}
```

### 4. Integrate Lock System with Table Cell Component (src/components/ui/table-cell.tsx)

Add lock acquisition and validation to the table cell component:

```typescript
// Modifications to table-cell.tsx
import { useLock } from '../../hooks/useLock';
import { LockIndicator } from './lock-indicator';
import { usePresence } from '../../hooks/usePresence';
import { useToast } from './use-toast'; // Assuming you have a toast component

// Inside your TableCell component
const { presence, locks } = usePresence(sheetId);
const { lockCell, unlockCell, activeLock } = useLock(sheetId, {
  onLockFailed: (message) => {
    toast({
      title: 'Cell Locked',
      description: message,
      variant: 'destructive'
    });
  }
});
const { toast } = useToast();

// Handle edit start
const handleEditStart = async () => {
  // Try to acquire lock before editing
  const canEdit = await lockCell(cellId);
  if (canEdit) {
    setIsEditing(true);
  }
};

// Handle edit end
const handleEditEnd = async () => {
  setIsEditing(false);
  await unlockCell();
};

// Get lock information for UI display
const currentLock = locks[cellId];
const lockOwner = currentLock ? presence[currentLock.userId] : null;

// In the render function
return (
  <div className="relative group">
    {/* Cell content */}

    {/* Lock indicator */}
    <LockIndicator lockInfo={currentLock} lockOwner={lockOwner} />
  </div>
);
```

## Testing Strategy

1. **Unit Testing**

   - Test lock utility functions
   - Test hook behavior with mocked Firebase

2. **Integration Testing**

   - Test lock acquisition and release flow
   - Test concurrent lock requests
   - Test lock expiration

3. **Manual Testing**
   - Test with multiple browser sessions
   - Verify lock UI indicators
   - Test disconnect scenarios

## Implementation Timeline

1. **Day 1**: Create lock utilities and extend usePresence hook
2. **Day 2**: Create useLock hook and integrate with table-cell component
3. **Day 3**: Testing and refinement

## Potential Challenges and Solutions

1. **Race Conditions**: Use Firebase transactions for critical operations
2. **Network Disconnects**: Implement robust error handling and reconnection logic
3. **Lock Expiration**: Ensure proper TTL handling and cleanup of stale locks
4. **UI Responsiveness**: Use optimistic updates with fallback for better UX

## Conclusion

This implementation plan provides a comprehensive approach to completing the lock mechanism for cell editing. By following this plan, we will enable users to collaborate on the same sheet without conflicts, with clear visual indicators of who is editing which cells.
