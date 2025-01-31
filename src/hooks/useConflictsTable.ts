import { DependencyList, useCallback, useEffect, useState } from "react";

import { ArgumentsType } from "vitest";
import { ReadonlyDeep } from "type-fest";

export interface UseConflictsTableProps {
  sheetId: string;
  token: string;
  gapi: typeof gapi;
}
export type CellId = string;
interface CellNode {
  type: "role" | "conflict" | "motivation";
  value: string;
  rowIndex: number;
  colIndex: number;
  cellRef: CellId;
}
type RoleData = CellNode & {
  type: "role";
  motivations: Motivations;
};
type ConflictData = CellNode & {
  type: "conflict";
  motivations: Motivations;
};
type MotivationData = CellNode & {
  type: "motivation";
  role: CellId;
  conflict: CellId;
};
type Motivations = Record<CellId, MotivationData>;

const useCallbackVoid = <T extends Function>(
  callback: T,
  deps: DependencyList
) => {
  return useCallback(
    (...args: ArgumentsType<T>) => void callback(...args),
    deps
  );
};

const getCellRef = (rowIndex: number, colIndex: number): string => {
  return `${String.fromCharCode(65 + colIndex)}${rowIndex + 1}`;
};
const getCellRange = (...cells: CellNode[]): string => {
  const colIndexes = new Set(cells.map((cell) => cell.colIndex));
  const rowIndexes = new Set(cells.map((cell) => cell.rowIndex));
  const minColIndex = Math.min(...colIndexes);
  const maxColIndex = Math.max(...colIndexes);
  const minRowIndex = Math.min(...rowIndexes);
  const maxRowIndex = Math.max(...rowIndexes);
  return `Sheet1!${getCellRef(minRowIndex, minColIndex)}:${getCellRef(
    maxRowIndex,
    maxColIndex
  )}`;
};

