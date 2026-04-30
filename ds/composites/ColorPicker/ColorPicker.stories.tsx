import type { Meta, StoryObj } from "@storybook/react";
import { ColorPicker } from "./ColorPicker";

const meta: Meta<typeof ColorPicker> = {
  title: "Composites/ColorPicker",
  component: ColorPicker,
};

export default meta;
type Story = StoryObj<typeof ColorPicker>;

export const Default: Story = {
  render: () => <ColorPicker value="" onChange={() => {}} />,
};
