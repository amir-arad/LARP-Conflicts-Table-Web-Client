import { vi } from 'vitest';
import { GoogleSheetsAPI } from '../../contexts/GoogleSheetsContext';

/**
 * A1 notation to array coordinates conversion utilities
 */
export class A1Utils {
  /**
   * Convert A1 notation (e.g., "B3") to zero-based array coordinates [row, col]
   * @param a1Notation - A1 notation string (e.g., "B3")
   * @returns [row, col] zero-based array coordinates
   */
  static toArrayCoords(a1Notation: string): [number, number] {
    // Extract column letters and row number
    const match = a1Notation.match(/^([A-Z]+)([0-9]+)$/);
    if (!match) {
      throw new Error(`Invalid A1 notation: ${a1Notation}`);
    }

    const [, colLetters, rowStr] = match;

    // Convert column letters to zero-based index
    // A -> 0, B -> 1, Z -> 25, AA -> 26, etc.
    let colIndex = 0;
    for (let i = 0; i < colLetters.length; i++) {
      colIndex =
        colIndex * 26 + (colLetters.charCodeAt(i) - 'A'.charCodeAt(0) + 1);
    }
    colIndex -= 1; // Convert to zero-based

    // Convert row to zero-based index
    const rowIndex = parseInt(rowStr, 10) - 1;

    return [rowIndex, colIndex];
  }

  /**
   * Convert zero-based array coordinates to A1 notation
   * @param row - Zero-based row index
   * @param col - Zero-based column index
   * @returns A1 notation string (e.g., "B3")
   */
  static fromArrayCoords(row: number, col: number): string {
    // Convert column index to letter(s)
    let colStr = '';
    let colIndex = col + 1; // Convert to one-based for calculation

    while (colIndex > 0) {
      const remainder = (colIndex - 1) % 26;
      colStr = String.fromCharCode('A'.charCodeAt(0) + remainder) + colStr;
      colIndex = Math.floor((colIndex - 1) / 26);
    }

    // Convert row index to one-based
    const rowStr = (row + 1).toString();

    return colStr + rowStr;
  }

  /**
   * Parse a range in A1 notation (e.g., "A1:C3") to array coordinates
   * @param range - Range in A1 notation
   * @returns Object with start and end coordinates
   */
  static parseRange(range: string): {
    startRow: number;
    startCol: number;
    endRow: number;
    endCol: number;
  } {
    // Handle sheet name if present
    const rangePart = range.includes('!') ? range.split('!')[1] : range;

    // Split range into start and end cells
    const [startCell, endCell] = rangePart.split(':');

    // If no end cell is specified, treat as a single cell
    const [startRow, startCol] = A1Utils.toArrayCoords(startCell);

    if (!endCell) {
      return {
        startRow,
        startCol,
        endRow: startRow,
        endCol: startCol,
      };
    }

    const [endRow, endCol] = A1Utils.toArrayCoords(endCell);

    return {
      startRow,
      startCol,
      endRow,
      endCol,
    };
  }
}

/**
 * Stateful Google Sheets API mock that maintains in-memory state
 * while providing the same interface as the real API
 */
export class StatefulSheetsAPI {
  private data: (string | number | null | undefined)[][] = [];
  private isLoading = false;
  private error: string | null = null;
  private updateListeners: (() => void)[] = [];

  /**
   * Create a new StatefulSheetsAPI instance
   * @param initialData - Optional initial data for the sheet
   */
  constructor(initialData?: (string | number | null | undefined)[][]) {
    if (initialData) {
      this.data = JSON.parse(JSON.stringify(initialData));
    }
  }

  /**
   * Add an update listener to be called when the API state changes
   * @param listener - Function to call on update
   */
  addUpdateListener(listener: () => void): void {
    this.updateListeners.push(listener);
  }

  /**
   * Remove an update listener
   * @param listener - Function to remove
   */
  removeUpdateListener(listener: () => void): void {
    this.updateListeners = this.updateListeners.filter(l => l !== listener);
  }

  /**
   * Trigger all update listeners
   */
  private triggerUpdate(): void {
    this.updateListeners.forEach(listener => listener());
  }

  /**
   * Set the API state
   * @param state - Partial state to update
   */
  setState(state: Partial<Pick<GoogleSheetsAPI, 'error' | 'isLoading'>>): void {
    if ('error' in state) {
      this.error = state.error ?? null;
    }
    if ('isLoading' in state) {
      this.isLoading = state.isLoading ?? false;
    }
    this.triggerUpdate();
  }

  /**
   * Ensure the data array has enough rows and columns to accommodate the given coordinates
   * @param row - Row index
   * @param col - Column index
   */
  private ensureDataSize(row: number, col: number): void {
    // Ensure we have enough rows
    while (this.data.length <= row) {
      this.data.push([]);
    }

    // Ensure the row has enough columns
    const targetRow = this.data[row];
    while (targetRow.length <= col) {
      targetRow.push(null);
    }
  }

  /**
   * Get a value at the specified coordinates
   * @param row - Row index
   * @param col - Column index
   * @returns The value at the specified coordinates
   */
  private getValue(
    row: number,
    col: number
  ): string | number | null | undefined {
    if (row < 0 || col < 0) {
      throw new Error(`Invalid coordinates: [${row}, ${col}]`);
    }

    if (row >= this.data.length) {
      return null;
    }

    const rowData = this.data[row];
    if (col >= rowData.length) {
      return null;
    }

    return rowData[col];
  }

