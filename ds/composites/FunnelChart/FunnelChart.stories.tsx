import type { Meta, StoryObj } from "@storybook/react";
import { FunnelChart } from "./FunnelChart";

const meta: Meta<typeof FunnelChart> = {
  title: "Composites/FunnelChart",
  component: FunnelChart,
};

export default meta;
type Story = StoryObj<typeof FunnelChart>;

export const Default: Story = {
  render: () => <FunnelChart data={[]} />,
};
