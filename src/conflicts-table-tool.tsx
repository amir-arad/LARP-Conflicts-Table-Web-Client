import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect } from "react";

import { useConflictsTable } from "@/hooks/useConflictsTable";

type ConflictsTableToolProps = {
  token: string;
  sheetId: string;
};

const ConflictsTableTool = ({ token, sheetId }: ConflictsTableToolProps) => {
  const {
    conflicts,
    roles,
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
  } = useConflictsTable({ sheetId, token, gapi: window.gapi });

  useEffect(() => {
    if (token && sheetId) {
      loadData();
    }
  }, [token, sheetId, loadData]);

  const handleAddConflict = useCallback(
    () => addConflict(`New Conflict`),
    [addConflict]
  );

  const handleAddRole = useCallback(() => addRole(`New Role`), [addRole]);

  if (isLoading) {
    return <div>Loading Data...</div>;
  }

  return (
    <div className="p-4 max-w-full overflow-x-auto">
      <Card className="mb-4">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>LARP Conflicts Table Tool</CardTitle>
            <div className="flex items-center gap-4">
              <a
                href={`https://docs.google.com/spreadsheets/d/${sheetId}`}
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
                  {roles.map((role) => (
                    <th
                      key={role.cellRef}
                      className="border border-gray-300 p-2 bg-gray-100"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) =>
                            updateRoleName(role.cellRef, e.target.textContent)
                          }
                          className="flex-1"
                        >
                          {role.value}
                        </span>
                        <button
                          onClick={() => removeRole(role.cellRef)}
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
                {conflicts.map((conflict) => (
                  <tr key={conflict.cellRef}>
                    <td className="border border-gray-300 p-2 bg-gray-50">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) =>
                            updateConflictName(
                              conflict.cellRef,
                              e.target.textContent
                            )
                          }
                          className="flex-1"
                        >
                          {conflict.value}
                        </span>
                        <button
                          onClick={() => removeConflict(conflict.cellRef)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                    {roles.map((role) => {
                      const motivation = conflict.motivations[role.cellRef];
                      return (
                        <td
                          key={`${conflict.cellRef}-${role.cellRef}`}
                          className="border border-gray-300 p-2"
                        >
                          <div
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) =>
                              updateMotivation(
                                conflict.cellRef,
                                role.cellRef,
                                e.target.textContent
                              )
                            }
                            className="min-h-8 focus:outline-none focus:bg-blue-50"
                          >
                            {motivation?.value || ""}
                          </div>
                        </td>
                      );
                    })}
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
