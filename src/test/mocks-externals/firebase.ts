import type { DatabaseReference, DataSnapshot } from 'firebase/database';

import { TEST_PATHS } from '../config/firebase.config';

/**
 * Create a mock database reference
 */
export const createMockDatabaseRef = (path: string): DatabaseReference => {
  // Simulate connection error for invalid paths
  if (path.startsWith('invalid/')) {
    throw new DatabaseConnectionError(path);
  }

  const descriptor = {
    key: { value: path.split('/').pop(), writable: false },
    parent: {
      value: path.includes('/')
        ? createMockDatabaseRef(path.split('/').slice(0, -1).join('/'))
        : null,
      writable: false,
    },
    toString: { value: () => path, writable: false },
    isEqual: {
      value: (other: DatabaseReference) => path === other.toString(),
      writable: false,
    },
    toJSON: { value: () => path, writable: false },
    path: {
      value: { pieces_: path.split('/').filter(Boolean), pieceNum_: 0 },
      writable: false,
    },
    _path: {
      value: { pieces_: path.split('/').filter(Boolean), pieceNum_: 0 },
      writable: false,
    },
    repo: {
      value: { serverSyncTree_: {} },
      writable: true,
      configurable: true,
    },
  };

  const ref = {
    key: descriptor.key.value,
    parent: descriptor.parent.value,
    toString: descriptor.toString.value,
    isEqual: descriptor.isEqual.value,
    toJSON: descriptor.toJSON.value,
    path: descriptor.path.value,
    _path: descriptor._path.value,
    repo: descriptor.repo.value || { serverSyncTree_: {} },
  } as unknown as DatabaseReference;
  const mutableRef = ref as DatabaseReference & {
    root: DatabaseReference;
    ref: DatabaseReference;
  };
  mutableRef.root = mutableRef;
  mutableRef.ref = mutableRef;
  return mutableRef;
};

/**
 * Create a mock data snapshot
 */
export const createMockDataSnapshot = (
  data: unknown,
  refPath: string
): DataSnapshot => {
  // Ensure data is an object or null
  const safeData =
    data === undefined
      ? null
      : typeof data === 'object'
        ? data
        : { value: data };

  return {
    val: () => safeData,
    exists: () => safeData !== null,
    key: refPath.split('/').pop() || null,
    ref: createMockDatabaseRef(refPath),
    size: safeData === null ? 0 : 1,
    hasChild: () => false,
    hasChildren: () =>
      safeData !== null && Object.keys(safeData as object).length > 0,
    child: (path: string) => createMockDataSnapshot(null, `${refPath}/${path}`),
    forEach: () => false,
    toJSON: () => safeData,
    priority: null,
    exportVal: () => safeData,
  };
};

/**
 * Helper function to notify subscribers
 */
function notifySubscribers(path: string, value: unknown) {
  const subscribers = mockDbState.subscriptions.get(path);
  if (subscribers) {
    const snapshot = createMockDataSnapshot(value, path);
    subscribers.forEach(callback => callback(snapshot));
  }
}

/**
 * Mock Firebase database operations
 */
export const mockDatabase = {
  getSubscriptionsCount: () => {
    return [...mockDbState.subscriptions.values()].reduce(
      (total, subs) => total + subs.size,
      0
    );
  },
  getDatabaseRef: (path: string): DatabaseReference => {
    return createMockDatabaseRef(path);
  },

  setupDisconnectCleanup: async (ref: DatabaseReference, cleanup: unknown) => {
    mockDbState.disconnectHandlers.set(ref.toString(), cleanup);
  },

  onValue: (
    ref: DatabaseReference,
    callback: (snapshot: DataSnapshot) => void
  ): (() => void) => {
    const path = ref.toString();

    // Simulate subscription error for specific test case
    if (path === TEST_PATHS.TEST_PATH && !mockDbState.values.has(path)) {
      throw new Error('Subscription error');
    }

    // Add subscriber
    let subscribers = mockDbState.subscriptions.get(path);
    if (!subscribers) {
      subscribers = new Set<(snapshot: DataSnapshot) => void>();
      mockDbState.subscriptions.set(path, subscribers);
    }
    subscribers.add(callback);

    // Initial callback with current value
    const currentValue = mockDbState.values.get(path) ?? null;
    callback(createMockDataSnapshot(currentValue, path));

    // Return unsubscribe function
    const unsubscribe = () => {
      const subs = mockDbState.subscriptions.get(path);
      if (subs) {
        subs.delete(callback);
        if (subs.size === 0) {
          mockDbState.subscriptions.delete(path);
        }
      }
    };

    // Track unsubscribe function for cleanup
    mockDbState.unsubscribeFunctions.set(callback, unsubscribe);

    return unsubscribe;
  },

  set: async (ref: DatabaseReference, data: unknown) => {
    if (data === undefined) {
      throw new InvalidDataError(data);
    }

    const path = ref.toString();
    mockDbState.values.set(path, data);
    notifySubscribers(path, data);
  },

  goOnline: () => {
    mockDbState.isOnline = true;
    mockDbState.subscriptions.forEach((_, path) => {
      const value = mockDbState.values.get(path) ?? null;
      notifySubscribers(path, value);
    });
  },

  goOffline: () => {
    mockDbState.isOnline = false;
    mockDbState.disconnectHandlers.forEach((cleanup, path) => {
      mockDbState.values.set(path, cleanup);
      notifySubscribers(path, cleanup);
    });
  },
};

