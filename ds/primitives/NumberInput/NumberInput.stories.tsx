import type { Meta, StoryObj } from "@storybook/react";
import { NumberInput } from "./NumberInput";

const meta: Meta<typeof NumberInput> = {
  title: "Primitives/NumberInput",
  component: NumberInput,
};

export default meta;
type Story = StoryObj<typeof NumberInput>;

export const Default: Story = {
  render: () => <NumberInput />,
};
