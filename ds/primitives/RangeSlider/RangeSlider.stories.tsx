import type { Meta, StoryObj } from "@storybook/react";
import { RangeSlider } from "./RangeSlider";

const meta: Meta<typeof RangeSlider> = {
  title: "Primitives/RangeSlider",
  component: RangeSlider,
};

export default meta;
type Story = StoryObj<typeof RangeSlider>;

export const Default: Story = {
  render: () => <RangeSlider value={[0, 0]} onChange={() => {}} />,
};
