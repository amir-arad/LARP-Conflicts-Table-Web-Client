/* eslint-disable react-refresh/only-export-components */
import { FirebaseApp, FirebaseOptions, initializeApp } from 'firebase/app';
import {
  DataSnapshot,
  Database,
  DatabaseReference,
  getDatabase,
  goOffline,
  goOnline,
  onDisconnect,
  onValue,
  ref,
  set,
} from 'firebase/database';
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';

export interface FirebaseAPI {
  getDatabaseRef: (path: string) => DatabaseReference;
  setupDisconnectCleanup: (
    ref: DatabaseReference,
    cleanup: unknown
  ) => Promise<void>;
  onValue: (
    ref: DatabaseReference,
    callback: (snapshot: DataSnapshot) => void
  ) => () => void;
  set: (ref: DatabaseReference, data: unknown) => Promise<void>;
  goOnline: () => void;
  goOffline: () => void;
}

const FirebaseContext = createContext<FirebaseAPI | null>(null);

interface FirebaseProviderProps {
  children: ReactNode;
  config: FirebaseOptions;
}

export function FirebaseProvider({ children, config }: FirebaseProviderProps) {
  let firebaseApp: FirebaseApp | null = null;
  let database: Database | null = null;

  // Initialize Firebase if not already initialized
  if (!firebaseApp) {
    firebaseApp = initializeApp(config);
    database = getDatabase(firebaseApp);
  }

  const getDatabaseRef = useCallback(
    (path: string): DatabaseReference => {
      if (!database) {
        throw new Error('Firebase not initialized');
      }
      return ref(database, path);
    },
    [database]
  );

  const setupDisconnectCleanup = useCallback(
    (reference: DatabaseReference, cleanup: unknown) => {
      return onDisconnect(reference).set(cleanup);
    },
    []
  );

  const setValue = useCallback(
    async (reference: DatabaseReference, data: unknown) => {
      await set(reference, data);
    },
    []
  );

  const onValueChange = useCallback(
    (
      reference: DatabaseReference,
      callback: (snapshot: DataSnapshot) => void
    ) => {
      try {
        const unsubscribe = onValue(reference, callback);
        return () => {
          try {
            unsubscribe();
          } catch (error) {
            console.error('Error during unsubscribe:', error);
          }
        };
      } catch (error) {
        if (error instanceof Error) {
          throw new Error('Subscription error');
        }
        throw error;
      }
    },
    []
  );

  const setOnline = useCallback(() => {
    if (database) {
      goOnline(database);
    }
  }, [database]);

  const setOffline = useCallback(() => {
    if (database) {
      goOffline(database);
    }
  }, [database]);

  const driver = useMemo(() => {
    return {
      getDatabaseRef,
      setupDisconnectCleanup,
      onValue: onValueChange,
      set: setValue,
      goOnline: setOnline,
      goOffline: setOffline,
    };
  }, [
    getDatabaseRef,
    setupDisconnectCleanup,
    onValueChange,
    setValue,
    setOnline,
    setOffline,
  ]);

  return (
    <FirebaseContext.Provider value={driver}>
      {children}
    </FirebaseContext.Provider>
  );
}
FirebaseProvider.Inject = FirebaseContext.Provider;

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  const subscriptionsRef = useRef<Array<() => void>>([]);
  const onValue = useCallback(
    (
      reference: DatabaseReference,
      callback: (snapshot: DataSnapshot) => void
    ) => {
      const unsubscribe = context.onValue(reference, callback);
      const cleanup = () => {
        try {
          unsubscribe();
        } catch (error) {
          console.error('Error during cleanup:', error);
        } finally {
          subscriptionsRef.current = subscriptionsRef.current.filter(
            sub => sub !== cleanup
          );
        }
      };
      subscriptionsRef.current.push(cleanup);
      return cleanup;
    },
    [context]
  );

  // on unmount, unsubscribe all
  useEffect(() => {
    return () => {
      for (const sub of subscriptionsRef.current) {
        sub();
      }
    };
  }, []);

  const result = useMemo(() => {
    return { ...context, onValue };
  }, [context, onValue]);
  return result;
}
