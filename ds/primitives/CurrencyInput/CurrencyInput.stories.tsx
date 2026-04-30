import type { Meta, StoryObj } from "@storybook/react";
import { CurrencyInput } from "./CurrencyInput";

const meta: Meta<typeof CurrencyInput> = {
  title: "Primitives/CurrencyInput",
  component: CurrencyInput,
};

export default meta;
type Story = StoryObj<typeof CurrencyInput>;

export const Default: Story = {
  render: () => <CurrencyInput />,
};
