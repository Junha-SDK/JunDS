import type { Meta, StoryObj } from "@storybook/react";
import { OTPInput } from "./OTPInput";

const meta: Meta<typeof OTPInput> = {
  title: "Primitives/OTPInput",
  component: OTPInput,
};

export default meta;
type Story = StoryObj<typeof OTPInput>;

export const Default: Story = {
  render: () => <OTPInput />,
};
