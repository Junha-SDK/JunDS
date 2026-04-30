import type { Meta, StoryObj } from "@storybook/react";
import { SwipeAction } from "./SwipeAction";

const meta: Meta<typeof SwipeAction> = {
  title: "Composites/SwipeAction",
  component: SwipeAction,
};

export default meta;
type Story = StoryObj<typeof SwipeAction>;

export const Default: Story = {
  render: () => <SwipeAction>{null}</SwipeAction>,
};
