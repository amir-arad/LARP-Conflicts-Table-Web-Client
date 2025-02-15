import { useMemo, useState } from 'react';

import { ROLES_CONFLICT_SHEET_ID } from '../config';

declare global {
  interface Window {
    gapi: typeof gapi;
  }
}

export interface UseGoogleSheetProps {
  sheetId: string;
  token: string;
}

function api() {
  return window.gapi.client.sheets.spreadsheets.values;
}

export function useGoogleSheet({ token, sheetId }: UseGoogleSheetProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiMethods = useMemo(() => {
    const handleError = (action: string, error: unknown) => {
      console.error(`${action} failed:`, error);
      setError(action + ': ' + (error as Error).message);
    };
    async function assertSdk() {
      if (!window.gapi.client.sheets) {
        await window.gapi.client.load('sheets', 'v4');
        if (!window.gapi.client.sheets) {
          throw new Error('Google Sheets API not loaded');
        }
      }
    }
    return {
      load: async () => {
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
        } finally {
          setIsLoading(false);
        }
      },
      update: async (
        range: string,
        values: (string | number | null | undefined)[][]
      ) => {
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
      clear: async (range: string) => {
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
    };
  }, [token, sheetId]);
  return { apiMethods, error, isLoading };
}
