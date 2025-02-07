import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type {
  CollaborationState,
  HeartbeatConfig,
  Presence,
  PresenceEvent,
  PresenceEventType,
  PresenceState,
  PresenceSubscriber,
} from "../lib/collaboration";
import {
  connectionManager,
  getDatabaseRef,
  realtimeDB,
  setupDisconnectCleanup,
} from "../lib/firebase";

import { useAuth } from "./AuthContext";

type PresenceError = {
  code: "REGISTRATION_FAILED" | "CLEANUP_FAILED" | "HEARTBEAT_FAILED";
  message: string;
  details?: unknown;
};

const DEFAULT_HEARTBEAT_CONFIG: HeartbeatConfig = {
  interval: 30000, // 30 seconds
  maxRetries: 3,
  retryDelay: 5000, // 5 seconds
};

type PresenceRegistrationOptions = {
  onError?: (error: PresenceError) => void;
};

interface CollaborationContextType {
  isConnected: boolean;
  collaborationStates: Map<string, CollaborationState>;
  registerPresence: (
    presenceData: Presence,
    options?: PresenceRegistrationOptions
  ) => Promise<void>;
  unregisterPresence: () => Promise<void>;
  setCurrentNamespace: (namespace: string | null) => void;
  cleanupFn: (() => void) | null;
  subscribeToPresence: (
    subscriber: PresenceSubscriber,
    eventTypes?: PresenceEventType[]
  ) => () => void;
  previousPresence: PresenceState;
  handlePresenceChange: (newPresence: PresenceState) => void;
}

const CollaborationContext = createContext<CollaborationContextType | null>(
  null
);

type CollaborationProviderProps = {
  children: ReactNode;
};

