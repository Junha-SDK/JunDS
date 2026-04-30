import type { Meta, StoryObj } from "@storybook/react";
import { MetricCard } from "./MetricCard";

const meta: Meta<typeof MetricCard> = {
  title: "Composites/MetricCard",
  component: MetricCard,
};

export default meta;
type Story = StoryObj<typeof MetricCard>;

export const Default: Story = {
  render: () => <MetricCard label="" value="" />,
};
