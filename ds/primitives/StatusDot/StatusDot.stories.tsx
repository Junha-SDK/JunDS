import type { Meta, StoryObj } from "@storybook/react";
import { StatusDot } from "./StatusDot";

const meta: Meta<typeof StatusDot> = {
  title: "Primitives/StatusDot",
  component: StatusDot,
  argTypes: {
    status: { control: "select", options: ["success", "warning", "danger", "info", "neutral", "pulse"] },
    size: { control: "radio", options: ["sm", "md", "lg"] },
  },
  args: { status: "success", label: "온라인", size: "md" },
};

export default meta;
type Story = StoryObj<typeof StatusDot>;

export const Success: Story = { args: { status: "success", label: "온라인" } };
export const Warning: Story = { args: { status: "warning", label: "지연" } };
export const Danger: Story = { args: { status: "danger", label: "오프라인" } };
export const Info: Story = { args: { status: "info", label: "안내" } };
export const Neutral: Story = { args: { status: "neutral", label: "대기" } };
export const Pulse: Story = { args: { status: "pulse", label: "라이브" } };
export const NoLabel: Story = { args: { label: undefined } };
