import type { Meta, StoryObj } from "@storybook/react";
import { PinInput } from "./PinInput";

const meta: Meta<typeof PinInput> = {
  title: "Primitives/PinInput",
  component: PinInput,
};

export default meta;
type Story = StoryObj<typeof PinInput>;

export const Default: Story = {
  render: () => <PinInput />,
};
