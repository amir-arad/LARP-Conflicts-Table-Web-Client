import "./index.css";

import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import {
  CredentialResponse,
  GoogleLogin,
  GoogleOAuthProvider,
} from "@react-oauth/google";
import React, { useEffect, useState } from "react";

import ConflictsTableTool from "./conflicts-table-tool";
import ReactDOM from "react-dom/client";
import { gapi } from "gapi-script";

const App = () => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error("GOOGLE_CLIENT_ID not set in environment");
  }

  const [credentialResponse, setCredentialResponse] =
    useState<CredentialResponse | null>(null);

  useEffect(() => {
    function initGapi() {
      gapi.load("client", async () => {
        await gapi.client.init({
          apiKey: process.env.GOOGLE_API_KEY,
          discoveryDocs: [
            "https://sheets.googleapis.com/$discovery/rest?version=v4",
          ],
        });
      });
    }
    initGapi();
  }, []);

  return (
    <GoogleOAuthProvider clientId={process.env.GOOGLE_CLIENT_ID}>
      {credentialResponse ? (
        <BrowserRouter>
          <div className="min-h-screen">
            <nav className="bg-indigo-600">
              <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                  <div className="flex items-center space-x-4">
                    <Link
                      to="/"
                      className="text-white hover:bg-indigo-500 px-3 py-2 rounded-md"
                    >
                      Home
                    </Link>
                  </div>
                </div>
              </div>
            </nav>
            <Routes>
              <Route
                path="/"
                element={
                  <ConflictsTableTool token={credentialResponse.credential} />
                }
              />
            </Routes>
          </div>
        </BrowserRouter>
      ) : (
        <GoogleLogin
          onSuccess={(credentialResponse) => {
            setCredentialResponse(credentialResponse);
          }}
          onError={() => {
            console.log("Login Failed");
          }}
        />
      )}
    </GoogleOAuthProvider>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
