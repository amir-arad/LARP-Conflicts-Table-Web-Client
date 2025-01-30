import { useCallback, useEffect, useState } from "react";

import { gapi } from "gapi-script";
import { useGoogleLogin } from "@react-oauth/google";

interface UseGoogleAuthProps {
  apiKey: string;
  discoveryDocs: string[];
  scopes: string[];
}
enum ClientLoadStatus {
  NotLoaded,
  Loading,
  Loaded,
  Initializing,
  Initialized,
  Ready,
  Error,
}
export const useGoogleAuth = ({
  apiKey,
  scopes,
  discoveryDocs,
}: UseGoogleAuthProps) => {
  const [clientStatus, setClientStatus] = useState(ClientLoadStatus.NotLoaded);
  const [access_token, setToken] = useState<string | null>(() => {
    const expirationDate = Number(
      localStorage.getItem("google_access_token_expires")
    );
    if (expirationDate && expirationDate > Date.now()) {
      return localStorage.getItem("google_access_token");
    }
    localStorage.removeItem("google_access_token");
    localStorage.removeItem("google_access_token_expires");
    return null;
  });

  const login = useGoogleLogin({
    onSuccess: ({ access_token, expires_in }) => {
      const expirationDate = Date.now() + 1000 * expires_in;
      localStorage.setItem("google_access_token", access_token);
      localStorage.setItem("google_access_token_expires", "" + expirationDate);
      setToken(access_token);
    },
    onError: (errorResponse) => console.log(errorResponse),
    scope: scopes.join(" "),
  });

  const loginCallback = useCallback(
    () => access_token || login(),
    [access_token, login]
  );

  useEffect(() => {
    try {
      switch (clientStatus) {
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
          if (access_token) {
            gapi.client.setToken({ access_token });
            setClientStatus(ClientLoadStatus.Ready);
          }
          break;
      }
    } catch (error) {
      console.error("Error initializing Google API client:", error);
      setClientStatus(ClientLoadStatus.Error);
    }
  }, [clientStatus, access_token, apiKey]);

  return {
    isReady: clientStatus === ClientLoadStatus.Ready,
    access_token,
    login: loginCallback,
  };
};
