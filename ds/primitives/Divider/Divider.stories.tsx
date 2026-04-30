import type { Meta, StoryObj } from "@storybook/react";
import { Divider } from "./Divider";

const meta: Meta<typeof Divider> = {
  title: "Primitives/Divider",
  component: Divider,
  argTypes: {
    orientation: { control: "radio", options: ["horizontal", "vertical"] },
  },
  args: {},
};

export default meta;
type Story = StoryObj<typeof Divider>;

export const Horizontal: Story = {
  render: () => (
    <div className="w-80">
      <Divider />
    </div>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <div className="w-80">
      <Divider label="또는" />
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="flex items-center gap-4 h-12 text-sm">
      <span>왼쪽</span>
      <Divider orientation="vertical" />
      <span>가운데</span>
      <Divider orientation="vertical" />
      <span>오른쪽</span>
    </div>
  ),
};
