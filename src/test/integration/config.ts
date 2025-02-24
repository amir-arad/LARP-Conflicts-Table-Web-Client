import { FirebaseOptions } from 'firebase/app';
import { ClientLoadStatus } from '../../contexts/AuthContext';

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

export const authStates = {
  authenticated: {
    clientStatus: ClientLoadStatus.Ready,
    errorStatus: ClientLoadStatus.Ready,
    access_token: 'mock-access-token',
    firebaseUser: testUser,
    error: null,
  },
  authenticating: {
    clientStatus: ClientLoadStatus.Initializing_firebase,
    errorStatus: ClientLoadStatus.Ready,
    access_token: 'mock-access-token',
    firebaseUser: null,
    error: null,
  },
  error: {
    clientStatus: ClientLoadStatus.Error,
    errorStatus: ClientLoadStatus.Initializing_firebase,
    access_token: null,
    firebaseUser: null,
    error: new Error('Authentication failed'),
  },
  initial: {
    clientStatus: ClientLoadStatus.Loading,
    errorStatus: ClientLoadStatus.Loading,
    access_token: null,
    firebaseUser: null,
    error: null,
  },
};
