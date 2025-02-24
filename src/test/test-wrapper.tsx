import { ReactNode, useState } from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import { FirebaseProvider } from '../contexts/FirebaseContext';
import {
  GoogleSheetsAPI,
  GoogleSheetsProvider,
} from '../contexts/GoogleSheetsContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import { I18nProvider } from '../i18n/I18nProvider';
import { mockAuthState } from './mocks-drivers/auth-api';
import { mockFirebaseAPI } from './mocks-drivers/firebase-api';
import { mockGoogleSheetsAPI } from './mocks-drivers/google-sheets-api';

interface WrapperProps {
  children: ReactNode;
}

export type GoogleSheetsAPIResult<T extends keyof GoogleSheetsAPI> =
  GoogleSheetsAPI[T] extends (...args: unknown[]) => unknown
    ? Awaited<ReturnType<GoogleSheetsAPI[T]>>
    : never;

/**
 * Create a test wrapper with all required providers and mock drivers
 */
export function createTestWrapper(stateless = false) {
  const mockGoogleSheets = mockGoogleSheetsAPI(stateless);
  const mockAuth = mockAuthState();
  const mockFirebase = mockFirebaseAPI();

  function Wrapper({ children }: WrapperProps) {
    const [authApi, setAuthApi] = useState(mockAuth.api);
    const [sheetsApi, setSheetsApi] = useState(mockGoogleSheets.api);
    const [firebaseApi, setFirebaseApi] = useState(mockFirebase.api);

    mockGoogleSheets.triggerUpdate = () => setSheetsApi(mockGoogleSheets.api);
    mockAuth.triggerUpdate = () => setAuthApi(mockAuth.api);
    mockFirebase.triggerUpdate = () => setFirebaseApi({ ...mockFirebase.api });

    return (
      <FirebaseProvider.Inject value={firebaseApi}>
        <AuthProvider.Inject value={authApi}>
          <GoogleSheetsProvider.Inject value={sheetsApi}>
            <LanguageProvider>
              <I18nProvider>{children}</I18nProvider>
            </LanguageProvider>
          </GoogleSheetsProvider.Inject>
        </AuthProvider.Inject>
      </FirebaseProvider.Inject>
    );
  }
  return {
    mockGoogleSheets,
    mockAuth,
    mockFirebase,
    Wrapper,
  };
}
