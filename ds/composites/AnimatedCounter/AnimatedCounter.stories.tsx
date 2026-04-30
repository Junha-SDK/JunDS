import type { Meta, StoryObj } from "@storybook/react";
import { AnimatedCounter } from "./AnimatedCounter";

const meta: Meta<typeof AnimatedCounter> = {
  title: "Composites/AnimatedCounter",
  component: AnimatedCounter,
};

export default meta;
type Story = StoryObj<typeof AnimatedCounter>;

export const Default: Story = {
  render: () => <AnimatedCounter value={0} />,
};
