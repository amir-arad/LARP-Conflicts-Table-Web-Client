export type timestamp = number;

export type HeartbeatError = {
  code: 'HEARTBEAT_FAILED';
  message: string;
  details?: unknown;
  timestamp: number;
  retryCount: number;
};

export type HeartbeatConfig = {
  interval: number; // milliseconds
  maxRetries: number;
  retryDelay: number; // milliseconds
};
export type LockInfo = {
  userId: string;
  acquired: timestamp;
  expires: timestamp; // 30s TTL from acquired timestamp
};

export type PresenceUpdateType = 'heartbeat' | 'state_change';

export type Presence = {
  name: string;
  photoUrl: string;
  lastActive: timestamp;
  activeCell: string | null;
  updateType: PresenceUpdateType;
};

export type LocksState = Record<string, LockInfo>;
export type PresenceState = Record<string, Presence>;

export type CollaborationState = {
  presence: PresenceState;
  locks: LocksState;
};

export type PresenceEventType = 'joined' | 'left' | 'updated';

export type PresenceEvent = {
  type: PresenceEventType;
  userId: string;
  presence: Presence;
  timestamp: number;
};

export type PresenceSubscriber = (event: PresenceEvent) => void;

export interface AllCollaborationsState {
  sheets: {
    [sheetId: string]: CollaborationState;
  };
}
export const DEFAULT_HEARTBEAT_CONFIG: HeartbeatConfig = Object.freeze({
  interval: 30_000,
  maxRetries: 3,
  retryDelay: 5_000,
});
