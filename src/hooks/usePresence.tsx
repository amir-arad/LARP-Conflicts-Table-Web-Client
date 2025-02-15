import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  DEFAULT_HEARTBEAT_CONFIG,
  LocksState,
  Presence,
  PresenceState,
} from '../lib/collaboration';
import {
  connectionManager,
  getDatabaseRef,
  realtimeDB,
  setupDisconnectCleanup,
} from '../lib/firebase';

export function usePresence(namespace: string) {
  const { firebaseUser, isReady } = useAuth();
  const [presence, setPresence] = useState<PresenceState>({});
  const [locks, setLocks] = useState<LocksState>({});
  const heartbeatCleanup = useRef(() => {});
  const userId = firebaseUser?.uid || 'unknown';

  const handlePresenceUpdate = useCallback(
    (data: PresenceState | null) => {
      if (import.meta.env.DEV) console.log('onPresence', data);
      setPresence(data || {});
    },
    [setPresence]
  );
  // Subscription effect
  useEffect(() => {
    if (!namespace || !isReady) return;

    if (import.meta.env.DEV) console.log('usePresence subscribing', namespace);
    const unsubPresence = realtimeDB.presence.subscribeToPresence(
      namespace,
      handlePresenceUpdate
    );

    const unsubLocks = realtimeDB.locks.subscribeToCellLocks(namespace, data =>
      setLocks(data || {})
    );

    return () => {
      if (import.meta.env.DEV)
        console.log('usePresence un-subscribing', namespace);
      unsubPresence();
      unsubLocks();
    };
  }, [namespace, isReady, handlePresenceUpdate, setLocks]);

  // Memoize user info to prevent unnecessary re-renders
  const userInfo = useMemo(
    () => ({
      name: firebaseUser?.displayName || 'Anonymous',
      photoUrl: firebaseUser?.photoURL || '',
    }),
    [firebaseUser?.displayName, firebaseUser?.photoURL]
  );

  const registerPresence = useCallback(
    (presenceData: Pick<Presence, 'activeCell'>) => {
      if (!namespace || !userId || !isReady) {
        throw new Error('Cannot register presence without namespace and auth');
      }

      const fullPresence = {
        ...presenceData,
        ...userInfo,
      };

      const presenceRef = getDatabaseRef(
        `sheets/${namespace}/presence/${userId}`
      );
      if (!presenceRef) {
        throw new Error('Failed to get presence reference');
      }

      setupDisconnectCleanup(presenceRef, null)
        .then(() =>
          realtimeDB.presence.updateUserPresence(presenceRef, fullPresence)
        )
        .catch(error => {
          console.error('Failed to register presence', error);
        });

      heartbeatCleanup.current?.();
      const cleanup = connectionManager.setupPresenceHeartbeat(
        presenceRef,
        fullPresence,
        { ...DEFAULT_HEARTBEAT_CONFIG },
        error => {
          console.error('Failed to update presence', error);
        }
      );

      heartbeatCleanup.current = cleanup ?? (() => {});
    },
    [namespace, userId, isReady, userInfo]
  );

  const unregisterPresence = useCallback(() => {
    heartbeatCleanup.current?.();
  }, []);

  // Memoize return object to prevent unnecessary rerenders
  const returnValue = useMemo(
    () => ({
      presence,
      locks,
      registerPresence,
      unregisterPresence,
    }),
    [presence, locks, registerPresence, unregisterPresence]
  );

  return returnValue;
}
