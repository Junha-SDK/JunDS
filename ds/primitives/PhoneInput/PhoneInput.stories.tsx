import type { Meta, StoryObj } from "@storybook/react";
import { PhoneInput } from "./PhoneInput";

const meta: Meta<typeof PhoneInput> = {
  title: "Primitives/PhoneInput",
  component: PhoneInput,
};

export default meta;
type Story = StoryObj<typeof PhoneInput>;

export const Default: Story = {
  render: () => <PhoneInput />,
};
