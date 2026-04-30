import type { Meta, StoryObj } from "@storybook/react";
import { Heatmap } from "./Heatmap";

const meta: Meta<typeof Heatmap> = {
  title: "Composites/Heatmap",
  component: Heatmap,
};

export default meta;
type Story = StoryObj<typeof Heatmap>;

export const Default: Story = {
  render: () => <Heatmap data={[]} />,
};
