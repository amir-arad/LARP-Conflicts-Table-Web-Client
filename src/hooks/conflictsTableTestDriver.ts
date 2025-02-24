import { renderHook, waitFor } from '@testing-library/react';
import { expect, vi } from 'vitest';
import { createTestWrapper } from '../test/test-wrapper';
import { CellId, ConflictsTable, useConflictsTable } from './useConflictsTable';

export interface ExpectedTableData {
  conflicts?: string[];
  roles?: string[];
  motivations?: Record<string, string>;
}

type HookReturn = ReturnType<typeof renderHook<ConflictsTable, never>>;

export class ConflictsTableTestDriver {
  private result: HookReturn['result'];
  private testWrapper = createTestWrapper(true);

  constructor() {
    const { result } = renderHook(() => useConflictsTable(), {
      wrapper: this.testWrapper.Wrapper,
    });
    this.result = result;
    vi.clearAllMocks();
  }

  resetApiCalls() {
    vi.clearAllMocks();
  }

  async setTestData(
    valuesArg: string[][] | Promise<string[][]>,
    loadAndWait = true
  ) {
    const loadResult = Promise.withResolvers<string[][]>();
    this.testWrapper.mockGoogleSheets.setTestData(loadResult.promise);

    if (loadAndWait) {
      this.loadData();
      await waitFor(() => expect(this.isLoading()).toBeTruthy());
    }
    try {
      loadResult.resolve(await valuesArg);
    } catch (e) {
      loadResult.reject(e);
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
            .map(motivation => [motivation.cellRef, motivation.value])
        );
        expect(allMotivations).toEqual(expected.motivations);
      }
    });
  }

  expectGoogleSheetsApiCall(
    method: 'load' | 'update' | 'clear',
    expectedRange: string,
    expectedValues?: unknown[][]
  ) {
    return waitFor(() => {
      const mockFn = this.testWrapper.mockGoogleSheets.api[method];
      const calls = mockFn.mock.calls.filter(call => {
        // Filter calls by range to handle multiple operations
        const range = call[0];
        return method === 'load' || range === expectedRange;
      });
      expect(calls.length).toBe(1);
      if (expectedValues) {
        expect(calls[0][1]).toEqual(expectedValues);
      }
    });
  }

  getConflicts(): string[] {
    return this.result.current.conflicts.map(conflict => conflict.value);
  }

  getRoles(): string[] {
    return this.result.current.roles.map(role => role.value);
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
