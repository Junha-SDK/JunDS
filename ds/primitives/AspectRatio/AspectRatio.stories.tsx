import type { Meta, StoryObj } from "@storybook/react";
import { AspectRatio } from "./AspectRatio";

const meta: Meta<typeof AspectRatio> = {
  title: "Primitives/AspectRatio",
  component: AspectRatio,
};

export default meta;
type Story = StoryObj<typeof AspectRatio>;

export const Default: Story = {
  render: () => <AspectRatio>{null}</AspectRatio>,
};
