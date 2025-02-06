import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { gapi } from "gapi-script";

enum ClientLoadStatus {
  NotLoaded,
  Loading,
  Loaded,
  Initializing,
  Initialized,
  Ready,
  Error,
}

interface AuthState {
  /* internal */ clientStatus: ClientLoadStatus;
  isReady: boolean;
  access_token: string | null;
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
  const expirationDate = Number(
    localStorage.getItem(KEY_ACCESS_TOKEN_EXPIRES)
  );
  if (expirationDate && expirationDate > Date.now()) {
    return localStorage.getItem(KEY_ACCESS_TOKEN);
  }
  localStorage.removeItem(KEY_ACCESS_TOKEN);
  localStorage.removeItem(KEY_ACCESS_TOKEN_EXPIRES);
  return null;
}

function AuthContext({ children }: { children: ReactNode }) {
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
  const scopes = ["https://www.googleapis.com/auth/spreadsheets"];
  const discoveryDocs = [
    "https://sheets.googleapis.com/$discovery/rest?version=v4",
  ];
  const login = useGoogleLogin({
    onSuccess: ({ access_token, expires_in }) => {
      const expirationDate = Date.now() + 1000 * expires_in;
      localStorage.setItem(KEY_ACCESS_TOKEN, access_token);
      localStorage.setItem(KEY_ACCESS_TOKEN_EXPIRES, "" + expirationDate);
      setToken(access_token);
    },
    onError: (errorResponse) => console.log(errorResponse),
    scope: scopes.join(" "),
  });

  const [auth, setAuth] = useState<AuthState>(() => {
    const access_token = readExistingToken();
    return {
      clientStatus: ClientLoadStatus.NotLoaded,
      isReady: false,
      access_token,
      login: () => access_token || login(),
    };
  });

  const setClientStatus = useCallback((clientStatus: ClientLoadStatus) => {
    setAuth((prev) => ({
      ...prev,
      clientStatus,
      isReady: clientStatus === ClientLoadStatus.Ready,
    }));
  }, []);
  const setToken = useCallback((token: string | null) => {
    setAuth((prev) => ({
      ...prev,
      access_token: token,
      login: () => token || login(),
    }));
  }, []);

  useEffect(() => {
    try {
      switch (auth.clientStatus) {
        case ClientLoadStatus.NotLoaded:
          setClientStatus(ClientLoadStatus.Loading);
          gapi.load("client", () => setClientStatus(ClientLoadStatus.Loaded));
          break;
        case ClientLoadStatus.Loaded:
          setClientStatus(ClientLoadStatus.Initializing);
          gapi.client
            .init({
              apiKey,
              discoveryDocs,
            })
            .then(() => setClientStatus(ClientLoadStatus.Initialized));
          break;
        case ClientLoadStatus.Initialized:
          if (auth.access_token) {
            gapi.client.setToken({ access_token: auth.access_token });
            setClientStatus(ClientLoadStatus.Ready);
          }
          break;
      }
    } catch (error) {
      console.error("Error initializing Google API client:", error);
      setClientStatus(ClientLoadStatus.Error);
    }
  }, [auth, apiKey]);

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
  return context;
}

export function useAccessToken() {
  return useAuth().access_token;
}
