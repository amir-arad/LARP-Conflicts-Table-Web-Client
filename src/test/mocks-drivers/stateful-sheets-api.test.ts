import { describe, expect, test } from 'vitest';
import { A1Utils, createStatefulSheetsAPI } from './stateful-sheets-api';

describe('A1Utils', () => {
  test('converts A1 notation to array coordinates', () => {
    expect(A1Utils.toArrayCoords('A1')).toEqual([0, 0]);
    expect(A1Utils.toArrayCoords('B3')).toEqual([2, 1]);
    expect(A1Utils.toArrayCoords('Z10')).toEqual([9, 25]);
    expect(A1Utils.toArrayCoords('AA1')).toEqual([0, 26]);
  });

  test('converts array coordinates to A1 notation', () => {
    expect(A1Utils.fromArrayCoords(0, 0)).toBe('A1');
    expect(A1Utils.fromArrayCoords(2, 1)).toBe('B3');
    expect(A1Utils.fromArrayCoords(9, 25)).toBe('Z10');
    expect(A1Utils.fromArrayCoords(0, 26)).toBe('AA1');
  });

  test('parses A1 range notation', () => {
    expect(A1Utils.parseRange('A1:C3')).toEqual({
      startRow: 0,
      startCol: 0,
      endRow: 2,
      endCol: 2,
    });

    expect(A1Utils.parseRange('B2')).toEqual({
      startRow: 1,
      startCol: 1,
      endRow: 1,
      endCol: 1,
    });

    expect(A1Utils.parseRange('Sheet1!A1:C3')).toEqual({
      startRow: 0,
      startCol: 0,
      endRow: 2,
      endCol: 2,
    });
  });
});

describe('StatefulSheetsAPI', () => {
  test('initializes with empty data by default', async () => {
    const mockSheets = createStatefulSheetsAPI();
    const result = await mockSheets.api.load();
    expect(result?.result?.values).toEqual([]);
  });

  test('initializes with provided data', async () => {
    const initialData = [
      ['', 'Role 1', 'Role 2'],
      ['Conflict 1', 'M1-1', 'M1-2'],
      ['Conflict 2', 'M2-1', 'M2-2'],
    ];
    const mockSheets = createStatefulSheetsAPI(initialData);
    const result = await mockSheets.api.load();
    expect(result?.result?.values).toEqual(initialData);
  });

  test('updates cell values', async () => {
    const mockSheets = createStatefulSheetsAPI([
      ['', 'Role 1', 'Role 2'],
      ['Conflict 1', 'M1-1', 'M1-2'],
    ]);

    // Update a cell
    await mockSheets.api.update('B2', [['Updated']]);

    // Verify the update
    const result = await mockSheets.api.load();
    const values = result?.result?.values;
    expect(values?.[1]?.[1]).toBe('Updated');
  });

  test('clears cell values', async () => {
    const mockSheets = createStatefulSheetsAPI([
      ['', 'Role 1', 'Role 2'],
      ['Conflict 1', 'M1-1', 'M1-2'],
    ]);

    // Clear a range
    await mockSheets.api.clear('B2:C2');

    // Verify the clear
    const result = await mockSheets.api.load();
    const values = result?.result?.values;
    expect(values?.[1]?.[1]).toBe(null);
    expect(values?.[1]?.[2]).toBe(null);
    expect(values?.[0]?.[1]).toBe('Role 1'); // Unchanged
  });

  test('maintains state across operations', async () => {
    const mockSheets = createStatefulSheetsAPI();

    // Set initial data
    await mockSheets.setTestData([
      ['', 'Role 1', 'Role 2'],
      ['Conflict 1', 'M1-1', 'M1-2'],
    ]);

    // Update a cell
    await mockSheets.api.update('B2', [['Updated']]);

    // Add a new row
    await mockSheets.api.update('A3:C3', [['Conflict 2', 'M2-1', 'M2-2']]);

    // Clear a cell
    await mockSheets.api.clear('C2');

    // Verify final state
    const result = await mockSheets.api.load();
    expect(result?.result?.values).toEqual([
      ['', 'Role 1', 'Role 2'],
      ['Conflict 1', 'Updated', null],
      ['Conflict 2', 'M2-1', 'M2-2'],
    ]);
  });

  test('handles error state', async () => {
    const mockSheets = createStatefulSheetsAPI();

    // Set error state
    mockSheets.setState({ error: 'Test error' });

    // Verify error state
    expect(mockSheets.api.error).toBe('Test error');
  });

  test('handles loading state', async () => {
    const mockSheets = createStatefulSheetsAPI();

    // Set loading state
    mockSheets.setState({ isLoading: true });

    // Verify loading state
    expect(mockSheets.api.isLoading).toBe(true);
  });
});
