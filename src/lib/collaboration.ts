export type timestamp = number;
export type LockInfo = {
  userId: string;
  acquired: timestamp;
  expires: timestamp; // 30s TTL from acquired timestamp
};

export type Presence = {
  name: string;
  photoUrl: string;
  lastActive: timestamp;
  activeCell?: string;
};

export type LocksState = Record<string, LockInfo>;
export type PresenceState = Record<string, Presence>;

export type CollaborationState = {
  presence: PresenceState;
  locks: LocksState;
};

export interface AllCollaborationsState {
  sheets: {
    [sheetId: string]: CollaborationState;
  };
}
