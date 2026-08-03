import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "Primitives/Button",
  component: Button,
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "danger", "ghost", "outline", "link"],
    },
    size: { control: "select", options: ["xs", "sm", "md", "lg"] },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
    fullWidth: { control: "boolean" },
  },
  args: { children: "버튼", variant: "primary", size: "md" },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = { args: { variant: "primary" } };
export const Secondary: Story = { args: { variant: "secondary" } };
export const Danger: Story = { args: { variant: "danger" } };
export const Ghost: Story = { args: { variant: "ghost" } };
export const Loading: Story = { args: { loading: true } };
export const Disabled: Story = { args: { disabled: true } };
export const Small: Story = { args: { size: "sm" } };
export const Large: Story = { args: { size: "lg" } };
export const FullWidth: Story = { args: { fullWidth: true } };
