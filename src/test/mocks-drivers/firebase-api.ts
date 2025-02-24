import { DatabaseReference, DataSnapshot } from 'firebase/database';
import { vi } from 'vitest';
import { FirebaseAPI } from '../../contexts/FirebaseContext';
import {
  createMockDatabaseRef,
  createMockDataSnapshot,
} from '../mocks-externals/firebase';

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
  };
}

export type MockFirebaseState = ReturnType<typeof createMockState>;

/**
 * Create a mock Firebase implementation
 */
export function createMockImplementation(
  state: MockFirebaseState
): FirebaseAPI {
  const notifySubscribers = (path: string, value: unknown) => {
    const subscribers = state.subscriptions.get(path);
    if (subscribers) {
      const snapshot = createMockDataSnapshot(value, path);
      subscribers.forEach(callback => callback(snapshot));
    }
  };

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
      notifySubscribers(path, data);
    }),

    goOnline: vi.fn(() => {
      state.isOnline = true;
      state.subscriptions.forEach((_, path) => {
        const value = state.values.get(path) ?? null;
        notifySubscribers(path, value);
      });
    }),

    goOffline: vi.fn(() => {
      state.isOnline = false;
      state.disconnectHandlers.forEach((cleanup, path) => {
        state.values.set(path, cleanup);
        notifySubscribers(path, cleanup);
      });
    }),
  };
}
