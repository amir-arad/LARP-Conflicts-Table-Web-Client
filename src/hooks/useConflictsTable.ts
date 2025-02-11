import { DependencyList, useCallback, useRef, useState } from "react";
import { ReadonlyDeep } from "type-fest";
import { ROLES_CONFLICT_SHEET_ID } from "../config";

type ArgumentsType<T> = T extends (...args: infer U) => any ? U : never;

export interface UseConflictsTableProps {
  sheetId: string;
  token: string;
  gapi: typeof gapi;
}

export type CellId = string;
interface CellNode {
  _oldVal?: string;
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
  return `${ROLES_CONFLICT_SHEET_ID}!${getCellRef(minRowIndex, minColIndex)}:${getCellRef(
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
  const actionLock = useRef(false);

  const optinos = {
    oauth_token: token,
    spreadsheetId: sheetId,
  };
  const optionsDeps = Object.values(optinos);

  function action<
    A extends Array<any>,
    T extends (...args: A) => Promise<unknown>
  >(name: string, callback: T, deps: DependencyList) {
    return useCallback((...args: ArgumentsType<T>) => {
      console.log("action", name, [...deps]);
      if (actionLock.current) {
        console.log(
          `${name} skipped - action lock active: ${actionLock.current}`
        );
        return;
      }
      console.log(`${name} started`);
      actionLock.current = true;

      callback(...args)
        .then(
          () => {
            console.log(`${name} completed successfully`);
            setError(null);
          },
          (error: Error) => {
            console.error(`${name} failed:`, error);
            setError(name + ": " + error.message);
          }
        )
        .finally(() => {
          console.log(`${name} cleanup`);
          actionLock.current = false;
        });
    }, deps);
  }

  const loadData = action(
    "load data from Google Sheet",
    async () => {
      console.log("Starting data load");
      if (isLoading) {
        console.log(`${name} skipped - loading`);
        return;
      }
      setIsLoading(true);
      try {
        if (!gapi.client.sheets) {
          console.log("Loading sheets API");
          await gapi.client.load("sheets", "v4");
          if (!gapi.client.sheets) {
            throw new Error("Google Sheets API not loaded");
          }
        }

        console.log("Fetching sheet data");
        const response = await gapi.client.sheets.spreadsheets.values.get({
          ...optinos,
          range: `${ROLES_CONFLICT_SHEET_ID}!A1:Z1000`,
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
      } finally {
        setIsLoading(false);
      }
    },
    [...optionsDeps]
  );

  const updateFullSheet = action(
    "update sheet",
    async () => {
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
        range: `${ROLES_CONFLICT_SHEET_ID}!A1:Z1000`,
        valueInputOption: "RAW",
        resource: { values },
      });
    },
    [...optionsDeps, conflicts, roles]
  );

  const addConflict = action(
    "add conflict",
    async (newConflict: string) => {
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
        range: `${ROLES_CONFLICT_SHEET_ID}!${cellRef}:${getCellRef(
          conflicts.length + 1,
          roles.length
        )}`,
        valueInputOption: "RAW",
        resource: { values: [[newConflict, ...roles.map(() => "")]] },
      });
    },
    [...optionsDeps, conflicts.length, roles]
  );

  const addRole = action(
    "add role",
    async (newRole: string) => {
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
        range: `${ROLES_CONFLICT_SHEET_ID}!${cellRef}:${getCellRef(
          conflicts.length,
          roles.length + 1
        )}`,
        valueInputOption: "RAW",
        resource: { values: [[newRole], ...conflicts.map(() => [""])] },
      });
    },
    [...optionsDeps, conflicts.length, roles.length]
  );

  const removeConflict = action(
    "remove conflict",
    async (cellRef: CellId) => {
      const conflict = conflicts.find((c) => c.cellRef === cellRef);
      if (!conflict) {
        throw new Error("Invalid conflict cell ref");
      }
      setConflicts((prev) => {
        const index = prev.findIndex((c) => c.cellRef === cellRef);
        switch (index) {
          case -1:
            return prev;
          case prev.length - 1:
            return prev.slice(0, index);
          default:
            const conflict = prev[index];
            return [
              ...prev.slice(0, index),
              {
                ...conflict,
                value: "",
                motivations: {},
                _oldVal: conflict.value,
              },
              ...prev.slice(index + 1),
            ];
        }
      });

      await gapi.client.sheets.spreadsheets.values.clear({
        ...optinos,
        range: getCellRange(conflict, ...Object.values(conflict.motivations)),
        resource: {},
      });
    },
    [...optionsDeps, conflicts, roles]
  );

  const removeRole = action(
    "remove role",
    async (cellRef: CellId) => {
      const role = roles.find((r) => r.cellRef === cellRef);
      if (!role) {
        throw new Error("Invalid role cell ref");
      }
      setRoles((prev) => {
        const index = prev.findIndex((c) => c.cellRef === cellRef);
        switch (index) {
          case -1:
            return prev;
          case prev.length - 1:
            return prev.slice(0, index);
          default:
            const role = prev[index];
            return [
              ...prev.slice(0, index),
              { ...role, value: "", motivations: {}, _oldVal: role.value },
              ...prev.slice(index + 1),
            ];
        }
      });
      await gapi.client.sheets.spreadsheets.values.clear({
        ...optinos,
        range: getCellRange(role, ...Object.values(role.motivations)),
        resource: {},
      });
    },
    [...optionsDeps, roles, conflicts]
  );

  const updateMotivation = action(
    "update motivation",
    async (conflictId: CellId, roleId: CellId, value: string | null) => {
      value = value?.trim() || "";
      const role = roles.find((r) => r.cellRef === roleId);
      const conflict = conflicts.find((c) => c.cellRef === conflictId);
      if (!role || !conflict) {
        throw new Error(`Invalid coordinates: ${role} ${conflict}`);
      }
      const cellRef = getCellRef(conflict.rowIndex, role.colIndex);
      const motivation = conflict.motivations[roleId];
      if (motivation?.value === value) {
        return;
      }

      await gapi.client.sheets.spreadsheets.values.update({
        ...optinos,
        range: `${ROLES_CONFLICT_SHEET_ID}!${cellRef}`,
        valueInputOption: "RAW",
        resource: { values: [[value]] },
      });
      const newMotivationBase: Omit<MotivationData, "value"> = {
        type: "motivation",
        rowIndex: conflict.rowIndex,
        colIndex: role.colIndex,
        cellRef,
        role: roleId,
        conflict: conflictId,
      };
      setRoles((prev) => {
        const oldR = prev.find((r) => r.cellRef === roleId);
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
        return prev.map((r) => (r === oldR ? newR : r));
      });
      setConflicts((prev) => {
        const oldC = prev.find((r) => r.cellRef === conflictId);
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
        return prev.map((c) => (c === oldC ? newC : c));
      });
    },
    [...optionsDeps, conflicts, roles]
  );

  const updateConflictName = action(
    "update conflict name",
    async (cellRef: CellId, newName: string | null) => {
      newName = newName?.trim() || "";
      const conflict = conflicts.find((c) => c.cellRef === cellRef);
      if (!conflict) {
        throw new Error("Invalid conflict index");
      }

      await gapi.client.sheets.spreadsheets.values.update({
        ...optinos,
        range: `${ROLES_CONFLICT_SHEET_ID}!${cellRef}`,
        valueInputOption: "RAW",
        resource: { values: [[newName]] },
      });

      setConflicts((prev) =>
        prev.map((c) =>
          c.cellRef === cellRef ? { ...c, value: newName, _oldVal: c.value } : c
        )
      );
    },
    [...optionsDeps, conflicts]
  );

  const updateRoleName = action(
    "update role name",
    async (cellRef: CellId, newName: string | null) => {
      newName = newName?.trim() || "";
      const role = roles.find((r) => r.cellRef === cellRef);
      if (!role) {
        throw new Error("Invalid role index");
      }

      await gapi.client.sheets.spreadsheets.values.update({
        ...optinos,
        range: `${ROLES_CONFLICT_SHEET_ID}!${cellRef}`,
        valueInputOption: "RAW",
        resource: { values: [[newName]] },
      });

      setRoles((prev) =>
        prev.map((r) =>
          r.cellRef === cellRef ? { ...r, value: newName, _oldVal: r.value } : r
        )
      );
    },
    [...optionsDeps, roles]
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
