# Stateful Sheets API Enhancement Implementation Plan

## Overview

This document provides a detailed implementation plan for enhancing the `StatefulSheetsAPI` class to support more realistic integration testing scenarios. These enhancements will focus on error simulation, validation improvements, event notifications, and Firebase integration.

## Core Enhancements

### 1. Error Simulation Framework

The enhanced API should be able to simulate various error conditions that can occur in the real Google Sheets API:

```typescript
interface ErrorSimulationOptions {
  // Error types
  rateLimit?: boolean; // Rate limit exceeded
  permissionDenied?: boolean; // User lacks permissions for operation
  networkError?: boolean; // Network connection issues
  quotaExceeded?: boolean; // API quota exceeded
  invalidRange?: boolean; // Range is invalid or out of bounds
  serviceUnavailable?: boolean; // API service unavailable
  timeout?: boolean; // Request timed out

  // Error behavior
  errorProbability?: number; // Probability (0-1) of error occurring
  affectedRanges?: string[]; // Specific ranges to apply errors to (A1 notation)
  affectedOperations?: Array<'load' | 'update' | 'clear'>; // Operations to affect
  responseDelay?: number; // Simulate response delay in ms
  errorMessage?: string; // Custom error message
}
```

Implementation:

```typescript
class StatefulSheetsAPI {
  // Existing implementation...
  private errorSimulation: ErrorSimulationOptions = {};

  /**
   * Configure error simulation for the API
   */
  simulateErrors(options: ErrorSimulationOptions): void {
    this.errorSimulation = { ...this.errorSimulation, ...options };
    this.triggerUpdate();
  }

  /**
   * Reset all error simulations
   */
  resetErrorSimulation(): void {
    this.errorSimulation = {};
    this.triggerUpdate();
  }

  /**
   * Check if an operation should be affected by error simulation
   */
  private shouldSimulateError(
    operation: 'load' | 'update' | 'clear',
    range?: string
  ): boolean {
    const {
      errorProbability = 1,
      affectedOperations = ['load', 'update', 'clear'],
      affectedRanges = [],
    } = this.errorSimulation;

    // Check if operation should be affected
    if (!affectedOperations.includes(operation)) {
      return false;
    }

    // Check if range should be affected (if specified)
    if (range && affectedRanges.length > 0 && !affectedRanges.includes(range)) {
      return false;
    }

    // Apply probability
    return Math.random() < errorProbability;
  }

  /**
   * Generate an error based on current simulation settings
   */
  private generateSimulatedError(): Error {
    const {
      rateLimit,
      permissionDenied,
      networkError,
      quotaExceeded,
      invalidRange,
      serviceUnavailable,
      timeout,
      errorMessage,
    } = this.errorSimulation;

    if (errorMessage) {
      return new Error(errorMessage);
    }

    if (rateLimit) {
      return new Error('Rate limit exceeded. Try again later.');
    }

    if (permissionDenied) {
      return new Error(
        'Permission denied. You do not have access to this resource.'
      );
    }

    if (networkError) {
      return new Error(
        'Network error. Unable to connect to Google Sheets API.'
      );
    }

    if (quotaExceeded) {
      return new Error('Quota exceeded for Google Sheets API.');
    }

    if (invalidRange) {
      return new Error('Invalid range specified.');
    }

    if (serviceUnavailable) {
      return new Error('Google Sheets API service is currently unavailable.');
    }

    if (timeout) {
      return new Error('Request timed out.');
    }

    return new Error('Unknown error occurred.');
  }
}
```

### 2. Event Notification System

Implement a publish/subscribe system for sheet changes to enable testing of components that react to changes:

```typescript
// Event types
type SheetEventType =
  | 'cellChanged' // Single cell changed
  | 'rangeChanged' // Range of cells changed
  | 'sheetCleared' // Sheet or range cleared
  | 'dataLoaded' // Data loaded/reloaded
  | 'errorOccurred'; // Error occurred during operation

// Event data
interface SheetEvent {
  type: SheetEventType;
  range?: string; // Affected range in A1 notation (if applicable)
  timestamp: number; // When event occurred
  changedBy?: string; // User ID (for multi-user testing)
  previousValues?: any[][]; // Previous state (if applicable)
  newValues?: any[][]; // New state (if applicable)
  error?: Error; // Error details (if type is 'errorOccurred')
}

// Subscription handler
type SheetEventHandler = (event: SheetEvent) => void;
```

Implementation:

```typescript
class StatefulSheetsAPI {
  // Existing implementation...
  private eventListeners: Map<SheetEventType, Set<SheetEventHandler>> =
    new Map();

  /**
   * Subscribe to sheet events
   */
  addEventListener(type: SheetEventType, handler: SheetEventHandler): void {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, new Set());
    }
    this.eventListeners.get(type)!.add(handler);
  }

  /**
   * Unsubscribe from sheet events
   */
  removeEventListener(type: SheetEventType, handler: SheetEventHandler): void {
    const listeners = this.eventListeners.get(type);
    if (listeners) {
      listeners.delete(handler);
      if (listeners.size === 0) {
        this.eventListeners.delete(type);
      }
    }
  }

  /**
   * Dispatch a sheet event to all subscribed handlers
   */
  private dispatchEvent(event: SheetEvent): void {
    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      listeners.forEach(handler => handler(event));
    }
  }
}
```

