import type { Meta, StoryObj } from "@storybook/react";
import { Avatar } from "./Avatar";

const meta: Meta<typeof Avatar> = {
  title: "Primitives/Avatar",
  component: Avatar,
  argTypes: {
    size: { control: "select", options: ["xs", "sm", "md", "lg", "xl"] },
    status: { control: "select", options: [undefined, "online", "offline", "away", "busy"] },
  },
  args: { name: "김준하", size: "md" },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Default: Story = {};
export const Initials: Story = { args: { name: "이영희" } };
export const Fallback: Story = { args: { name: undefined } };
export const Image: Story = {
  args: {
    src: "https://i.pravatar.cc/120?img=12",
    name: "홍길동",
  },
};
export const Small: Story = { args: { size: "sm" } };
export const Large: Story = { args: { size: "lg" } };
export const ExtraLarge: Story = { args: { size: "xl" } };
export const Online: Story = { args: { status: "online" } };
export const Busy: Story = { args: { status: "busy" } };
