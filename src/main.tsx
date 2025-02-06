import "./index.css";

import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import { clientId, sheetId } from "./config";

import { CollaborationProvider } from "./contexts/CollaborationContext";
import ConflictsTableTool from "./components/conflicts-table-tool";
import { I18nProvider } from "./i18n/I18nProvider";
import { LanguageProvider } from "./contexts/LanguageContext";
import { LanguageSwitcher } from "./components/LanguageSwitcher";
import React from "react";
import ReactDOM from "react-dom/client";
import { useTranslations } from "./hooks/useTranslations";

const App = () => {
  const { t } = useTranslations();
  const { access_token, login, isReady } = useAuth();

  if (!access_token) {
    return (
      <button
        onClick={login}
        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        {t("action.login")}
      </button>
    );
  }

  if (!isReady) {
    return <div>{t("action.authenticating")}</div>;
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
              <div className="flex items-center">
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        </nav>
        <Routes>
          <Route path="/" element={<ConflictsTableTool sheetId={sheetId} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider clientId={clientId}>
      <LanguageProvider>
        <I18nProvider>
          <CollaborationProvider>
            <App />
          </CollaborationProvider>
        </I18nProvider>
      </LanguageProvider>
    </AuthProvider>
  </React.StrictMode>
);
