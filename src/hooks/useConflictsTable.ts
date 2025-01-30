import { DependencyList, useCallback, useState } from "react";

interface UseConflictsTableProps {
  sheetId: string;
  token: string;
}
const useCallbackVoid = (callback: Function, deps: DependencyList) => {
  return useCallback((...args: unknown[]) => void callback(...args), deps);
};
export function useConflictsTable({ token, sheetId }: UseConflictsTableProps) {
  const [conflicts, setConflicts] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [motivations, setMotivations] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const optinos = {
    oauth_token: token,
    spreadsheetId: sheetId,
  };
  const loadData = useCallbackVoid(async () => {
    try {
      setIsLoading(true);
      if (!window.gapi.client.sheets) {
        await window.gapi.client.load("sheets", "v4");
        if (!window.gapi.client.sheets) {
          throw new Error("Google Sheets API not loaded");
        }
      }

      const response = await window.gapi.client.sheets.spreadsheets.values.get({
        ...optinos,
        range: "Sheet1!A1:Z1000",
      });

      const values = response.result.values;
      if (!values) {
        throw new Error("No data found in sheet");
      }

      const sheetRoles = values[0].slice(1);
      const sheetConflicts: string[] = [];
      const sheetMotivations: Record<string, string> = {};

      for (let i = 1; i < values.length; i++) {
        const row = values[i];
        if (row[0]) {
          sheetConflicts.push(row[0]);
          for (let j = 1; j < row.length; j++) {
            if (row[j]) {
              sheetMotivations[`${row[0]}-${sheetRoles[j - 1]}`] = row[j];
            }
          }
        }
      }

      setRoles(sheetRoles);
      setConflicts(sheetConflicts);
      setMotivations(sheetMotivations);
      setError(null);
    } catch (error) {
      console.error("Error loading sheet data:", error);
      setError("Failed to load data from Google Sheet");
    } finally {
      setIsLoading(false);
    }
  }, [sheetId]);

  const updateFullSheet = useCallbackVoid(async () => {
    try {
      const values = [
        ["Conflicts / Roles", ...roles],
        ...conflicts.map((conflict) => [
          conflict,
          ...roles.map((role) => motivations[`${conflict}-${role}`] || ""),
        ]),
      ];

      await window.gapi.client.sheets.spreadsheets.values.update({
        ...optinos,
        range: "Sheet1!A1:Z1000",
        valueInputOption: "RAW",
        resource: { values },
      });

      setError(null);
    } catch (error) {
      console.error("Error updating sheet:", error);
      setError("Failed to update sheet");
      throw error;
    }
  }, [sheetId, conflicts, roles, motivations]);

  const addConflict = useCallbackVoid(
    async (newConflict: string) => {
      try {
        const values = [[newConflict, ...roles.map(() => "")]];
        const range = `Sheet1!A${conflicts.length + 2}`;

        await window.gapi.client.sheets.spreadsheets.values.update({
          ...optinos,
          range,
          valueInputOption: "RAW",
          resource: { values },
        });

        setConflicts((prev) => [...prev, newConflict]);
        setError(null);
      } catch (error) {
        console.error("Error adding conflict:", error);
        setError("Failed to add conflict");
        throw error;
      }
    },
    [sheetId, conflicts.length, roles]
  );

  const addRole = useCallbackVoid(
    async (newRole: string) => {
      try {
        const values = [[newRole], ...conflicts.map(() => [""])];
        const range = `Sheet1!${String.fromCharCode(65 + roles.length)}1`;

        await window.gapi.client.sheets.spreadsheets.values.update({
          ...optinos,
          range,
          valueInputOption: "RAW",
          resource: { values },
        });

        setRoles((prev) => [...prev, newRole]);
        setError(null);
      } catch (error) {
        console.error("Error adding role:", error);
        setError("Failed to add role");
        throw error;
      }
    },
    [sheetId, conflicts, roles.length]
  );

  const removeConflict = useCallbackVoid(
    async (index: number) => {
      try {
        const newConflicts = conflicts.filter((_, i) => i !== index);
        const newMotivations = { ...motivations };

        Object.keys(newMotivations).forEach((key) => {
          const [conflict] = key.split("-");
          if (conflicts[index] === conflict) {
            delete newMotivations[key];
          }
        });

        setConflicts(newConflicts);
        setMotivations(newMotivations);
        await updateFullSheet();
      } catch (error) {
        console.error("Error removing conflict:", error);
        setError("Failed to remove conflict");
        throw error;
      }
    },
    [conflicts, motivations, updateFullSheet]
  );

  const removeRole = useCallbackVoid(
    async (index: number) => {
      try {
        const newRoles = roles.filter((_, i) => i !== index);
        const newMotivations = { ...motivations };

        Object.keys(newMotivations).forEach((key) => {
          const [_, role] = key.split("-");
          if (roles[index] === role) {
            delete newMotivations[key];
          }
        });

        setRoles(newRoles);
        setMotivations(newMotivations);
        await updateFullSheet();
      } catch (error) {
        console.error("Error removing role:", error);
        setError("Failed to remove role");
        throw error;
      }
    },
    [roles, motivations, updateFullSheet]
  );

  const updateMotivation = useCallbackVoid(
    async (rowIndex: number, colIndex: number, value: string | null) => {
      value = value?.trim() || "";

      try {
        const conflict = conflicts[rowIndex];
        const role = roles[colIndex];
        if (!conflict || !role) {
          throw new Error("Invalid row or column index");
        }

        const range = `Sheet1!${String.fromCharCode(65 + colIndex + 1)}${
          rowIndex + 2
        }`;

        await window.gapi.client.sheets.spreadsheets.values.update({
          ...optinos,
          range,
          valueInputOption: "RAW",
          resource: { values: [[value]] },
        });

        setMotivations((prev) => ({
          ...prev,
          [`${conflict}-${role}`]: value,
        }));
        setError(null);
      } catch (error) {
        console.error("Error updating motivation:", error);
        setError("Failed to update motivation");
        throw error;
      }
    },
    [sheetId, roles, conflicts]
  );

  const updateConflictName = useCallbackVoid(
    async (index: number, newName: string | null) => {
      newName = newName?.trim() || "";
      try {
        const oldName = conflicts[index];
        if (!oldName) {
          throw new Error("Invalid conflict index");
        }

        const newMotivations = { ...motivations };

        Object.entries(motivations).forEach(([key, value]) => {
          const [conflict, role] = key.split("-");
          if (conflict === oldName) {
            delete newMotivations[key];
            newMotivations[`${newName}-${role}`] = value;
          }
        });

        setConflicts((prev) => prev.map((c, i) => (i === index ? newName : c)));
        setMotivations(newMotivations);
        await updateFullSheet();
      } catch (error) {
        console.error("Error updating conflict name:", error);
        setError("Failed to update conflict name");
        throw error;
      }
    },
    [motivations, updateFullSheet, conflicts]
  );

  const updateRoleName = useCallbackVoid(
    async (index: number, newName: string | null) => {
      newName = newName?.trim() || "";
      try {
        const oldName = roles[index];
        if (!oldName) {
          throw new Error("Invalid role index");
        }

        const newMotivations = { ...motivations };

        Object.entries(motivations).forEach(([key, value]) => {
          const [conflict, role] = key.split("-");
          if (role === oldName) {
            delete newMotivations[key];
            newMotivations[`${conflict}-${newName}`] = value;
          }
        });

        setRoles((prev) => prev.map((r, i) => (i === index ? newName : r)));
        setMotivations(newMotivations);
        await updateFullSheet();
      } catch (error) {
        console.error("Error updating role name:", error);
        setError("Failed to update role name");
        throw error;
      }
    },
    [motivations, updateFullSheet, roles]
  );

  return {
    conflicts,
    roles,
    motivations,
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
