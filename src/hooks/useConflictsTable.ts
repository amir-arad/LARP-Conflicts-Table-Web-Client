import { useCallback, useMemo, useState } from 'react';

import { ROLES_CONFLICT_SHEET_ID } from '../config';
import { ReadonlyDeep } from 'type-fest';
import { useGoogleSheet } from './useGoogleSheet';

export interface UseConflictsTableProps {
  sheetId: string;
  token: string;
}

export type CellId = string;
interface CellNode {
  _oldVal?: string;
  type: 'role' | 'conflict' | 'motivation';
  value: string;
  rowIndex: number;
  colIndex: number;
  cellRef: CellId;
}
type RoleData = CellNode & {
  type: 'role';
  motivations: Motivations;
};
type ConflictData = CellNode & {
  type: 'conflict';
  motivations: Motivations;
};
type MotivationData = CellNode & {
  type: 'motivation';
  role: CellId;
  conflict: CellId;
};
type Motivations = Record<CellId, MotivationData>;

const getCellRef = (rowIndex: number, colIndex: number): string => {
  return `${String.fromCharCode(65 + colIndex)}${rowIndex + 1}`;
};
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
export function useConflictsTable({ token, sheetId }: UseConflictsTableProps) {
  const [conflicts, setConflicts] = useState<ReadonlyDeep<ConflictData[]>>([]);
  const [roles, setRoles] = useState<ReadonlyDeep<RoleData[]>>([]);
  const { apiMethods, error, isLoading } = useGoogleSheet({ token, sheetId });

  const loadData = useCallback(async () => {
    const response = await apiMethods.load();
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
  }, [apiMethods]);

  const updateFullSheet = useCallback(async () => {
    const values = [
      ['Conflicts / Roles', ...roles.map(r => r.value)],
      ...conflicts.map(conflict => [
        conflict.value,
        ...roles.map(role => conflict.motivations[role.cellRef]?.value || ''),
      ]),
    ];

    await apiMethods.update(`${ROLES_CONFLICT_SHEET_ID}!A1:Z1000`, values);
  }, [apiMethods, roles, conflicts]);

  const addConflict = useCallback(
    async (newConflict: string) => {
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
      await apiMethods.update(range, [
        [newConflict, ...Array(roles.length).fill('')],
      ]);
    },
    [apiMethods, roles.length, conflicts.length]
  );

  const addRole = useCallback(
    async (newRole: string) => {
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
      await apiMethods.update(range, [
        [newRole],
        ...Array(conflicts.length)
          .fill('')
          .map(() => ['']),
      ]);
    },
    [apiMethods, roles.length, conflicts.length]
  );

  const removeConflict = useCallback(
    async (cellRef: CellId) => {
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

      await apiMethods.clear(
        getCellRange(conflict, ...Object.values(conflict.motivations))
      );
    },
    [apiMethods, conflicts]
  );

  const removeRole = useCallback(
    async (cellRef: CellId) => {
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
      await apiMethods.clear(
        getCellRange(role, ...Object.values(role.motivations))
      );
    },
    [apiMethods, roles]
  );

  const updateMotivation = useCallback(
    async (conflictId: CellId, roleId: CellId, value: string | null) => {
      value = value?.trim() || '';
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

      await apiMethods.update(`${ROLES_CONFLICT_SHEET_ID}!${cellRef}`, [
        [value],
      ]);
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
    },
    [apiMethods, roles, conflicts]
  );

  const updateConflictName = useCallback(
    async (cellRef: CellId, newName: string | null) => {
      newName = newName?.trim() || '';
      const conflict = conflicts.find(c => c.cellRef === cellRef);
      if (!conflict) {
        throw new Error('Invalid conflict index');
      }

      await apiMethods.update(`${ROLES_CONFLICT_SHEET_ID}!${cellRef}`, [
        [newName],
      ]);

      setConflicts(prev =>
        prev.map(c =>
          c.cellRef === cellRef ? { ...c, value: newName, _oldVal: c.value } : c
        )
      );
    },
    [apiMethods, conflicts]
  );

  const updateRoleName = useCallback(
    async (cellRef: CellId, newName: string | null) => {
      newName = newName?.trim() || '';
      const role = roles.find(r => r.cellRef === cellRef);
      if (!role) {
        throw new Error('Invalid role index');
      }

      await apiMethods.update(`${ROLES_CONFLICT_SHEET_ID}!${cellRef}`, [
        [newName],
      ]);

      setRoles(prev =>
        prev.map(r =>
          r.cellRef === cellRef ? { ...r, value: newName, _oldVal: r.value } : r
        )
      );
    },
    [apiMethods, roles]
  );

  const filteredConflicts = useMemo(
    () => conflicts.filter(c => c.value || Object.keys(c.motivations).length),
    [conflicts]
  );
  const filteredRoles = useMemo(
    () => roles.filter(r => r.value || Object.keys(r.motivations).length),
    [roles]
  );

  return {
    conflicts: filteredConflicts,
    roles: filteredRoles,
    error,
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
