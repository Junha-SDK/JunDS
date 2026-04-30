import type { Meta, StoryObj } from "@storybook/react";
import { ComparisonGrid } from "./ComparisonGrid";

const meta: Meta<typeof ComparisonGrid> = {
  title: "Composites/ComparisonGrid",
  component: ComparisonGrid,
};

export default meta;
type Story = StoryObj<typeof ComparisonGrid>;

export const Default: Story = {
  render: () => <ComparisonGrid cards={[]} />,
};
