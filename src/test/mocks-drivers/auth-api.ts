import { User } from 'firebase/auth';
import { vi } from 'vitest';
import { ClientLoadStatus, AuthState } from '../../contexts/AuthContext';

export function mockAuthState() {
  return {
    triggerUpdate: () => {},
    setState(state: Partial<Omit<AuthState, 'login'>>) {
      this.api = { ...this.api, ...state };
      this.triggerUpdate();
    },
    api: {
      clientStatus: ClientLoadStatus.Ready as ClientLoadStatus,
      errorStatus: ClientLoadStatus.Ready as ClientLoadStatus,
      access_token: null as string | null,
      firebaseUser: {
        uid: 'mock-user-id',
        displayName: 'Mock User',
        photoURL: 'mock-photo-url',
      } as User | null,
      error: null as Error | null,
      login: vi.fn(),
    } satisfies AuthState,
  };
}
