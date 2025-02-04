import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "./button";

const meta: Meta<typeof Button> = {
  title: "Test/RTL Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div className="flex flex-col gap-4">
        <div dir="ltr" className="flex gap-4">
          <h3>LTR:</h3>
          <Story />
        </div>
        <div dir="rtl" className="flex gap-4">
          <h3>RTL:</h3>
          <Story />
        </div>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    children: "Click me",
    variant: "default",
  },
};
