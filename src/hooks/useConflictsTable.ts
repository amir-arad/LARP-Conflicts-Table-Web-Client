import { useCallback, useMemo, useState } from 'react';

import { ROLES_CONFLICT_SHEET_ID } from '../config';
import { ReadonlyDeep } from 'type-fest';
import { useGoogleSheets } from '../contexts/GoogleSheetsContext';

// export interface UseConflictsTableProps {
//   sheetId: string;
// }

/**
 * Cell identifier string (e.g., "A1", "B2")
 */
export type CellId = string;

/**
 * Base interface for all cell types in the conflicts table
 */
interface CellNode {
  /** Previous value (for tracking changes) */
  _oldVal?: string;
  /** Type of cell */
  type: 'role' | 'conflict' | 'motivation';
  /** Cell content */
  value: string;
  /** Row index (0-based) */
  rowIndex: number;
  /** Column index (0-based) */
  colIndex: number;
  /** Cell reference (e.g., "A1") */
  cellRef: CellId;
}

/**
 * Role data structure
 */
type RoleData = CellNode & {
  type: 'role';
  /** Motivations for this role across all conflicts */
  motivations: Motivations;
};

/**
 * Conflict data structure
 */
type ConflictData = CellNode & {
  type: 'conflict';
  /** Motivations for this conflict across all roles */
  motivations: Motivations;
};

/**
 * Motivation data structure
 */
type MotivationData = CellNode & {
  type: 'motivation';
  /** Reference to the role this motivation belongs to */
  role: CellId;
  /** Reference to the conflict this motivation belongs to */
  conflict: CellId;
};

/**
 * Map of cell IDs to motivation data
 */
type Motivations = Record<CellId, MotivationData>;

/**
 * Convert row and column indices to a cell reference (e.g., "A1")
 *
 * @param rowIndex - Row index (0-based)
 * @param colIndex - Column index (0-based)
 * @returns Cell reference (e.g., "A1")
 */
const getCellRef = (rowIndex: number, colIndex: number): string => {
  return `${String.fromCharCode(65 + colIndex)}${rowIndex + 1}`;
};

/**
 * Get a range of cells (e.g., "Sheet1!A1:B2")
 *
 * @param cells - Cells to include in the range
 * @returns Range string (e.g., "Sheet1!A1:B2")
 */
const getCellRange = (...cells: CellNode[]): string => {
  const colIndexes = new Set(cells.map(cell => cell.colIndex));
  const rowIndexes = new Set(cells.map(cell => cell.rowIndex));
  const minColIndex = Math.min(...colIndexes);
  const maxColIndex = Math.max(...colIndexes);
  const minRowIndex = Math.min(...rowIndexes);
  const maxRowIndex = Math.max(...rowIndexes);
  return `${ROLES_CONFLICT_SHEET_ID}!${getCellRef(
    minRowIndex,
    minColIndex
  )}:${getCellRef(maxRowIndex, maxColIndex)}`;
};

export type ConflictsTable = ReturnType<typeof useConflictsTable>;

/**
 * Hook for managing conflicts table data and operations
 *
 * @hook
 * @description Provides functionality for loading, updating, and manipulating conflicts table data
 *
 * @returns {Object} Conflicts table state and operations
 * @returns {ConflictData[]} conflicts - Array of conflict objects
 * @returns {RoleData[]} roles - Array of role objects
 * @returns {string | null} error - Error message, if any
 * @returns {boolean} isLoading - Whether data is currently being loaded
 * @returns {Function} loadData - Function to load data from Google Sheets
 * @returns {Function} addConflict - Function to add a new conflict
 * @returns {Function} addRole - Function to add a new role
 * @returns {Function} removeConflict - Function to remove a conflict
 * @returns {Function} removeRole - Function to remove a role
 * @returns {Function} updateMotivation - Function to update a motivation
 * @returns {Function} updateFullSheet - Function to update the entire sheet
 * @returns {Function} updateConflictName - Function to update a conflict name
 * @returns {Function} updateRoleName - Function to update a role name
 *
 * @example
 * ```tsx
 * const {
 *   conflicts,
 *   roles,
 *   error,
 *   isLoading,
 *   loadData,
 *   addConflict,
 *   addRole,
 *   removeConflict,
 *   removeRole,
 *   updateMotivation,
 *   updateConflictName,
 *   updateRoleName
 * } = useConflictsTable();
 * ```
 */