  /**
   * Set a value at the specified coordinates
   * @param row - Row index
   * @param col - Column index
   * @param value - Value to set
   */
  private setValue(
    row: number,
    col: number,
    value: string | number | null | undefined
  ): void {
    if (row < 0 || col < 0) {
      throw new Error(`Invalid coordinates: [${row}, ${col}]`);
    }

    this.ensureDataSize(row, col);
    this.data[row][col] = value;
  }

  /**
   * Get values in the specified range
   * @param range - Range in A1 notation
   * @returns 2D array of values in the range
   */
  private getRange(range: string): (string | number | null | undefined)[][] {
    const { startRow, startCol, endRow, endCol } = A1Utils.parseRange(range);

    const result: (string | number | null | undefined)[][] = [];

    for (let row = startRow; row <= endRow; row++) {
      const rowData: (string | number | null | undefined)[] = [];
      for (let col = startCol; col <= endCol; col++) {
        rowData.push(this.getValue(row, col));
      }
      result.push(rowData);
    }

    return result;
  }

  /**
   * Set values in the specified range
   * @param range - Range in A1 notation
   * @param values - 2D array of values to set
   */
  private setRange(
    range: string,
    values: (string | number | null | undefined)[][]
  ): void {
    const { startRow, startCol } = A1Utils.parseRange(range);

    for (let rowOffset = 0; rowOffset < values.length; rowOffset++) {
      const rowData = values[rowOffset];
      for (let colOffset = 0; colOffset < rowData.length; colOffset++) {
        this.setValue(
          startRow + rowOffset,
          startCol + colOffset,
          rowData[colOffset]
        );
      }
    }
  }

  /**
   * Clear values in the specified range
   * @param range - Range in A1 notation
   */
  private clearRange(range: string): void {
    const { startRow, startCol, endRow, endCol } = A1Utils.parseRange(range);

    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        this.setValue(row, col, null);
      }
    }
  }

  /**
   * Set test data for the sheet
   * @param valuesArg - 2D array of values or Promise that resolves to a 2D array
   */
  async setTestData(
    valuesArg:
      | (string | number | null | undefined)[][]
      | Promise<(string | number | null | undefined)[][]>
  ): Promise<void> {
    try {
      this.setState({ isLoading: true });
      const values = await valuesArg;
      this.data = JSON.parse(JSON.stringify(values));
      this.triggerUpdate();
    } catch (error) {
      this.setState({
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    } finally {
      this.setState({ isLoading: false });
    }
  }

  /**
   * Create a mock API that implements the GoogleSheetsAPI interface
   * @returns Mock API object
   */
  createMockAPI(): {
    triggerUpdate: () => void;
    setState: (
      state: Partial<Pick<GoogleSheetsAPI, 'error' | 'isLoading'>>
    ) => void;
    setTestData: (
      valuesArg:
        | (string | number | null | undefined)[][]
        | Promise<(string | number | null | undefined)[][]>
    ) => Promise<void>;
    api: GoogleSheetsAPI;
  } {
    const load = vi.fn().mockImplementation(async () => {
      this.setState({ isLoading: true });
      try {
        return {
          result: {
            values: JSON.parse(JSON.stringify(this.data)),
          },
        };
      } catch (error) {
        this.setState({
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      } finally {
        this.setState({ isLoading: false });
      }
    });

    const update = vi
      .fn()
      .mockImplementation(
        async (
          range: string,
          values: (string | number | null | undefined)[][]
        ) => {
          try {
            this.setRange(range, values);
            this.triggerUpdate();
            return {
              result: {
                updatedCells: values.reduce((sum, row) => sum + row.length, 0),
                updatedRange: range,
                updatedRows: values.length,
              },
            };
          } catch (error) {
            this.setState({
              error: error instanceof Error ? error.message : String(error),
            });
            throw error;
          }
        }
      );

    const clear = vi.fn().mockImplementation(async (range: string) => {
      try {
        this.clearRange(range);
        this.triggerUpdate();
        return {
          result: {
            clearedRange: range,
          },
        };
      } catch (error) {
        this.setState({
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    });

    // Use arrow functions for getters to preserve 'this' context
    const isLoadingGetter = () => this.isLoading;
    const errorGetter = () => this.error;

    return {
      triggerUpdate: () => this.triggerUpdate(),
      setState: state => this.setState(state),
      setTestData: valuesArg => this.setTestData(valuesArg),
      api: {
        load,
        update,
        clear,
        get isLoading() {
          return isLoadingGetter();
        },
        get error() {
          return errorGetter();
        },
      } satisfies GoogleSheetsAPI,
    };
  }
}

/**
 * Create a stateful Google Sheets API mock
 * @param initialData - Optional initial data for the sheet
 * @returns Mock API object
 */
export function createStatefulSheetsAPI(
  initialData?: (string | number | null | undefined)[][]
) {
  const statefulApi = new StatefulSheetsAPI(initialData);
  return statefulApi.createMockAPI();
}
