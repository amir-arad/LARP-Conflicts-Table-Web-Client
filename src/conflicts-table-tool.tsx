import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter, Link, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect } from "react";

import { useConflictsTable } from "@/hooks/useConflictsTable";
import { useFlags } from "./hooks/useFlags";

type ConflictsTableToolProps = {
  token: string;
  sheetId: string;
};

const ConflictsTableTool = ({ token, sheetId }: ConflictsTableToolProps) => {
  const [roleFilters, toggleRoleFilter] = useFlags({
    namespace: `${sheetId}-roleFilters`,
  });

  const [conflictFilters, toggleConflictFilter] = useFlags({
    namespace: `${sheetId}-conflictFilters`,
  });

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

  const filteredRoles = roles.filter(
    (role) => roleFilters.length === 0 || roleFilters.includes(role.cellRef)
  );

  const filteredConflicts = conflicts.filter(
    (conflict) =>
      conflictFilters.length === 0 || conflictFilters.includes(conflict.cellRef)
  );
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
          <div className="mb-4">
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Filter size={16} /> Role Filters
                </h3>
                <div className="flex flex-wrap gap-2">
                  {roles.map((role) => (
                    <button
                      key={role.cellRef}
                      onClick={() => toggleRoleFilter(role.cellRef)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        roleFilters.includes(role.cellRef)
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {role.value}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Filter size={16} /> Conflict Filters
                </h3>
                <div className="flex flex-wrap gap-2">
                  {conflicts.map((conflict) => (
                    <button
                      key={conflict.cellRef}
                      onClick={() => toggleConflictFilter(conflict.cellRef)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        conflictFilters.includes(conflict.cellRef)
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {conflict.value}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr>
                  <th className="border border-gray-300 p-2 bg-gray-100">
                    Conflicts / Roles
                  </th>
                  {filteredRoles.map((role) => (
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
                {filteredConflicts.map((conflict) => (
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
                    {filteredRoles.map((role) => {
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
