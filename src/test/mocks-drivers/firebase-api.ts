import { DatabaseReference, DataSnapshot } from 'firebase/database';
import { vi } from 'vitest';
import { FirebaseAPI } from '../../contexts/FirebaseContext';
import {
  createMockDatabaseRef,
  createMockDataSnapshot,
} from '../mocks-externals/firebase';

// Activity types for detailed simulation
type ActivityType = 'join' | 'leave' | 'focus' | 'edit' | 'idle' | 'heartbeat';

interface ActivityRecord {
  type: ActivityType;
  timestamp: number;
  data?: unknown;
}

interface PresenceData {
  name: string;
  photoUrl: string;
  lastActive: number;
  activeCell: string | null;
  updateType: 'state_change' | 'heartbeat' | 'cell_focus';
  status: 'online' | 'away' | 'offline';
  activityHistory: ActivityRecord[];
  connectionId?: string;
}

interface LockData {
  userId: string;
  acquired: number;
  expires: number;
  attempts?: number;
  previousOwner?: string;
  queue?: string[];
}

interface PresenceMap {
  [userId: string]: PresenceData;
}

interface LockMap {
  [cellId: string]: LockData;
}

export function mockFirebaseAPI() {
  let state = createMockState();
  return {
    triggerUpdate: () => {},
    state,
    api: createMockImplementation(state),
    reset() {
      state = createMockState();
      this.state = state;
      this.api = createMockImplementation(state);
      this.triggerUpdate();
    },
    // Enhanced mock methods for testing
    simulateUserJoined(userId: string, userName: string, photoUrl: string) {
      const presencePath = `sheets/test-sheet-id/presence/${userId}`;
      const now = Date.now();
      const activityRecord: ActivityRecord = {
        type: 'join',
        timestamp: now,
        data: { userId, userName },
      };

      const presenceData = {
        name: userName,
        photoUrl,
        lastActive: now,
        activeCell: null,
        updateType: 'state_change',
      };

      // Update state
      state.values.set(presencePath, presenceData);
      state.activityLog.push(activityRecord);

      // Notify subscribers immediately
      notifySubscribers(state, `sheets/test-sheet-id/presence`, {
        [userId]: presenceData,
      } as PresenceMap);

      return presenceData;
    },
    simulateUserLeft(userId: string) {
      const presencePath = `sheets/test-sheet-id/presence/${userId}`;
      // Immediately remove the user and notify subscribers
      state.values.delete(presencePath);
      notifySubscribers(state, `sheets/test-sheet-id/presence`, {});
    },
    simulateUserActiveCell(userId: string, cellId: string | null) {
      const presencePath = `sheets/test-sheet-id/presence/${userId}`;
      const presenceData = state.values.get(presencePath) as
        | PresenceData
        | undefined;

      if (presenceData) {
        const now = Date.now();
        const updatedData = {
          name: presenceData.name,
          photoUrl: presenceData.photoUrl,
          activeCell: cellId,
          updateType: 'cell_focus',
          lastActive: now,
        };

        // Update state
        state.values.set(presencePath, updatedData);

        // Notify subscribers immediately
        notifySubscribers(state, `sheets/test-sheet-id/presence`, {
          [userId]: updatedData,
        } as PresenceMap);

        return updatedData;
      }
      return null;
    },
    simulateCellLock(cellId: string, userId: string, ttlMs = 30000) {
      const lockPath = `sheets/test-sheet-id/locks/${cellId}`;
      const now = Date.now();

      const activityRecord: ActivityRecord = {
        type: 'edit',
        timestamp: now,
        data: { userId, cellId, action: 'lock_attempt' },
      };

      // Update lock data
      const lockData = {
        userId,
        acquired: now,
        expires: now + ttlMs,
      };

      // Update state
      state.values.set(lockPath, lockData);
      state.activityLog.push(activityRecord);

      // Notify subscribers immediately
      notifySubscribers(state, `sheets/test-sheet-id/locks`, {
        [cellId]: lockData,
      } as LockMap);

      return lockData;
    },
    simulateCellUnlock(cellId: string) {
      const lockPath = `sheets/test-sheet-id/locks/${cellId}`;
      const now = Date.now();

      // Get current lock data
      const currentLock = state.values.get(lockPath) as LockData | undefined;

      if (currentLock) {
        const activityRecord: ActivityRecord = {
          type: 'edit',
          timestamp: now,
          data: {
            userId: currentLock.userId,
            cellId,
            action: 'unlock',
            queueLength: currentLock.queue?.length ?? 0,
          },
        };

        // Update state
        state.values.delete(lockPath);
        state.activityLog.push(activityRecord);

        // Notify subscribers immediately
        notifySubscribers(state, `sheets/test-sheet-id/locks`, {});

        // If there are users in queue, notify the next user
        if (currentLock.queue && currentLock.queue.length > 1) {
          const nextUserId = currentLock.queue[1]; // Skip current user who's unlocking
          const queueNotification: ActivityRecord = {
            type: 'edit',
            timestamp: now,
            data: {
              userId: nextUserId,
              cellId,
              action: 'lock_available',
              queuePosition: 0,
            },
          };
          state.activityLog.push(queueNotification);
        }
      }
    },
    simulateLockExpiration(cellId: string) {
      const lockPath = `sheets/test-sheet-id/locks/${cellId}`;
      const now = Date.now();
      const lockData = state.values.get(lockPath) as LockData | undefined;

      if (lockData) {
        const activityRecord: ActivityRecord = {
          type: 'edit',
          timestamp: now,
          data: {
            userId: lockData.userId,
            cellId,
            action: 'lock_expired',
            queueLength: lockData.queue?.length ?? 0,
            timeSinceAcquired: now - lockData.acquired,
          },
        };

        // Update state
        state.values.delete(lockPath);
        state.activityLog.push(activityRecord);

        // Add artificial network delay based on network conditions
        const delay = Math.max(
          0,
          state.networkCondition.latencyMs +
            (Math.random() * 2 - 1) * state.networkCondition.jitter
        );

        // Simulate packet loss
        if (Math.random() >= state.networkCondition.packetLoss) {
          setTimeout(() => {
            notifySubscribers(
              state,
              `sheets/test-sheet-id/locks`,
              Object.fromEntries(
                Array.from(state.values.entries())
                  .filter(([key]) =>
                    key.startsWith('sheets/test-sheet-id/locks/')
                  )
                  .map(([key, value]) => [key.split('/').pop()!, value])
              ) as LockMap
            );
          }, delay);
        }

        // If there are users in queue, notify the next user
        if (lockData.queue && lockData.queue.length > 1) {
          const nextUserId = lockData.queue[1]; // Skip expired lock owner
          const queueNotification: ActivityRecord = {
            type: 'edit',
            timestamp: now,
            data: {
              userId: nextUserId,
              cellId,
              action: 'lock_available_after_expiry',
              queuePosition: 0,
              previousOwner: lockData.userId,
            },
          };
          state.activityLog.push(queueNotification);
        }
      }
    },
    getCurrentUsers(): PresenceMap {
      const presencePath = 'sheets/test-sheet-id/presence';
      const presenceData: PresenceMap = {};

      for (const [key, value] of state.values.entries()) {
        if (key.startsWith(presencePath)) {
          const userId = key.split('/').pop()!;
          presenceData[userId] = value as PresenceData;
        }
      }

      return presenceData;
    },
    getCurrentLocks(): LockMap {
      const locksPath = 'sheets/test-sheet-id/locks';
      const locksData: LockMap = {};

      for (const [key, value] of state.values.entries()) {
        if (key.startsWith(locksPath)) {
          const cellId = key.split('/').pop()!;
          locksData[cellId] = value as LockData;
        }
      }

      return locksData;
    },
  };
}

