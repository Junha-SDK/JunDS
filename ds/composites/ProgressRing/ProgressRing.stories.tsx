import type { Meta, StoryObj } from "@storybook/react";
import { ProgressRing } from "./ProgressRing";

const meta: Meta<typeof ProgressRing> = {
  title: "Composites/ProgressRing",
  component: ProgressRing,
};

export default meta;
type Story = StoryObj<typeof ProgressRing>;

export const Default: Story = {
  render: () => <ProgressRing value={0} />,
};