export type ConflictsTable = ReturnType<typeof useConflictsTable>;
export function useConflictsTable({
  token,
  sheetId,
  gapi,
}: UseConflictsTableProps) {
  const [conflicts, setConflicts] = useState<ReadonlyDeep<ConflictData[]>>([]);
  const [roles, setRoles] = useState<ReadonlyDeep<RoleData[]>>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  function reportError(message: null): void;
  function reportError(message: string, error: Error): void;
  function reportError(message: string | null, error?: Error | null): void {
    if (message && error) {
      console.error(message, error);
      message = message + ": " + error.message;
    }
    setError(message);
  }
  const optinos = {
    oauth_token: token,
    spreadsheetId: sheetId,
  };

  const loadData = useCallbackVoid(async () => {
    try {
      setIsLoading(true);
      if (!gapi.client.sheets) {
        await gapi.client.load("sheets", "v4");
        if (!gapi.client.sheets) {
          throw new Error("Google Sheets API not loaded");
        }
      }

      const response = await gapi.client.sheets.spreadsheets.values.get({
        ...optinos,
        range: "Sheet1!A1:Z1000",
      });

      const values = response.result.values;
      if (!values) {
        throw new Error("No data found in sheet");
      }

      const sheetRoles: RoleData[] = values[0]
        .slice(1)
        .map((value: string, index: number) => ({
          type: "role",
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
            type: "conflict",
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
                type: "motivation",
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
      reportError(null);
    } catch (error) {
      reportError("Failed to load data from Google Sheet", error as Error);
    } finally {
      setIsLoading(false);
    }
  }, [sheetId]);

  const updateFullSheet = useCallbackVoid(async () => {
    try {
      const values = [
        ["Conflicts / Roles", ...roles.map((r) => r.value)],
        ...conflicts.map((conflict) => [
          conflict.value,
          ...roles.map(
            (role) => conflict.motivations[role.cellRef]?.value || ""
          ),
        ]),
      ];

      await gapi.client.sheets.spreadsheets.values.update({
        ...optinos,
        range: "Sheet1!A1:Z1000",
        valueInputOption: "RAW",
        resource: { values },
      });

      reportError(null);
    } catch (error) {
      reportError("Failed to update sheet", error as Error);
    }
  }, [sheetId, conflicts, roles]);

  const addConflict = useCallbackVoid(
    async (newConflict: string) => {
      try {
        const cellRef = getCellRef(conflicts.length + 1, 0);

        const newConflictCell: ConflictData = {
          type: "conflict",
          value: newConflict,
          rowIndex: conflicts.length + 1,
          colIndex: 0,
          cellRef,
          motivations: {},
        };

        setConflicts((prev) => [...prev, newConflictCell]);

        await gapi.client.sheets.spreadsheets.values.update({
          ...optinos,
          range: `Sheet1!${cellRef}:${getCellRef(
            conflicts.length + 1,
            roles.length
          )}`,
          valueInputOption: "RAW",
          resource: { values: [[newConflict, ...roles.map(() => "")]] },
        });
        reportError(null);
      } catch (error) {
        reportError("Failed to add conflict", error as Error);
      }
    },
    [conflicts.length, roles]
  );

  const addRole = useCallbackVoid(
    async (newRole: string) => {
      try {
        const cellRef = getCellRef(0, roles.length + 1);

        const newRoleCell: RoleData = {
          type: "role",
          value: newRole,
          rowIndex: 0,
          colIndex: roles.length + 1,
          cellRef,
          motivations: {},
        };

        setRoles((prev) => [...prev, newRoleCell]);

        await gapi.client.sheets.spreadsheets.values.update({
          ...optinos,
          range: `Sheet1!${cellRef}:${getCellRef(
            conflicts.length,
            roles.length + 1
          )}`,
          valueInputOption: "RAW",
          resource: { values: [[newRole], ...conflicts.map(() => [""])] },
        });
        reportError(null);
      } catch (error) {
        reportError("Failed to add role", error as Error);
      }
    },
    [conflicts.length, roles.length]
  );

  const removeConflict = useCallbackVoid(
    async (cellRef: CellId) => {
      try {
        const conflict = conflicts.find((c) => c.cellRef === cellRef);
        if (!conflict) {
          throw new Error("Invalid conflict cell ref");
        }
        setConflicts((prev) => {
          const index = prev.indexOf(conflict);
          switch (index) {
            case -1:
              return prev;
            case prev.length - 1:
              return prev.slice(0, index);
            default:
              return [
                ...prev.slice(0, index),
                { ...conflict, value: "", motivations: {} },
                ...prev.slice(index + 1),
              ];
          }
        });

        await gapi.client.sheets.spreadsheets.values.clear({
          ...optinos,
          range: getCellRange(conflict, ...Object.values(conflict.motivations)),
          resource: {},
        });
        reportError(null);
      } catch (error) {
        reportError("Failed to remove conflict", error as Error);
      }
    },
    [conflicts, roles]
  );

  const removeRole = useCallbackVoid(
    async (cellRef: CellId) => {
      try {
        const role = roles.find((r) => r.cellRef === cellRef);
        if (!role) {
          throw new Error("Invalid role cell ref");
        }
        setRoles((prev) => {
          const index = prev.indexOf(role);
          switch (index) {
            case -1:
              return prev;
            case prev.length - 1:
              return prev.slice(0, index);
            default:
              return [
                ...prev.slice(0, index),
                { ...role, value: "", motivations: {} },
                ...prev.slice(index + 1),
              ];
          }
        });
        await gapi.client.sheets.spreadsheets.values.clear({
          ...optinos,
          range: getCellRange(role, ...Object.values(role.motivations)),
          resource: {},
        });
        reportError(null);
      } catch (error) {
        reportError("Failed to remove role", error as Error);
      }
    },
    [roles, conflicts]
  );

  const updateMotivation = useCallbackVoid(
    async (conflictId: CellId, roleId: CellId, value: string | null) => {
      value = value?.trim() || "";
      const oldR = roles.find((r) => r.cellRef === roleId);
      const oldC = conflicts.find((c) => c.cellRef === conflictId);
      if (!oldR || !oldC) {
        throw new Error(`Invalid coordinates: ${oldR} ${oldC}`);
      }
      try {
        const cellRef = getCellRef(oldC.rowIndex, oldR.colIndex);
        const motivationData = oldC.motivations[roleId];
        if (motivationData?.value === value) {
          return;
        }
        const range = `Sheet1!${cellRef}`;

        await gapi.client.sheets.spreadsheets.values.update({
          ...optinos,
          range,
          valueInputOption: "RAW",
          resource: { values: [[value]] },
        });
        const newM: MotivationData = {
          value,
          type: "motivation",
          rowIndex: oldC.rowIndex,
          colIndex: oldR.colIndex,
          cellRef,
          role: roleId,
          conflict: conflictId,
        };
        const newR = {
          ...oldR,
          motivations: { ...oldR.motivations, [conflictId]: newM },
        };
        const newC = {
          ...oldC,
          motivations: { ...oldC.motivations, [roleId]: newM },
        };

        setRoles((prev) => prev.map((r) => (r === oldR ? newR : r)));
        setConflicts((prev) => prev.map((c) => (c === oldC ? newC : c)));
        reportError(null);
      } catch (error) {
        reportError("Failed to update motivation", error as Error);
      }
    },
    [conflicts, roles]
  );

  const updateConflictName = useCallbackVoid(
    async (cellRef: CellId, newName: string | null) => {
      newName = newName?.trim() || "";
      try {
        const conflict = conflicts.find((c) => c.cellRef === cellRef);
        if (!conflict) {
          throw new Error("Invalid conflict index");
        }

        await gapi.client.sheets.spreadsheets.values.update({
          ...optinos,
          range: `Sheet1!${cellRef}`,
          valueInputOption: "RAW",
          resource: { values: [[newName]] },
        });

        setConflicts((prev) =>
          prev.map((c) =>
            c.cellRef === cellRef ? { ...c, value: newName } : c
          )
        );
        reportError(null);
      } catch (error) {
        reportError("Failed to update conflict name", error as Error);
      }
    },
    [conflicts]
  );

  const updateRoleName = useCallbackVoid(
    async (cellRef: CellId, newName: string | null) => {
      newName = newName?.trim() || "";
      try {
        const role = roles.find((r) => r.cellRef === cellRef);
        if (!role) {
          throw new Error("Invalid role index");
        }

        await gapi.client.sheets.spreadsheets.values.update({
          ...optinos,
          range: `Sheet1!${cellRef}`,
          valueInputOption: "RAW",
          resource: { values: [[newName]] },
        });

        setRoles((prev) =>
          prev.map((r) =>
            r.cellRef === cellRef ? { ...r, value: newName } : r
          )
        );
        reportError(null);
      } catch (error) {
        reportError("Failed to update role name", error as Error);
      }
    },
    [roles]
  );

  return {
    conflicts: conflicts.filter(
      (c) => c.value || Object.keys(c.motivations).length
    ),
    roles: roles.filter((r) => r.value || Object.keys(r.motivations).length),
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
