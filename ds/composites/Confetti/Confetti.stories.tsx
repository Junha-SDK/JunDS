import type { Meta, StoryObj } from "@storybook/react";
import { Confetti } from "./Confetti";

const meta: Meta<typeof Confetti> = {
  title: "Composites/Confetti",
  component: Confetti,
};

export default meta;
type Story = StoryObj<typeof Confetti>;

export const Default: Story = {
  render: () => <Confetti active={false} />,
};
