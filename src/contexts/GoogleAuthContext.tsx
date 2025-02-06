import { ReactNode, createContext, useContext } from "react";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { useGoogleAuth } from "../hooks/useGoogleAuth";

interface AuthContextType {
  isReady: boolean;
  access_token: string | null;
  login: () => string | void;
}

const GoogleAuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  clientId: string;
  children: ReactNode;
}

export function AuthProvider({ children, clientId }: AuthProviderProps) {
  const auth = useGoogleAuth({
    apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
  });

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <GoogleAuthContext.Provider value={auth}>
        {children}
      </GoogleAuthContext.Provider>
    </GoogleOAuthProvider>
  );
}

export function useAuth() {
  const context = useContext(GoogleAuthContext);
  if (!context) {
    throw new Error("useGoogleAuth must be used within a GoogleAuthProvider");
  }
  return context;
}

export function useAccessToken() {
  return useAuth().access_token;
}