/**
 * Global mock database state
 */
export const mockDbState: MockDatabaseState = {
  values: new Map(),
  disconnectHandlers: new Map(),
  isOnline: true,
  subscriptions: new Map(),
  unsubscribeFunctions: new Map(),
};

/**
 * State management functions
 */
export const dbStateManager = {
  /**
   * Reset all state
   */
  reset: () => {
    mockDbState.values.clear();
    mockDbState.disconnectHandlers.clear();
    mockDbState.isOnline = true;
    mockDbState.subscriptions.clear();
    mockDbState.unsubscribeFunctions.clear();
  },

  /**
   * Get value at path
   */
  getValue: (path: string): unknown => {
    return mockDbState.values.get(path) ?? null;
  },

  /**
   * Set value at path and notify subscribers
   */
  setValue: (path: string, value: unknown) => {
    mockDbState.values.set(path, value);
    const subscribers = mockDbState.subscriptions.get(path);
    if (subscribers) {
      const snapshot = createMockDataSnapshot(value, path);
      subscribers.forEach(callback => callback(snapshot));
    }
  },

  /**
   * Set disconnect handler for path
   */
  setDisconnectHandler: (path: string, cleanup: unknown) => {
    mockDbState.disconnectHandlers.set(path, cleanup);
  },

  /**
   * Add subscriber for path
   */
  addSubscriber: (path: string, callback: (snapshot: DataSnapshot) => void) => {
    let subscribers = mockDbState.subscriptions.get(path);
    if (!subscribers) {
      subscribers = new Set();
      mockDbState.subscriptions.set(path, subscribers);
    }
    subscribers.add(callback);
  },

  /**
   * Remove subscriber for path
   */
  removeSubscriber: (
    path: string,
    callback: (snapshot: DataSnapshot) => void
  ) => {
    const subscribers = mockDbState.subscriptions.get(path);
    if (subscribers) {
      subscribers.delete(callback);
      if (subscribers.size === 0) {
        mockDbState.subscriptions.delete(path);
      }
    }
  },

  /**
   * Execute disconnect handlers
   */
  executeDisconnectHandlers: () => {
    mockDbState.disconnectHandlers.forEach((cleanup, path) => {
      dbStateManager.setValue(path, cleanup);
    });
  },

  /**
   * Notify all subscribers of current values
   */
  notifyAllSubscribers: () => {
    mockDbState.subscriptions.forEach((_subscribers, path) => {
      const value = mockDbState.values.get(path) ?? null;
      dbStateManager.setValue(path, value);
    });
  },
};

/**
 * Mock Firebase implementation
 */
export const mockFirebase = {
  ...mockDatabase,
  _reset: dbStateManager.reset,
};

/**
 * Mock database state interface
 */
export interface MockDatabaseState {
  values: Map<string, unknown>;
  disconnectHandlers: Map<string, unknown>;
  isOnline: boolean;
  subscriptions: Map<string, Set<(snapshot: DataSnapshot) => void>>;
  unsubscribeFunctions: Map<(snapshot: DataSnapshot) => void, () => void>;
}

/**
 * Custom error classes for Firebase operations
 */
export class DatabaseConnectionError extends Error {
  constructor(path: string, details?: string) {
    super(
      `Database connection error for path: ${path}${details ? ` - ${details}` : ''}`
    );
    this.name = 'DatabaseConnectionError';
  }
}

export class InvalidDataError extends Error {
  constructor(data: unknown, details?: string) {
    super(
      `Invalid data for database operation: ${JSON.stringify(data)}${details ? ` - ${details}` : ''}`
    );
    this.name = 'InvalidDataError';
  }
}

export class SubscriptionError extends Error {
  constructor(path: string, details?: string) {
    super(
      `Subscription error for path: ${path}${details ? ` - ${details}` : ''}`
    );
    this.name = 'SubscriptionError';
  }
}

export class CleanupError extends Error {
  constructor(path: string, details?: string) {
    super(`Cleanup error for path: ${path}${details ? ` - ${details}` : ''}`);
    this.name = 'CleanupError';
  }
}

/**
 * Enhanced mock database reference interface
 */
export interface EnhancedMockDatabaseRef extends DatabaseReference {
  path: string;
  onDisconnect: () => Promise<void>;
  set: (value: unknown) => Promise<void>;
}

/**
 * Enhanced mock data snapshot interface
 */
export interface EnhancedMockDataSnapshot extends DataSnapshot {
  exists: () => boolean;
  val: () => unknown;
  ref: EnhancedMockDatabaseRef;
}

/**
 * Helper to create a mock database reference
 */
export function createMockRef(path: string): DatabaseReference {
  return mockDatabase.getDatabaseRef(path);
}

/**
 * Helper to create a mock snapshot
 */
export function createMockSnapshot<T extends object>(
  value: T,
  path = 'mock-path'
): DataSnapshot {
  return createMockDataSnapshot(value, path);
}
