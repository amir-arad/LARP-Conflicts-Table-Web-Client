# Lock Visualization Testing Plan

## Overview

Based on user feedback, it appears that the lock state visualizations and tooltips that are supposedly implemented may not be functioning correctly or visibly in the application. This document outlines a testing strategy to verify the implementation status of these UI elements and identify any issues that need to be addressed.

## Current Implementation Status

The codebase contains the following UI implementations for lock visualization:

1. **In `table-cell.tsx`**:

   - Line 53: CSS for applying a red border to locked cells: `lockInfo && 'border-red-400'`
   - Line 58: Integration of the LockIndicator component

2. **In `lock-indicator.tsx`**:
   - Lines 19-21: Lock icon that appears when a lock exists
   - Lines 22-26: Tooltip that shows "Locked by [username]" on hover

## Testing Strategy

### 1. Visual Verification Tests

#### Test Case 1: Lock Border Visibility

- **Objective**: Verify that cells with active locks display a red border
- **Steps**:
  1. Create a test component that renders a table cell with mock lock information
  2. Verify the rendered cell has the CSS class `border-red-400`
  3. Visually confirm the border is visible and distinct

#### Test Case 2: Lock Icon Visibility

- **Objective**: Verify that locked cells display a lock icon
- **Steps**:
  1. Create a test component that renders a LockIndicator with mock lock information
  2. Verify the lock icon (Lock component) is rendered
  3. Visually confirm the icon is positioned correctly and visible

#### Test Case 3: Tooltip Functionality

- **Objective**: Verify that hovering over a locked cell shows the owner information
- **Steps**:
  1. Create a test component with mock lock and presence information
  2. Simulate a hover event
  3. Verify the tooltip with "Locked by [username]" appears

### 2. Integration Testing

#### Test Case 4: Lock State Propagation

- **Objective**: Verify that lock information correctly propagates from Firebase to UI components
- **Steps**:
  1. Set up a test environment with mocked Firebase
  2. Simulate a lock being acquired
  3. Verify the lock state is correctly passed to the table cell components
  4. Confirm the visual indicators appear (border, icon, tooltip)

#### Test Case 5: Multiple User Lock Interaction

- **Objective**: Verify lock visualization when multiple users interact
- **Steps**:
  1. Set up a test environment with two simulated users
  2. Have User A acquire a lock on a cell
  3. Verify User B sees the visual lock indicators
  4. Verify the tooltip correctly shows User A as the owner

### 3. End-to-End Testing

#### Test Case 6: Full Lock Visualization Flow

- **Objective**: Verify the complete lock visualization experience
- **Steps**:
  1. Set up an end-to-end test environment
  2. Simulate a user clicking on a cell to edit
  3. Verify the lock is acquired in Firebase
  4. Verify the visual indicators appear for other users
  5. Complete the edit and release the lock
  6. Verify the visual indicators disappear

## Implementation Checks

The following checks should be performed to ensure the implementation is correct:

1. **CSS Specificity Check**: Ensure the `border-red-400` class is not being overridden by other styles
2. **Conditional Rendering Check**: Verify the LockIndicator component is being conditionally rendered based on lock status
3. **UI Visibility Check**: Ensure the lock icon has sufficient contrast and size to be visible
4. **Tooltip Behavior Check**: Verify the tooltip appears on hover with the expected content

## Potential Issues and Solutions

Based on the user feedback, here are potential issues and solutions:

1. **Issue**: Lock state not being correctly populated

   - **Solution**: Verify the Firebase structure and lock subscription in the `usePresence` hook

2. **Issue**: Lock indicator not visually distinct enough

   - **Solution**: Enhance the styling with a more prominent border or background color

3. **Issue**: Tooltip not appearing or visible

   - **Solution**: Check z-index issues or hover behavior in the CSS

4. **Issue**: Lock icon too small or positioned incorrectly
   - **Solution**: Adjust size and positioning of the lock icon for better visibility

## Test Implementation Plan

1. Create a new file `src/test/integration/lock-visualization.test.tsx` to implement the visual tests
2. Update `src/components/ui/lock-indicator.tsx` if needed to improve visibility
3. Add storybook stories to visualize different lock states:
   - `src/test/storybook/lock-visualization.stories.tsx`

The tests should be implemented before proceeding with the remaining lock mechanism functionality to ensure the UI components are working as expected.