export function CollaborationProvider({
  children,
}: CollaborationProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [collaborationStates] = useState<Map<string, CollaborationState>>(
    new Map()
  );
  const [currentNamespace, setCurrentNamespace] = useState<string | null>(null);
  const [cleanupFn, setCleanupFn] = useState<(() => void) | null>(null);
  const presenceSubscribers = useRef<Set<PresenceSubscriber>>(new Set());
  const [previousPresence, setPreviousPresence] = useState<PresenceState>({});

  useEffect(() => {
    return () => {
      presenceSubscribers.current.clear();
      if (cleanupFn) {
        cleanupFn();
      }
    };
  }, [cleanupFn]);

  useEffect(() => {
    return connectionManager.monitorConnection((connected) => {
      setIsConnected(connected);
    });
  }, []);

  const { access_token } = useAuth();

  const registerPresence = async (
    presenceData: Presence,
    options?: PresenceRegistrationOptions
  ): Promise<void> => {
    if (!currentNamespace) {
      const error: PresenceError = {
        code: "REGISTRATION_FAILED",
        message: "No active namespace",
      };
      options?.onError?.(error);
      throw error;
    }

    if (!access_token) {
      const error: PresenceError = {
        code: "REGISTRATION_FAILED",
        message: "User not authenticated",
      };
      options?.onError?.(error);
      throw error;
    }

    try {
      // Use a stable ID derived from the access token
      const userId = `user-${btoa(access_token).slice(0, 8)}`;
      const presenceRef = getDatabaseRef(
        `sheets/${currentNamespace}/presence/${userId}`
      );
      if (!presenceRef) {
        throw new Error("Failed to get presence reference");
      }
      await setupDisconnectCleanup(presenceRef, null);

      const heartbeatCleanup = connectionManager.setupPresenceHeartbeat(
        currentNamespace,
        userId,
        presenceData,
        DEFAULT_HEARTBEAT_CONFIG,
        (error) => {
          const presenceError: PresenceError = {
            code: "HEARTBEAT_FAILED",
            message: error.message,
            details: error.details,
          };
          options?.onError?.(presenceError);
        }
      );
      setCleanupFn(() => heartbeatCleanup);
    } catch (error) {
      const presenceError: PresenceError = {
        code: "REGISTRATION_FAILED",
        message: "Failed to register presence",
        details: error,
      };
      options?.onError?.(presenceError);
      throw presenceError;
    }
  };

  const unregisterPresence = async (): Promise<void> => {
    try {
      if (cleanupFn) {
        cleanupFn();
        setCleanupFn(null);
      }
    } catch (error) {
      const presenceError: PresenceError = {
        code: "CLEANUP_FAILED",
        message: "Failed to cleanup presence",
        details: error,
      };
      throw presenceError;
    }
  };

  const handleError = useCallback(
    (error: PresenceError, options?: PresenceRegistrationOptions) => {
      options?.onError?.(error);
      console.error("[Collaboration Error]:", error);
    },
    []
  );

  const emitPresenceEvent = useCallback((event: PresenceEvent) => {
    presenceSubscribers.current.forEach((subscriber) => {
      try {
        subscriber(event);
      } catch (error) {
        console.error("Error in presence subscriber:", error);
      }
    });
  }, []);

  const handlePresenceChange = useCallback(
    (newPresence: PresenceState) => {
      const timestamp = Date.now();

      // Compare with previous state to determine events
      Object.entries(newPresence).forEach(([userId, presence]) => {
        if (!previousPresence[userId]) {
          emitPresenceEvent({
            type: "joined",
            userId,
            presence,
            timestamp,
          });
        } else if (
          JSON.stringify(previousPresence[userId]) !== JSON.stringify(presence)
        ) {
          emitPresenceEvent({
            type: "updated",
            userId,
            presence,
            timestamp,
          });
        }
      });

      // Check for users who left
      Object.keys(previousPresence).forEach((userId) => {
        if (!newPresence[userId]) {
          emitPresenceEvent({
            type: "left",
            userId,
            presence: previousPresence[userId],
            timestamp,
          });
        }
      });

      setPreviousPresence(newPresence);
    },
    [previousPresence, emitPresenceEvent]
  );

  const subscribeToPresence = useCallback(
    (subscriber: PresenceSubscriber, eventTypes?: PresenceEventType[]) => {
      const wrappedSubscriber: PresenceSubscriber = (event) => {
        if (!eventTypes || eventTypes.includes(event.type)) {
          subscriber(event);
        }
      };

      presenceSubscribers.current.add(wrappedSubscriber);
      return () => {
        presenceSubscribers.current.delete(wrappedSubscriber);
      };
    },
    []
  );

  const value: CollaborationContextType = {
    isConnected,
    collaborationStates,
    registerPresence,
    unregisterPresence,
    setCurrentNamespace,
    cleanupFn,
    subscribeToPresence,
    previousPresence,
    handlePresenceChange,
  };

  return (
    <CollaborationContext.Provider value={value}>
      {children}
    </CollaborationContext.Provider>
  );
}

export function useCollaboration(namespace: string) {
  const context = useContext(CollaborationContext);
  if (!context) {
    throw new Error(
      "useCollaboration must be used within a CollaborationProvider"
    );
  }

  const {
    isConnected,
    setCurrentNamespace,
    unregisterPresence,
    cleanupFn,
    registerPresence,
    subscribeToPresence,
  } = context;
  const [{ presence, locks }, setState] = useState<CollaborationState>({
    presence: {},
    locks: {},
  });

  const { access_token, isReady } = useAuth();

  useEffect(() => {
    if (!namespace || !access_token || !isReady) return;

    setCurrentNamespace(namespace);

    const unsubPresence = realtimeDB.presence.subscribeToPresence(
      namespace,
      (data) => {
        const presenceData = data || {};
        setState((prev) => ({ ...prev, presence: presenceData }));
        context.handlePresenceChange(presenceData);
      }
    );

    const unsubLocks = realtimeDB.locks.subscribeToCellLocks(
      namespace,
      (data) => setState((prev) => ({ ...prev, locks: data || {} }))
    );

    return () => {
      if (cleanupFn) {
        cleanupFn();
      }
      setCurrentNamespace(null);
      unsubPresence();
      unsubLocks();
    };
  }, [
    namespace,
    access_token,
    isReady,
    cleanupFn,
    setCurrentNamespace,
    context.handlePresenceChange,
  ]);

  return {
    isConnected,
    presence,
    locks,
    namespace,
    registerPresence,
    unregisterPresence,
    subscribeToPresence,
  };
}
