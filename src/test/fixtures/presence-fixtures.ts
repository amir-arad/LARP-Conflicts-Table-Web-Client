import { PresenceState } from '../../lib/collaboration';

export const presenceFixtures = {
  singleUser: {
    user1: {
      name: 'Alice',
      photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
      activeCell: null,
      lastActive: Date.now(),
      updateType: 'state_change',
    },
  } as PresenceState,
  multipleUsers: {
    user1: {
      name: 'Alice',
      photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
      activeCell: 'A1',
      lastActive: Date.now(),
      updateType: 'state_change',
    },
    user2: {
      name: 'Bob',
      photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
      activeCell: 'B2',
      lastActive: Date.now(),
      updateType: 'state_change',
    },
    user3: {
      name: 'Charlie',
      photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie',
      activeCell: 'C3',
      lastActive: Date.now(),
      updateType: 'state_change',
    },
  } as PresenceState,
  empty: {} as PresenceState,
};