/**
 * Create a new mock state instance
 */
export function createMockState() {
  return {
    values: new Map<string, unknown>(),
    subscriptions: new Map<string, Set<(snapshot: DataSnapshot) => void>>(),
    disconnectHandlers: new Map<string, unknown>(),
    isOnline: true as boolean,
    networkCondition: {
      latencyMs: 0,
      packetLoss: 0,
      jitter: 0,
    },
    eventBuffer: [] as Array<{
      path: string;
      value: unknown;
      timestamp: number;
    }>,
    activityLog: [] as ActivityRecord[],
  };
}

export type MockFirebaseState = ReturnType<typeof createMockState>;

/**
 * Helper to notify subscribers of changes
 */
function notifySubscribers(
  state: MockFirebaseState,
  path: string,
  value: unknown
) {
  const subscribers = state.subscriptions.get(path);
  if (subscribers) {
    const snapshot = createMockDataSnapshot(value, path);
    subscribers.forEach(callback => callback(snapshot));
  }
}

/**
 * Create a mock Firebase implementation
 */
export function createMockImplementation(
  state: MockFirebaseState
): FirebaseAPI {
  return {
    getDatabaseRef: vi.fn((path: string) => createMockDatabaseRef(path)),

    setupDisconnectCleanup: vi.fn(
      async (ref: DatabaseReference, cleanup: unknown) => {
        state.disconnectHandlers.set(ref.toString(), cleanup);
      }
    ),

    onValue: vi.fn(
      (ref: DatabaseReference, callback: (snapshot: DataSnapshot) => void) => {
        const path = ref.toString();

        // Get or create subscriber set
        let subscribers = state.subscriptions.get(path);
        if (!subscribers) {
          subscribers = new Set();
          state.subscriptions.set(path, subscribers);
        }

        // Add new subscriber
        subscribers.add(callback);

        // Initial callback with current value
        const currentValue = state.values.get(path) ?? null;
        callback(createMockDataSnapshot(currentValue, path));

        // Return unsubscribe function
        return () => {
          const subs = state.subscriptions.get(path);
          if (subs) {
            subs.delete(callback);
            if (subs.size === 0) {
              state.subscriptions.delete(path);
            }
          }
        };
      }
    ),

    set: vi.fn(async (ref: DatabaseReference, data: unknown) => {
      if (data === undefined) {
        throw new Error('Invalid data: undefined is not allowed');
      }
      const path = ref.toString();
      state.values.set(path, data);

      // Notify subscribers of the specific path
      notifySubscribers(state, path, data);

      // If this is a presence or lock update, also notify parent path subscribers
      if (path.includes('/presence/')) {
        notifySubscribers(
          state,
          'sheets/test-sheet-id/presence',
          Object.fromEntries(
            Array.from(state.values.entries())
              .filter(([key]) =>
                key.startsWith('sheets/test-sheet-id/presence/')
              )
              .map(([key, value]) => [key.split('/').pop()!, value])
          ) as PresenceMap
        );
      } else if (path.includes('/locks/')) {
        notifySubscribers(
          state,
          'sheets/test-sheet-id/locks',
          Object.fromEntries(
            Array.from(state.values.entries())
              .filter(([key]) => key.startsWith('sheets/test-sheet-id/locks/'))
              .map(([key, value]) => [key.split('/').pop()!, value])
          ) as LockMap
        );
      }
    }),

    goOnline: vi.fn(() => {
      state.isOnline = true;
      state.subscriptions.forEach((_, path) => {
        const value = state.values.get(path) ?? null;
        notifySubscribers(state, path, value);
      });
    }),

    goOffline: vi.fn(() => {
      state.isOnline = false;
      state.disconnectHandlers.forEach((cleanup, path) => {
        if (path.includes('/presence/')) {
          state.values.delete(path);
          notifySubscribers(state, 'sheets/test-sheet-id/presence', {});
        }
      });
    }),
  };
}
