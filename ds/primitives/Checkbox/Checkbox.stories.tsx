import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox } from "./Checkbox";

const meta: Meta<typeof Checkbox> = {
  title: "Primitives/Checkbox",
  component: Checkbox,
  argTypes: {
    size: { control: "radio", options: ["sm", "md"] },
    checked: { control: "boolean" },
    indeterminate: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: { label: "동의합니다", size: "md" },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Unchecked: Story = { args: { checked: false } };
export const Checked: Story = { args: { checked: true } };
export const Indeterminate: Story = { args: { indeterminate: true } };
export const Disabled: Story = { args: { disabled: true, checked: true } };
export const Small: Story = { args: { size: "sm" } };
export const NoLabel: Story = { args: { label: undefined } };
