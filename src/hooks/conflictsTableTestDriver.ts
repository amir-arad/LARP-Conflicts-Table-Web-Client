import { renderHook, waitFor } from "@testing-library/react";
import { expect, vi } from "vitest";
import {
  CellId,
  ConflictsTable,
  UseConflictsTableProps,
  useConflictsTable,
} from "./useConflictsTable";

function mockSheetsApi() {
  return {
    client: {
      sheets: {
        spreadsheets: {
          values: {
            get: vi.fn(),
            update: vi.fn(),
            clear: vi.fn(),
          },
        },
      },
      load: vi.fn(),
    },
  };
}

export interface ExpectedTableData {
  conflicts?: string[];
  roles?: string[];
  motivations?: Record<string, string>;
}

type HookReturn = ReturnType<
  typeof renderHook<ConflictsTable, UseConflictsTableProps>
>;

export class ConflictsTableTestDriver {
  private result: HookReturn["result"];
  private gapi = mockSheetsApi();
  constructor(
    initialProps: UseConflictsTableProps = {
      gapi: this.gapi as unknown as typeof gapi,
      sheetId: "test-sheet-id",
      token: "test-token",
    }
  ) {
    const { result } = renderHook(() => useConflictsTable(initialProps));
    this.result = result;
  }

  resetApiCalls() {
    vi.clearAllMocks();
  }

  async setTestData(
    values: string[][] | Promise<string[][]>,
    loadAndWait = true
  ) {
    const getResult = Promise.withResolvers();
    this.gapi.client.sheets.spreadsheets.values.get.mockResolvedValueOnce(
      getResult.promise
    );
    if (loadAndWait) {
      this.loadData();
      await waitFor(() => expect(this.isLoading()).toBeTruthy());
    }
    try {
      const resolvedValues = await values;
      getResult.resolve({ result: { values: resolvedValues } });
    } catch (e) {
      getResult.reject(e);
    }
    if (loadAndWait) {
      await waitFor(() => expect(this.isLoading()).toBeFalsy());
    }
  }

  waitForState(expected: ExpectedTableData) {
    return waitFor(() => {
      if (expected.conflicts) {
        expect(this.getConflicts()).toEqual(expected.conflicts);
      }
      if (expected.roles) {
        expect(this.getRoles()).toEqual(expected.roles);
      }
      if (expected.motivations) {
        const allMotivations = Object.fromEntries(
          this.result.current.roles
            .flatMap(({ motivations }) => Object.values(motivations))
            .map((motivation) => [motivation.cellRef, motivation.value])
        );
        expect(allMotivations).toEqual(expected.motivations);
      }
    });
  }

  expectApiCall(
    method: "get" | "update" | "clear",
    expectedRange: string,
    expectedValues?: unknown[][]
  ) {
    return waitFor(() => {
      const mockApi = this.gapi.client.sheets.spreadsheets.values;
      expect(mockApi[method]).toHaveBeenCalledTimes(1);
      const mockCall = mockApi[method].mock.calls[0][0];

      expect(mockCall.range).toBe(expectedRange);
      if (expectedValues) {
        expect(mockCall.resource.values).toEqual(expectedValues);
      }
    });
  }

  getConflicts(): string[] {
    return this.result.current.conflicts.map((conflict) => conflict.value);
  }

  getRoles(): string[] {
    return this.result.current.roles.map((role) => role.value);
  }

  getError(): string | null {
    return this.result.current.error;
  }

  isLoading(): boolean {
    return this.result.current.isLoading;
  }

  loadData(): void {
    this.result.current.loadData();
  }

  addConflict(conflict: string): void {
    this.result.current.addConflict(conflict);
  }

  addRole(role: string): void {
    this.result.current.addRole(role);
  }

  removeConflict(id: CellId): void {
    this.result.current.removeConflict(id);
  }

  removeRole(id: CellId): void {
    this.result.current.removeRole(id);
  }

  updateMotivation(conflictId: CellId, roleId: CellId, value: string): void {
    this.result.current.updateMotivation(conflictId, roleId, value);
  }

  updateConflictName(id: CellId, newName: string): void {
    this.result.current.updateConflictName(id, newName);
  }

  updateRoleName(id: CellId, newName: string): void {
    this.result.current.updateRoleName(id, newName);
  }
}
