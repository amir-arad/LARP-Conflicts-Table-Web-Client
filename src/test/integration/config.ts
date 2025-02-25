import { FirebaseOptions } from 'firebase/app';

export const testConfig = {
  sheetId: 'test-sheet-id',
  clientId: 'test-client-id',
  firebaseConfig: {
    databaseURL: 'https://test-db.firebaseio.com',
    projectId: 'test-project',
  } as FirebaseOptions,
};

export const testUser = {
  uid: 'test-user-id',
  displayName: 'Test User',
  photoURL: 'test-photo-url',
};

// Note: Auth states are now imported from fixtures
