import * as React from 'react';
import { GoogleSheetsProvider, useGoogleSheets } from './GoogleSheetsContext';
import { describe, expect, test } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useMockGapi } from '../test/mocks-externals/gapi';

interface TestWrapperProps {
  children: React.ReactNode;
  sheetId: string;
  token: string;
  mockConfig: Parameters<typeof useMockGapi>[0];
}

function TestWrapper({
  children,
  sheetId,
  token,
  mockConfig,
}: TestWrapperProps) {
  useMockGapi(mockConfig);
  return (
    <GoogleSheetsProvider sheetId={sheetId} token={token}>
      {children}
    </GoogleSheetsProvider>
  );
}

function renderGoogleSheetsHook(props: {
  sheetId: string;
  token: string;
  mockConfig: Parameters<typeof useMockGapi>[0];
}) {
  return renderHook(() => useGoogleSheets(), {
    wrapper: ({ children }) => <TestWrapper {...props}>{children}</TestWrapper>,
  });
}

describe('GoogleSheetsContext', () => {
  const mockProps = {
    sheetId: 'test-sheet-id',
    token: 'test-token',
  };

  test('provides Google Sheets operations through context', () => {
    const { result } = renderGoogleSheetsHook({ ...mockProps, mockConfig: {} });

    expect(result.current.load).toBeDefined();
    expect(result.current.update).toBeDefined();
    expect(result.current.clear).toBeDefined();
    expect(result.current.isLoading).toBeDefined();
    expect(result.current.error).toBeDefined();
  });

  test('load returns sheet data', async () => {
    const mockSheetData = {
      result: {
        values: [
          ['A1', 'B1'],
          ['A2', 'B2'],
        ],
      },
      body: JSON.stringify({
        values: [
          ['A1', 'B1'],
          ['A2', 'B2'],
        ],
      }),
      headers: {
        'content-type': 'application/json',
      },
      status: 200,
      statusText: 'OK',
    };

    const { result } = renderGoogleSheetsHook({
      ...mockProps,
      mockConfig: {
        sheets: {
          get: () => Promise.resolve(mockSheetData),
        },
      },
    });

    const response = await result.current.load();

    expect(response).toBeDefined();
    expect(response?.result.values).toBeInstanceOf(Array);
    expect(response?.result.values).toEqual([
      ['A1', 'B1'],
      ['A2', 'B2'],
    ]);
  });

  test('update modifies sheet data', async () => {
    const mockUpdateResponse = {
      result: {
        updatedRange: 'A1:B2',
        updatedRows: 2,
        updatedColumns: 2,
        updatedCells: 4,
      },
      body: JSON.stringify({
        updatedRange: 'A1:B2',
        updatedRows: 2,
        updatedColumns: 2,
        updatedCells: 4,
      }),
      headers: {
        'content-type': 'application/json',
      },
      status: 200,
      statusText: 'OK',
    };

    const { result } = renderGoogleSheetsHook({
      ...mockProps,
      mockConfig: {
        sheets: {
          update: params => {
            expect(params.range).toBe('A1:B2');
            expect(params.valueInputOption).toBe('RAW');
            expect(params.resource.values).toEqual([['new', 'data']]);
            return Promise.resolve(mockUpdateResponse);
          },
        },
      },
    });

    const range = 'A1:B2';
    const values = [['new', 'data']];

    const response = await result.current.update(range, values);
    expect(response).toBeDefined();
    expect(response?.result.updatedRange).toBe('A1:B2');
    expect(response?.result.updatedCells).toBe(4);
  });

  test('clear removes sheet data', async () => {
    const mockClearResponse = {
      result: {
        clearedRange: 'A1:B2',
        spreadsheetId: 'test-sheet-id',
      },
      body: JSON.stringify({
        clearedRange: 'A1:B2',
        spreadsheetId: 'test-sheet-id',
      }),
      headers: {
        'content-type': 'application/json',
      },
      status: 200,
      statusText: 'OK',
    };

    const { result } = renderGoogleSheetsHook({
      ...mockProps,
      mockConfig: {
        sheets: {
          clear: params => {
            expect(params.range).toBe('A1:B2');
            expect(params.spreadsheetId).toBe('test-sheet-id');
            return Promise.resolve(mockClearResponse);
          },
        },
      },
    });

    const range = 'A1:B2';

    const response = await result.current.clear(range);
    expect(response).toBeDefined();
    expect(response?.result.clearedRange).toBe('A1:B2');
    expect(response?.result.spreadsheetId).toBe('test-sheet-id');
  });

  test('handles loading state', async () => {
    const mockSheetData = {
      result: {
        values: [['test']],
      },
      body: JSON.stringify({ values: [['test']] }),
      headers: { 'content-type': 'application/json' },
      status: 200,
      statusText: 'OK',
    };

    let resolvePromise: (value: typeof mockSheetData) => void;
    const responsePromise = new Promise<typeof mockSheetData>(resolve => {
      resolvePromise = resolve;
    });

    const { result } = renderGoogleSheetsHook({
      ...mockProps,
      mockConfig: {
        sheets: {
          get: () => responsePromise,
        },
      },
    });

    expect(result.current.isLoading).toBe(false);

    let loadPromise: Promise<
      | Pick<gapi.client.Response<gapi.client.sheets.ValueRange>, 'result'>
      | undefined
    >;
    act(() => {
      loadPromise = result.current.load();
    });

    // Loading should be true immediately after starting the operation
    expect(result.current.isLoading).toBe(true);

    // Resolve the API call
    await act(async () => {
      resolvePromise(mockSheetData);
      await loadPromise;
    });

    // Loading should be false after completion
    expect(result.current.isLoading).toBe(false);
  });

  test('handles error state', async () => {
    const { result } = renderGoogleSheetsHook({
      ...mockProps,
      mockConfig: { shouldError: true },
    });

    await expect(result.current.load()).rejects.toThrow();
    expect(result.current.error).toBeDefined();
  });

  test('throws error when used outside provider', () => {
    expect(() => {
      renderHook(() => useGoogleSheets());
    }).toThrow('useGoogleSheets must be used within a GoogleSheetsProvider');
  });
});
