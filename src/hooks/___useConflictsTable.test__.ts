// import { beforeEach, describe, expect, it, vi } from "vitest";

// import { ConflictsTableTestDriver } from "./conflictsTableTestDriver";
// import { waitFor } from "@testing-library/react";

// const mockSheetsApi = {
//   client: {
//     sheets: {
//       spreadsheets: {
//         values: {
//           get: vi.fn(),
//           update: vi.fn(),
//         },
//       },
//     },
//     load: vi.fn(),
//   },
// };

// describe("useConflictsTable", () => {
//   let driver: ConflictsTableTestDriver;

//   beforeEach(() => {
//     (window as any).gapi = mockSheetsApi;
//     vi.clearAllMocks();
//     driver = new ConflictsTableTestDriver();
//   });

//   describe("basic functionality", () => {
//     it("should initialize with empty state", () => {
//       driver.waitForState({
//         conflicts: [],
//         roles: [],
//         motivations: {},
//       });
//       expect(driver.getError()).toBeNull();
//       expect(driver.isLoading()).toBeFalsy();
//     });

//     it("should report `isLoading` correctly", async () => {
//       const getResult = Promise.withResolvers();
//       const mockSheetData = {
//         result: {
//           values: [
//             ["Conflicts / Roles", "Role1"],
//             ["Conflict1", "Mot1-1"],
//           ],
//         },
//       };

//       mockSheetsApi.client.sheets.spreadsheets.values.get.mockResolvedValueOnce(
//         getResult.promise
//       );

//       driver.loadData();
//       await waitFor(() => expect(driver.isLoading()).toBeTruthy());
//       getResult.resolve(mockSheetData);
//       await waitFor(() => expect(driver.isLoading()).toBeFalsy());
//     });

//     it("should load data successfully", async () => {
//       await driver.setTestData([
//         ["", "Role1", "Role2"],
//         ["Conflict1", "Mot1-1", "Mot1-2"],
//         ["Conflict2", "Mot2-1", "Mot2-2"],
//       ]);

//       await driver.waitForState({
//         conflicts: ["Conflict1", "Conflict2"],
//         roles: ["Role1", "Role2"],
//         motivations: {
//           A2: "Mot1-2",
//           A3: "Mot2-2",
//         },
//       });
//       expect(driver.getError()).toBeNull();
//     });

//     it("should handle load data error", async () => {
//       mockSheetsApi.client.sheets.spreadsheets.values.get.mockRejectedValueOnce(
//         new Error("API Error")
//       );

//       driver.loadData();
//       await waitFor(() =>
//         expect(driver.getError()).toBe("Failed to load data from Google Sheet")
//       );
//     });

//     it("should add a new conflict", async () => {
//       mockSheetsApi.client.sheets.spreadsheets.values.update.mockResolvedValueOnce(
//         {}
//       );

//       driver.addConflict("NewConflict");

//       await driver.waitForState({
//         conflicts: ["NewConflict"],
//       });
//       driver.expectApiCall("update", "Sheet1!A2", [["NewConflict", ""]]);
//     });

//     it("should add a new role", async () => {
//       mockSheetsApi.client.sheets.spreadsheets.values.update.mockResolvedValueOnce(
//         {}
//       );

//       driver.addRole("NewRole");

//       await driver.waitForState({
//         roles: ["NewRole"],
//       });
//       driver.expectApiCall("update", "Sheet1!B1:B2", [["NewRole"], [""]]);
//     });

//     it("should update motivation", async () => {
//       await driver.setTestData([
//         ["", "Role1"],
//         ["Conflict1", ""],
//       ]);

//       driver.updateMotivation(0, 0, "New Motivation");

//       await driver.waitForState({
//         motivations: {
//           B2: "New Motivation",
//         },
//       });
//       driver.expectApiCall("update", "Sheet1!B2", [["New Motivation"]]);
//     });

//     it("should remove a conflict", async () => {
//       await driver.setTestData([
//         ["", "Role1"],
//         ["Conflict1", "Mot1"],
//       ]);

//       driver.removeConflict(0);

//       await driver.waitForState({
//         conflicts: ["Conflict2"],
//         motivations: {},
//       });
//       driver.expectApiCall("update", "Sheet1!A2:B2", [["Conflict2", ""]]);
//     });

//     it("should remove a role", async () => {
//       await driver.setTestData([
//         ["", "Role1", "Role2"],
//         ["Conflict1", "Mot1", ""],
//       ]);

//       driver.removeRole(0);

//       await driver.waitForState({
//         roles: ["Role2"],
//         motivations: {},
//       });
//       driver.expectApiCall("update", "Sheet1!B1:B2", [["Role2"], [""]]);
//     });

//     it("should update conflict name", async () => {
//       await driver.setTestData([
//         ["", "Role1"],
//         ["OldConflict", "Mot1"],
//       ]);

//       driver.updateConflictName(0, "NewConflict");

//       await driver.waitForState({
//         conflicts: ["NewConflict"],
//         motivations: {
//           "NewConflict-Role1": "Mot1",
//         },
//       });
//       driver.expectApiCall("update", "Sheet1!A2", [["NewConflict"]]);
//     });

//     it("should update role name", async () => {
//       await driver.setTestData([
//         ["", "Role1"],
//         ["Conflict1", "Mot1"],
//       ]);

//       driver.updateRoleName(0, "NewRole");

//       await driver.waitForState({
//         roles: ["NewRole"],
//         motivations: {
//           "Conflict1-NewRole": "Mot1",
//         },
//       });
//       driver.expectApiCall("update", "Sheet1!B1", [["NewRole"]]);
//     });
//   });
// });
