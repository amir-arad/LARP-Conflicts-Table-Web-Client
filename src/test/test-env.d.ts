import { mockFirebase } from './test-utils';

declare global {
  interface Window {
    mockFirebase: typeof mockFirebase;
    gapi: {
      client: {
        sheets: {
          spreadsheets: {
            values: {
              get: (params: unknown) => Promise<unknown>;
              update: (params: unknown) => Promise<unknown>;
              clear: (params: unknown) => Promise<unknown>;
            };
          };
        };
        load: () => Promise<void>;
        init: () => Promise<void>;
        setToken: () => void;
      };
      load: (lib: string, callback: () => void) => void;
      auth: {
        getToken: () => null;
        setToken: () => void;
      };
      auth2: {
        init: () => Promise<void>;
        getAuthInstance: () => null;
        signIn: () => Promise<void>;
      };
      signin2: {
        render: () => void;
      };
    };
  }
}

export {};
