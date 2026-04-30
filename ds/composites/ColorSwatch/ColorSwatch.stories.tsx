import type { Meta, StoryObj } from "@storybook/react";
import { ColorSwatch } from "./ColorSwatch";

const meta: Meta<typeof ColorSwatch> = {
  title: "Composites/ColorSwatch",
  component: ColorSwatch,
};

export default meta;
type Story = StoryObj<typeof ColorSwatch>;

export const Default: Story = {
  render: () => <ColorSwatch colors={[]} />,
};
