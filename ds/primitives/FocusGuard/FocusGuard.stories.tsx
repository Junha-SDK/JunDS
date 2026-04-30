import type { Meta, StoryObj } from "@storybook/react";
import { FocusGuard } from "./FocusGuard";

const meta: Meta<typeof FocusGuard> = {
  title: "Primitives/FocusGuard",
  component: FocusGuard,
};

export default meta;
type Story = StoryObj<typeof FocusGuard>;

export const Default: Story = {
  render: () => <FocusGuard>{null}</FocusGuard>,
};
