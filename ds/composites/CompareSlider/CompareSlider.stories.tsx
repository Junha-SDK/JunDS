import type { Meta, StoryObj } from "@storybook/react";
import { CompareSlider } from "./CompareSlider";

const meta: Meta<typeof CompareSlider> = {
  title: "Composites/CompareSlider",
  component: CompareSlider,
};

export default meta;
type Story = StoryObj<typeof CompareSlider>;

export const Default: Story = {
  render: () => <CompareSlider before="" after="" />,
};
