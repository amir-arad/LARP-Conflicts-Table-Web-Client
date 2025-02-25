# Google Sheets Mock Enhancement Plan

## Overview

This document outlines the plan for enhancing the Google Sheets mock implementation to support more realistic integration testing scenarios. These enhancements are part of Week 1, Days 3-4 of our integration testing preparation plan.

## Current State

After examining both `google-sheets-api.ts` and `stateful-sheets-api.ts`, we can see that many fundamental components are already in place:

1. A comprehensive A1 notation coordinate translation system
2. In-memory state management
3. Basic range operations (get, update, clear)
4. Simple validation and error handling

## Enhancement Goals

To support more realistic integration testing, we need to enhance this implementation in the following areas:

### 1. Enhanced Validation and Error Simulation

- Add proper validation for range boundaries similar to real API
- Implement rate limiting simulation
- Add permission error simulation
- Implement network failure scenarios
- Add API quota error simulation
- Validation for maximum sheet size (like real API)

### 2. Test Fixtures for Common Scenarios

- Create fixtures for empty sheets
- Create fixtures with roles and conflicts data
- Implement fixtures with various error conditions
- Add fixtures with specific cell formatting
- Create fixtures for multi-sheet scenarios
- Add standard test data sets that match typical LARP conflicts table structures

### 3. Advanced Sheet Operations

- Add support for formula evaluation simulation
- Implement cell formatting operations
- Add support for merge/unmerge operations
- Implement sheet-level operations (add/delete/rename)
- Add conditional formatting support
- Implement cell change history tracking

### 4. Event Notification System

- Add change notification events
- Implement subscription system for cell/range changes
- Add lifecycle hooks for testing reactions to data changes
- Create synchronization mechanisms between sheets and Firebase
- Simulate real-time collaborative editing events

### 5. Integration Test Helpers

- Create helper functions for common test scenarios
- Implement verification utilities for expected sheet state
- Add timing and synchronization utilities
- Create combined Firebase+Sheets test fixtures
- Add assertion helpers for specific sheet states

## Implementation Timeline

### Day 3 (First Day of Google Sheets Enhancements)

#### Morning

- Extend validation in existing stateful implementation
- Add error simulation capabilities
- Implement test fixtures for common scenarios

#### Afternoon

- Begin event notification system implementation
- Add subscription mechanisms for cell/range changes
- Create test cases for the enhanced functionality

### Day 4 (Second Day of Google Sheets Enhancements)

#### Morning

- Complete advanced sheet operations
- Add formula simulation
- Implement cell formatting operations

#### Afternoon

- Create integration test helpers
- Develop synchronization mechanisms with Firebase
- Document usage patterns and examples

## Key Interfaces and Classes to Enhance

### `StatefulSheetsAPI` Class

- Add error simulation methods
- Enhance validation logic
- Implement subscription mechanisms
- Add formula evaluation capabilities

### `A1Utils` Class

- Add validation for range boundaries
- Add support for named ranges
- Implement sheet name handling

### Common Test Fixtures

- Create standard test fixtures for LARP conflicts tables
- Add error-prone fixtures for testing error handling
- Implement fixtures with complex range interactions

## Integration with Firebase Mock

To enable realistic multi-user testing scenarios, we need to integrate the enhanced Google Sheets mock with the Firebase mock:

1. Create synchronized state between Firebase and Sheets mocks
2. Implement simulated conflicts between sheet updates and Firebase changes
3. Add user presence awareness in the sheet operations
4. Simulate real-world race conditions and concurrency issues

## Success Criteria

The enhanced Google Sheets mock should:

1. Behave similarly to the real Google Sheets API in terms of validation and errors
2. Support all operations needed for LARP conflicts table testing
3. Provide realistic simulation of collaborative editing scenarios
4. Enable comprehensive testing of error conditions and edge cases
5. Integrate smoothly with the Firebase mock for end-to-end testing
