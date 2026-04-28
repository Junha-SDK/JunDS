import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./Input";

const meta: Meta<typeof Input> = {
  title: "Primitives/Input",
  component: Input,
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
    error: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: { placeholder: "텍스트를 입력하세요" },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {};
export const Small: Story = { args: { size: "sm", placeholder: "Small" } };
export const Large: Story = { args: { size: "lg", placeholder: "Large" } };
export const Error: Story = { args: { error: true, placeholder: "에러 상태" } };
export const Disabled: Story = { args: { disabled: true, placeholder: "비활성화" } };
