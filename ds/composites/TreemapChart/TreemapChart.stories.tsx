import type { Meta, StoryObj } from "@storybook/react";
import { TreemapChart } from "./TreemapChart";

const meta: Meta<typeof TreemapChart> = {
  title: "Composites/TreemapChart",
  component: TreemapChart,
};

export default meta;
type Story = StoryObj<typeof TreemapChart>;

export const Default: Story = {
  render: () => <TreemapChart data={[]} />,
};
