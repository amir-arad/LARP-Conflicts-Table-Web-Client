import type { Meta, StoryObj } from '@storybook/react';

// A simple component for testing
const SimpleTestComponent = () => {
  return (
    <div style={{ padding: '20px', border: '1px solid #ccc' }}>
      <h1>Test Component</h1>
      <p>This is a simple test component to verify Storybook setup.</p>
      <button>Test Button</button>
    </div>
  );
};

const meta = {
  title: 'Test/Basic',
  component: SimpleTestComponent,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof SimpleTestComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithBackground: Story = {
  parameters: {
    backgrounds: {
      default: 'dark',
    },
  },
};
