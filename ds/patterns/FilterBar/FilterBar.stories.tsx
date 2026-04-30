import type { Meta, StoryObj } from "@storybook/react";
import { FilterBar } from "./FilterBar";

const meta: Meta<typeof FilterBar> = {
  title: "Patterns/FilterBar",
  component: FilterBar,
};

export default meta;
type Story = StoryObj<typeof FilterBar>;

export const Default: Story = {
  render: () => <FilterBar />,
};
