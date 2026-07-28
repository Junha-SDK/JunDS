import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "./Badge";

const meta: Meta<typeof Badge> = {
  title: "Primitives/Badge",
  component: Badge,
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "primary", "success", "warning", "danger", "info", "outline"],
    },
    size: { control: "select", options: ["sm", "md", "lg"] },
    dot: { control: "boolean" },
  },
  args: { children: "Badge", variant: "primary", size: "md" },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Primary: Story = { args: { variant: "primary" } };
export const Success: Story = { args: { variant: "success" } };
export const Warning: Story = { args: { variant: "warning" } };
export const Danger: Story = { args: { variant: "danger" } };
export const WithDot: Story = { args: { dot: true, variant: "success", children: "Active" } };
export const Count: Story = { args: { count: 42 } };
