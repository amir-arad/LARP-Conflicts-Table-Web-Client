import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  DEFAULT_HEARTBEAT_CONFIG,
  LocksState,
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


export function usePresence(namespace: string) {
  const { access_token, firebaseUser, isReady } = useAuth();
  const presenceSubscribers = useRef<Set<PresenceSubscriber>>(new Set());
  const [presence, setPresence] = useState<PresenceState>({});
  const [locks, setLocks] = useState<LocksState>({});

  const userId = useMemo(
    () => (access_token ? `user-${btoa(access_token).slice(0, 8)}` : null),
    [access_token]
  );

  const emitPresenceEvent = useCallback(
    (userId: string, presence: Presence, type: PresenceEventType) => {
      const event: PresenceEvent = {
        type,
        userId,
        presence,
        timestamp: Date.now(),
      };
      presenceSubscribers.current.forEach((subscriber) => {
        try {
          subscriber(event);
        } catch (error) {
          console.error("Error in presence subscriber:", error);
        }
      });
    },
    []
  );

  const handlePresenceUpdate = useCallback(
    (data: PresenceState | null) => {
      const newPresence = data || {};
      const joined = new Set<string>();
      const left = new Set(Object.keys(presence));
      const updated = new Set<string>();
      
      for (const userId of Object.keys(newPresence)) {
        const newUserData = newPresence[userId];
        if (left.delete(userId)) {
          // User already exists
          if (newUserData.updateType === 'state_change') {
            updated.add(userId);
          }
        } else if (newUserData.updateType === 'state_change') {
          // Only add to joined if it's a state change, not a heartbeat
          joined.add(userId);
        }
      }
      
      for (const userId of left) {
        emitPresenceEvent(userId, presence[userId], "left");
      }
      for (const userId of joined) {
        emitPresenceEvent(userId, newPresence[userId], "joined");
      }
      for (const userId of updated) {
        emitPresenceEvent(userId, newPresence[userId], "updated");
      }
      setPresence(newPresence);
    },
    [emitPresenceEvent]
  );

  // Subscription effect
  useEffect(() => {
    if (!namespace || !access_token || !isReady) return;

    const unsubPresence = realtimeDB.presence.subscribeToPresence(
      namespace,
      handlePresenceUpdate
    );

    const unsubLocks = realtimeDB.locks.subscribeToCellLocks(
      namespace,
      (data) => setLocks(data || {})
    );

    return () => {
      unsubPresence();
      unsubLocks();
    };
  }, [namespace, access_token, isReady, handlePresenceUpdate]);

  const registerPresence = useCallback(
    (presenceData: Pick<Presence, "activeCell">) => {
      if (!namespace || !access_token || !userId || !isReady) {
        throw new Error("Cannot register presence without namespace and auth");
      }
      const fullPresence = {
        ...presenceData,
        name: firebaseUser?.displayName || "Anonymous",
        photoUrl: firebaseUser?.photoURL || "",
      }
      const presenceRef = getDatabaseRef(
        `sheets/${namespace}/presence/${userId}`
      );
      if (!presenceRef) {
        throw new Error("Failed to get presence reference");
      }

      setupDisconnectCleanup(presenceRef, null)
        .then(() =>
          realtimeDB.presence.updateUserPresence(
            namespace,
            userId,
            fullPresence
          )
        )
        .catch((error) => {
          console.error("Failed to register presence", error);
        });
      return connectionManager.setupPresenceHeartbeat(
        namespace,
        userId,
        fullPresence,
        DEFAULT_HEARTBEAT_CONFIG
      );
    },
    [namespace, access_token, userId, isReady]
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

  // Memoize return object to prevent unnecessary rerenders
  const returnValue = useMemo(
    () => ({
      presence,
      locks,
      registerPresence,
      unregisterPresence: () => {}, // Empty function since cleanup is handled elsewhere
      subscribeToPresence,
    }),
    [presence, locks, registerPresence, subscribeToPresence]
  );

  return returnValue;
}
