import type { CollaborationState, Presence } from "../lib/collaboration";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { connectionManager, realtimeDB } from "../lib/firebase";

import { useAuth } from "./GoogleAuthContext";

type PresenceError = {
  code: "REGISTRATION_FAILED" | "CLEANUP_FAILED";
  message: string;
  details?: unknown;
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

  useEffect(() => {
    return connectionManager.monitorConnection((connected) => {
      setIsConnected(connected);
    });
  }, []);

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

    try {
      const userId = `user-${Math.random().toString(36).substr(2, 9)}`;
      const cleanup = connectionManager.setupPresenceHeartbeat(
        currentNamespace,
        userId,
        presenceData
      );
      setCleanupFn(() => cleanup);
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

  const value = {
    isConnected,
    collaborationStates,
    registerPresence,
    unregisterPresence,
    setCurrentNamespace,
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

  const { isConnected, setCurrentNamespace } = context;
  const [state, setState] = useState<CollaborationState>({
    presence: {},
    locks: {},
  });

  const { access_token, isReady } = useAuth();

  useEffect(() => {
    if (!namespace || !access_token || !isReady) return;

    setCurrentNamespace(namespace);

    const unsubPresence = realtimeDB.presence.subscribeToPresence(
      namespace,
      (data) => setState((prev) => ({ ...prev, presence: data || {} }))
    );

    const unsubLocks = realtimeDB.locks.subscribeToCellLocks(
      namespace,
      (data) => setState((prev) => ({ ...prev, locks: data || {} }))
    );

    return () => {
      setCurrentNamespace(null);
      unsubPresence();
      unsubLocks();
    };
  }, [namespace, access_token, isReady]);

  return {
    isConnected,
    presence: state.presence,
    locks: state.locks,
    namespace,
    registerPresence: context.registerPresence,
    unregisterPresence: context.unregisterPresence,
  };
}
