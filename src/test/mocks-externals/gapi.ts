import { useEffect } from 'react';

import 'gapi-script';

type GapiResponse<T> = {
  result: T;
  body: string;
  headers: { [key: string]: string };
  status: number;
  statusText: string;
};

interface MockGapiConfig {
  sheets?: {
    get?: () => Promise<GapiResponse<gapi.client.sheets.ValueRange>>;
    update?: (params: {
      spreadsheetId: string;
      range: string;
      valueInputOption: string;
      resource: { values: (string | number | null | undefined)[][] };
      oauth_token?: string;
    }) => Promise<GapiResponse<gapi.client.sheets.UpdateValuesResponse>>;
    clear?: (params: {
      spreadsheetId: string;
      range: string;
      resource: Record<string, never>;
      oauth_token?: string;
    }) => Promise<GapiResponse<gapi.client.sheets.ClearValuesResponse>>;
  };
  shouldError?: boolean;
}

export function createMockGapi(config: MockGapiConfig = {}) {
  const { sheets = {}, shouldError = false } = config;

  if (shouldError) {
    return {
      client: {
        sheets: undefined,
        load: () => Promise.resolve(),
        init: () => Promise.resolve(),
        setToken: () => {},
      },
      load: (_lib: string, callback: () => void) => callback(),
      auth: {
        getToken: () => null,
        setToken: () => {},
      },
      auth2: {
        init: () => Promise.resolve(),
        getAuthInstance: () => null,
      },
      signin2: {
        render: () => {},
      },
    } as unknown as typeof gapi;
  }

  return {
    client: {
      sheets: {
        spreadsheets: {
          values: {
            get: sheets.get,
            update: sheets.update,
            clear: sheets.clear,
          },
        },
      },
      load: () => Promise.resolve(),
      init: () => Promise.resolve(),
      setToken: () => {},
    },
    load: (_lib: string, callback: () => void) => callback(),
    auth: {
      getToken: () => null,
      setToken: () => {},
    },
    auth2: {
      init: () => Promise.resolve(),
      getAuthInstance: () => null,
    },
    signin2: {
      render: () => {},
    },
  } as unknown as typeof gapi;
}

/**
 * React hook for mocking the Google API (gapi) in tests.
 * Automatically handles setup and cleanup of the mock gapi instance.
 *
 * @param config - Configuration object for the mock gapi instance
 * @throws {Error} If window.gapi is undefined
 *
 * @example
 * ```typescript
 * test('example test', () => {
 *   renderHook(() => {
 *     useMockGapi({
 *       sheets: {
 *         get: () => Promise.resolve(mockData)
 *       }
 *     });
 *     return useGoogleSheets();
 *   });
 * });
 * ```
 */
export function useMockGapi(config: MockGapiConfig): void {
  useEffect(() => {
    if (typeof window === 'undefined' || !('gapi' in window)) {
      throw new Error('window.gapi is not defined');
    }

    const originalGapi = window.gapi;
    window.gapi = createMockGapi(config);

    return () => {
      window.gapi = originalGapi;
    };
  }, [config]);
}

/**
 * @deprecated Use useMockGapi hook instead
 */
export function withMockGapi<T>(
  config: MockGapiConfig,
  fn: () => Promise<T>
): Promise<T> {
  console.warn(
    'withMockGapi is deprecated. Please use useMockGapi hook instead.'
  );
  const originalGapi = window.gapi;
  window.gapi = createMockGapi(config);

  return fn().finally(() => {
    window.gapi = originalGapi;
  });
}
