import type { Meta, StoryObj } from "@storybook/react";
import { GradientBorder } from "./GradientBorder";

const meta: Meta<typeof GradientBorder> = {
  title: "Composites/GradientBorder",
  component: GradientBorder,
};

export default meta;
type Story = StoryObj<typeof GradientBorder>;

export const Default: Story = {
  render: () => <GradientBorder>{null}</GradientBorder>,
};
