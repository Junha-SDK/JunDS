import type { Meta, StoryObj } from "@storybook/react";
import { AddressInput } from "./AddressInput";

const meta: Meta<typeof AddressInput> = {
  title: "Composites/AddressInput",
  component: AddressInput,
};

export default meta;
type Story = StoryObj<typeof AddressInput>;

export const Default: Story = {
  render: () => <AddressInput />,
};
