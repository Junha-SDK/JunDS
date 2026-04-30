import type { Meta, StoryObj } from "@storybook/react";
import { PasswordInput } from "./PasswordInput";

const meta: Meta<typeof PasswordInput> = {
  title: "Primitives/PasswordInput",
  component: PasswordInput,
};

export default meta;
type Story = StoryObj<typeof PasswordInput>;

export const Default: Story = {
  render: () => <PasswordInput />,
};
