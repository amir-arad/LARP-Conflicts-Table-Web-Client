import { describe, expect, test, beforeEach } from 'vitest';
import { mockFirebaseAPI } from './firebase-api';

describe('Firebase API Mock', () => {
  const mock = mockFirebaseAPI();

  beforeEach(() => {
    mock.reset();
  });

  describe('User Presence', () => {
    test('simulates user joining', () => {
      // When a user joins
      const presenceData = mock.simulateUserJoined(
        'user1',
        'Test User',
        'test-photo-url'
      );

      // Then the presence data should be correct
      expect(presenceData).toEqual({
        name: 'Test User',
        photoUrl: 'test-photo-url',
        activeCell: null,
        updateType: 'state_change',
        lastActive: expect.any(Number),
      });

      // And the user should appear in current users
      const currentUsers = mock.getCurrentUsers();
      expect(currentUsers).toHaveProperty('user1', presenceData);
    });

    test('simulates user leaving', () => {
      // Given a user has joined
      mock.simulateUserJoined('user1', 'Test User', 'test-photo-url');

      // When the user leaves
      mock.simulateUserLeft('user1');

      // Then they should be removed from current users
      const currentUsers = mock.getCurrentUsers();
      expect(currentUsers).not.toHaveProperty('user1');
    });

    test('simulates user changing active cell', () => {
      // Given a user has joined
      mock.simulateUserJoined('user1', 'Test User', 'test-photo-url');

      // When they focus on a cell
      const updatedData = mock.simulateUserActiveCell('user1', 'A1');

      // Then their presence data should be updated
      expect(updatedData).toEqual({
        name: 'Test User',
        photoUrl: 'test-photo-url',
        activeCell: 'A1',
        updateType: 'cell_focus',
        lastActive: expect.any(Number),
      });

      // And the change should be reflected in current users
      const currentUsers = mock.getCurrentUsers();
      expect(currentUsers.user1).toEqual(updatedData);
    });

    test('handles multiple users', () => {
      // Given multiple users join
      const user1 = mock.simulateUserJoined('user1', 'Test User 1', 'photo1');
      const user2 = mock.simulateUserJoined('user2', 'Test User 2', 'photo2');

      // When checking current users
      const currentUsers = mock.getCurrentUsers();

      // Then all users should be present
      expect(currentUsers).toEqual({
        user1,
        user2,
      });
    });
  });

  describe('Cell Locking', () => {
    test('simulates acquiring cell lock', () => {
      // When acquiring a lock
      const lockData = mock.simulateCellLock('A1', 'user1');

      // Then the lock data should be correct
      expect(lockData).toEqual({
        userId: 'user1',
        acquired: expect.any(Number),
        expires: expect.any(Number),
      });

      // And the lock should appear in current locks
      const currentLocks = mock.getCurrentLocks();
      expect(currentLocks).toHaveProperty('A1', lockData);
    });

    test('simulates releasing cell lock', () => {
      // Given a cell is locked
      mock.simulateCellLock('A1', 'user1');

      // When releasing the lock
      mock.simulateCellUnlock('A1');

      // Then the lock should be removed
      const currentLocks = mock.getCurrentLocks();
      expect(currentLocks).not.toHaveProperty('A1');
    });

    test('simulates lock expiration', () => {
      // Given a cell is locked
      mock.simulateCellLock('A1', 'user1');

      // When the lock expires
      mock.simulateLockExpiration('A1');

      // Then the lock should be removed
      const currentLocks = mock.getCurrentLocks();
      expect(currentLocks).not.toHaveProperty('A1');
    });

    test('handles multiple locks', () => {
      // Given multiple cells are locked
      const lock1 = mock.simulateCellLock('A1', 'user1');
      const lock2 = mock.simulateCellLock('B2', 'user2');

      // When checking current locks
      const currentLocks = mock.getCurrentLocks();

      // Then all locks should be present
      expect(currentLocks).toEqual({
        A1: lock1,
        B2: lock2,
      });
    });
  });

  describe('Real-time Updates', () => {
    test('notifies subscribers of presence changes', () => {
      const updates: unknown[] = [];

      // Given a subscriber to presence changes
      mock.api.onValue(
        mock.api.getDatabaseRef('sheets/test-sheet-id/presence'),
        snapshot => {
          updates.push(snapshot.val());
        }
      );

      // When simulating presence changes
      mock.simulateUserJoined('user1', 'Test User', 'test-photo-url');
      mock.simulateUserActiveCell('user1', 'A1');
      mock.simulateUserLeft('user1');

      // Then the subscriber should receive all updates
      expect(updates).toHaveLength(4); // Initial null + 3 updates
      expect(updates[0]).toBeNull(); // Initial value
      expect(updates[1]).toHaveProperty('user1.name', 'Test User'); // Join
      expect(updates[2]).toHaveProperty('user1.activeCell', 'A1'); // Cell focus
      expect(updates[3]).toEqual({}); // Left (empty presence)
    });

    test('notifies subscribers of lock changes', () => {
      const updates: unknown[] = [];

      // Given a subscriber to lock changes
      mock.api.onValue(
        mock.api.getDatabaseRef('sheets/test-sheet-id/locks'),
        snapshot => {
          updates.push(snapshot.val());
        }
      );

      // When simulating lock changes
      mock.simulateCellLock('A1', 'user1');
      mock.simulateCellUnlock('A1');

      // Then the subscriber should receive all updates
      expect(updates).toHaveLength(3); // Initial null + 2 updates
      expect(updates[0]).toBeNull(); // Initial value
      expect(updates[1]).toHaveProperty('A1.userId', 'user1'); // Lock acquired
      expect(updates[2]).toEqual({}); // Lock released
    });
  });

  describe('Online/Offline Handling', () => {
    test('handles going offline with presence cleanup', () => {
      // Given a user is present
      mock.simulateUserJoined('user1', 'Test User', 'test-photo-url');

      // And a disconnect handler is set up
      mock.api.setupDisconnectCleanup(
        mock.api.getDatabaseRef('sheets/test-sheet-id/presence/user1'),
        null
      );

      // When going offline
      mock.api.goOffline();

      // Then the presence should be cleaned up
      const currentUsers = mock.getCurrentUsers();
      expect(currentUsers).not.toHaveProperty('user1');
    });

    test('handles going back online with presence restoration', () => {
      // Given a user was present before going offline
      const presenceData = mock.simulateUserJoined(
        'user1',
        'Test User',
        'test-photo-url'
      );
      mock.api.goOffline();

      // When going back online
      mock.api.goOnline();

      // Then the presence should be restored
      const currentUsers = mock.getCurrentUsers();
      expect(currentUsers).toHaveProperty('user1', presenceData);
    });
  });
});
