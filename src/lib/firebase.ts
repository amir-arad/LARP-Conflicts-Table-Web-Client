import {
  CollaborationState,
  HeartbeatConfig,
  HeartbeatError,
  LockInfo,
  LocksState,
  Presence,
} from "./collaboration";
import {
  Database,
  DatabaseReference,
  get,
  getDatabase,
  goOffline,
  goOnline,
  off,
  onDisconnect,
  onValue,
  orderByChild,
  query,
  ref,
  remove,
  serverTimestamp,
  set,
  update,
} from "firebase/database";
import { FirebaseApp, initializeApp } from "firebase/app";

let firebaseApp: FirebaseApp | null = null;
let database: Database | null = null;

export const initializeFirebase = (config: Record<string, string>) => {
  if (!firebaseApp) {
    firebaseApp = initializeApp(config);
    database = getDatabase(firebaseApp);
  }
  return { firebaseApp, database };
};

export const getDatabaseRef = (path: string): DatabaseReference | null => {
  if (!database) {
    console.error("Firebase not initialized");
    return null;
  }
  return ref(database, path);
};

export const setupDisconnectCleanup = (
  reference: DatabaseReference,
  cleanup: any
) => {
  return onDisconnect(reference).set(cleanup);
};

export const subscribeToPath = (
  path: string,
  callback: (data: any) => void
): (() => void) => {
  const reference = getDatabaseRef(path);
  if (!reference) return () => {};

  onValue(reference, (snapshot) => {
    callback(snapshot.val());
  });

  return () => off(reference);
};

export const updateData = async (path: string, data: any): Promise<void> => {
  const reference = getDatabaseRef(path);
  if (!reference) return;

  await set(reference, data);
};

export const getSheetPath = (sheetId: string): string => {
  return `sheets/${sheetId}`;
};

export const getPresencePath = (sheetId: string, userId: string): string => {
  return `sheets/${sheetId}/presence/${userId}`;
};

export const getLockPath = (sheetId: string, cellId: string): string => {
  return `sheets/${sheetId}/locks/${cellId}`;
};

export const connectionManager = {
  monitorConnection: (callback: (connected: boolean) => void): (() => void) => {
    const connectedRef = getDatabaseRef(".info/connected");
    if (!connectedRef) return () => {};

    const unsubscribe = onValue(connectedRef, (snap) => {
      const connected = snap.val() === true;
      callback(connected);
    });

    return unsubscribe;
  },

  setConnectionState: (online: boolean) => {
    if (online) {
      goOnline(database!);
    } else {
      goOffline(database!);
    }
  },

  setupPresenceHeartbeat: (
    sheetId: string,
    userId: string,
    presenceData: Partial<Presence>,
    config: HeartbeatConfig = {
      interval: 30000,
      maxRetries: 3,
      retryDelay: 5000,
    },
    onError?: (error: HeartbeatError) => void
  ) => {
    const presenceRef = getDatabaseRef(getPresencePath(sheetId, userId));
    if (!presenceRef) return;

    let retryCount = 0;
    let retryTimeout: NodeJS.Timeout | null = null;

    const updatePresence = async () => {
      try {
        await set(presenceRef, {
          ...presenceData,
          lastActive: serverTimestamp(),
        });
        retryCount = 0; // Reset retry count on success
      } catch (error) {
        retryCount++;
        const heartbeatError: HeartbeatError = {
          code: 'HEARTBEAT_FAILED',
          message: 'Failed to update presence',
          details: error,
          timestamp: Date.now(),
          retryCount,
        };

        if (onError) {
          onError(heartbeatError);
        }

        // Retry if under max retries
        if (retryCount <= config.maxRetries) {
          if (retryTimeout) {
            clearTimeout(retryTimeout);
          }
          retryTimeout = setTimeout(updatePresence, config.retryDelay);
        }
      }
    };

    // Initial presence update
    updatePresence();

    // Setup regular heartbeat
    const heartbeatInterval = setInterval(updatePresence, config.interval);

    // Setup disconnect cleanup
    setupDisconnectCleanup(presenceRef, null);

    return () => {
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
      clearInterval(heartbeatInterval);
      set(presenceRef, null);
    };
  },

  isDatabaseReady: (): boolean => {
    return database !== null;
  },

  reconnect: async (): Promise<void> => {
    if (!database) return;

    goOffline(database);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    goOnline(database);
  },
};

