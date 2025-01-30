import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, Plus, Trash2 } from "lucide-react";
import React, { useEffect } from "react";

import { useConflictsTable } from "@/hooks/useConflictsTable";

type ConflictsTableToolProps = {
  apiKey: string;
  token: string;
  sheetId: string;
};

const ConflictsTableTool = ({ token, sheetId }: ConflictsTableToolProps) => {
  const {
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
    updateConflictName,
    updateRoleName,
  } = useConflictsTable({ sheetId, token });
  useEffect(() => {
    if (token && sheetId) {
      loadData();
    }
  }, [token, sheetId, loadData]);

  const handleAddConflict = async () => {
    const newConflict = `New Conflict ${conflicts.length + 1}`;
    await addConflict(newConflict);
  };

  const handleAddRole = async () => {
    const newRole = `New Role ${roles.length + 1}`;
    await addRole(newRole);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }
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
              onClick={handleAddConflict}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              <Plus size={16} /> Add Conflict
            </button>
            <button
              onClick={handleAddRole}
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
                          onBlur={(e) =>
                            updateRoleName(index, e.target.textContent)
                          }
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
                          onBlur={(e) =>
                            updateConflictName(rowIndex, e.target.textContent)
                          }
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
                              rowIndex,
                              colIndex,
                              e.target.textContent || ""
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