### 3. Enhanced Range Operations with History Tracking

Extend the range operations to track history and support undo/redo operations:

```typescript
interface HistoryEntry {
  range: string; // Range in A1 notation
  previousValues: any[][]; // Values before change
  newValues: any[][]; // Values after change
  operation: 'update' | 'clear'; // Operation performed
  timestamp: number; // When the change occurred
  userId?: string; // Who made the change (for multi-user)
}
```

Implementation:

```typescript
class StatefulSheetsAPI {
  // Existing implementation...
  private history: HistoryEntry[] = [];
  private maxHistoryEntries = 100; // Configurable

  /**
   * Record a change in history
   */
  private recordHistory(
    range: string,
    previousValues: any[][],
    newValues: any[][],
    operation: 'update' | 'clear',
    userId?: string
  ): void {
    const historyEntry: HistoryEntry = {
      range,
      previousValues: JSON.parse(JSON.stringify(previousValues)),
      newValues: JSON.parse(JSON.stringify(newValues)),
      operation,
      timestamp: Date.now(),
      userId,
    };

    // Add to history and maintain max length
    this.history.push(historyEntry);
    if (this.history.length > this.maxHistoryEntries) {
      this.history.shift();
    }

    // Dispatch event
    this.dispatchEvent({
      type: operation === 'update' ? 'rangeChanged' : 'sheetCleared',
      range,
      timestamp: historyEntry.timestamp,
      changedBy: userId,
      previousValues: historyEntry.previousValues,
      newValues: historyEntry.newValues,
    });
  }

  /**
   * Get operation history
   */
  getHistory(): HistoryEntry[] {
    return JSON.parse(JSON.stringify(this.history));
  }

  /**
   * Clear history
   */
  clearHistory(): void {
    this.history = [];
  }
}
```

### 4. Firebase Integration

Create integration points with the Firebase mock to simulate realistic multi-user scenarios:

```typescript
interface FirebaseIntegrationOptions {
  presenceDataPath: string; // Path to presence data in Firebase
  lockDataPath: string; // Path to lock data in Firebase
  firebaseInstance: any; // Firebase mock instance
  syncChangesToFirebase: boolean; // Should sheet changes update Firebase
  syncFirebaseToSheet: boolean; // Should Firebase changes update sheet
  simulateConflicts: boolean; // Should simulate editing conflicts
  conflictProbability: number; // Probability of conflict occurring
}
```

Implementation:

```typescript
class StatefulSheetsAPI {
  // Existing implementation...
  private firebaseIntegration: FirebaseIntegrationOptions | null = null;
  private firebaseSubscriptions: Array<() => void> = [];

  /**
   * Set up Firebase integration
   */
  integrateWithFirebase(options: FirebaseIntegrationOptions): void {
    // Clean up any existing subscriptions
    this.disconnectFromFirebase();

    this.firebaseIntegration = options;

    if (options.syncFirebaseToSheet) {
      // Subscribe to Firebase presence changes
      const unsubscribePresence = options.firebaseInstance.onValue(
        options.presenceDataPath,
        (snapshot: any) => {
          // Update sheet based on presence data
          // Implementation depends on specific Firebase mock structure
        }
      );

      // Subscribe to Firebase lock changes
      const unsubscribeLocks = options.firebaseInstance.onValue(
        options.lockDataPath,
        (snapshot: any) => {
          // Update sheet based on lock data
          // Implementation depends on specific Firebase mock structure
        }
      );

      this.firebaseSubscriptions.push(unsubscribePresence, unsubscribeLocks);
    }
  }

  /**
   * Disconnect from Firebase
   */
  disconnectFromFirebase(): void {
    if (this.firebaseIntegration) {
      // Unsubscribe from all Firebase listeners
      this.firebaseSubscriptions.forEach(unsubscribe => unsubscribe());
      this.firebaseSubscriptions = [];
      this.firebaseIntegration = null;
    }
  }

  /**
   * Notify Firebase of sheet changes (if integration enabled)
   */
  private notifyFirebaseOfChanges(range: string, newValues: any[][]): void {
    if (
      this.firebaseIntegration &&
      this.firebaseIntegration.syncChangesToFirebase
    ) {
      // Implementation depends on specific Firebase mock structure
      // This would typically update presence data or trigger lock operations
    }
  }

  /**
   * Simulate editing conflict
   */
  private simulateEditingConflict(range: string): boolean {
    if (
      !this.firebaseIntegration ||
      !this.firebaseIntegration.simulateConflicts
    ) {
      return false;
    }

    return Math.random() < this.firebaseIntegration.conflictProbability;
  }
}
```

### 5. Formula Simulation

Add basic formula evaluation capabilities:

