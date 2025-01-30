declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: any) => void;
          }) => void;
          revoke: (token: string, callback: () => void) => void;
        };
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: any) => void;
          }) => any;
        };
      };
    };
  }
}

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, Plus, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";

const ConflictsTableTool = ({ token }: { token: string | undefined }) => {
  const [conflicts, setConflicts] = useState(["Loading..."]);
  const [roles, setRoles] = useState(["Loading..."]);
  const [motivations, setMotivations] = useState({});
  const [error, setError] = useState(null);
  useEffect(() => {
    loadDataFromSheet();
  }, [token]);

  async function loadDataFromSheet() {
    try {
      if (!window.gapi.client.sheets) {
        await window.gapi.client.load("sheets", "v4");
        if (!window.gapi.client.sheets) {
          throw new Error("Google Sheets API not loaded");
        }
      }
      const response = await window.gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
        range: "Sheet1!A1:Z1000",
      });

      const values = response.result.values;
      if (!values) {
        throw new Error("No data found in sheet");
      }

      // Extract roles from first row (excluding first cell)
      const sheetRoles = values[0].slice(1);
      setRoles(sheetRoles);

      // Extract conflicts and motivations
      const sheetConflicts = [];
      const sheetMotivations = {};

      for (let i = 1; i < values.length; i++) {
        const row = values[i];
        if (row[0]) {
          // If there's a conflict name
          sheetConflicts.push(row[0]);
          // Add motivations for each role
          for (let j = 1; j < row.length; j++) {
            if (row[j]) {
              sheetMotivations[`${row[0]}-${sheetRoles[j - 1]}`] = row[j];
            }
          }
        }
      }

      setConflicts(sheetConflicts);
      setMotivations(sheetMotivations);
      setError(null);
    } catch (error) {
      console.error("Error loading sheet data:", error);
      setError("Failed to load data from Google Sheet");
    }
  }

  const updateSheet = async (action) => {
    try {
      let values;
      let range;

      switch (action.type) {
        case "full":
          // Update entire sheet
          values = [
            ["Conflicts / Roles", ...roles],
            ...conflicts.map((conflict) => [
              conflict,
              ...roles.map((role) => motivations[`${conflict}-${role}`] || ""),
            ]),
          ];
          range = "Sheet1!A1:Z1000";
          break;

        case "conflict":
          // Add new row for conflict
          values = [[action.data, ...roles.map((role) => "")]];
          range = `Sheet1!A${conflicts.length + 2}`;
          break;

        case "role":
          // Add new column for role
          values = [[action.data], ...conflicts.map((conflict) => [""])];
          range = `Sheet1!${String.fromCharCode(65 + roles.length)}1`;
          break;

        case "motivation":
          // Update single cell
          values = [[action.data.value]];
          const colIndex = roles.indexOf(action.data.role) + 1;
          const rowIndex = conflicts.indexOf(action.data.conflict) + 2;
          range = `Sheet1!${String.fromCharCode(65 + colIndex)}${rowIndex}`;
          break;
      }

      await window.gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
        range,
        valueInputOption: "RAW",
        resource: { values },
      });

      setError(null);
    } catch (error) {
      console.error("Error updating sheet:", error);
      setError("Failed to update Google Sheet");
    }
  };

  const addConflict = async () => {
    const newConflict = `New Conflict ${conflicts.length + 1}`;
    setConflicts([...conflicts, newConflict]);
    await updateSheet({ type: "conflict", data: newConflict });
  };

  const addRole = async () => {
    const newRole = `New Role ${roles.length + 1}`;
    setRoles([...roles, newRole]);
    await updateSheet({ type: "role", data: newRole });
  };

  const removeConflict = async (index) => {
    // For Google Sheets, we'll rewrite the entire sheet after removal
    const newConflicts = conflicts.filter((_, i) => i !== index);
    const newMotivations = {};
    Object.keys(motivations).forEach((key) => {
      const [conflict] = key.split("-");
      if (conflicts[index] !== conflict) {
        newMotivations[key] = motivations[key];
      }
    });

    setConflicts(newConflicts);
    setMotivations(newMotivations);
    await updateSheet({ type: "full" });
  };

  const removeRole = async (index) => {
    // For Google Sheets, we'll rewrite the entire sheet after removal
    const newRoles = roles.filter((_, i) => i !== index);
    const newMotivations = {};
    Object.keys(motivations).forEach((key) => {
      const [conflict, role] = key.split("-");
      if (roles[index] !== role) {
        newMotivations[key] = motivations[key];
      }
    });

    setRoles(newRoles);
    setMotivations(newMotivations);
    await updateSheet({ type: "full" });
  };

  const updateMotivation = async (conflict, role, value) => {
    const newMotivations = {
      ...motivations,
      [`${conflict}-${role}`]: value,
    };
    setMotivations(newMotivations);
    await updateSheet({
      type: "motivation",
      data: { conflict, role, value },
    });
  };

  return (
    <div className="p-4 max-w-full overflow-x-auto">
      <Card className="mb-4">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>LARP Conflicts Table Tool</CardTitle>
            <div className="flex items-center gap-4">
              <a
                href={`https://docs.google.com/spreadsheets/d/${process.env.GOOGLE_SPREADSHEET_ID}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
              >
                <Link size={16} /> Open in Google Sheets
              </a>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4" variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Alert className="mb-4">
            <AlertDescription>
              All changes are automatically saved to the shared Google Sheet.
              Multiple people can edit simultaneously.
            </AlertDescription>
          </Alert>

          <div className="flex gap-4 mb-4">
            <button
              onClick={addConflict}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              <Plus size={16} /> Add Conflict
            </button>
            <button
              onClick={addRole}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              <Plus size={16} /> Add Role
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr>
                  <th className="border border-gray-300 p-2 bg-gray-100">
                    Conflicts / Roles
                  </th>
                  {roles.map((role, index) => (
                    <th
                      key={index}
                      className="border border-gray-300 p-2 bg-gray-100"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={async (e) => {
                            const newRoles = [...roles];
                            const oldRole = newRoles[index];
                            newRoles[index] = e.target.textContent;
                            setRoles(newRoles);

                            // Update motivations with new role name
                            const newMotivations = {};
                            Object.entries(motivations).forEach(
                              ([key, value]) => {
                                const [conflict, role] = key.split("-");
                                if (role === oldRole) {
                                  newMotivations[
                                    `${conflict}-${e.target.textContent}`
                                  ] = value;
                                } else {
                                  newMotivations[key] = value;
                                }
                              }
                            );
                            setMotivations(newMotivations);

                            await updateSheet({ type: "full" });
                          }}
                          className="flex-1"
                        >
                          {role}
                        </span>
                        <button
                          onClick={() => removeRole(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {conflicts.map((conflict, rowIndex) => (
                  <tr key={rowIndex}>
                    <td className="border border-gray-300 p-2 bg-gray-50">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={async (e) => {
                            const newConflicts = [...conflicts];
                            const oldConflict = newConflicts[rowIndex];
                            newConflicts[rowIndex] = e.target.textContent;
                            setConflicts(newConflicts);

                            // Update motivations with new conflict name
                            const newMotivations = {};
                            Object.entries(motivations).forEach(
                              ([key, value]) => {
                                const [conflict, role] = key.split("-");
                                if (conflict === oldConflict) {
                                  newMotivations[
                                    `${e.target.textContent}-${role}`
                                  ] = value;
                                } else {
                                  newMotivations[key] = value;
                                }
                              }
                            );
                            setMotivations(newMotivations);

                            await updateSheet({ type: "full" });
                          }}
                          className="flex-1"
                        >
                          {conflict}
                        </span>
                        <button
                          onClick={() => removeConflict(rowIndex)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                    {roles.map((role, colIndex) => (
                      <td key={colIndex} className="border border-gray-300 p-2">
                        <div
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) =>
                            updateMotivation(
                              conflict,
                              role,
                              e.target.textContent
                            )
                          }
                          className="min-h-8 focus:outline-none focus:bg-blue-50"
                        >
                          {motivations[`${conflict}-${role}`] || ""}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConflictsTableTool;
