import { beforeEach, describe, expect, it } from "vitest";
import { ConflictsTableTestDriver } from "./conflictsTableTestDriver";
import { ROLES_CONFLICT_SHEET_ID } from "../config";
import { waitFor } from "@testing-library/react";

describe("useConflictsTable", () => {
  let driver: ConflictsTableTestDriver;
  const defaultTestData = [
    ["", "Role 1", "Role 2", "Role 3"],
    ["Conflict 1", "M1-1", "M1-2", "M1-3"],
    ["Conflict 2", "M2-1", "M2-2", "M2-3"],
    ["Conflict 3", "M3-1", "M3-2", "M3-3"],
  ];

  beforeEach(() => {
    driver = new ConflictsTableTestDriver();
  });

  describe("Loading and Display", () => {
    it("should load initial data and correctly parse conflicts and roles", async () => {
      await driver.setTestData(defaultTestData);

      await driver.waitForState({
        conflicts: ["Conflict 1", "Conflict 2", "Conflict 3"],
        roles: ["Role 1", "Role 2", "Role 3"],
        motivations: {
          B2: "M1-1",
          C2: "M1-2",
          D2: "M1-3",
          B3: "M2-1",
          C3: "M2-2",
          D3: "M2-3",
          B4: "M3-1",
          C4: "M3-2",
          D4: "M3-3",
        },
      });

      await driver.expectApiCall("get", `${ROLES_CONFLICT_SHEET_ID}!A1:Z1000`);
    });

    it("should show loading state during data fetch", async () => {
      const apiResult = Promise.withResolvers<string[][]>();

      driver.setTestData(apiResult.promise, false);

      driver.loadData();
      await waitFor(() => expect(driver.isLoading()).toBeTruthy());
      apiResult.resolve([[]]);
      await waitFor(() => expect(driver.isLoading()).toBeFalsy());
    });

    it("should handle API errors gracefully", async () => {
      // Your test code here
      await driver.setTestData(Promise.reject(new Error("API Error")), false);

      driver.loadData();
      await waitFor(() => expect(driver.getError()).toMatch("API Error"));
    });
  });

  describe("Add/Remove Operations", () => {
    beforeEach(async () => {
      await driver.setTestData(defaultTestData);
    });

    it("should add a new conflict at the bottom of conflicts list", async () => {
      driver.addConflict("New Conflict");
      await driver.waitForState({
        conflicts: ["Conflict 1", "Conflict 2", "Conflict 3", "New Conflict"],
      });

      await driver.expectApiCall("update", `${ROLES_CONFLICT_SHEET_ID}!A5:D5`, [
        ["New Conflict", "", "", ""],
      ]);
    });

    it("should add a new role at the right end of roles list", async () => {
      driver.addRole("New Role");

      await driver.waitForState({
        roles: ["Role 1", "Role 2", "Role 3", "New Role"],
      });

      await driver.expectApiCall("update", `${ROLES_CONFLICT_SHEET_ID}!E1:E4`, [
        ["New Role"],
        [""],
        [""],
        [""],
      ]);
    });

    it("should remove a conflict and its motivations", async () => {
      driver.removeConflict("A2"); // Removing "Conflict 1"

      await driver.waitForState({
        conflicts: ["Conflict 2", "Conflict 3"],
      });

      await driver.expectApiCall("clear", `${ROLES_CONFLICT_SHEET_ID}!A2:D2`);
    });

    it("should remove a role and its motivations from all conflicts", async () => {
      driver.removeRole("B1"); // Removing "Role 1"

      await driver.waitForState({
        roles: ["Role 2", "Role 3"],
      });

      await driver.expectApiCall("clear", `${ROLES_CONFLICT_SHEET_ID}!B1:B4`);
    });
  });

  describe("Update Operations", () => {
    beforeEach(async () => {
      await driver.setTestData(defaultTestData);
    });

    it("should update conflict name", async () => {
      driver.updateConflictName("A2", "Updated Conflict");

      await driver.waitForState({
        conflicts: ["Updated Conflict", "Conflict 2", "Conflict 3"],
      });

      await driver.expectApiCall("update", `${ROLES_CONFLICT_SHEET_ID}!A2`, [["Updated Conflict"]]);
    });

    it("should update role name", async () => {
      driver.updateRoleName("B1", "Updated Role");

      await driver.waitForState({
        roles: ["Updated Role", "Role 2", "Role 3"],
      });

      await driver.expectApiCall("update", `${ROLES_CONFLICT_SHEET_ID}!B1`, [["Updated Role"]]);
    });

    it("should update motivation for a specific conflict-role pair", async () => {
      driver.updateMotivation("A2", "B1", "Updated Motivation");

      await driver.waitForState({
        motivations: {
          B2: "Updated Motivation",
          C2: "M1-2",
          D2: "M1-3",
          B3: "M2-1",
          C3: "M2-2",
          D3: "M2-3",
          B4: "M3-1",
          C4: "M3-2",
          D4: "M3-3",
        },
      });

      await driver.expectApiCall("update", `${ROLES_CONFLICT_SHEET_ID}!B2`, [
        ["Updated Motivation"],
      ]);
    });
  });

  describe("API Cell Range Optimization", () => {
    beforeEach(async () => {
      await driver.setTestData(defaultTestData);
    });

    it("should only update affected cells when adding new items", async () => {
      driver.addConflict("New Conflict");
      await driver.expectApiCall("update", `${ROLES_CONFLICT_SHEET_ID}!A5:D5`, [
        ["New Conflict", "", "", ""],
      ]);
      driver.resetApiCalls();
      driver.addRole("New Role");
      await driver.expectApiCall("update", `${ROLES_CONFLICT_SHEET_ID}!E1:E5`, [
        ["New Role"],
        [""],
        [""],
        [""],
        [""],
      ]);
    });

    it("should only clear affected cells when removing items", async () => {
      driver.removeConflict("A2");
      await driver.expectApiCall("clear", `${ROLES_CONFLICT_SHEET_ID}!A2:D2`);

      driver.resetApiCalls();
      driver.removeRole("B1");
      await driver.expectApiCall("clear", `${ROLES_CONFLICT_SHEET_ID}!B1:B4`);
    });

    it("should only update single cell when updating names", async () => {
      driver.updateConflictName("A2", "Updated Conflict");
      await driver.expectApiCall("update", `${ROLES_CONFLICT_SHEET_ID}!A2`, [["Updated Conflict"]]);

      driver.resetApiCalls();
      driver.updateRoleName("B1", "Updated Role");
      await driver.expectApiCall("update", `${ROLES_CONFLICT_SHEET_ID}!B1`, [["Updated Role"]]);
    });

    it("should only update single cell when updating motivation", async () => {
      driver.updateMotivation("A2", "B1", "New Motivation");
      await driver.expectApiCall("update", `${ROLES_CONFLICT_SHEET_ID}!B2`, [["New Motivation"]]);
    });
  });
});
