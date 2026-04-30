import type { Meta, StoryObj } from "@storybook/react";
import { FilterButtonGroup } from "./FilterButtonGroup";

const meta: Meta<typeof FilterButtonGroup> = {
  title: "Composites/FilterButtonGroup",
  component: FilterButtonGroup,
};

export default meta;
type Story = StoryObj<typeof FilterButtonGroup>;

export const Default: Story = {
  render: () => <FilterButtonGroup options={[]} value="" onChange={() => {}} />,
};
