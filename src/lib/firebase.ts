import { CollaborationState, LockInfo, LocksState } from './collaboration';

// Re-export types for use in other files
export type { CollaborationState, LockInfo, LocksState };

// Path utility functions
export const getSheetPath = (sheetId: string): string => {
  return `sheets/${sheetId}`;
};

export const getPresencePath = (sheetId: string, userId: string): string => {
  return `sheets/${sheetId}/presence/${userId}`;
};

export const getLockPath = (sheetId: string, cellId: string): string => {
  return `sheets/${sheetId}/locks/${cellId}`;
};