```typescript
class StatefulSheetsAPI {
  // Existing implementation...
  private formulaPattern = /^=(.+)$/;
  private enableFormulaEvaluation = false;

  /**
   * Enable or disable formula evaluation
   */
  setFormulaEvaluation(enabled: boolean): void {
    this.enableFormulaEvaluation = enabled;
    this.triggerUpdate();
  }

  /**
   * Evaluate a formula in the context of the sheet
   */
  private evaluateFormula(formula: string, row: number, col: number): any {
    if (!this.enableFormulaEvaluation) {
      return formula; // Return formula as-is if evaluation disabled
    }

    // Extract formula content (remove leading =)
    const match = formula.match(this.formulaPattern);
    if (!match) {
      return formula;
    }

    const formulaContent = match[1];

    // Simple formula evaluation (this is a basic implementation that could be expanded)
    try {
      // Handle SUM formula
      if (formulaContent.startsWith('SUM(') && formulaContent.endsWith(')')) {
        const rangeStr = formulaContent.substring(4, formulaContent.length - 1);
        const { startRow, startCol, endRow, endCol } =
          A1Utils.parseRange(rangeStr);

        let sum = 0;
        for (let r = startRow; r <= endRow; r++) {
          for (let c = startCol; c <= endCol; c++) {
            const value = this.getValue(r, c);
            if (typeof value === 'number') {
              sum += value;
            } else if (typeof value === 'string') {
              const num = parseFloat(value);
              if (!isNaN(num)) {
                sum += num;
              }
            }
          }
        }
        return sum;
      }

      // Handle AVERAGE formula
      if (
        formulaContent.startsWith('AVERAGE(') &&
        formulaContent.endsWith(')')
      ) {
        const rangeStr = formulaContent.substring(8, formulaContent.length - 1);
        const { startRow, startCol, endRow, endCol } =
          A1Utils.parseRange(rangeStr);

        let sum = 0;
        let count = 0;
        for (let r = startRow; r <= endRow; r++) {
          for (let c = startCol; c <= endCol; c++) {
            const value = this.getValue(r, c);
            if (typeof value === 'number') {
              sum += value;
              count++;
            } else if (typeof value === 'string') {
              const num = parseFloat(value);
              if (!isNaN(num)) {
                sum += num;
                count++;
              }
            }
          }
        }
        return count > 0 ? sum / count : 0;
      }

      // Return formula as-is for other cases
      return formula;
    } catch (error) {
      // Return error indicator for formula errors
      return '#ERROR!';
    }
  }

  /**
   * Override getValue to handle formula evaluation
   */
  private getValue(
    row: number,
    col: number
  ): string | number | null | undefined {
    const value = super.getValue(row, col);

    // Evaluate formulas if enabled
    if (
      typeof value === 'string' &&
      this.formulaPattern.test(value) &&
      this.enableFormulaEvaluation
    ) {
      return this.evaluateFormula(value, row, col);
    }

    return value;
  }
}
```

## Integration Test Helpers

To make the enhanced API more usable in tests, we'll provide helper functions:

```typescript
/**
 * Test utilities for working with the enhanced StatefulSheetsAPI
 */
export class SheetTestUtils {
  /**
   * Create a mock with realistic error conditions
   */
  static createErrorProneMock(options: ErrorSimulationOptions) {
    const mock = createStatefulSheetsAPI();
    mock.api.simulateErrors(options);
    return mock;
  }

  /**
   * Create a mock that integrates with Firebase
   */
  static createFirebaseIntegratedMock(
    firebaseMock: any,
    options: Partial<FirebaseIntegrationOptions> = {}
  ) {
    const mock = createStatefulSheetsAPI();
    mock.api.integrateWithFirebase({
      presenceDataPath: 'sheets/test-sheet-id/presence',
      lockDataPath: 'sheets/test-sheet-id/locks',
      firebaseInstance: firebaseMock,
      syncChangesToFirebase: true,
      syncFirebaseToSheet: true,
      simulateConflicts: false,
      conflictProbability: 0.1,
      ...options,
    });
    return mock;
  }

  /**
   * Verify sheet content matches expected values
   */
  static assertSheetContent(
    mock: ReturnType<typeof createStatefulSheetsAPI>,
    expectedValues: any[][]
  ) {
    return mock.api.load().then(response => {
      const actualValues = response.result.values;
      expect(actualValues).toEqual(expectedValues);
    });
  }

  /**
   * Execute multiple operations with delay between them
   */
  static async executeBatchedOperations(
    mock: ReturnType<typeof createStatefulSheetsAPI>,
    operations: Array<{
      type: 'update' | 'clear';
      range: string;
      values?: any[][];
    }>,
    delayMs: number = 0
  ) {
    for (const op of operations) {
      if (op.type === 'update') {
        await mock.api.update(op.range, op.values!);
      } else if (op.type === 'clear') {
        await mock.api.clear(op.range);
      }

      if (delayMs > 0 && operations.indexOf(op) < operations.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }
}
```

## Implementation Roadmap

1. Implement the core error simulation framework
2. Add the event notification system
3. Enhance range operations with history tracking
4. Implement Firebase integration
5. Add formula simulation capabilities
6. Create test utility functions
7. Document the enhanced API

These enhancements will enable much more realistic testing of the LARP Conflicts Table Web Client, particularly for multi-user collaboration scenarios and error handling.
