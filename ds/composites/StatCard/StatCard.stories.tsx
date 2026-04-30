import type { Meta, StoryObj } from "@storybook/react";
import { StatCard } from "./StatCard";

const meta: Meta<typeof StatCard> = {
  title: "Composites/StatCard",
  component: StatCard,
};

export default meta;
type Story = StoryObj<typeof StatCard>;

export const Default: Story = {
  render: () => <StatCard label="" value="" />,
};
