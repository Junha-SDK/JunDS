import type { Meta, StoryObj } from "@storybook/react";
import { MiniChart } from "./MiniChart";

const meta: Meta<typeof MiniChart> = {
  title: "Composites/MiniChart",
  component: MiniChart,
};

export default meta;
type Story = StoryObj<typeof MiniChart>;

export const Default: Story = {
  render: () => <MiniChart data={[]} />,
};
