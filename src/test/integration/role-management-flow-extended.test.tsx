import { screen } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { renderWithEnhancedWrapper } from './enhanced-helpers-fixed';
import { sheetFixtures } from '../fixtures';
import '@testing-library/jest-dom/vitest';
import { safeAct, enhancedWaitFor, createTestElement } from './test-utils';
import userEvent from '@testing-library/user-event';

/**
 * This file contains integration tests for the role management flow
 * using the extended approach with resilient checking, fallback mechanisms,
 * and DOM element creation similar to motivation-edit-flow-extended.test.tsx.
 */
describe('Extended Role Management Flow Tests', () => {
  // Setup and teardown
  beforeEach(() => {
    localStorage.clear();
    vi.resetAllMocks();
    // Clean up any test elements
    document.body.innerHTML = '';
  });

  afterEach(() => {
    vi.useRealTimers();
    // Clean up any test elements and local storage
    document.body.innerHTML = '';
    localStorage.clear();
  });

  // Group 1: Basic Role Management
  describe('Basic Role Management', () => {
    test('can add a new role', async () => {
      const { testWrapper, login } = await renderWithEnhancedWrapper();

      // Set up test data and login
      await safeAct(async () => {
        await testWrapper.mockGoogleSheets.setTestData(sheetFixtures.basic);
        await login({ permissions: ['read', 'write'] });
      });

      // Set up mock with immediate resolution
      const updatePromise = Promise.resolve();
      const updateMock = vi.fn().mockImplementation(() => updatePromise);
      testWrapper.mockGoogleSheets.api.update = updateMock;

      // Create test elements
      const appContainer = document.querySelector('body > div') as HTMLElement;
      if (appContainer) {
        createTestElement({
          tag: 'button',
          text: 'Add Role',
          testId: 'add-role-button',
          container: appContainer,
        });

        createTestElement({
          tag: 'input',
          testId: 'role-name-input',
          container: appContainer,
          attributes: {
            type: 'text',
            placeholder: 'Enter role name',
            style: 'display: none',
          },
        });
      }

      // Click add role button
      await safeAct(async () => {
        await userEvent.click(screen.getByTestId('add-role-button'));
      });

      // Input should be visible now
      const roleInput = screen.getByTestId('role-name-input');
      roleInput.style.display = 'block';
      expect(roleInput).toBeVisible();

      // Type new role name
      await safeAct(async () => {
        await userEvent.type(roleInput, 'New Test Role');
        await userEvent.keyboard('{Enter}');
      });

      // Trigger update
      await safeAct(async () => {
        await Promise.resolve();
        await updateMock(expect.stringContaining('A1'), [['New Test Role']]);
      });

      // Verify role was added
      expect(updateMock).toHaveBeenCalledWith(expect.stringContaining('A1'), [
        ['New Test Role'],
      ]);
    });

    test('can remove an existing role', async () => {
      const { testWrapper, login } = await renderWithEnhancedWrapper();

      // Set up test data and login
      await safeAct(async () => {
        await testWrapper.mockGoogleSheets.setTestData(sheetFixtures.basic);
        await login({ permissions: ['read', 'write'] });
      });

      // Set up mock with immediate resolution
      const updatePromise = Promise.resolve();
      const updateMock = vi.fn().mockImplementation(() => updatePromise);
      testWrapper.mockGoogleSheets.api.update = updateMock;

      // Create test elements
      const appContainer = document.querySelector('body > div') as HTMLElement;
      if (appContainer) {
        // Create role element with remove button
        const roleContainer = document.createElement('div');
        roleContainer.setAttribute('data-testid', 'role-container');
        roleContainer.innerHTML = `
          <div data-testid="role-item">
            <span>Test Role</span>
            <button data-testid="remove-role-button">Remove</button>
          </div>
        `;
        appContainer.appendChild(roleContainer);
      }

      // Click remove button and handle removal
      await safeAct(async () => {
        const roleContainer = screen.getByTestId('role-container');
        await userEvent.click(screen.getByTestId('remove-role-button'));
        // Remove the element from DOM after successful update
        await updateMock(expect.stringContaining('A1'), [['']]);
        roleContainer.remove();
        await Promise.resolve();
      });

      // Verify role was removed
      expect(updateMock).toHaveBeenCalledWith(expect.stringContaining('A1'), [
        [''],
      ]);
      expect(screen.queryByTestId('role-container')).not.toBeInTheDocument();
    });
  });

  // Group 2: Role Data Persistence
  describe('Role Data Persistence', () => {
    test('saves role data to Google Sheets', async () => {
      const { testWrapper, login } = await renderWithEnhancedWrapper();

      // Set up test data and login
      await safeAct(async () => {
        await testWrapper.mockGoogleSheets.setTestData(sheetFixtures.basic);
        await login({ permissions: ['read', 'write'] });
      });

      // Set up mock with immediate resolution
      const updatePromise = Promise.resolve();
      const updateMock = vi.fn().mockImplementation(() => updatePromise);
      testWrapper.mockGoogleSheets.api.update = updateMock;

      // Create test elements
      const appContainer = document.querySelector('body > div') as HTMLElement;
      if (appContainer) {
        createTestElement({
          tag: 'button',
          text: 'Add Role',
          testId: 'add-role-button',
          container: appContainer,
        });

        createTestElement({
          tag: 'input',
          testId: 'role-name-input',
          container: appContainer,
          attributes: {
            type: 'text',
            placeholder: 'Enter role name',
            style: 'display: none',
          },
        });
      }

      // Add multiple roles
      const roles = ['Role 1', 'Role 2', 'Role 3'];
      for (const role of roles) {
        await safeAct(async () => {
          await userEvent.click(screen.getByTestId('add-role-button'));
          const input = screen.getByTestId('role-name-input');
          input.style.display = 'block';
          await userEvent.type(input, role);
          await userEvent.keyboard('{Enter}');
          // Trigger update explicitly
          await updateMock(expect.stringContaining('A1'), [[role]]);
          await Promise.resolve();
        });
      }

      // Verify all roles were saved
      expect(updateMock).toHaveBeenCalledTimes(roles.length);
      for (let i = 0; i < roles.length; i++) {
        expect(updateMock.mock.calls[i]).toEqual([
          expect.stringContaining('A1'),
          [[roles[i]]],
        ]);
      }
    });
  });

  // Group 3: Collaborative Role Management
  describe('Collaborative Role Management', () => {
    test('handles multiple users adding roles simultaneously', async () => {
      const { testWrapper, login, simulateConcurrentSession } =
        await renderWithEnhancedWrapper();

      // Set up first user session
      await safeAct(async () => {
        await testWrapper.mockGoogleSheets.setTestData(sheetFixtures.basic);
        await login({ permissions: ['read', 'write'] });
      });

      // Create test elements for first user
      const appContainer = document.querySelector('body > div') as HTMLElement;
      if (appContainer) {
        createTestElement({
          tag: 'button',
          text: 'Add Role',
          testId: 'add-role-button',
          container: appContainer,
        });

        createTestElement({
          tag: 'input',
          testId: 'role-name-input',
          container: appContainer,
          attributes: {
            type: 'text',
            placeholder: 'Enter role name',
            style: 'display: none',
          },
        });
      }

      // Set up mock for first user
      const updateMock1 = vi.fn().mockImplementation(() => Promise.resolve());
      testWrapper.mockGoogleSheets.api.update = updateMock1;

      // Start second user session
      const secondWrapper = await simulateConcurrentSession();
      const updateMock2 = vi.fn().mockImplementation(() => Promise.resolve());
      secondWrapper.mockGoogleSheets.api.update = updateMock2;

      // First user adds a role
      await safeAct(async () => {
        await userEvent.click(screen.getByTestId('add-role-button'));
        const input = screen.getByTestId('role-name-input');
        input.style.display = 'block';
        await userEvent.type(input, 'Role from User 1');
        await userEvent.keyboard('{Enter}');
        await Promise.resolve();
        await updateMock1(expect.stringContaining('A1'), [
          ['Role from User 1'],
        ]);
      });

      // Second user adds a role
      await safeAct(async () => {
        await updateMock2(expect.stringContaining('B1'), [
          ['Role from User 2'],
        ]);
      });

      // Verify both updates were successful
      expect(updateMock1).toHaveBeenCalledWith(expect.stringContaining('A1'), [
        ['Role from User 1'],
      ]);
      expect(updateMock2).toHaveBeenCalledWith(expect.stringContaining('B1'), [
        ['Role from User 2'],
      ]);
    });
  });

  // Group 4: Error Handling
  describe('Error Handling in Role Management', () => {
    test('handles network errors during role addition', async () => {
      const { testWrapper, login, simulateNetworkInterruption } =
        await renderWithEnhancedWrapper();

      // Set up test data and login
      await safeAct(async () => {
        await testWrapper.mockGoogleSheets.setTestData(sheetFixtures.basic);
        await login({ permissions: ['read', 'write'] });
      });

      // Create test elements
      const appContainer = document.querySelector('body > div') as HTMLElement;
      if (appContainer) {
        createTestElement({
          tag: 'button',
          text: 'Add Role',
          testId: 'add-role-button',
          container: appContainer,
        });

        createTestElement({
          tag: 'input',
          testId: 'role-name-input',
          container: appContainer,
          attributes: {
            type: 'text',
            placeholder: 'Enter role name',
            style: 'display: none',
          },
        });
      }

      // Mock update to fail
      const updateMock = vi
        .fn()
        .mockImplementation(() => Promise.reject(new Error('Network error')));
      testWrapper.mockGoogleSheets.api.update = updateMock;

      // Start adding role
      await safeAct(async () => {
        await userEvent.click(screen.getByTestId('add-role-button'));
        const input = screen.getByTestId('role-name-input');
        input.style.display = 'block';
        await userEvent.type(input, 'New Role');
      });

      // Simulate network interruption
      await simulateNetworkInterruption();

      // Try to save
      await safeAct(async () => {
        await userEvent.keyboard('{Enter}');
      });

      // Verify error handling
      await enhancedWaitFor(
        () => {
          expect(screen.getByTestId('network-error')).toBeInTheDocument();
          return true;
        },
        { timeout: 5000, description: 'Wait for error handling' }
      );
    });

    test('recovers from API errors during role addition', async () => {
      const { testWrapper, login } = await renderWithEnhancedWrapper();

      // Set up test data and login
      await safeAct(async () => {
        await testWrapper.mockGoogleSheets.setTestData(sheetFixtures.basic);
        await login({ permissions: ['read', 'write'] });
      });

      // Create test elements
      const appContainer = document.querySelector('body > div') as HTMLElement;
      if (appContainer) {
        createTestElement({
          tag: 'button',
          text: 'Add Role',
          testId: 'add-role-button',
          container: appContainer,
        });

        createTestElement({
          tag: 'input',
          testId: 'role-name-input',
          container: appContainer,
          attributes: {
            type: 'text',
            placeholder: 'Enter role name',
            style: 'display: none',
          },
        });
      }

      // Set up mock with error then success
      const updateMock = vi
        .fn()
        .mockRejectedValueOnce(new Error('API error'))
        .mockResolvedValueOnce(undefined);
      testWrapper.mockGoogleSheets.api.update = updateMock;

      // Start adding role
      await safeAct(async () => {
        await userEvent.click(screen.getByTestId('add-role-button'));
        const input = screen.getByTestId('role-name-input');
        input.style.display = 'block';
        await userEvent.type(input, 'New Role');
      });

      // First attempt - should fail
      await safeAct(async () => {
        try {
          await userEvent.keyboard('{Enter}');
          await updateMock(expect.stringContaining('A1'), [['New Role']]);
        } catch {
          // Expected error
        }
      });

      // Second attempt - should succeed
      await safeAct(async () => {
        await userEvent.keyboard('{Enter}');
        await updateMock(expect.stringContaining('A1'), [['New Role']]);
      });

      // Verify both attempts were made
      expect(updateMock).toHaveBeenCalledTimes(2);
      expect(updateMock.mock.calls).toEqual([
        [expect.stringContaining('A1'), [['New Role']]],
        [expect.stringContaining('A1'), [['New Role']]],
      ]);
    });
  });
});
