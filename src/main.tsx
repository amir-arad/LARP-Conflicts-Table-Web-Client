/* eslint-disable react-refresh/only-export-components */
import './index.css';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { HashRouter, Link, Route, Routes } from 'react-router-dom';
import { clientId, firebaseConfig, sheetId } from './config';

import ConflictsTableTool from './components/conflicts-table-tool';
import { ConnectionStatusIndicator } from './components/ui/connection-status-indicator';
import ErrorBoundary from './components/error-boundary';
import { FirebaseProvider } from './contexts/FirebaseContext';
import { GoogleSheetsProvider } from './contexts/GoogleSheetsContext';
import { I18nProvider } from './i18n/I18nProvider';
import { LanguageProvider } from './contexts/LanguageContext';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { useAccessToken } from './contexts/AuthContext';
import { useTranslations } from './hooks/useTranslations';

function AppWithSheets() {
  const token = useAccessToken();

  if (!token) return <App />;
  return (
    <GoogleSheetsProvider sheetId={sheetId} token={token}>
      <App />
    </GoogleSheetsProvider>
  );
}

const App = () => {
  const { t } = useTranslations();
  const { access_token, login, isReady } = useAuth();

  if (!access_token) {
    return (
      <button
        onClick={login}
        className="flex items-center gap-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
      >
        {t('action.login')}
      </button>
    );
  }

  if (!isReady) {
    return <div>{t('action.authenticating')}</div>;
  }

  return (
    <ErrorBoundary component="App">
      <HashRouter>
        <div className="min-h-screen">
          <nav className="bg-indigo-600">
            <div className="mx-auto max-w-7xl px-4">
              <div className="flex h-16 items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Link
                    to="/"
                    className="rounded-md px-3 py-2 text-white hover:bg-indigo-500"
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
            <Route
              path="/"
              element={<ConflictsTableTool sheetId={sheetId} />}
            />
          </Routes>
          <ConnectionStatusIndicator />
        </div>
      </HashRouter>
    </ErrorBoundary>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary component="Root">
      <FirebaseProvider config={firebaseConfig}>
        <AuthProvider clientId={clientId}>
          <LanguageProvider>
            <I18nProvider>
              <AppWithSheets />
            </I18nProvider>
          </LanguageProvider>
        </AuthProvider>
      </FirebaseProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