export function useConflictsTable() {
  const [conflicts, setConflicts] = useState<ReadonlyDeep<ConflictData[]>>([]);
  const [roles, setRoles] = useState<ReadonlyDeep<RoleData[]>>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const { load, update, clear, error, isLoading } = useGoogleSheets();

  /**
   * Load conflicts table data from Google Sheets
   *
   * @returns {Promise<void>}
   */
  const loadData = useCallback(async () => {
    try {
      const response = await load();
      if (!response) {
        return;
      }
      const values = response.result.values;
      if (!values) {
        setRoles([]);
        setConflicts([]);
        return;
      }

      const sheetRoles: RoleData[] = values[0]
        .slice(1)
        .map((value: string, index: number) => ({
          type: 'role',
          value,
          rowIndex: 0,
          colIndex: index + 1,
          cellRef: getCellRef(0, index + 1),
          motivations: {},
        }));

      const sheetConflicts: ConflictData[] = [];

      for (let i = 1; i < values.length; i++) {
        const row = values[i];
        if (row[0]) {
          const conflictMotivations: Motivations = {};
          const conflictCell: ConflictData = {
            type: 'conflict',
            value: row[0],
            rowIndex: i,
            colIndex: 0,
            cellRef: getCellRef(i, 0),
            motivations: conflictMotivations,
          };
          sheetConflicts.push(conflictCell);
          for (let j = 1; j < row.length; j++) {
            const role = sheetRoles[j - 1];
            if (row[j]?.trim()) {
              const motivation: MotivationData = {
                type: 'motivation',
                value: row[j],
                rowIndex: i,
                colIndex: j,
                cellRef: getCellRef(i, j),
                role: sheetRoles[j - 1].cellRef,
                conflict: conflictCell.cellRef,
              };
              conflictMotivations[motivation.role] = motivation;
              role.motivations[motivation.conflict] = motivation;
            }
          }
        }
      }
      setRoles(sheetRoles);
      setConflicts(sheetConflicts);
    } catch (error: unknown) {
      setApiError(error instanceof Error ? error.message : String(error));
    }
  }, [load]);

  /**
   * Update the entire sheet with current data
   *
   * @returns {Promise<void>}
   */
  const updateFullSheet = useCallback(async () => {
    try {
      const values = [
        ['Conflicts / Roles', ...roles.map(r => r.value)],
        ...conflicts.map(conflict => [
          conflict.value,
          ...roles.map(role => conflict.motivations[role.cellRef]?.value || ''),
        ]),
      ];

      await update(`${ROLES_CONFLICT_SHEET_ID}!A1:Z1000`, values);
    } catch (error: unknown) {
      setApiError(error instanceof Error ? error.message : String(error));
    }
  }, [update, roles, conflicts]);

  /**
   * Add a new conflict to the table
   *
   * @param {string} newConflict - Name of the new conflict
   * @returns {Promise<void>}
   */
  const addConflict = useCallback(
    async (newConflict: string) => {
      try {
        const cellRef = getCellRef(conflicts.length + 1, 0);

        const newConflictCell: ConflictData = {
          type: 'conflict',
          value: newConflict,
          rowIndex: conflicts.length + 1,
          colIndex: 0,
          cellRef,
          motivations: {},
        };

        setConflicts(prev => [...prev, newConflictCell]);

        const range = `${ROLES_CONFLICT_SHEET_ID}!${cellRef}:${getCellRef(
          conflicts.length + 1,
          roles.length
        )}`;
        await update(range, [[newConflict, ...Array(roles.length).fill('')]]);
      } catch (error: unknown) {
        setApiError(error instanceof Error ? error.message : String(error));
      }
    },
    [update, roles.length, conflicts.length]
  );

  /**
   * Add a new role to the table
   *
   * @param {string} newRole - Name of the new role
   * @returns {Promise<void>}
   */
  const addRole = useCallback(
    async (newRole: string) => {
      try {
        const cellRef = getCellRef(0, roles.length + 1);

        const newRoleCell: RoleData = {
          type: 'role',
          value: newRole,
          rowIndex: 0,
          colIndex: roles.length + 1,
          cellRef,
          motivations: {},
        };

        setRoles(prev => [...prev, newRoleCell]);

        const range = `${ROLES_CONFLICT_SHEET_ID}!${cellRef}:${getCellRef(
          conflicts.length,
          roles.length + 1
        )}`;
        await update(range, [
          [newRole],
          ...Array(conflicts.length)
            .fill('')
            .map(() => ['']),
        ]);
      } catch (error: unknown) {
        setApiError(error instanceof Error ? error.message : String(error));
      }
    },
    [update, roles.length, conflicts.length]
  );

  /**
   * Remove a conflict from the table
   *
   * @param {CellId} cellRef - Cell reference of the conflict to remove
   * @returns {Promise<void>}
   */
  const removeConflict = useCallback(
    async (cellRef: CellId) => {
      try {
        const conflict = conflicts.find(c => c.cellRef === cellRef);
        if (!conflict) {
          throw new Error('Invalid conflict cell ref');
        }

        setConflicts(prev => {
          const index = prev.findIndex(c => c.cellRef === cellRef);
          if (index === -1) {
            return prev;
          }

          // Get the current conflict before any modifications
          const currentConflict = prev[index];
          if (!currentConflict) {
            return prev;
          }

          // Last item - just remove it
          if (index === prev.length - 1) {
            return prev.slice(0, index);
          }

          // Otherwise clear the values but keep the structure
          return [
            ...prev.slice(0, index),
            {
              ...currentConflict,
              value: '',
              motivations: {},
              _oldVal: currentConflict.value,
            },
            ...prev.slice(index + 1),
          ];
        });

        await clear(
          getCellRange(conflict, ...Object.values(conflict.motivations))
        );
      } catch (error: unknown) {
        setApiError(error instanceof Error ? error.message : String(error));
      }
    },
    [clear, conflicts]
  );

  /**
   * Remove a role from the table
   *
   * @param {CellId} cellRef - Cell reference of the role to remove
   * @returns {Promise<void>}
   */
  const removeRole = useCallback(
    async (cellRef: CellId) => {
      try {
        const role = roles.find(r => r.cellRef === cellRef);
        if (!role) {
          throw new Error('Invalid role cell ref');
        }

        setRoles(prev => {
          const index = prev.findIndex(c => c.cellRef === cellRef);
          if (index === -1) {
            return prev;
          }

          // Get the current role before any modifications
          const currentRole = prev[index];
          if (!currentRole) {
            return prev;
          }

          // Last item - just remove it
          if (index === prev.length - 1) {
            return prev.slice(0, index);
          }

          // Otherwise clear the values but keep the structure
          return [
            ...prev.slice(0, index),
            {
              ...currentRole,
              value: '',
              motivations: {},
              _oldVal: currentRole.value,
            },
            ...prev.slice(index + 1),
          ];
        });
        await clear(getCellRange(role, ...Object.values(role.motivations)));
      } catch (error: unknown) {
        setApiError(error instanceof Error ? error.message : String(error));
      }
    },
    [clear, roles]
  );

  /**
   * Update a motivation in the table
   *
   * @param {CellId} conflictId - Cell reference of the conflict
   * @param {CellId} roleId - Cell reference of the role
   * @param {string | null} valueArg - New motivation value
   * @returns {Promise<void>}
   */
  const updateMotivation = useCallback(
    async (conflictId: CellId, roleId: CellId, valueArg: string | null) => {
      try {
        const value = valueArg?.trim() || '';
        const role = roles.find(r => r.cellRef === roleId);
        const conflict = conflicts.find(c => c.cellRef === conflictId);
        if (!role || !conflict) {
          throw new Error(`Invalid coordinates: ${role} ${conflict}`);
        }
        const cellRef = getCellRef(conflict.rowIndex, role.colIndex);
        const motivation = conflict.motivations[roleId];
        if (motivation?.value === value) {
          return;
        }

        await update(`${ROLES_CONFLICT_SHEET_ID}!${cellRef}`, [[value]]);
        const newMotivationBase: Omit<MotivationData, 'value'> = {
          type: 'motivation',
          rowIndex: conflict.rowIndex,
          colIndex: role.colIndex,
          cellRef,
          role: roleId,
          conflict: conflictId,
        };
        setRoles(prev => {
          const oldR = prev.find(r => r.cellRef === roleId);
          if (!oldR) return prev;
          const oldMotivation = oldR.motivations[conflictId];
          if (oldMotivation?.value === value) return prev;
          const newM = {
            ...newMotivationBase,
            value,
            colIndex: oldR.colIndex,
          };
          if (oldMotivation) {
            newM._oldVal = oldMotivation.value;
          }
          const newR = {
            ...oldR,
            motivations: {
              ...oldR.motivations,
              [conflictId]: newM,
            },
          };
          return prev.map(r => (r === oldR ? newR : r));
        });
        setConflicts(prev => {
          const oldC = prev.find(r => r.cellRef === conflictId);
          if (!oldC) return prev;
          const oldMotivation = oldC.motivations[roleId];
          if (oldMotivation?.value === value) return prev;
          const newM = {
            ...newMotivationBase,
            value,
            rowIndex: oldC.rowIndex,
          };
          if (oldMotivation) {
            newM._oldVal = oldMotivation.value;
          }
          const newC = {
            ...oldC,
            motivations: {
              ...oldC.motivations,
              [roleId]: newM,
            },
          };
          return prev.map(c => (c === oldC ? newC : c));
        });
      } catch (error: unknown) {
        setApiError(error instanceof Error ? error.message : String(error));
      }
    },
    [update, roles, conflicts]
  );

  /**
   * Update a conflict name
   *
   * @param {CellId} cellRef - Cell reference of the conflict
   * @param {string | null} newName - New conflict name
   * @returns {Promise<void>}
   */
  const updateConflictName = useCallback(
    async (cellRef: CellId, newName: string | null) => {
      try {
        const value = newName?.trim() || '';
        const conflict = conflicts.find(c => c.cellRef === cellRef);
        if (!conflict) {
          throw new Error('Invalid conflict index');
        }

        await update(`${ROLES_CONFLICT_SHEET_ID}!${cellRef}`, [[value]]);

        setConflicts(prev =>
          prev.map(c =>
            c.cellRef === cellRef ? { ...c, value, _oldVal: c.value } : c
          )
        );
      } catch (error: unknown) {
        setApiError(error instanceof Error ? error.message : String(error));
      }
    },
    [update, conflicts]
  );

  /**
   * Update a role name
   *
   * @param {CellId} cellRef - Cell reference of the role
   * @param {string | null} newName - New role name
   * @returns {Promise<void>}
   */
  const updateRoleName = useCallback(
    async (cellRef: CellId, newName: string | null) => {
      try {
        const value = newName?.trim() || '';
        const role = roles.find(r => r.cellRef === cellRef);
        if (!role) {
          throw new Error('Invalid role index');
        }

        await update(`${ROLES_CONFLICT_SHEET_ID}!${cellRef}`, [[value]]);

        setRoles(prev =>
          prev.map(r =>
            r.cellRef === cellRef ? { ...r, value, _oldVal: r.value } : r
          )
        );
      } catch (error: unknown) {
        setApiError(error instanceof Error ? error.message : String(error));
      }
    },
    [update, roles]
  );

  /**
   * Filter out conflicts with empty values and no motivations
   */
  const filteredConflicts = useMemo(
    () => conflicts.filter(c => c.value || Object.keys(c.motivations).length),
    [conflicts]
  );

  /**
   * Filter out roles with empty values and no motivations
   */
  const filteredRoles = useMemo(
    () => roles.filter(r => r.value || Object.keys(r.motivations).length),
    [roles]
  );

  return {
    conflicts: filteredConflicts,
    roles: filteredRoles,
    error: error || apiError,
    isLoading,
    loadData,
    addConflict,
    addRole,
    removeConflict,
    removeRole,
    updateMotivation,
    updateFullSheet,
    updateConflictName,
    updateRoleName,
  };
}
