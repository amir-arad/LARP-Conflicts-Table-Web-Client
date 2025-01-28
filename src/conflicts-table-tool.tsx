import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Link, Plus, Save, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";

const SHEET_URL = "YOUR_GOOGLE_SHEET_URL";

const ConflictsTableTool = () => {
  const [conflicts, setConflicts] = useState(["Loading..."]);
  const [roles, setRoles] = useState(["Loading..."]);
  const [motivations, setMotivations] = useState({});
  const [sheetConnected, setSheetConnected] = useState(false);

  // Initialize Google Sheets connection
  useEffect(() => {
    const initGoogleSheets = async () => {
      try {
        // Here you would load the Google Sheets API client
        // and authenticate the user
        setSheetConnected(true);
        await loadDataFromSheet();
      } catch (error) {
        console.error("Failed to connect to Google Sheets:", error);
      }
    };

    initGoogleSheets();
  }, []);

  // Load data from sheet
  const loadDataFromSheet = async () => {
    try {
      // Here you would fetch data from your Google Sheet
      // Format: Each conflict is a row, each role is a column
      const demoData = {
        conflicts: ["Political Power Struggle", "Resource Distribution"],
        roles: ["Noble Houses", "Merchants", "Common Folk"],
        motivations: {
          "Political Power Struggle-Noble Houses":
            "Maintain traditional authority",
          "Political Power Struggle-Merchants": "Gain political representation",
          "Political Power Struggle-Common Folk": "Fight for basic rights",
          "Resource Distribution-Noble Houses": "Control trade routes",
          "Resource Distribution-Merchants": "Expand market access",
          "Resource Distribution-Common Folk": "Secure fair food prices",
        },
      };

      setConflicts(demoData.conflicts);
      setRoles(demoData.roles);
      setMotivations(demoData.motivations);
    } catch (error) {
      console.error("Failed to load data from sheet:", error);
    }
  };

  // Update sheet when data changes
  const updateSheet = async (newData) => {
    try {
      // Here you would update the Google Sheet with the new data
      console.log("Updating sheet with:", newData);
    } catch (error) {
      console.error("Failed to update sheet:", error);
    }
  };

  const addConflict = async () => {
    const newConflicts = [...conflicts, `New Conflict ${conflicts.length + 1}`];
    setConflicts(newConflicts);
    await updateSheet({ type: "conflicts", data: newConflicts });
  };

  const addRole = async () => {
    const newRoles = [...roles, `New Role ${roles.length + 1}`];
    setRoles(newRoles);
    await updateSheet({ type: "roles", data: newRoles });
  };

  const removeConflict = async (index) => {
    const newConflicts = conflicts.filter((_, i) => i !== index);
    setConflicts(newConflicts);

    // Clean up associated motivations
    const newMotivations = {};
    Object.keys(motivations).forEach((key) => {
      const [conflict] = key.split("-");
      if (conflicts[index] !== conflict) {
        newMotivations[key] = motivations[key];
      }
    });
    setMotivations(newMotivations);

    await updateSheet({
      type: "conflictRemoval",
      data: { conflicts: newConflicts, motivations: newMotivations },
    });
  };

  const removeRole = async (index) => {
    const newRoles = roles.filter((_, i) => i !== index);
    setRoles(newRoles);

    // Clean up associated motivations
    const newMotivations = {};
    Object.keys(motivations).forEach((key) => {
      const [conflict, role] = key.split("-");
      if (roles[index] !== role) {
        newMotivations[key] = motivations[key];
      }
    });
    setMotivations(newMotivations);

    await updateSheet({
      type: "roleRemoval",
      data: { roles: newRoles, motivations: newMotivations },
    });
  };

  const updateMotivation = async (conflict, role, value) => {
    const newMotivations = {
      ...motivations,
      [`${conflict}-${role}`]: value,
    };
    setMotivations(newMotivations);
    await updateSheet({
      type: "motivation",
      data: { conflict, role, value, allMotivations: newMotivations },
    });
  };

  return (
    <div className="p-4 max-w-full overflow-x-auto">
      <Card className="mb-4">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>LARP Conflicts Table Tool</CardTitle>
            <div className="flex items-center gap-2">
              <span
                className={`inline-block w-2 h-2 rounded-full ${
                  sheetConnected ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span className="text-sm">
                {sheetConnected ? "Connected to Sheet" : "Disconnected"}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
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
            <a
              href={SHEET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              <Link size={16} /> Open in Google Sheets
            </a>
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
                            newRoles[index] = e.target.textContent;
                            setRoles(newRoles);
                            await updateSheet({
                              type: "roleUpdate",
                              data: { index, value: e.target.textContent },
                            });
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
                            newConflicts[rowIndex] = e.target.textContent;
                            setConflicts(newConflicts);
                            await updateSheet({
                              type: "conflictUpdate",
                              data: {
                                index: rowIndex,
                                value: e.target.textContent,
                              },
                            });
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
