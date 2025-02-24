vi.mock('firebase/database', () => {
  const original = vi.importActual('firebase/database');
  return {
    ...original,
    getDatabase: () => ({}),
    ref: (_: unknown, path: string) => createMockRef(path),
    onValue: (
      reference: DatabaseReference,
      callback: (snapshot: unknown) => void
    ) => mockFirebase.onValue(reference, callback),
    set: (reference: DatabaseReference, data: unknown) =>
      mockFirebase.set(reference, data),
    goOnline: (_: unknown) => mockFirebase.goOnline(),
    goOffline: (_: unknown) => mockFirebase.goOffline(),
    onDisconnect: (reference: DatabaseReference) => ({
      set: (cleanup: unknown) =>
        mockFirebase.setupDisconnectCleanup(reference, cleanup),
    }),
  };
});
import { FirebaseProvider, useFirebase } from './FirebaseContext';
import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { createMockRef, mockFirebase } from '../test/mocks-externals/firebase';
import {
  testFirebaseConfig,
  TEST_PATHS,
  TEST_DATA,
} from '../test/config/firebase.config';
import { DatabaseReference } from 'firebase/database';

describe('FirebaseContext', () => {
  // Track active subscriptions for cleanup
  let activeSubscriptions: (() => void)[] = [];

  beforeEach(() => {
    activeSubscriptions = [];
    mockFirebase._reset();

    // Initialize test paths with default values
    mockFirebase.set(createMockRef(TEST_PATHS.TEST_PATH), TEST_DATA.TEST_VALUE);
    mockFirebase.set(
      createMockRef(TEST_PATHS.PRESENCE_PATH),
      TEST_DATA.INITIAL_PRESENCE
    );
  });

  afterEach(() => {
    // Clean up any active subscriptions
    activeSubscriptions.forEach(unsubscribe => unsubscribe());
  });

  // Helper function to render hook with Firebase provider
  const renderFirebaseHook = () => {
    return renderHook(() => useFirebase(), {
      wrapper: ({ children }) => (
        <FirebaseProvider config={testFirebaseConfig}>
          {children}
        </FirebaseProvider>
      ),
    });
  };

  describe('Basic Firebase Operations', () => {
    test('provides Firebase operations through context', () => {
      const { result } = renderFirebaseHook();

      expect(result.current.getDatabaseRef).toBeDefined();
      expect(result.current.setupDisconnectCleanup).toBeDefined();
      expect(result.current.onValue).toBeDefined();
      expect(result.current.set).toBeDefined();
      expect(result.current.goOnline).toBeDefined();
      expect(result.current.goOffline).toBeDefined();
    });

    test('getDatabaseRef returns a valid reference', () => {
      const { result } = renderFirebaseHook();

      const ref = result.current.getDatabaseRef('test/path');
      expect(ref.key).toBe('path');
      expect(ref.parent?.key).toBe('test');
      expect(ref.toString()).toMatch(/test\/path$/);
    });

    test('onValue subscribes to database updates', () => {
      const { result } = renderFirebaseHook();

      const ref = createMockRef('test/normal');
      const callback = vi.fn();
      const unsubscribe = result.current.onValue(ref, callback);
      activeSubscriptions.push(unsubscribe);

      expect(callback).toHaveBeenCalledWith(expect.any(Object));
      expect(unsubscribe).toBeInstanceOf(Function);
    });

    test('set updates database value', async () => {
      const { result } = renderFirebaseHook();

      const ref = createMockRef('test/path');
      const data = TEST_DATA.TEST_VALUE;

      await expect(result.current.set(ref, data)).resolves.not.toThrow();
    });
  });

  describe('Error Handling', () => {
    test('handles database connection errors', async () => {
      const { result } = renderFirebaseHook();

      // Attempt to connect to invalid database
      expect(() => {
        result.current.getDatabaseRef(TEST_PATHS.INVALID_PATH);
      }).toThrow('Database connection error');
    });

    test('handles set operation failures', async () => {
      const { result } = renderFirebaseHook();
      const ref = createMockRef('test/path');

      // Attempt to set invalid data
      await expect(result.current.set(ref, undefined)).rejects.toThrow(
        'Invalid data for database operation'
      );
    });

    test('handles subscription errors', () => {
      mockFirebase._reset(); // Clear default values
      const { result } = renderFirebaseHook();
      const ref = createMockRef(TEST_PATHS.TEST_PATH);

      const callback = vi.fn();
      expect(() => {
        result.current.onValue(ref, callback);
      }).toThrow('Subscription error');
    });
  });

  describe('Cleanup and Reset', () => {
    test('setupDisconnectCleanup properly removes data on disconnect', async () => {
      const { result } = renderFirebaseHook();
      const ref = createMockRef(TEST_PATHS.PRESENCE_PATH);
      const cleanup = TEST_DATA.CLEANUP_PRESENCE;
      const valueCallback = vi.fn();

      // Subscribe to changes
      const unsubscribe = result.current.onValue(ref, valueCallback);
      activeSubscriptions.push(unsubscribe);

      // Set initial data
      await result.current.set(ref, TEST_DATA.INITIAL_PRESENCE);

      // Setup disconnect cleanup
      await result.current.setupDisconnectCleanup(ref, cleanup);

      // Simulate disconnect
      result.current.goOffline();

      // Verify cleanup was triggered
      expect(valueCallback).toHaveBeenLastCalledWith(
        expect.objectContaining({
          val: expect.any(Function),
        })
      );

      const mockCalls = valueCallback.mock.calls;
      expect(mockCalls.length).toBeGreaterThan(0);
      const lastCallSnapshot = mockCalls[mockCalls.length - 1][0];
      expect(lastCallSnapshot.val()).toEqual(cleanup);
    });

    test('unsubscribes from all listeners on component unmount', async () => {
      const { result, unmount } = renderFirebaseHook();
      const ref = createMockRef('test/path');
      const subscriptionCount = 3;

      expect(mockFirebase.getSubscriptionsCount()).toBe(0);
      // Create multiple subscriptions
      for (let i = 0; i < subscriptionCount; i++) {
        const callback = vi.fn();
        const unsubscribe = result.current.onValue(ref, callback);
        activeSubscriptions.push(unsubscribe);
      }

      expect(mockFirebase.getSubscriptionsCount()).toBe(subscriptionCount);
      unmount();

      // Verify all subscriptions were cleaned up
      expect(mockFirebase.getSubscriptionsCount()).toBe(0);
    });

    test('maintains consistent state across connection changes', () => {
      const { result } = renderFirebaseHook();
      const ref = createMockRef('test/path');
      const data = TEST_DATA.TEST_VALUE;
      const valueCallback = vi.fn();

      // Subscribe to changes
      const unsubscribe = result.current.onValue(ref, valueCallback);
      activeSubscriptions.push(unsubscribe);

      // Set initial data
      result.current.set(ref, data);

      // Clear previous calls
      valueCallback.mockClear();

      // Test connection changes
      result.current.goOffline();
      result.current.goOnline();

      // Verify data persists through connection changes
      expect(valueCallback).toHaveBeenLastCalledWith(
        expect.objectContaining({
          val: expect.any(Function),
        })
      );

      const mockCalls = valueCallback.mock.calls;
      expect(mockCalls.length).toBeGreaterThan(0);
      const lastCallSnapshot = mockCalls[mockCalls.length - 1][0];
      expect(lastCallSnapshot.val()).toEqual(data);
    });
  });

  test('throws error when used outside provider', () => {
    expect(() => {
      renderHook(() => useFirebase());
    }).toThrow('useFirebase must be used within a FirebaseProvider');
  });
});
