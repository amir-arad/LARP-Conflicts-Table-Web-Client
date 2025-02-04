import { FilterChip, FilterContainer, FilterSection } from "./filter";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof FilterContainer> = {
  component: FilterContainer,
  title: "Components/Filter",
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div dir="rtl" className="w-[400px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof FilterContainer>;

export const Default: Story = {
  render: () => (
    <FilterContainer>
      <FilterSection title="Status">
        <FilterChip label="Active" onRemove={() => {}} />
        <FilterChip label="Pending" onRemove={() => {}} />
        <FilterChip label="Completed" onRemove={() => {}} />
      </FilterSection>
      <FilterSection title="Category">
        <FilterChip label="Work" onRemove={() => {}} />
        <FilterChip label="Personal" onRemove={() => {}} />
        <FilterChip label="Important" onRemove={() => {}} />
      </FilterSection>
    </FilterContainer>
  ),
};
