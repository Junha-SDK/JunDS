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

// 스토리의 트리거도 라이브러리의 상태 3종을 지켜야 한다 — 여기가 소비자가 베껴 가는 자리다
const Trigger = (
  <button
    type="button"
    className="px-3 py-1.5 text-sm rounded-xl bg-primary text-white cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.15)] transition-colors duration-150 hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
