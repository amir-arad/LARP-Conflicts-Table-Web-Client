# Lock Visualization Storybook Test Story

## Overview

This document outlines a comprehensive Storybook test story for verifying the lock visualization functionality in the Conflicts Table application. Following our strategic decision to use Storybook exclusively for all flow tests involving UI, this approach provides a more visual and interactive way to test and verify the lock visualization features.

## User Story

**Title**: Visible Lock Indicators During Collaborative Editing

**As a** user collaborating on a conflicts table,  
**I want** to clearly see which cells are being edited by other users,  
**So that** I avoid editing conflicts and understand the current state of the document.

**Acceptance Criteria**:

1. When a user begins editing a cell, a visual indicator (lock icon) appears for other users
2. The locked cell displays a distinct red border to signal its locked state
3. Hovering over a locked cell shows a tooltip with the editor's name
4. When the editor completes their edit, the lock visualization disappears

## Storybook Implementation

Create a comprehensive Storybook story file at `src/test/storybook/lock-visualization.stories.tsx`:

```tsx
import { Meta, StoryObj } from '@storybook/react';
import { EditableTableCell } from '../../components/ui/table-cell';
import { LockInfo, Presence } from '../../lib/collaboration';
import { userEvent, within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { fn } from '@storybook/test';

const meta: Meta<typeof EditableTableCell> = {
  title: 'Collaboration/Lock Visualization',
  component: EditableTableCell,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Displays an editable table cell with lock visualization when the cell is being edited by another user.',
      },
    },
  },
  argTypes: {
    content: {
      control: 'text',
      description: 'The content displayed in the cell',
    },
    onUpdate: {
      action: 'updated',
      description: 'Callback when content is updated',
    },
    onDelete: {
      action: 'deleted',
      description: 'Callback when delete button is clicked',
    },
    onFocusChange: {
      action: 'focusChanged',
      description: 'Callback when focus state changes',
    },
    lockInfo: {
      control: 'object',
      description: 'Information about the current lock on this cell',
    },
    presence: {
      control: 'object',
      description: 'Current user presence information',
    },
  },
  decorators: [
    Story => (
      <div style={{ padding: '2rem' }}>
        <table>
          <tbody>
            <tr>
              <Story />
            </tr>
          </tbody>
        </table>
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof EditableTableCell>;

// Mock data
const now = Date.now();

const mockUserId = 'user-1';
const mockEditorName = 'Alice';

const mockLockInfo: LockInfo = {
  userId: mockUserId,
  acquired: now,
  expires: now + 30000, // 30 seconds from now
};

const mockPresence: Record<string, Presence> = {
  [mockUserId]: {
    name: mockEditorName,
    photoUrl: 'https://example.com/avatar.jpg',
    lastActive: now,
    activeCell: 'cell-1-1',
    updateType: 'state_change',
  },
};

// Base story args
const baseArgs = {
  content: 'Sample Cell Content',
  cellId: 'cell-1-1',
  onUpdate: fn(content => content),
  onDelete: fn(),
  onFocusChange: fn(isFocused => isFocused),
};

// Basic cell with no lock
export const Unlocked: Story = {
  args: {
    ...baseArgs,
    content: 'Unlocked Cell',
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Verify no lock icon is present', async () => {
      const lockIcon = canvas.queryByTestId('lock-icon');
      expect(lockIcon).not.toBeInTheDocument();
    });

    await step('Verify cell is editable', async () => {
      const cell = canvas.getByText('Unlocked Cell');
      expect(cell).toHaveAttribute('contentEditable', 'true');
    });
  },
};

// Cell with active lock
export const Locked: Story = {
  args: {
    ...baseArgs,
    content: 'Locked Cell',
    lockInfo: mockLockInfo,
    presence: mockPresence,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Verify lock icon is displayed', async () => {
      const lockIcon = canvas.getByTestId('lock-icon');
      expect(lockIcon).toBeInTheDocument();
    });

    await step('Verify red border is applied', async () => {
      const cell = canvas.getByTestId('cell-1-1');
      expect(cell).toHaveClass('border-red-400');
    });

    await step('Verify cell is not editable', async () => {
      const content = canvas.getByText('Locked Cell');
      expect(content).not.toHaveAttribute('contentEditable', 'true');
    });
  },
};

// Cell with lock and hover for tooltip
export const LockedWithTooltip: Story = {
  args: {
    ...baseArgs,
    content: 'Hover to See Tooltip',
    lockInfo: mockLockInfo,
    presence: mockPresence,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Hover over locked cell', async () => {
      const cell = canvas.getByTestId('cell-1-1');
      await userEvent.hover(cell);
    });

    await step('Verify tooltip shows lock owner', async () => {
      const tooltip = canvas.getByText(`Locked by ${mockEditorName}`);
      expect(tooltip).toBeVisible();
    });
  },
};

// Cell with expired lock
export const ExpiredLock: Story = {
  args: {
    ...baseArgs,
    content: 'Cell with Expired Lock',
    lockInfo: {
      ...mockLockInfo,
      expires: now - 5000, // Expired 5 seconds ago
    },
    presence: mockPresence,
  },
  play: async ({ canvasElement, step }) => {
    // In a real implementation, expired locks would be automatically removed
    // This story demonstrates how we would test that behavior
    const canvas = within(canvasElement);

    await step(
      'Verify lock visualization is not shown for expired locks',
      async () => {
        // This would only work if the component has logic to check expiration
        const lockIcon = canvas.queryByTestId('lock-icon');
        expect(lockIcon).not.toBeInTheDocument();
      }
    );
  },
};

// Interactive story showing lock life cycle
export const LockLifecycle: Story = {
  args: {
    ...baseArgs,
    content: 'Lock Lifecycle Demo',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates the full lifecycle of a lock from acquisition to release',
      },
    },
  },
  play: async ({ canvasElement, step, args }) => {
    const canvas = within(canvasElement);

    // Store references to key elements
    let cell = canvas.getByTestId('cell-1-1');

    await step('Initial state - cell is unlocked', async () => {
      const lockIcon = canvas.queryByTestId('lock-icon');
      expect(lockIcon).not.toBeInTheDocument();
      expect(cell).not.toHaveClass('border-red-400');
    });

    await step('User acquires lock', async () => {
      // Simulate lock acquisition by updating props
      // In a real app this would happen through the lock mechanism
      args.lockInfo = mockLockInfo;
      args.presence = mockPresence;

      // Force re-render through focus event
      await userEvent.click(cell);
      if (args.onFocusChange) {
        args.onFocusChange(true);
      }
    });

    // At this point, in a real component with reactivity, the lock would be visible
    // This simulation has limitations in Storybook's play function

    await step('User releases lock', async () => {
      // Simulate lock release
      args.lockInfo = undefined;

      // Force re-render through blur event
      if (args.onFocusChange) {
        args.onFocusChange(false);
      }
    });

    // Again, in a real component, the lock would now be removed
  },
};

// Multiple users scenario
export const MultiUserScenario: Story = {
  args: {
    ...baseArgs,
    content: 'Multi-user Scenario',
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates how locks appear when multiple users are present',
      },
    },
  },
  play: async ({ canvasElement, step, args }) => {
    const canvas = within(canvasElement);

    const userA = {
      id: 'user-A',
      name: 'Alice',
    };

    const userB = {
      id: 'user-B',
      name: 'Bob',
    };

    // Setup multi-user presence
    const multiUserPresence = {
      [userA.id]: {
        name: userA.name,
        photoUrl: 'https://example.com/alice.jpg',
        lastActive: now,
        activeCell: 'cell-1-2',
        updateType: 'state_change',
      },
      [userB.id]: {
        name: userB.name,
        photoUrl: 'https://example.com/bob.jpg',
        lastActive: now,
        activeCell: 'cell-2-1',
        updateType: 'state_change',
      },
    };

    await step('User A locks the cell', async () => {
      args.lockInfo = {
        userId: userA.id,
        acquired: now,
        expires: now + 30000,
      };
      args.presence = multiUserPresence;

      // Force re-render
      await userEvent.click(canvas.getByTestId('cell-1-1'));
    });

    // In a real component, we would now see:
    // - Lock icon
    // - Red border
    // - "Locked by Alice" on hover
  },
};
```

