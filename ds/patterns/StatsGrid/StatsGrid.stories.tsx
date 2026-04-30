import type { Meta, StoryObj } from "@storybook/react";
import { StatsGrid } from "./StatsGrid";

const meta: Meta<typeof StatsGrid> = {
  title: "Patterns/StatsGrid",
  component: StatsGrid,
};

export default meta;
type Story = StoryObj<typeof StatsGrid>;

export const Default: Story = {
  render: () => <StatsGrid stats={[]} />,
};
