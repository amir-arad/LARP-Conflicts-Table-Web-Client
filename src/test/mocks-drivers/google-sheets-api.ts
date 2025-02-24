import { createStatefulSheetsAPI } from './stateful-sheets-api';

import { vi } from 'vitest';
import { GoogleSheetsAPI } from '../../contexts/GoogleSheetsContext';
/**
 * Create a mock Google Sheets API for testing
 *
 * This function now returns a stateful mock that maintains in-memory state
 * across operations while providing the same interface as the real API.
 *
 * @returns Mock API object with methods to control the mock behavior
 */
export function mockGoogleSheetsAPI(stateless = false) {
  if (stateless) {
    return createStatelessSheetsApi();
  }
  return createStatefulSheetsAPI();
}

export function createStatelessSheetsApi() {
  return {
    triggerUpdate: () => {},
    setState(state: Partial<Pick<GoogleSheetsAPI, 'error' | 'isLoading'>>) {
      this.api = { ...this.api, ...state };
      this.triggerUpdate();
    },
    async setTestData(valuesArg: string[][] | Promise<string[][]>) {
      try {
        this.api.load.mockImplementationOnce(async () => {
          this.setState({ isLoading: true });
          try {
            const values = await valuesArg;
            return { result: { values } };
          } catch (error) {
            this.setState({
              error: error instanceof Error ? error.message : String(error),
            });
            throw error;
          } finally {
            this.setState({ isLoading: false });
          }
        });
      } catch (error) {
        this.setState({
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    },
    api: {
      load: vi.fn(),
      update: vi.fn(),
      clear: vi.fn(),
      error: null as string | null,
      isLoading: false as boolean,
    } satisfies GoogleSheetsAPI,
  };
}