export const realtimeDB = {
  /**
   * Sheet Methods
   */
  sheet: {
    /**
     * Get all real-time data for a sheet
     */
    getData: async (sheetId: string): Promise<CollaborationState | null> => {
      const sheetRef = getDatabaseRef(getSheetPath(sheetId));
      if (!sheetRef) return null;

      const snapshot = await get(sheetRef);
      return snapshot.val();
    },

    /**
     * Subscribe to all sheet changes
     */
    subscribe: (
      sheetId: string,
      callback: (data: CollaborationState | null) => void
    ): (() => void) => {
      return subscribeToPath(getSheetPath(sheetId), callback);
    },
  },

  /**
   * Presence Methods
   */
  presence: {
    /**
     * Get active users in a sheet
     */
    getActiveUsers: async (
      sheetId: string
    ): Promise<CollaborationState["presence"]> => {
      const presencePath = `sheets/${sheetId}/presence`;
      const presenceRef = getDatabaseRef(presencePath);
      if (!presenceRef) return {};

      const snapshot = await get(presenceRef);
      return snapshot.val() || {};
    },

    /**
     * Update user presence data
     */
    updateUserPresence: async (
      sheetId: string,
      userId: string,
      data: Partial<CollaborationState["presence"][string]>
    ): Promise<void> => {
      const presenceRef = getDatabaseRef(getPresencePath(sheetId, userId));
      if (!presenceRef) return;

      await update(presenceRef, {
        ...data,
        userId, 
        lastActive: serverTimestamp(),
      });
    },

    /**
     * Subscribe to presence changes
     */
    subscribeToPresence: (
      sheetId: string,
      callback: (presence: CollaborationState["presence"]) => void
    ): (() => void) => {
      const presencePath = `sheets/${sheetId}/presence`;
      return subscribeToPath(presencePath, callback);
    },

    /**
     * Clean up inactive users (utility for maintenance)
     */
    cleanupInactiveUsers: async (
      sheetId: string,
      maxInactiveTime: number
    ): Promise<void> => {
      const presencePath = `sheets/${sheetId}/presence`;
      const presenceRef = getDatabaseRef(presencePath);
      if (!presenceRef) return;

      const snapshot = await get(
        query(presenceRef, orderByChild("lastActive"))
      );

      const now = Date.now();
      const updates: Record<string, null> = {};

      snapshot.forEach((child) => {
        const lastActive = child.val().lastActive;
        if (now - lastActive > maxInactiveTime) {
          updates[child.key!] = null;
        }
      });

      if (Object.keys(updates).length > 0) {
        await update(presenceRef, updates);
      }
    },
  },

  /**
   * Lock Methods
   */
  locks: {
    /**
     * Acquire a cell lock
     */
    acquireLock: async (
      sheetId: string,
      cellId: string,
      userId: string
    ): Promise<boolean> => {
      const lockRef = getDatabaseRef(getLockPath(sheetId, cellId));
      if (!lockRef) return false;

      const lockData = {
        userId,
        acquired: serverTimestamp(),
      };

      try {
        await set(lockRef, lockData);
        return true;
      } catch (error) {
        console.error("Failed to acquire lock:", error);
        return false;
      }
    },

    /**
     * Release a cell lock
     */
    releaseLock: async (
      sheetId: string,
      cellId: string,
      userId: string
    ): Promise<boolean> => {
      const lockRef = getDatabaseRef(getLockPath(sheetId, cellId));
      if (!lockRef) return false;

      // Verify lock ownership before release
      const snapshot = await get(lockRef);
      const currentLock = snapshot.val();

      if (currentLock && currentLock.userId === userId) {
        await remove(lockRef);
        return true;
      }
      return false;
    },

    /**
     * Subscribe to lock changes
     */
    subscribeToCellLocks: (
      sheetId: string,
      callback: (locks: LocksState) => void
    ): (() => void) => {
      const locksPath = `sheets/${sheetId}/locks`;
      return subscribeToPath(locksPath, callback);
    },

    /**
     * Check if a cell is locked
     */
    checkLock: async (
      sheetId: string,
      cellId: string
    ): Promise<{
      isLocked: boolean;
      lockInfo: LockInfo | null;
    }> => {
      const lockRef = getDatabaseRef(getLockPath(sheetId, cellId));
      if (!lockRef) return { isLocked: false, lockInfo: null };

      const snapshot = await get(lockRef);
      const lockData: LockInfo = snapshot.val();

      if (!lockData) {
        return { isLocked: false, lockInfo: null };
      }

      const now = Date.now();
      const isLocked = lockData.acquired + 30_000 > now;

      return {
        isLocked,
        lockInfo: isLocked ? lockData : null,
      };
    },
  },
};
