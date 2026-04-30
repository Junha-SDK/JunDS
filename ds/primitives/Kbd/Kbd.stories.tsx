import type { Meta, StoryObj } from "@storybook/react";
import { Kbd } from "./Kbd";

const meta: Meta<typeof Kbd> = {
  title: "Primitives/Kbd",
  component: Kbd,
  args: { children: "K" },
};

export default meta;
type Story = StoryObj<typeof Kbd>;

export const SingleKey: Story = { args: { children: "K" } };
export const Esc: Story = { args: { children: "Esc" } };
export const Chord: Story = {
  render: () => (
    <span className="inline-flex items-center gap-1 text-sm">
      <Kbd>⌘</Kbd>
      <span className="text-muted">+</span>
      <Kbd>K</Kbd>
    </span>
  ),
};
export const KeysProp: Story = {
  args: { keys: ["⌘", "⇧", "P"] },
};
export const InText: Story = {
  render: () => (
    <p className="text-sm">
      검색을 열려면 <Kbd>⌘</Kbd> <Kbd>K</Kbd>를 누르세요.
    </p>
  ),
};
