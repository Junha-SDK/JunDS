import type { Meta, StoryObj } from "@storybook/react";
import { IconButton } from "./IconButton";

const CloseIcon = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const meta: Meta<typeof IconButton> = {
  title: "Primitives/IconButton",
  component: IconButton,
  argTypes: {
    variant: { control: "radio", options: ["ghost", "outline", "filled"] },
    size: { control: "select", options: ["xs", "sm", "md", "lg"] },
    disabled: { control: "boolean" },
  },
  args: { icon: CloseIcon, label: "닫기", variant: "ghost", size: "md" },
};

export default meta;
type Story = StoryObj<typeof IconButton>;

export const Ghost: Story = { args: { variant: "ghost" } };
export const Outline: Story = { args: { variant: "outline" } };
export const Filled: Story = { args: { variant: "filled" } };
export const ExtraSmall: Story = { args: { size: "xs" } };
export const Large: Story = { args: { size: "lg" } };
export const Disabled: Story = { args: { disabled: true } };
