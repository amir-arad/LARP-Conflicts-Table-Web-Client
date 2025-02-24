import {
  DEFAULT_HEARTBEAT_CONFIG,
  LocksState,
  Presence,
  PresenceState,
} from '../lib/collaboration';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useAuth } from '../contexts/AuthContext';
import { useFirebase } from '../contexts/FirebaseContext';

export function usePresence(namespace: string) {
  const { firebaseUser, isReady } = useAuth();
  const firebase = useFirebase();
  const [presence, setPresence] = useState<PresenceState>({});
  const [locks, setLocks] = useState<LocksState>({});
  const heartbeatCleanup = useRef(() => {});
  const userId = firebaseUser?.uid;

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
    const presenceRef = firebase.getDatabaseRef(`sheets/${namespace}/presence`);
    const locksRef = firebase.getDatabaseRef(`sheets/${namespace}/locks`);

    const unsubPresence = firebase.onValue(presenceRef, snapshot => {
      handlePresenceUpdate(snapshot.val() || {});
    });

    const unsubLocks = firebase.onValue(locksRef, snapshot => {
      setLocks(snapshot.val() || {});
    });

    return () => {
      if (import.meta.env.DEV)
        console.log('usePresence un-subscribing', namespace);
      unsubPresence();
      unsubLocks();
    };
  }, [namespace, isReady, handlePresenceUpdate, setLocks, firebase]);

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
      if (!namespace || !userId || !isReady || !firebaseUser) {
        throw new Error('Cannot register presence without namespace and auth');
      }

      const fullPresence = {
        ...presenceData,
        ...userInfo,
      };

      const presenceRef = firebase.getDatabaseRef(
        `sheets/${namespace}/presence/${userId}`
      );

      firebase
        .setupDisconnectCleanup(presenceRef, null)
        .then(() =>
          firebase.set(presenceRef, {
            ...fullPresence,
            lastActive: Date.now(),
            updateType: 'state_change',
          })
        )
        .catch(error => {
          console.error('Failed to register presence', error);
        });

      // Setup heartbeat
      heartbeatCleanup.current?.();

      const heartbeatInterval = setInterval(() => {
        firebase
          .set(presenceRef, {
            ...fullPresence,
            lastActive: Date.now(),
            updateType: 'heartbeat',
          })
          .catch(error => {
            console.error('Failed to update presence', error);
          });
      }, DEFAULT_HEARTBEAT_CONFIG.interval);

      heartbeatCleanup.current = () => {
        clearInterval(heartbeatInterval);
        firebase.set(presenceRef, null).catch(console.error);
      };
    },
    [namespace, userId, isReady, firebaseUser, userInfo, firebase]
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
