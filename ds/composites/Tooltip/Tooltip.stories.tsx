import type { Meta, StoryObj } from "@storybook/react";
import { Tooltip } from "./Tooltip";

const meta: Meta<typeof Tooltip> = {
  title: "Composites/Tooltip",
  component: Tooltip,
  argTypes: {
    position: { control: "radio", options: ["top", "bottom", "left", "right"] },
    delay: { control: { type: "number", min: 0, max: 1000, step: 50 } },
  },
  args: { content: "도움말 텍스트", position: "top", delay: 200 },
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

const Trigger = (
  <button
    type="button"
    className="px-3 py-1.5 text-sm rounded-lg bg-primary text-white"
  >
    Hover me
  </button>
);

export const Top: Story = {
  args: { position: "top" },
  render: (args: React.ComponentProps<typeof Tooltip>) => (
    <div className="p-12">
      <Tooltip {...args}>{Trigger}</Tooltip>
    </div>
  ),
};

export const Bottom: Story = {
  args: { position: "bottom" },
  render: (args: React.ComponentProps<typeof Tooltip>) => (
    <div className="p-12">
      <Tooltip {...args}>{Trigger}</Tooltip>
    </div>
  ),
};

export const Left: Story = {
  args: { position: "left" },
  render: (args: React.ComponentProps<typeof Tooltip>) => (
    <div className="p-12">
      <Tooltip {...args}>{Trigger}</Tooltip>
    </div>
  ),
};

export const Right: Story = {
  args: { position: "right" },
  render: (args: React.ComponentProps<typeof Tooltip>) => (
    <div className="p-12">
      <Tooltip {...args}>{Trigger}</Tooltip>
    </div>
  ),
};

export const NoDelay: Story = {
  args: { delay: 0, content: "즉시 표시" },
  render: (args: React.ComponentProps<typeof Tooltip>) => (
    <div className="p-12">
      <Tooltip {...args}>{Trigger}</Tooltip>
    </div>
  ),
};