## Test Modifications Required

To make the Storybook stories work correctly, the following modifications are needed:

1. Add `data-testid` attributes to relevant components:

```tsx
// In table-cell.tsx, add testid to the main container:
<Element
  ref={ref}
  id={cellId}
  data-testid={cellId} // Add this line
  className={cn(
    'group relative border p-2',
    isHeader && 'bg-gray-100',
    getContentClass(content),
    lockInfo && 'border-red-400'
  )}
  dir={getTextDirection(content)}
  {...props}
>

// In lock-indicator.tsx, add testid to the lock icon:
<Lock size={14} className="text-red-400" data-testid="lock-icon" />
```

2. Ensure the tooltip visibility works correctly with CSS:

```tsx
// In lock-indicator.tsx, make tooltip visible on hover:
{
  lockOwner && (
    <div className="invisible absolute -top-8 right-0 whitespace-nowrap rounded bg-black px-2 py-1 text-xs text-white group-hover:visible">
      Locked by {lockOwner.name}
    </div>
  );
}
```

## Additional Storybook Documentation

Create a dedicated documentation page for the lock visualization in Storybook:

```tsx
import { Meta } from '@storybook/blocks';

<Meta title="Collaboration/Lock Visualization/Documentation" />

# Lock Visualization

Lock visualization is a critical part of the collaborative editing experience in the Conflicts Table application.
It provides visual feedback to users about which cells are currently being edited by other collaborators.

## Components

The lock visualization consists of three main visual elements:

1. **Red Border**: Indicates that a cell is currently locked for editing
2. **Lock Icon**: A small lock icon appears in the corner of locked cells
3. **Tooltip**: Hovering over a locked cell reveals which user is currently editing it

## Implementation

The lock visualization is implemented through:

- The `LockIndicator` component, which renders the lock icon and tooltip
- CSS styling in the `EditableTableCell` component to show a red border
- Conditional rendering based on the presence of a valid `lockInfo` object

## Usage

To display lock visualization:

1. Pass a valid `lockInfo` object to the `EditableTableCell` component
2. Ensure the user presence information is available in the `presence` prop
3. The component automatically handles the visualization based on these props

## Edge Cases

- **Expired Locks**: Locks that have expired should not show visualization
- **Missing User Data**: If user data is not available, the tooltip falls back to "Locked"
- **Multiple Locks**: Only one lock can be active per cell at any time
```

## Testing Through Storybook Interaction Addon

Enable the Storybook Interactions addon to allow interactive testing:

1. Configure the addon in `.storybook/main.js`:

```js
module.exports = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions', // Ensure this is enabled
  ],
  framework: '@storybook/react',
  core: {
    builder: '@storybook/builder-vite',
  },
  features: {
    interactionsDebugger: true, // Enable interactions debugger
  },
};
```

2. Use the interaction addon for manual testing in the Storybook UI

## Conclusion

By implementing these comprehensive Storybook stories, we can:

1. Visually verify that lock indicators, borders, and tooltips are correctly displayed
2. Test the interactions and behaviors expected during collaborative editing
3. Document the expected visual appearance for different lock states

This Storybook-exclusive approach will help us identify and fix any issues with the lock visualization before proceeding with the full lock mechanism implementation, ensuring a solid foundation for collaborative editing features.
