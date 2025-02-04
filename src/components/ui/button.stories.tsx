import { ArrowLeft, ArrowRight, Plus, Trash2 } from "lucide-react";
import { Button, ButtonGroup } from "./button";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof Button> = {
  component: Button,
  title: "Components/Button",
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div dir="rtl" className="flex gap-4">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: "Button",
  },
};

export const WithStartIcon: Story = {
  args: {
    children: "Create New",
    icon: <Plus className="h-4 w-4" />,
    iconPosition: "start",
  },
};

export const WithEndIcon: Story = {
  args: {
    children: "Delete",
    icon: <Trash2 className="h-4 w-4" />,
    iconPosition: "end",
  },
};

export const ButtonGroupExample: Story = {
  render: () => (
    <ButtonGroup>
      <Button icon={<ArrowRight className="h-4 w-4" />} iconPosition="start">
        Previous
      </Button>
      <Button icon={<ArrowLeft className="h-4 w-4" />} iconPosition="end">
        Next
      </Button>
    </ButtonGroup>
  ),
};
