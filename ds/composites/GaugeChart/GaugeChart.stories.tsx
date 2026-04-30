import type { Meta, StoryObj } from "@storybook/react";
import { GaugeChart } from "./GaugeChart";

const meta: Meta<typeof GaugeChart> = {
  title: "Composites/GaugeChart",
  component: GaugeChart,
};

export default meta;
type Story = StoryObj<typeof GaugeChart>;

export const Default: Story = {
  render: () => <GaugeChart value={0} />,
};
