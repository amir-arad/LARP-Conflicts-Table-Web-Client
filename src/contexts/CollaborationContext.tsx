import type {
  CollaborationState,
  Presence,
  timestamp,
} from "../lib/collaboration";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { connectionManager, realtimeDB } from "../lib/firebase";

import { useAuth } from "./GoogleAuthContext";

interface CollaborationContextType {
  isConnected: boolean;
  collaborationStates: Map<string, CollaborationState>;
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

  useEffect(() => {
    return connectionManager.monitorConnection((connected) => {
      setIsConnected(connected);
    });
  }, []);

  const value = {
    isConnected,
    collaborationStates,
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

  const { isConnected } = context;
  const [state, setState] = useState<CollaborationState>({
    presence: {},
    locks: {},
  });

  const { access_token, isReady } = useAuth();

  useEffect(() => {
    if (!namespace || !access_token || !isReady) return;

    const userId = "user-" + Math.random().toString(36).substr(2, 9);
    const presenceData: Presence = {
      name: "Anonymous",
      photoUrl: "",
      lastActive: Date.now() as timestamp,
    };

    const cleanupPresence = connectionManager.setupPresenceHeartbeat(
      namespace,
      userId,
      presenceData
    );

    const unsubPresence = realtimeDB.presence.subscribeToPresence(
      namespace,
      (data) => setState((prev) => ({ ...prev, presence: data || {} }))
    );

    const unsubLocks = realtimeDB.locks.subscribeToCellLocks(
      namespace,
      (data) => setState((prev) => ({ ...prev, locks: data || {} }))
    );

    return () => {
      cleanupPresence?.();
      unsubPresence();
      unsubLocks();
    };
  }, [namespace, access_token, isReady]);

  return {
    isConnected,
    presence: state.presence,
    locks: state.locks,
    namespace,
  };
}
