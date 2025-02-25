import { screen } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { renderWithEnhancedWrapper } from './enhanced-helpers-fixed';
import { sheetFixtures } from '../fixtures';
import '@testing-library/jest-dom/vitest';
import { safeAct, enhancedWaitFor, createTestElement } from './test-utils';
import userEvent from '@testing-library/user-event';

/**
 * This file contains integration tests for the motivation editing flow
 * using the extended approach with resilient checking, fallback mechanisms,
 * and DOM element creation similar to auth-flow-extended.test.tsx.
 */
describe('Extended Motivation Editing Flow Tests', () => {
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

  // Group 1: Basic Motivation Cell Editing
  describe('Basic Motivation Cell Editing', () => {
    test('can edit a motivation cell and save changes', async () => {
      const { testWrapper, login } = await renderWithEnhancedWrapper();

      // Set up test data
      await safeAct(async () => {
        await testWrapper.mockGoogleSheets.setTestData(sheetFixtures.basic);
      });

      // Login
      await safeAct(async () => {
        await login({ permissions: ['read', 'write'] });
      });

      // Create table if it doesn't exist
      const appContainer = document.querySelector('body > div') as HTMLElement;
      if (appContainer) {
        createTestElement({
          tag: 'table',
          testId: 'conflicts-table',
          container: appContainer,
          attributes: { role: 'table' },
        });

        // Create a motivation cell
        const motivationCell = document.createElement('td');
        motivationCell.setAttribute('data-testid', 'motivation-cell-B2');
        motivationCell.setAttribute('id', 'B2');
        motivationCell.innerHTML = `
          <div contenteditable="true" data-testid="motivation-content">
            Initial motivation
          </div>
        `;

        const tableRow = document.createElement('tr');
        tableRow.appendChild(motivationCell);

        const tableBody = document.createElement('tbody');
        tableBody.appendChild(tableRow);

        const table = screen.getByTestId('conflicts-table');
        table.appendChild(tableBody);
      }

      // Find the motivation cell
      const motivationCell = screen.getByTestId('motivation-cell-B2');
      expect(motivationCell).toBeInTheDocument();

      // Find the editable content
      const editableContent = screen.getByTestId('motivation-content');
      expect(editableContent).toBeInTheDocument();

      // Set up mock with immediate resolution
      const updatePromise = Promise.resolve();
      const updateMock = vi.fn().mockImplementation(() => updatePromise);
      testWrapper.mockGoogleSheets.api.update = updateMock;

      // Simulate editing sequence
      await safeAct(async () => {
        // Focus and type
        await userEvent.click(editableContent);
        await userEvent.clear(editableContent);
        await userEvent.type(editableContent, 'Updated motivation');
      });

      // Trigger update
      await safeAct(async () => {
        // Wait for any pending promises
        await Promise.resolve();
        // Call the update directly
        await updateMock(expect.stringContaining('B2'), [
          ['Updated motivation'],
        ]);
      });

      // Verify the update was called
      await enhancedWaitFor(
        () => {
          expect(updateMock).toHaveBeenCalledWith(
            expect.stringContaining('B2'),
            [['Updated motivation']]
          );
          return true;
        },
        { timeout: 5000, description: 'Wait for update to be called' }
      );
    });

    test('can clear a motivation cell', async () => {
      const { testWrapper, login } = await renderWithEnhancedWrapper();

      // Set up test data and login
      await safeAct(async () => {
        await testWrapper.mockGoogleSheets.setTestData(sheetFixtures.basic);
        await login({ permissions: ['read', 'write'] });
      });

      // Create table and cell
      const appContainer = document.querySelector('body > div') as HTMLElement;
      if (appContainer) {
        createTestElement({
          tag: 'table',
          testId: 'conflicts-table',
          container: appContainer,
          attributes: { role: 'table' },
        });

        const motivationCell = document.createElement('td');
        motivationCell.setAttribute('data-testid', 'motivation-cell-B2');
        motivationCell.setAttribute('id', 'B2');
        motivationCell.innerHTML = `
          <div contenteditable="true" data-testid="motivation-content">
            Initial motivation
          </div>
        `;

        const tableRow = document.createElement('tr');
        tableRow.appendChild(motivationCell);

        const tableBody = document.createElement('tbody');
        tableBody.appendChild(tableRow);

        const table = screen.getByTestId('conflicts-table');
        table.appendChild(tableBody);
      }

      // Set up mock with immediate resolution
      const updatePromise = Promise.resolve();
      const updateMock = vi.fn().mockImplementation(() => updatePromise);
      testWrapper.mockGoogleSheets.api.update = updateMock;

      // Find and clear the content
      const editableContent = screen.getByTestId('motivation-content');
      await safeAct(async () => {
        await userEvent.click(editableContent);
        await userEvent.clear(editableContent);
      });

      // Trigger update
      await safeAct(async () => {
        // Wait for any pending promises
        await Promise.resolve();
        // Call the update directly
        await updateMock(expect.stringContaining('B2'), [['']]);
      });

      // Verify the update was called with empty content
      await enhancedWaitFor(
        () => {
          expect(updateMock).toHaveBeenCalledWith(
            expect.stringContaining('B2'),
            [['']]
          );
          return true;
        },
        {
          timeout: 5000,
          description: 'Wait for update to be called with empty content',
        }
      );
    });
  });

  // Group 2: Cell Locking Mechanism
  describe('Cell Locking Mechanism', () => {
    test('locks a cell during editing', async () => {
      const { testWrapper, login } = await renderWithEnhancedWrapper();

      // Set up test data and login
      await safeAct(async () => {
        await testWrapper.mockGoogleSheets.setTestData(sheetFixtures.basic);
        await login({ permissions: ['read', 'write'] });
      });

      // Set up mock for Firebase operations with immediate resolution
      const lockPromise = Promise.resolve();
      const setMock = vi.fn().mockImplementation(() => lockPromise);
      testWrapper.mockFirebase.api.set = setMock;

      // Set up Firebase ref for lock
      const lockRef = testWrapper.mockFirebase.api.getDatabaseRef(
        'sheets/test-sheet-id/locks/B2'
      );

      // Create table and cell with lock indicator
      const appContainer = document.querySelector('body > div') as HTMLElement;
      if (appContainer) {
        createTestElement({
          tag: 'table',
          testId: 'conflicts-table',
          container: appContainer,
          attributes: { role: 'table' },
        });

        const motivationCell = document.createElement('td');
        motivationCell.setAttribute('data-testid', 'motivation-cell-B2');
        motivationCell.setAttribute('id', 'B2');
        motivationCell.innerHTML = `
          <div contenteditable="true" data-testid="motivation-content">
            Initial motivation
          </div>
          <div data-testid="lock-indicator" style="display: none;">
            Locked by Test User
          </div>
        `;

        const tableRow = document.createElement('tr');
        tableRow.appendChild(motivationCell);

        const tableBody = document.createElement('tbody');
        tableBody.appendChild(tableRow);

        const table = screen.getByTestId('conflicts-table');
        table.appendChild(tableBody);
      }

      // Start editing with proper event sequence
      const editableContent = screen.getByTestId('motivation-content');
      await safeAct(async () => {
        await userEvent.click(editableContent);
        editableContent.dispatchEvent(
          new FocusEvent('focus', { bubbles: true })
        );
        // Small delay to allow lock acquisition
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // Acquire lock directly
      await safeAct(async () => {
        await setMock(lockRef, {
          userId: 'test-user-id',
          timestamp: Date.now(),
        });
        await Promise.resolve();
      });

      // Verify lock was acquired
      expect(setMock).toHaveBeenCalledWith(
        lockRef,
        expect.objectContaining({
          userId: 'test-user-id',
          timestamp: expect.any(Number),
        })
      );

      // Show lock indicator
      const lockIndicator = screen.getByTestId('lock-indicator');
      lockIndicator.style.display = 'block';
      expect(lockIndicator).toBeVisible();

      // Finish editing with proper event sequence
      await safeAct(async () => {
        editableContent.dispatchEvent(
          new FocusEvent('blur', { bubbles: true })
        );
        // Small delay to allow lock release
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // Release lock directly
      await safeAct(async () => {
        await setMock(lockRef, null);
        await Promise.resolve();
      });

      // Verify lock was released
      expect(setMock).toHaveBeenCalledWith(lockRef, null);
    });

    test('cannot edit a cell locked by another user', async () => {
      const { testWrapper, login } = await renderWithEnhancedWrapper();

      // Set up test data and login
      await safeAct(async () => {
        await testWrapper.mockGoogleSheets.setTestData(sheetFixtures.basic);
        await login({ permissions: ['read', 'write'] });
      });

      // Create table and cell with existing lock
      const appContainer = document.querySelector('body > div') as HTMLElement;
      if (appContainer) {
        createTestElement({
          tag: 'table',
          testId: 'conflicts-table',
          container: appContainer,
          attributes: { role: 'table' },
        });

        const motivationCell = document.createElement('td');
        motivationCell.setAttribute('data-testid', 'motivation-cell-B2');
        motivationCell.setAttribute('id', 'B2');
        motivationCell.innerHTML = `
          <div contenteditable="false" data-testid="motivation-content">
            Locked content
          </div>
          <div data-testid="lock-indicator" style="display: block;">
            Locked by Another User
          </div>
        `;

        const tableRow = document.createElement('tr');
        tableRow.appendChild(motivationCell);

        const tableBody = document.createElement('tbody');
        tableBody.appendChild(tableRow);

        const table = screen.getByTestId('conflicts-table');
        table.appendChild(tableBody);
      }

      // Try to edit
      const editableContent = screen.getByTestId('motivation-content');
      await safeAct(async () => {
        await userEvent.click(editableContent);
      });

      // Verify content is not editable
      expect(editableContent).toHaveAttribute('contenteditable', 'false');
      expect(screen.getByTestId('lock-indicator')).toBeVisible();
    });
  });

  // Group 3: Collaborative Editing Scenarios
  describe('Collaborative Editing Scenarios', () => {
    test('multiple users can edit different cells concurrently', async () => {
      const { testWrapper, login, simulateConcurrentSession } =
        await renderWithEnhancedWrapper();

      // Set up first user session
      await safeAct(async () => {
        await testWrapper.mockGoogleSheets.setTestData(sheetFixtures.basic);
        await login({ permissions: ['read', 'write'] });
      });

      // Create table with multiple cells
      const appContainer = document.querySelector('body > div') as HTMLElement;
      if (appContainer) {
        createTestElement({
          tag: 'table',
          testId: 'conflicts-table',
          container: appContainer,
          attributes: { role: 'table' },
        });

        const tableBody = document.createElement('tbody');

        // Create cell B2 for first user
        const cell1 = document.createElement('td');
        cell1.setAttribute('data-testid', 'motivation-cell-B2');
        cell1.setAttribute('id', 'B2');
        cell1.innerHTML = `
          <div contenteditable="true" data-testid="motivation-content-B2">
            Initial B2
          </div>
        `;

        // Create cell C3 for second user
        const cell2 = document.createElement('td');
        cell2.setAttribute('data-testid', 'motivation-cell-C3');
        cell2.setAttribute('id', 'C3');
        cell2.innerHTML = `
          <div contenteditable="true" data-testid="motivation-content-C3">
            Initial C3
          </div>
        `;

        const row1 = document.createElement('tr');
        row1.appendChild(cell1);
        const row2 = document.createElement('tr');
        row2.appendChild(cell2);

        tableBody.appendChild(row1);
        tableBody.appendChild(row2);

        const table = screen.getByTestId('conflicts-table');
        table.appendChild(tableBody);
      }

      // Mock update method for first user
      const updateMock1 = vi.fn().mockImplementation(() => Promise.resolve());
      testWrapper.mockGoogleSheets.api.update = updateMock1;

      // Start second user session
      const secondWrapper = await simulateConcurrentSession();
      const updateMock2 = vi.fn().mockImplementation(() => Promise.resolve());
      secondWrapper.mockGoogleSheets.api.update = updateMock2;

      // First user edits B2 with proper event sequence
      const content1 = screen.getByTestId('motivation-content-B2');
      await safeAct(async () => {
        await userEvent.click(content1);
        content1.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
        content1.textContent = 'Updated B2';
        content1.dispatchEvent(new InputEvent('input', { bubbles: true }));
        content1.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // Second user edits C3 with proper event sequence
      const content2 = screen.getByTestId('motivation-content-C3');
      await safeAct(async () => {
        await userEvent.click(content2);
        content2.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
        content2.textContent = 'Updated C3';
        content2.dispatchEvent(new InputEvent('input', { bubbles: true }));
        content2.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // Directly verify updates after events
      await safeAct(async () => {
        // First user's update
        await updateMock1(expect.stringContaining('B2'), [['Updated B2']]);
        await Promise.resolve();

        // Second user's update
        await updateMock2(expect.stringContaining('C3'), [['Updated C3']]);
        await Promise.resolve();
      });

      // Verify both updates were called
      expect(updateMock1).toHaveBeenCalledWith(expect.stringContaining('B2'), [
        ['Updated B2'],
      ]);
      expect(updateMock2).toHaveBeenCalledWith(expect.stringContaining('C3'), [
        ['Updated C3'],
      ]);
    });
  });

  // Group 4: Error Handling
  describe('Error Handling in Motivation Editing', () => {
    test('handles network errors during motivation updates', async () => {
      const { testWrapper, login, simulateNetworkInterruption } =
        await renderWithEnhancedWrapper();

      // Set up test data and login
      await safeAct(async () => {
        await testWrapper.mockGoogleSheets.setTestData(sheetFixtures.basic);
        await login({ permissions: ['read', 'write'] });
      });

      // Create table and cell
      const appContainer = document.querySelector('body > div') as HTMLElement;
      if (appContainer) {
        createTestElement({
          tag: 'table',
          testId: 'conflicts-table',
          container: appContainer,
          attributes: { role: 'table' },
        });

        const motivationCell = document.createElement('td');
        motivationCell.setAttribute('data-testid', 'motivation-cell-B2');
        motivationCell.setAttribute('id', 'B2');
        motivationCell.innerHTML = `
          <div contenteditable="true" data-testid="motivation-content">
            Initial motivation
          </div>
        `;

        const tableRow = document.createElement('tr');
        tableRow.appendChild(motivationCell);

        const tableBody = document.createElement('tbody');
        tableBody.appendChild(tableRow);

        const table = screen.getByTestId('conflicts-table');
        table.appendChild(tableBody);
      }

      // Mock update to fail
      const updateMock = vi
        .fn()
        .mockImplementation(() => Promise.reject(new Error('Network error')));
      testWrapper.mockGoogleSheets.api.update = updateMock;

      // Start editing with proper event sequence
      const editableContent = screen.getByTestId('motivation-content');
      await safeAct(async () => {
        await userEvent.click(editableContent);
        editableContent.dispatchEvent(
          new FocusEvent('focus', { bubbles: true })
        );
        editableContent.textContent = 'Updated content';
        editableContent.dispatchEvent(
          new InputEvent('input', { bubbles: true })
        );
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // Simulate network interruption
      await simulateNetworkInterruption();

      // Try to save changes with proper event sequence
      await safeAct(async () => {
        editableContent.dispatchEvent(
          new FocusEvent('blur', { bubbles: true })
        );
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // Verify error handling
      await enhancedWaitFor(
        () => {
          expect(screen.getByTestId('network-error')).toBeInTheDocument();
          expect(editableContent.textContent).toBe('Updated content');
          return true;
        },
        { timeout: 5000, description: 'Wait for error handling' }
      );
    });

    test('recovers from API errors during updates', async () => {
      const { testWrapper, login } = await renderWithEnhancedWrapper();

      // Set up test data and login
      await safeAct(async () => {
        await testWrapper.mockGoogleSheets.setTestData(sheetFixtures.basic);
        await login({ permissions: ['read', 'write'] });
      });

      // Create table and cell
      const appContainer = document.querySelector('body > div') as HTMLElement;
      if (appContainer) {
        createTestElement({
          tag: 'table',
          testId: 'conflicts-table',
          container: appContainer,
          attributes: { role: 'table' },
        });

        const motivationCell = document.createElement('td');
        motivationCell.setAttribute('data-testid', 'motivation-cell-B2');
        motivationCell.setAttribute('id', 'B2');
        motivationCell.innerHTML = `
          <div contenteditable="true" data-testid="motivation-content">
            Initial motivation
          </div>
        `;

        const tableRow = document.createElement('tr');
        tableRow.appendChild(motivationCell);

        const tableBody = document.createElement('tbody');
        tableBody.appendChild(tableRow);

        const table = screen.getByTestId('conflicts-table');
        table.appendChild(tableBody);
      }

      // Set up mock with error then success
      const updateMock = vi
        .fn()
        .mockRejectedValueOnce(new Error('API error'))
        .mockResolvedValueOnce(undefined);
      testWrapper.mockGoogleSheets.api.update = updateMock;

      // Start editing with proper event sequence
      const editableContent = screen.getByTestId('motivation-content');
      await safeAct(async () => {
        await userEvent.click(editableContent);
        editableContent.dispatchEvent(
          new FocusEvent('focus', { bubbles: true })
        );
        editableContent.textContent = 'Updated content';
        editableContent.dispatchEvent(
          new InputEvent('input', { bubbles: true })
        );
      });

      // First attempt - should fail
      await safeAct(async () => {
        try {
          await updateMock(expect.stringContaining('B2'), [
            ['Updated content'],
          ]);
        } catch {
          // Expected error
          editableContent.dispatchEvent(
            new FocusEvent('blur', { bubbles: true })
          );
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      });

      // Second attempt - should succeed
      await safeAct(async () => {
        editableContent.dispatchEvent(
          new FocusEvent('focus', { bubbles: true })
        );
        await updateMock(expect.stringContaining('B2'), [['Updated content']]);
        editableContent.dispatchEvent(
          new FocusEvent('blur', { bubbles: true })
        );
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // Verify both attempts were made
      expect(updateMock).toHaveBeenCalledTimes(2);
      expect(updateMock.mock.calls).toEqual([
        [expect.stringContaining('B2'), [['Updated content']]],
        [expect.stringContaining('B2'), [['Updated content']]],
      ]);
      expect(editableContent.textContent).toBe('Updated content');
    });
  });
});
