import type { Meta, StoryObj } from "@storybook/react";
import { HoverCard } from "./HoverCard";

const meta: Meta<typeof HoverCard> = {
  title: "Composites/HoverCard",
  component: HoverCard,
  argTypes: {
    side: { control: "radio", options: ["top", "bottom", "left", "right"] },
    openDelay: { control: { type: "number", min: 0, max: 1000, step: 50 } },
  },
  args: { side: "bottom", openDelay: 100 },
};

export default meta;
type Story = StoryObj<typeof HoverCard>;

const Trigger = <span className="text-primary-ink underline cursor-default">@junha</span>;

const Profile = (
  <div className="space-y-1.5">
    <div className="font-semibold text-sm">김준하</div>
    <div className="text-xs text-muted">Frontend Engineer · Seoul</div>
    <div className="text-xs text-muted">디자인 시스템과 인터랙션 개발에 관심이 많습니다.</div>
  </div>
);

export const Bottom: Story = {
  args: { side: "bottom", trigger: Trigger, children: Profile },
  render: (args: React.ComponentProps<typeof HoverCard>) => (
    <div className="p-12">
      <HoverCard {...args} />
    </div>
  ),
};

export const Top: Story = {
  args: { side: "top", trigger: Trigger, children: Profile },
  render: (args: React.ComponentProps<typeof HoverCard>) => (
    <div className="p-12">
      <HoverCard {...args} />
    </div>
  ),
};

export const Right: Story = {
  args: { side: "right", trigger: Trigger, children: Profile },
  render: (args: React.ComponentProps<typeof HoverCard>) => (
    <div className="p-12">
      <HoverCard {...args} />
    </div>
  ),
};

export const NoOpenDelay: Story = {
  args: { side: "bottom", openDelay: 0, trigger: Trigger, children: Profile },
  render: (args: React.ComponentProps<typeof HoverCard>) => (
    <div className="p-12">
      <HoverCard {...args} />
    </div>
  ),
};
