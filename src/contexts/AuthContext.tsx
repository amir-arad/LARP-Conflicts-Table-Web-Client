import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import {
  User,
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import { gapi } from "gapi-script";
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { connectionManager, initializeFirebase } from "../lib/firebase";
import { firebaseConfig } from "../config";
export enum ClientLoadStatus {
  Loading,
  Loaded,
  Initializing_gapi,
  Initializing_gapi_2,
  Initializing_firebase,
  Connecting,
  Ready,
  Error,
}
interface AuthState {
  clientStatus: ClientLoadStatus;
  errorStatus: ClientLoadStatus;
  access_token: string | null;
  firebaseUser: User | null;
  error: Error | null;
  login: () => string | void;
}

const AuthStateCtx = createContext<AuthState | null>(null);

interface AuthProviderProps {
  clientId: string;
  children: ReactNode;
}

const KEY_ACCESS_TOKEN = "access_token";
const KEY_ACCESS_TOKEN_EXPIRES = "access_token_expires";
function readExistingToken() {
  const expirationDate = Number(localStorage.getItem(KEY_ACCESS_TOKEN_EXPIRES));
  if (expirationDate && expirationDate > Date.now()) {
    return localStorage.getItem(KEY_ACCESS_TOKEN);
  }
  localStorage.removeItem(KEY_ACCESS_TOKEN);
  localStorage.removeItem(KEY_ACCESS_TOKEN_EXPIRES);
  return null;
}

function storeAccessToken(expires_in: number, access_token: string) {
  const expirationDate = Date.now() + 1000 * expires_in;
  localStorage.setItem(KEY_ACCESS_TOKEN, access_token);
  localStorage.setItem(KEY_ACCESS_TOKEN_EXPIRES, "" + expirationDate);
}

function AuthContext({ children }: { children: ReactNode }) {
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
  const scopes = ["https://www.googleapis.com/auth/spreadsheets"];
  const discoveryDocs = [
    "https://sheets.googleapis.com/$discovery/rest?version=v4",
  ];
  const login = useGoogleLogin({
    onSuccess: ({ access_token, expires_in }) => {
      try {
        storeAccessToken(expires_in, access_token);
        setToken(access_token);
      } catch (error) {
        setError(error);
      }
    },
    onError: (errorResponse) => {
      setError(errorResponse);
    },
    scope: scopes.join(" "),
  });

  const [auth, setAuth] = useState<AuthState>(() => {
    const access_token = readExistingToken();
    return {
      clientStatus: ClientLoadStatus.Loading,
      errorStatus: ClientLoadStatus.Loading,
      access_token,
      firebaseUser: null,
      error: null,
      login: () => access_token || login(),
    };
  });
  
  if (import.meta.env.DEV) {
    useEffect(() => {
      console.log("auth changed", auth);
    }, [auth]);
  }

  const setClientStatus = useCallback(
    (clientStatus: ClientLoadStatus, prev: ClientLoadStatus | null) => {
      if (prev !== null && prev !== auth.clientStatus) {
        console.warn(
          "Client status changed from",
          ClientLoadStatus[prev],
          "to",
          ClientLoadStatus[clientStatus]
        );
      }
      setAuth((prev) => ({
        ...prev,
        clientStatus,
        errorStatus: prev.clientStatus,
      }));
    },
    [setAuth, auth.clientStatus]
  );
  const setToken = useCallback(
    (token: string | null) => {
      setAuth((prev) => ({
        ...prev,
        access_token: token,
        login: () => token || login(),
      }));
    },
    [setAuth]
  );
  const setFirebaseUser = useCallback(
    (firebaseUser: User | null) => {
      setAuth((prev) => ({ ...prev, firebaseUser }));
    },
    [setAuth]
  );
  const setError = useCallback(
    (error: unknown) => {
      console.error(
        "Error during " + ClientLoadStatus[auth.clientStatus],
        error
      );
      const errorStatus = auth.clientStatus;
      setAuth((prev) => {
        if (errorStatus !== prev.clientStatus) return prev as AuthState;
        return {
          ...prev,
          clientStatus: ClientLoadStatus.Error,
          errorStatus: errorStatus,
          error: error as Error,
        };
      });
    },
    [setAuth, auth.clientStatus]
  );

  useEffect(() => {
    try {
      switch (auth.clientStatus) {
        case ClientLoadStatus.Loading:
          gapi.load("client", () =>
            setClientStatus(
              ClientLoadStatus.Initializing_gapi,
              ClientLoadStatus.Loading
            )
          );
          break;
        case ClientLoadStatus.Initializing_gapi:
          gapi.client
            .init({
              apiKey,
              discoveryDocs,
            })
            .then(() =>
              setClientStatus(
                ClientLoadStatus.Initializing_gapi_2,
                ClientLoadStatus.Initializing_gapi
              )
            )
            .catch(setError);
          break;
        case ClientLoadStatus.Initializing_gapi_2:
          if (auth.access_token) {
            gapi.client.setToken({ access_token: auth.access_token });
            setClientStatus(
              ClientLoadStatus.Initializing_firebase,
              ClientLoadStatus.Initializing_gapi_2
            );
          }
          break;
        case ClientLoadStatus.Initializing_firebase:
          if (auth.access_token) {
            const { database } = initializeFirebase(firebaseConfig);
            if (!database) {
              setError(new Error("No firebase database"));
              return;
            }
            const firebaseAuth = getAuth();
            const firebaseCredential = GoogleAuthProvider.credential(
              null,
              auth.access_token
            );
            signInWithCredential(firebaseAuth, firebaseCredential)
              .then((result) => setFirebaseUser(result.user))
              .then(() =>
                setClientStatus(
                  ClientLoadStatus.Connecting,
                  ClientLoadStatus.Initializing_firebase
                )
              )
              .catch(setError);
          } else {
            setError(new Error("No access token"));
          }
          break;
        case ClientLoadStatus.Connecting:
          const cleanup = connectionManager.monitorConnection((connected) => {
            if (connected) {
              setClientStatus(
                ClientLoadStatus.Ready,
                ClientLoadStatus.Connecting
              );
              connectionManager.reconnect().catch(setError);
            } else if (auth.clientStatus === ClientLoadStatus.Ready) {
              setClientStatus(
                ClientLoadStatus.Connecting,
                ClientLoadStatus.Ready
              );
            }
          });
          return cleanup;
      }
    } catch (error) {
      setError(error);
    }
  }, [auth.clientStatus, auth.access_token, auth.firebaseUser, apiKey]);

  return <AuthStateCtx.Provider value={auth}>{children}</AuthStateCtx.Provider>;
}

export function AuthProvider({ children, clientId }: AuthProviderProps) {
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <AuthContext>{children}</AuthContext>
    </GoogleOAuthProvider>
  );
}

export function useAuth() {
  const context = useContext(AuthStateCtx);
  if (!context) {
    throw new Error("useGoogleAuth must be used within a GoogleAuthProvider");
  }
  return {
    ...context,
    isReady: context.clientStatus === ClientLoadStatus.Ready,
  };
}

export function useAccessToken() {
  return useAuth().access_token;
}
