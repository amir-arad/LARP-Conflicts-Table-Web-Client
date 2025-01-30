import "./index.css";

import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import { apiKey, clientId, sheetId } from "./config";

import ConflictsTableTool from "./conflicts-table-tool";
import { GoogleOAuthProvider } from "@react-oauth/google";
import React from "react";
import ReactDOM from "react-dom/client";
import { useGoogleAuth } from "./hooks/useGoogleAuth";

const googleOptions = {
  apiKey,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
};

const App = () => {
  const { access_token, login, isReady } = useGoogleAuth(googleOptions);
  if (!access_token) {
    return (
      <button
        onClick={login}
        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Log In
      </button>
    );
  }
  if (!isReady) {
    return <div>Loading...</div>;
  }
  return (
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
              <ConflictsTableTool
                apiKey={apiKey}
                token={access_token}
                sheetId={sheetId}
              />
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
