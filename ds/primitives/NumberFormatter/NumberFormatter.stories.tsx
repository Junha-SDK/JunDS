import type { Meta, StoryObj } from "@storybook/react";
import { NumberFormatter } from "./NumberFormatter";

const meta: Meta<typeof NumberFormatter> = {
  title: "Primitives/NumberFormatter",
  component: NumberFormatter,
};

export default meta;
type Story = StoryObj<typeof NumberFormatter>;

export const Default: Story = {
  render: () => <NumberFormatter value={0} />,
};
