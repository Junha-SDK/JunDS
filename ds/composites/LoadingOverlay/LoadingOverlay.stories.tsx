import type { Meta, StoryObj } from "@storybook/react";
import { LoadingOverlay } from "./LoadingOverlay";

const meta: Meta<typeof LoadingOverlay> = {
  title: "Composites/LoadingOverlay",
  component: LoadingOverlay,
};

export default meta;
type Story = StoryObj<typeof LoadingOverlay>;

export const Default: Story = {
  render: () => <LoadingOverlay active={false}>{null}</LoadingOverlay>,
};
