import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

import { useConflictsTable } from "./useConflictsTable";

// Mock window.gapi
const mockSheetsApi = {
  client: {
    sheets: {
      spreadsheets: {
        values: {
          get: vi.fn(),
          update: vi.fn(),
        },
      },
    },
    load: vi.fn(),
  },
};

describe("useConflictsTable", () => {
  beforeEach(() => {
    (window as any).gapi = mockSheetsApi;
    vi.clearAllMocks();
  });

  const defaultProps = {
    sheetId: "test-sheet-id",
    token: "test-token",
  };

  it("should initialize with empty state", () => {
    const { result } = renderHook(() => useConflictsTable(defaultProps));

    expect(result.current.conflicts).toEqual([]);
    expect(result.current.roles).toEqual([]);
    expect(result.current.motivations).toEqual({});
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBeFalsy();
  });

  it("should report `isLoading` correctly", async () => {
    const getResult = Promise.withResolvers();
    const mockSheetData = {
      result: {
        values: [
          ["Conflicts / Roles", "Role1", "Role2"],
          ["Conflict1", "Mot1-1", "Mot1-2"],
          ["Conflict2", "Mot2-1", "Mot2-2"],
        ],
      },
    };

    mockSheetsApi.client.sheets.spreadsheets.values.get.mockResolvedValueOnce(
      getResult.promise
    );

    const { result } = renderHook(() => useConflictsTable(defaultProps));

    result.current.loadData();
    await waitFor(() => {
      expect(result.current.isLoading).toBeTruthy();
    });
    getResult.resolve(mockSheetData);
    await waitFor(() => {
      expect(result.current.isLoading).toBeFalsy();
    });
  });

  it("should load data successfully", async () => {
    const mockSheetData = {
      result: {
        values: [
          ["Conflicts / Roles", "Role1", "Role2"],
          ["Conflict1", "Mot1-1", "Mot1-2"],
          ["Conflict2", "Mot2-1", "Mot2-2"],
        ],
      },
    };

    mockSheetsApi.client.sheets.spreadsheets.values.get.mockResolvedValueOnce(
      mockSheetData
    );

    const { result } = renderHook(() => useConflictsTable(defaultProps));

    result.current.loadData();
    await waitFor(() => {
      expect(result.current.roles).toEqual(["Role1", "Role2"]);
      expect(result.current.conflicts).toEqual(["Conflict1", "Conflict2"]);
      expect(result.current.motivations).toEqual({
        "Conflict1-Role1": "Mot1-1",
        "Conflict1-Role2": "Mot1-2",
        "Conflict2-Role1": "Mot2-1",
        "Conflict2-Role2": "Mot2-2",
      });
      expect(result.current.error).toBeNull();
    });
  });

  it("should handle load data error", async () => {
    mockSheetsApi.client.sheets.spreadsheets.values.get.mockRejectedValueOnce(
      new Error("API Error")
    );

    const { result } = renderHook(() => useConflictsTable(defaultProps));

    result.current.loadData();

    await waitFor(() => {
      expect(result.current.error).toBe(
        "Failed to load data from Google Sheet"
      );
    });
  });

  it("should add a new conflict", async () => {
    mockSheetsApi.client.sheets.spreadsheets.values.update.mockResolvedValueOnce(
      {}
    );

    const { result } = renderHook(() => useConflictsTable(defaultProps));

    result.current.addConflict("NewConflict");

    await waitFor(() => {
      expect(result.current.conflicts).toContain("NewConflict");
      expect(
        mockSheetsApi.client.sheets.spreadsheets.values.update
      ).toHaveBeenCalled();
    });
  });

  it("should add a new role", async () => {
    mockSheetsApi.client.sheets.spreadsheets.values.update.mockResolvedValueOnce(
      {}
    );

    const { result } = renderHook(() => useConflictsTable(defaultProps));

    result.current.addRole("NewRole");

    await waitFor(() => {
      expect(result.current.roles).toContain("NewRole");
      expect(
        mockSheetsApi.client.sheets.spreadsheets.values.update
      ).toHaveBeenCalled();
    });
  });

  it("should update motivation", async () => {
    const { result } = renderHook(() => useConflictsTable(defaultProps));

    // Set some initial state manually
    result.current.conflicts.push("Conflict1");
    result.current.roles.push("Role1");

    mockSheetsApi.client.sheets.spreadsheets.values.update.mockResolvedValueOnce(
      {}
    );

    result.current.updateMotivation(0, 0, "New Motivation");

    await waitFor(() => {
      expect(result.current.motivations["Conflict1-Role1"]).toBe(
        "New Motivation"
      );
      expect(
        mockSheetsApi.client.sheets.spreadsheets.values.update
      ).toHaveBeenCalled();
    });
  });

  it("should remove a conflict", async () => {
    mockSheetsApi.client.sheets.spreadsheets.values.update.mockResolvedValueOnce(
      {}
    );

    const { result } = renderHook(() => useConflictsTable(defaultProps));

    // Set initial state
    result.current.conflicts.push("Conflict1", "Conflict2");
    result.current.motivations["Conflict1-Role1"] = "Mot1";

    result.current.removeConflict(0);

    await waitFor(() => {
      expect(result.current.conflicts).not.toContain("Conflict1");
      expect(result.current.motivations["Conflict1-Role1"]).toBeUndefined();
      expect(
        mockSheetsApi.client.sheets.spreadsheets.values.update
      ).toHaveBeenCalled();
    });
  });

  it("should remove a role", async () => {
    mockSheetsApi.client.sheets.spreadsheets.values.update.mockResolvedValueOnce(
      {}
    );

    const { result } = renderHook(() => useConflictsTable(defaultProps));

    // Set initial state
    result.current.roles.push("Role1", "Role2");
    result.current.motivations["Conflict1-Role1"] = "Mot1";

    result.current.removeRole(0);

    await waitFor(() => {
      expect(result.current.roles).not.toContain("Role1");
      expect(result.current.motivations["Conflict1-Role1"]).toBeUndefined();
      expect(
        mockSheetsApi.client.sheets.spreadsheets.values.update
      ).toHaveBeenCalled();
    });
  });

  it("should update conflict name", async () => {
    mockSheetsApi.client.sheets.spreadsheets.values.update.mockResolvedValueOnce(
      {}
    );

    const { result } = renderHook(() => useConflictsTable(defaultProps));

    // Set initial state
    result.current.conflicts.push("OldConflict");
    result.current.roles.push("Role1");
    result.current.motivations["OldConflict-Role1"] = "Mot1";

    result.current.updateConflictName(0, "NewConflict");

    await waitFor(() => {
      expect(result.current.conflicts[0]).toBe("NewConflict");
      expect(result.current.motivations["OldConflict-Role1"]).toBeUndefined();
      expect(result.current.motivations["NewConflict-Role1"]).toBe("Mot1");
      expect(
        mockSheetsApi.client.sheets.spreadsheets.values.update
      ).toHaveBeenCalled();
    });
  });

  it("should update role name", async () => {
    mockSheetsApi.client.sheets.spreadsheets.values.update.mockResolvedValueOnce(
      {}
    );

    const { result } = renderHook(() => useConflictsTable(defaultProps));

    // Set initial state
    result.current.conflicts.push("Conflict1");
    result.current.roles.push("OldRole");
    result.current.motivations["Conflict1-OldRole"] = "Mot1";
    result.current.updateRoleName(0, "NewRole");

    await waitFor(() => {
      expect(result.current.roles[0]).toBe("NewRole");
      expect(result.current.motivations["Conflict1-OldRole"]).toBeUndefined();
      expect(result.current.motivations["Conflict1-NewRole"]).toBe("Mot1");
      expect(
        mockSheetsApi.client.sheets.spreadsheets.values.update
      ).toHaveBeenCalled();
    });
  });
});
