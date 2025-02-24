/* eslint-disable react-refresh/only-export-components */
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import { ROLES_CONFLICT_SHEET_ID } from '../config';

export interface GoogleSheetsAPI {
  load: () => Promise<
    | Pick<gapi.client.Response<gapi.client.sheets.ValueRange>, 'result'>
    | undefined
  >;
  update: (
    range: string,
    values: (string | number | null | undefined)[][]
  ) => Promise<
    gapi.client.Response<gapi.client.sheets.UpdateValuesResponse> | undefined
  >;
  clear: (
    range: string
  ) => Promise<
    gapi.client.Response<gapi.client.sheets.ClearValuesResponse> | undefined
  >;
  isLoading: boolean;
  error: string | null;
}

const GoogleSheetsContext = createContext<GoogleSheetsAPI | null>(null);

export interface GoogleSheetsProviderProps {
  children: ReactNode;
  sheetId: string;
  token: string;
}

export function GoogleSheetsProvider({
  children,
  sheetId,
  token,
}: GoogleSheetsProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback((action: string, error: unknown) => {
    console.error(`${action} failed:`, error);
    setError(action + ': ' + (error as Error).message);
  }, []);

  const assertSdk = useCallback(async () => {
    if (!window.gapi.client.sheets) {
      await window.gapi.client.load('sheets', 'v4');
      if (!window.gapi.client.sheets) {
        throw new Error('Google Sheets API not loaded');
      }
    }
  }, []);

  const api = useCallback(() => {
    return window.gapi.client.sheets.spreadsheets.values;
  }, []);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      await assertSdk();
      return api().get({
        oauth_token: token,
        spreadsheetId: sheetId,
        range: `${ROLES_CONFLICT_SHEET_ID}!A1:Z1000`,
      });
    } catch (error: unknown) {
      handleError('load', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [token, sheetId, assertSdk, api, handleError]);

  const update = useCallback(
    async (range: string, values: (string | number | null | undefined)[][]) => {
      try {
        await assertSdk();
        return api().update({
          oauth_token: token,
          spreadsheetId: sheetId,
          range,
          valueInputOption: 'RAW',
          resource: { values },
        });
      } catch (error: unknown) {
        handleError('update', error);
      }
    },
    [token, sheetId, assertSdk, api, handleError]
  );

  const clear = useCallback(
    async (range: string) => {
      try {
        await assertSdk();
        return api().clear({
          oauth_token: token,
          spreadsheetId: sheetId,
          range,
          resource: {},
        });
      } catch (error: unknown) {
        handleError('clear', error);
      }
    },
    [token, sheetId, assertSdk, api, handleError]
  );

  const driver = useMemo(() => {
    return {
      load,
      update,
      clear,
      isLoading,
      error,
    };
  }, [load, update, clear, isLoading, error]);

  return (
    <GoogleSheetsContext.Provider value={driver}>
      {children}
    </GoogleSheetsContext.Provider>
  );
}

GoogleSheetsProvider.Inject = GoogleSheetsContext.Provider;

export function useGoogleSheets() {
  const context = useContext(GoogleSheetsContext);
  if (!context) {
    throw new Error(
      'useGoogleSheets must be used within a GoogleSheetsProvider'
    );
  }
  return context;
}

// Add type declaration for global gapi object
declare global {
  interface Window {
    gapi: typeof gapi;
  }
}
