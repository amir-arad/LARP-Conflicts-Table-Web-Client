import { ClientLoadStatus } from '../../contexts/AuthContext';
import { User } from 'firebase/auth';

export const authFixtures = {
  authenticated: {
    clientStatus: ClientLoadStatus.Ready,
    errorStatus: ClientLoadStatus.Ready,
    access_token: 'mock-access-token',
    firebaseUser: {
      uid: 'test-user-id',
      displayName: 'Test User',
      photoURL: 'test-photo-url',
    } as User,
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
