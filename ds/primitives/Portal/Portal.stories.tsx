import type { Meta, StoryObj } from "@storybook/react";
import { Portal } from "./Portal";

const meta: Meta<typeof Portal> = {
  title: "Primitives/Portal",
  component: Portal,
};

export default meta;
type Story = StoryObj<typeof Portal>;

export const Default: Story = {
  render: () => <Portal>{null}</Portal>,
};
